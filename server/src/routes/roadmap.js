import { Router } from 'express'
import { z } from 'zod'
import { protect } from '../middleware/auth.js'
import { plannerNode } from '../agent/nodes/plannerNode.js'
import LearningPath from '../models/LearningPath.js'

const router = Router()

const GenerateSchema = z.object({
  topic: z.string().min(1).max(200),
  goal:  z.string().min(1).max(500),
  weeks: z.number().int().min(2).max(12),
})

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

router.get('/my-paths', protect, async (req, res) => {
  const paths = await LearningPath.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('topic goal weeks progress createdAt')
  res.json({ paths })
})

export default router
