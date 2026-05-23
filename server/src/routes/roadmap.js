import { Router } from 'express'
import { z } from 'zod'
import { protect } from '../middleware/auth.js'
import { plannerGraph, quizGraph, retryGraph } from '../agent/graph.js'
import { researcherNode } from '../agent/nodes/researcherNode.js'
import { evaluatorNode } from '../agent/nodes/evaluatorNode.js'
import { getWeakConcepts } from '../services/memoryService.js'
import LearningPath from '../models/LearningPath.js'

const router = Router()

const GenerateSchema = z.object({
  topic: z.string().min(1).max(200),
  goal:  z.string().min(1).max(500),
  weeks: z.number().int().min(2).max(12),
})

// POST /api/roadmap/generate
router.post('/generate', protect, async (req, res) => {
  const parsed = GenerateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten().fieldErrors })
  }

  const { topic, goal, weeks } = parsed.data

  try {
    const result = await plannerGraph.invoke({
      userId: req.user._id.toString(),
      topic,
      goal,
      weeks,
    })

    const path = await LearningPath.create({
      user:  req.user._id,
      topic,
      goal,
      weeks,
      nodes: result.roadmap,
    })

    res.json({ pathId: path._id, roadmap: result.roadmap })
  } catch (err) {
    console.error('[plannerGraph]', err.message)
    res.status(500).json({ message: 'Failed to generate roadmap', error: err.message })
  }
})

// POST /api/roadmap/generate-stream — SSE: emits a progress event per agent step
router.post('/generate-stream', protect, async (req, res) => {
  const parsed = GenerateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten().fieldErrors })
  }
  const { topic, goal, weeks } = parsed.data

  res.setHeader('Content-Type',     'text/event-stream')
  res.setHeader('Cache-Control',    'no-cache, no-transform')
  res.setHeader('Connection',       'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders?.()

  const send = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  // Heartbeat keeps the connection alive through proxies (e.g. Vercel/Cloudflare)
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 15000)
  req.on('close', () => clearInterval(heartbeat))

  try {
    send({ stage: 'memory', message: 'Loading your learning history…' })

    let historicalWeakConcepts = []
    let roadmap = null

    const stream = await plannerGraph.stream({
      userId: req.user._id.toString(),
      topic, goal, weeks,
    })

    for await (const chunk of stream) {
      for (const [node, delta] of Object.entries(chunk)) {
        if (node === 'loadMemory') {
          historicalWeakConcepts = delta.historicalWeakConcepts || []
          send({
            stage:    'memory:done',
            count:    historicalWeakConcepts.length,
            concepts: historicalWeakConcepts.slice(0, 5),
            message:  historicalWeakConcepts.length > 0
              ? `Found ${historicalWeakConcepts.length} past weak spots — Planner will address them`
              : 'No past history — designing from scratch',
          })
          send({ stage: 'planner', message: 'Designing your weekly roadmap…' })
        } else if (node === 'planner') {
          roadmap = delta.roadmap
          send({ stage: 'planner:done', weeks: roadmap?.length || 0, message: `Generated ${roadmap?.length || 0} weeks of curriculum` })
          send({ stage: 'save', message: 'Saving your path…' })
        }
      }
    }

    if (!roadmap) throw new Error('Planner returned no roadmap')

    const path = await LearningPath.create({
      user: req.user._id, topic, goal, weeks, nodes: roadmap,
    })

    send({ stage: 'done', pathId: path._id.toString(), roadmap, message: 'Roadmap ready' })
    clearInterval(heartbeat)
    res.end()
  } catch (err) {
    console.error('[generate-stream]', err.message)
    send({ stage: 'error', message: err.message })
    clearInterval(heartbeat)
    res.end()
  }
})

// GET /api/roadmap/my-paths
router.get('/my-paths', protect, async (req, res) => {
  const paths = await LearningPath.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('topic goal weeks progress createdAt')
  res.json({ paths })
})

// GET /api/roadmap/weak-concepts?topic=...
// Must be declared before /:pathId to avoid being swallowed by the param route
router.get('/weak-concepts', protect, async (req, res) => {
  try {
    const concepts = await getWeakConcepts(req.user._id.toString(), req.query.topic || undefined)
    res.json({ concepts })
  } catch (err) {
    console.error('[memoryService]', err.message)
    res.status(500).json({ message: 'Failed to fetch weak concepts', error: err.message })
  }
})

// GET /api/roadmap/:pathId
router.get('/:pathId', protect, async (req, res) => {
  const path = await LearningPath.findOne({ _id: req.params.pathId, user: req.user._id })
  if (!path) return res.status(404).json({ message: 'Path not found' })
  res.json({ path })
})

// DELETE /api/roadmap/:pathId
router.delete('/:pathId', protect, async (req, res) => {
  const result = await LearningPath.deleteOne({ _id: req.params.pathId, user: req.user._id })
  if (result.deletedCount === 0) return res.status(404).json({ message: 'Path not found' })
  res.json({ ok: true })
})

// PATCH /api/roadmap/:pathId — rename topic / goal
const PatchPathSchema = z.object({
  topic: z.string().min(1).max(200).optional(),
  goal:  z.string().min(1).max(500).optional(),
})
router.patch('/:pathId', protect, async (req, res) => {
  const parsed = PatchPathSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten().fieldErrors })
  }
  if (Object.keys(parsed.data).length === 0) {
    return res.status(400).json({ message: 'Nothing to update' })
  }

  const path = await LearningPath.findOneAndUpdate(
    { _id: req.params.pathId, user: req.user._id },
    { $set: parsed.data },
    { new: true }
  )
  if (!path) return res.status(404).json({ message: 'Path not found' })
  res.json({ path })
})

// POST /api/roadmap/:pathId/node/:nodeId/resources
// nodeId = week number (1-based)
router.post('/:pathId/node/:nodeId/resources', protect, async (req, res) => {
  const week = parseInt(req.params.nodeId, 10)
  if (isNaN(week) || week < 1) {
    return res.status(400).json({ message: 'nodeId must be a valid week number' })
  }

  const path = await LearningPath.findOne({ _id: req.params.pathId, user: req.user._id })
  if (!path) return res.status(404).json({ message: 'Path not found' })

  const node = path.nodes.find(n => n.week === week)
  if (!node) return res.status(404).json({ message: `Week ${week} not found in this path` })

  try {
    const { resources } = await researcherNode({ currentNode: node })

    // Persist real resources back onto the node
    node.resources = resources
    await path.save()

    res.json({ resources })
  } catch (err) {
    console.error('[researcherNode]', err.message)
    res.status(500).json({ message: 'Failed to fetch resources', error: err.message })
  }
})

// POST /api/roadmap/:pathId/node/:nodeId/quiz
// nodeId = week number. Returns cached questions if already generated.
router.post('/:pathId/node/:nodeId/quiz', protect, async (req, res) => {
  const week = parseInt(req.params.nodeId, 10)
  if (isNaN(week) || week < 1) {
    return res.status(400).json({ message: 'nodeId must be a valid week number' })
  }

  const path = await LearningPath.findOne({ _id: req.params.pathId, user: req.user._id })
  if (!path) return res.status(404).json({ message: 'Path not found' })

  const node = path.nodes.find(n => n.week === week)
  if (!node) return res.status(404).json({ message: `Week ${week} not found in this path` })

  // Return cached questions to avoid re-generating on every visit
  if (node.quizQuestions?.length) {
    return res.json({ questions: node.quizQuestions })
  }

  try {
    const result = await quizGraph.invoke({
      userId:      req.user._id.toString(),
      topic:       path.topic,
      currentNode: node.toObject ? node.toObject() : node,
    })

    node.quizQuestions = result.questions
    await path.save()

    res.json({ questions: result.questions })
  } catch (err) {
    console.error('[quizGraph]', err.message)
    res.status(500).json({ message: 'Failed to generate quiz', error: err.message })
  }
})

// POST /api/roadmap/:pathId/node/:nodeId/evaluate
const EvaluateSchema = z.object({
  userAnswers: z.array(z.number().int().min(-1).max(3)),
  questions:   z.array(z.object({
    correct:  z.number().int().min(0).max(3),
    question: z.string(),
    concept:  z.string().optional(),
  })),
})

// POST /:pathId/node/:nodeId/retry
// Adaptive loop: re-generate quiz + fetch supplementary resources targeting wrongConcepts.
router.post('/:pathId/node/:nodeId/retry', protect, async (req, res) => {
  const week = parseInt(req.params.nodeId, 10)
  if (isNaN(week) || week < 1) {
    return res.status(400).json({ message: 'nodeId must be a valid week number' })
  }

  const path = await LearningPath.findOne({ _id: req.params.pathId, user: req.user._id })
  if (!path) return res.status(404).json({ message: 'Path not found' })

  const node = path.nodes.find(n => n.week === week)
  if (!node) return res.status(404).json({ message: `Week ${week} not found` })

  const focusConcepts = node.wrongConcepts || []
  if (focusConcepts.length === 0) {
    return res.status(400).json({ message: 'No weak concepts to target — take the quiz first' })
  }

  try {
    const result = await retryGraph.invoke({
      userId:      req.user._id.toString(),
      currentNode: node.toObject ? node.toObject() : node,
      focusConcepts,
    })

    node.reviewResources = result.resources
    node.quizQuestions   = result.questions
    node.retryCount      = (node.retryCount || 0) + 1
    await path.save()

    res.json({
      questions:       result.questions,
      reviewResources: result.resources,
      retryCount:      node.retryCount,
      focusConcepts,
    })
  } catch (err) {
    console.error('[retryGraph]', err.message)
    res.status(500).json({ message: 'Adaptive retry failed', error: err.message })
  }
})

router.post('/:pathId/node/:nodeId/evaluate', protect, async (req, res) => {
  const week = parseInt(req.params.nodeId, 10)
  if (isNaN(week)) return res.status(400).json({ message: 'Invalid nodeId' })

  const parsed = EvaluateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid input', errors: parsed.error.flatten().fieldErrors })
  }

  const path = await LearningPath.findOne({ _id: req.params.pathId, user: req.user._id })
  if (!path) return res.status(404).json({ message: 'Path not found' })

  const node = path.nodes.find(n => n.week === week)
  if (!node) return res.status(404).json({ message: `Week ${week} not found` })

  try {
    const result = await evaluatorNode({
      currentNode:  node,
      path,
      userId:       req.user._id.toString(),
      userAnswers:  parsed.data.userAnswers,
      questions:    parsed.data.questions,
    })
    res.json(result)
  } catch (err) {
    console.error('[evaluatorNode]', err.message)
    res.status(500).json({ message: 'Evaluation failed', error: err.message })
  }
})

export default router
