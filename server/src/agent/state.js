import { z } from 'zod'
import { Annotation } from '@langchain/langgraph'

// Zod schema — used for validation and structured LLM output elsewhere
export const SkillPathStateSchema = z.object({
  topic:       z.string(),
  goal:        z.string(),
  weeks:       z.number().int().min(1).max(52),
  roadmap:     z.array(z.any()).default([]),
  currentNode: z.string().nullable().default(null),
  quizScore:   z.number().min(0).max(100).nullable().default(null),
  retryCount:  z.number().int().min(0).default(0),
  userMemory:  z.record(z.any()).default({}),
})

// LangGraph annotation — defines how state channels merge across nodes
export const SkillPathState = Annotation.Root({
  topic:       Annotation({ reducer: (_, v) => v, default: () => '' }),
  goal:        Annotation({ reducer: (_, v) => v, default: () => '' }),
  weeks:       Annotation({ reducer: (_, v) => v, default: () => 4 }),
  roadmap:     Annotation({ reducer: (_, v) => v, default: () => [] }),
  currentNode: Annotation({ reducer: (_, v) => v, default: () => null }),
  quizScore:   Annotation({ reducer: (_, v) => v, default: () => null }),
  retryCount:  Annotation({ reducer: (_, v) => v, default: () => 0 }),
  userMemory:  Annotation({ reducer: (prev, v) => ({ ...prev, ...v }), default: () => ({}) }),
})
