import { Router } from 'express'
import { z } from 'zod'
import { protect } from '../middleware/auth.js'
import { plannerNode } from '../agent/nodes/plannerNode.js'

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
    res.json({ roadmap })
  } catch (err) {
    console.error('[plannerNode]', err.message)
    res.status(500).json({ message: 'Failed to generate roadmap', error: err.message })
  }
})

export default router
