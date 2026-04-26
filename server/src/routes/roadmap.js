import { Router } from 'express'
import { z } from 'zod'
import { protect } from '../middleware/auth.js'
import { plannerNode } from '../agent/nodes/plannerNode.js'
import { researcherNode } from '../agent/nodes/researcherNode.js'
import { quizNode } from '../agent/nodes/quizNode.js'
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
    const { roadmap } = await plannerNode({ topic, goal, weeks })

    const path = await LearningPath.create({
      user:  req.user._id,
      topic,
      goal,
      weeks,
      nodes: roadmap,
    })

    res.json({ pathId: path._id, roadmap })
  } catch (err) {
    console.error('[plannerNode]', err.message)
    res.status(500).json({ message: 'Failed to generate roadmap', error: err.message })
  }
})

// GET /api/roadmap/my-paths
router.get('/my-paths', protect, async (req, res) => {
  const paths = await LearningPath.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('topic goal weeks progress createdAt')
  res.json({ paths })
})

// GET /api/roadmap/:pathId
router.get('/:pathId', protect, async (req, res) => {
  const path = await LearningPath.findOne({ _id: req.params.pathId, user: req.user._id })
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
    const { questions } = await quizNode({ currentNode: node })

    node.quizQuestions = questions
    await path.save()

    res.json({ questions })
  } catch (err) {
    console.error('[quizNode]', err.message)
    res.status(500).json({ message: 'Failed to generate quiz', error: err.message })
  }
})

export default router
