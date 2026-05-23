import { StateGraph, START, END, Annotation } from '@langchain/langgraph'
import { plannerNode }    from './nodes/plannerNode.js'
import { researcherNode } from './nodes/researcherNode.js'
import { quizNode }       from './nodes/quizNode.js'
import { getWeakConcepts } from '../services/memoryService.js'

// ── Shared state shape across all sub-graphs ────────────────────────────────
const SkillPathState = Annotation.Root({
  userId:                 Annotation({ reducer: (_, v) => v, default: () => null }),
  topic:                  Annotation({ reducer: (_, v) => v, default: () => '' }),
  goal:                   Annotation({ reducer: (_, v) => v, default: () => '' }),
  weeks:                  Annotation({ reducer: (_, v) => v, default: () => 4 }),
  currentNode:            Annotation({ reducer: (_, v) => v, default: () => null }),
  focusConcepts:          Annotation({ reducer: (_, v) => v, default: () => [] }),
  historicalWeakConcepts: Annotation({ reducer: (_, v) => v, default: () => [] }),
  roadmap:                Annotation({ reducer: (_, v) => v, default: () => null }),
  resources:              Annotation({ reducer: (_, v) => v, default: () => null }),
  questions:              Annotation({ reducer: (_, v) => v, default: () => null }),
})

// ── Memory loader node ──────────────────────────────────────────────────────
// Pulls the learner's historical weak concepts from Pinecone, filtered by topic
// (or returns all concepts if no topic is supplied). Failures are non-fatal —
// memory is a soft signal, the graph still runs without it.
async function memoryLoaderNode(state) {
  if (!state.userId) return { historicalWeakConcepts: [] }
  try {
    const concepts = await getWeakConcepts(state.userId, state.topic || undefined)
    return { historicalWeakConcepts: concepts.map(c => c.concept) }
  } catch (err) {
    console.error('[graph:memoryLoader]', err.message)
    return { historicalWeakConcepts: [] }
  }
}

// ── plannerGraph: memory → planner ──────────────────────────────────────────
// Used when a learner generates a new roadmap. Past weak concepts (if any)
// flow into the planner so the roadmap can compensate for known gaps.
export const plannerGraph = new StateGraph(SkillPathState)
  .addNode('loadMemory', memoryLoaderNode)
  .addNode('planner',    plannerNode)
  .addEdge(START, 'loadMemory')
  .addEdge('loadMemory', 'planner')
  .addEdge('planner', END)
  .compile()

// ── quizGraph: memory → quiz ────────────────────────────────────────────────
// Used for the FIRST quiz attempt on a node. Memory provides gentle awareness
// of concepts the learner has historically struggled with so the quiz can
// surface them with at least one targeted question.
export const quizGraph = new StateGraph(SkillPathState)
  .addNode('loadMemory', memoryLoaderNode)
  .addNode('quiz',       quizNode)
  .addEdge(START, 'loadMemory')
  .addEdge('loadMemory', 'quiz')
  .addEdge('quiz', END)
  .compile()

// ── retryGraph: researcher ∥ quiz (fan-out) ─────────────────────────────────
// Used for adaptive retry. Both nodes consume `focusConcepts` (the learner's
// current wrong concepts) and run in parallel — researcher fetches review
// material, quiz regenerates a focused test. No memory loader: focusConcepts
// is more specific than historical memory for this case.
export const retryGraph = new StateGraph(SkillPathState)
  .addNode('researcher', researcherNode)
  .addNode('quiz',       quizNode)
  .addEdge(START, 'researcher')
  .addEdge(START, 'quiz')
  .addEdge('researcher', END)
  .addEdge('quiz', END)
  .compile()
