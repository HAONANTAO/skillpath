# Zod — Structured Output Validation

## What is it
A TypeScript schema validation library.
Used to enforce that LLM output matches 
the exact structure your code expects.

## Why critical for Agents
LLMs can return anything.
Your code expects a specific structure.
Without validation: app crashes on unexpected output.
With Zod: invalid output caught and handled gracefully.

## Basic Usage
```javascript
import { z } from 'zod'

const RoadmapSchema = z.object({
  topic: z.string(),
  totalWeeks: z.number(),
  nodes: z.array(z.object({
    week: z.number(),
    title: z.string(),
    concepts: z.array(z.string()).max(3),
    estimatedMinutes: z.number().min(30).max(120)
  }))
})

// With LangChain structured output
const model = new ChatOpenAI()
const structured = model.withStructuredOutput(RoadmapSchema)
const result = await structured.invoke(prompt)
// result is guaranteed to match schema
```

## In SkillPath
Every LangGraph Node that calls an LLM
uses Zod to validate the output:
- Planner Node → RoadmapSchema
- Quiz Node → QuizSchema
- Evaluator Node → EvaluationSchema

## Links
[[LangGraph]]
[[Prompt Engineering]]
[[Task Planning]]