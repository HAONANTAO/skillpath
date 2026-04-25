import { ChatOpenAI } from '@langchain/openai'
import { z } from 'zod'

const LearningNodeSchema = z.object({
  week:        z.number().int().describe('Week number, starting at 1'),
  title:       z.string().describe('Short title for this week, e.g. "React Fundamentals"'),
  description: z.string().describe('2–3 sentence overview of what the learner will cover'),
  topics:      z.array(z.string()).min(2).max(6).describe('Key concepts or skills covered this week'),
  resources:   z.array(
    z.object({
      type:  z.enum(['video', 'article', 'docs', 'exercise']),
      title: z.string(),
      url:   z.string(),
    })
  ).min(1).max(4).describe('Suggested learning resources'),
  quizFocus:   z.string().describe('One sentence describing what the end-of-week quiz will test'),
  difficulty:  z.enum(['beginner', 'intermediate', 'advanced']),
})

const RoadmapSchema = z.object({
  nodes: z.array(LearningNodeSchema),
})

const model = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0.3,
}).withStructuredOutput(RoadmapSchema, { name: 'roadmap' })

export async function plannerNode(state) {
  const { topic, goal, weeks } = state

  const prompt = `You are an expert curriculum designer. Create a ${weeks}-week learning roadmap for the following:

Topic: ${topic}
Goal: ${goal}
Duration: ${weeks} weeks

Requirements:
- Each week builds on the previous
- Progress from fundamentals to advanced concepts
- Include practical, hands-on topics each week
- Keep resource titles realistic and descriptive
- Difficulty should naturally escalate across weeks

Return exactly ${weeks} learning nodes, one per week.`

  const { nodes } = await model.invoke([{ role: 'user', content: prompt }])

  return { roadmap: nodes }
}
