import { storeWeakConcept } from '../../services/memoryService.js'

/**
 * Evaluates quiz results, updates node status, and stores weak concepts.
 *
 * @param {object} state
 * @param {object} state.currentNode   - The LearningPath sub-document (has .topics, .title)
 * @param {object} state.path          - The full LearningPath mongoose document
 * @param {string} state.userId        - String form of user._id
 * @param {number[]} state.userAnswers - Array of selected option indices (0-3), one per question
 * @param {object[]} state.questions   - Quiz questions with .correct index
 * @returns {{ score, passed, wrongConcepts, nodeStatus }}
 */
export async function evaluatorNode(state) {
  const { currentNode, path, userId, userAnswers, questions } = state

  const total   = questions.length
  const correct = userAnswers.filter((ans, i) => ans === questions[i].correct).length
  const score   = Math.round((correct / total) * 100)
  const passed  = score >= 60

  // Map wrong answer indices → concepts from the node's topics list
  const wrongConcepts = userAnswers
    .map((ans, i) => (ans !== questions[i].correct ? currentNode.topics[i % currentNode.topics.length] : null))
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i) // deduplicate

  // Persist weak concepts to Pinecone (fire-and-forget, don't block response)
  if (wrongConcepts.length > 0) {
    Promise.all(
      wrongConcepts.map(concept => storeWeakConcept(userId, concept, currentNode.title))
    ).catch(err => console.error('[memoryService] storeWeakConcept failed:', err.message))
  }

  // Update the node in MongoDB
  const node = path.nodes.find(n => n.week === currentNode.week)
  if (node) {
    node.quizScore     = score
    node.wrongConcepts = wrongConcepts

    if (passed) {
      node.status = 'complete'
      // Unlock next node
      const nextNode = path.nodes.find(n => n.week === currentNode.week + 1)
      if (nextNode && nextNode.status === 'locked') nextNode.status = 'unlocked'
    } else {
      // Keep unlocked for retry; don't lock it back
      node.status = 'unlocked'
    }
  }

  // Recalculate overall path progress
  const completedCount = path.nodes.filter(n => n.status === 'complete').length
  path.progress = Math.round((completedCount / path.nodes.length) * 100)

  await path.save()

  return { score, passed, wrongConcepts, nodeStatus: node?.status }
}
