import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock Pinecone-backed memory storage so evaluator tests don't hit the network
vi.mock('../services/memoryService.js', () => ({
  storeWeakConcept: vi.fn().mockResolvedValue(undefined),
}))

import { evaluatorNode } from '../agent/nodes/evaluatorNode.js'
import { storeWeakConcept } from '../services/memoryService.js'

// Build a mongoose-like LearningPath document. The evaluator only needs
// .nodes (array with status/quizScore/wrongConcepts), .progress, and .save().
function makePath({ totalWeeks = 3, statuses = {} } = {}) {
  const nodes = Array.from({ length: totalWeeks }, (_, i) => ({
    week: i + 1,
    title: `Week ${i + 1}`,
    topics: ['a', 'b', 'c'],
    status: statuses[i + 1] || (i === 0 ? 'unlocked' : 'locked'),
  }))
  return { nodes, progress: 0, save: vi.fn().mockResolvedValue(undefined) }
}

function makeQuestions(concepts) {
  return concepts.map((c, i) => ({ correct: 0, question: `q${i}`, concept: c }))
}

describe('evaluatorNode', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('scores correctly and passes at exactly 60%', async () => {
    const path = makePath()
    const questions = makeQuestions(['a', 'a', 'b', 'b', 'c'])
    const userAnswers = [0, 0, 0, 1, 1] // 3 right, 2 wrong = 60%

    const result = await evaluatorNode({
      currentNode: path.nodes[0], path, userId: 'u', userAnswers, questions,
    })

    expect(result.score).toBe(60)
    expect(result.passed).toBe(true)
    expect(result.nodeStatus).toBe('complete')
    expect(path.save).toHaveBeenCalledOnce()
  })

  it('fails when below 60% and keeps node unlocked for retry', async () => {
    const path = makePath()
    const questions = makeQuestions(['a', 'b', 'c', 'a', 'b'])
    const userAnswers = [1, 1, 1, 1, 0] // 1 right = 20%

    const result = await evaluatorNode({
      currentNode: path.nodes[0], path, userId: 'u', userAnswers, questions,
    })

    expect(result.passed).toBe(false)
    expect(result.nodeStatus).toBe('unlocked')
    expect(path.nodes[1].status).toBe('locked') // next week stays locked on fail
  })

  it('unlocks the next week when current is passed', async () => {
    const path = makePath()
    const questions = makeQuestions(['a', 'a', 'a', 'a', 'a'])
    const userAnswers = [0, 0, 0, 0, 0]

    await evaluatorNode({
      currentNode: path.nodes[0], path, userId: 'u', userAnswers, questions,
    })

    expect(path.nodes[0].status).toBe('complete')
    expect(path.nodes[1].status).toBe('unlocked')
    expect(path.nodes[2].status).toBe('locked') // only immediate next unlocks
  })

  it('uses the per-question concept tag for wrongConcepts (deduped)', async () => {
    const path = makePath()
    const questions = makeQuestions(['useState', 'useEffect', 'useState', 'useMemo', 'props'])
    const userAnswers = [1, 1, 1, 0, 0] // wrong on indices 0, 1, 2

    const { wrongConcepts } = await evaluatorNode({
      currentNode: path.nodes[0], path, userId: 'u', userAnswers, questions,
    })

    // useState appears twice in wrong answers but should be deduped
    expect(wrongConcepts).toEqual(['useState', 'useEffect'])
  })

  it('falls back to topic rotation when question.concept is missing', async () => {
    const path = makePath()
    const questions = Array.from({ length: 5 }, (_, i) => ({ correct: 0, question: `q${i}` }))
    const userAnswers = [1, 1, 1, 1, 1] // all wrong, no concepts on questions

    const { wrongConcepts } = await evaluatorNode({
      currentNode: path.nodes[0], path, userId: 'u', userAnswers, questions,
    })

    // topics = ['a','b','c']: i%3 maps to a,b,c,a,b → deduped a,b,c
    expect(wrongConcepts).toEqual(['a', 'b', 'c'])
  })

  it('persists weak concepts to Pinecone memory on failure', async () => {
    const path = makePath()
    const questions = makeQuestions(['useState', 'useEffect'])
    const userAnswers = [1, 1]

    await evaluatorNode({
      currentNode: path.nodes[0], path, userId: 'user-123', userAnswers, questions,
    })

    // storeWeakConcept is fire-and-forget — flush microtasks so the Promise.all schedules
    await new Promise(r => setImmediate(r))
    expect(storeWeakConcept).toHaveBeenCalledTimes(2)
    expect(storeWeakConcept).toHaveBeenCalledWith('user-123', 'useState', 'Week 1')
    expect(storeWeakConcept).toHaveBeenCalledWith('user-123', 'useEffect', 'Week 1')
  })

  it('does not call memory when there are no wrong answers', async () => {
    const path = makePath()
    const questions = makeQuestions(['a', 'b', 'c', 'a', 'b'])
    const userAnswers = [0, 0, 0, 0, 0]

    await evaluatorNode({
      currentNode: path.nodes[0], path, userId: 'u', userAnswers, questions,
    })

    expect(storeWeakConcept).not.toHaveBeenCalled()
  })

  it('marks isFinalWeek + pathComplete when the last week passes and progress hits 100', async () => {
    const path = makePath({ totalWeeks: 2, statuses: { 1: 'complete', 2: 'unlocked' } })
    const questions = makeQuestions(['a', 'a', 'a', 'a', 'a'])
    const userAnswers = [0, 0, 0, 0, 0]

    const result = await evaluatorNode({
      currentNode: path.nodes[1], path, userId: 'u', userAnswers, questions,
    })

    expect(result.isFinalWeek).toBe(true)
    expect(result.pathComplete).toBe(true)
    expect(path.progress).toBe(100)
  })

  it('does not mark pathComplete when passing a non-final week', async () => {
    const path = makePath({ totalWeeks: 4 })
    const questions = makeQuestions(['a', 'a', 'a', 'a', 'a'])
    const userAnswers = [0, 0, 0, 0, 0]

    const result = await evaluatorNode({
      currentNode: path.nodes[0], path, userId: 'u', userAnswers, questions,
    })

    expect(result.isFinalWeek).toBe(false)
    expect(result.pathComplete).toBe(false)
    expect(path.progress).toBe(25) // 1 of 4 weeks complete
  })

  it('does not mark pathComplete when final week fails (even if earlier weeks done)', async () => {
    const path = makePath({ totalWeeks: 2, statuses: { 1: 'complete', 2: 'unlocked' } })
    const questions = makeQuestions(['a', 'b', 'c', 'a', 'b'])
    const userAnswers = [1, 1, 1, 1, 1] // 0 correct

    const result = await evaluatorNode({
      currentNode: path.nodes[1], path, userId: 'u', userAnswers, questions,
    })

    expect(result.isFinalWeek).toBe(true)
    expect(result.passed).toBe(false)
    expect(result.pathComplete).toBe(false)
  })
})
