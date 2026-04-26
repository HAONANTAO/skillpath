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
})

const QuizSchema = z.object({
  questions: z.array(QuestionSchema).describe('Exactly 5 quiz questions'),
})

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0.4,
}).withStructuredOutput(QuizSchema, { name: 'quiz' })

export async function quizNode(state) {
  const { currentNode } = state
  const { title, topics = [], quizFocus = '' } = currentNode

  const prompt = `You are a coding educator creating a quiz for learners.

Topic: ${title}
Concepts covered: ${topics.join(', ')}
${quizFocus ? `Quiz focus: ${quizFocus}` : ''}

Generate exactly 5 multiple-choice questions that test understanding of the above concepts.

Rules:
- Questions should vary in difficulty (2 easy, 2 medium, 1 hard)
- Each question must have exactly 4 options (A, B, C, D)
- Only one option is correct
- Distractors should be plausible, not obviously wrong
- Explanations should be clear and educational
- Use code snippets in backticks when relevant`

  const { questions } = await model.invoke([{ role: 'user', content: prompt }])

  // Normalize to 0-based index for the frontend
  const letterToIndex = { A: 0, B: 1, C: 2, D: 3 }
  const normalized = questions.slice(0, 5).map((q, i) => ({
    id: i + 1,
    question: q.question,
    options: [q.options.A, q.options.B, q.options.C, q.options.D],
    correct: letterToIndex[q.correctAnswer],
    explanation: q.explanation,
  }))

  return { questions: normalized }
}
