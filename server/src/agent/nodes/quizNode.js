import { ChatOpenAI } from '@langchain/openai'
import { z } from 'zod'

const QuestionSchema = z.object({
  question: z.string().describe('The quiz question text'),
  options: z.object({
    A: z.string().describe('Option A'),
    B: z.string().describe('Option B'),
    C: z.string().describe('Option C'),
    D: z.string().describe('Option D'),
  }),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']).describe('Letter of the correct option'),
  explanation: z.string().describe('Why the correct answer is right, in 2-3 sentences'),
  concept: z.string().describe('Single concept from the topics list that this question primarily tests. Must exactly match one of the listed topics.'),
})

const QuizSchema = z.object({
  questions: z.array(QuestionSchema).min(1).max(10).describe('Quiz questions — exact count specified in the prompt'),
})

// First-pass quizzes cover the full topic broadly; retries are tighter and
// focused on the weak concepts the learner already missed.
const INITIAL_QUIZ_SIZE = 8
const RETRY_QUIZ_SIZE   = 5

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0.4,
}).withStructuredOutput(QuizSchema, { name: 'quiz' })

export async function quizNode(state) {
  const {
    currentNode,
    focusConcepts = [],          // retry: primary focus concepts
    historicalWeakConcepts = [], // initial: past weak concepts from memory (gentle weight)
  } = state
  const { title, topics = [], quizFocus = '' } = currentNode
  const isRetry     = focusConcepts.length > 0
  const targetCount = isRetry ? RETRY_QUIZ_SIZE : INITIAL_QUIZ_SIZE

  // For initial quizzes, find concepts the user has historically struggled with that overlap with this node
  const relevantHistorical = isRetry
    ? []
    : historicalWeakConcepts.filter(c =>
        topics.some(t => t.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(t.toLowerCase()))
      )

  const prompt = `You are a coding educator creating a quiz for learners.

Topic: ${title}
Concepts covered: ${topics.join(', ')}
${quizFocus ? `Quiz focus: ${quizFocus}` : ''}
${isRetry ? `\nThis is a RETRY quiz. The learner previously struggled with these concepts:
${focusConcepts.map(c => `- ${c}`).join('\n')}

Generate exactly ${targetCount} multiple-choice questions that primarily target the weak concepts above. Approach them from different angles than a typical first-pass quiz (different examples, different framings) so the learner actually has to demonstrate understanding rather than recognize a memorized answer.` : `\nGenerate exactly ${targetCount} multiple-choice questions that test understanding of the above concepts.`}
${relevantHistorical.length > 0 ? `\nNote: This learner has previously struggled with related concepts: ${relevantHistorical.join(', ')}. Make sure at least 1 question covers these areas, but keep the overall quiz balanced across all topics.` : ''}

Rules:
- Questions should vary in difficulty (${isRetry ? '3 easy, 2 medium' : '3 easy, 3 medium, 2 hard'})
- Each question must have exactly 4 options (A, B, C, D)
- Only one option is correct
- Distractors should be plausible, not obviously wrong
- Explanations should be clear and educational${isRetry ? ', and explicitly reinforce the weak concept' : ''}
- Use code snippets in backticks when relevant
- Each question's "concept" field MUST be one of the listed topics (verbatim) — this is used to track what the learner struggles with`

  const { questions } = await model.invoke([{ role: 'user', content: prompt }])

  const letterToIndex = { A: 0, B: 1, C: 2, D: 3 }
  const normalized = questions.slice(0, targetCount).map((q, i) => ({
    id:          i + 1,
    question:    q.question,
    options:     [q.options.A, q.options.B, q.options.C, q.options.D],
    correct:     letterToIndex[q.correctAnswer],
    explanation: q.explanation,
    concept:     q.concept,
  }))

  return { questions: normalized }
}
