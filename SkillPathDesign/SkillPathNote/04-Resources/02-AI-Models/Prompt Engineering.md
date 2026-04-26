# Prompt Engineering

## Why it matters
The quality of your prompts directly determines
the quality of your Agent's output.
Bad prompt = wrong structured output = broken app.

## Key Techniques

### System Prompt
Sets the Agent's behavior and constraints.
Always define: role, task, output format, constraints.

### Structured Output
Force the LLM to return valid JSON using Zod schema.
Critical for Agent nodes — downstream code depends on it.

```javascript
const schema = z.object({
  nodes: z.array(z.object({
    day: z.number(),
    title: z.string(),
    concepts: z.array(z.string()),
    estimatedMinutes: z.number()
  }))
})
```

### Few-shot Examples
Show the model examples of good output.
"Here's an example of a good learning node: ..."
Dramatically improves consistency.

### Chain of Thought
Ask the model to reason before outputting.
"Think step by step, then generate the roadmap."
Better for complex planning tasks.

### Constraints
Tell the model what NOT to do.
"Do not include more than 3 concepts per node."
"Always return valid JSON, no markdown."

## Planner Node Prompt Structure
1. Role: "You are an expert learning coach"
2. Context: user's topic, goal, time budget
3. User history: weak points from Pinecone
4. Instructions: how to structure the roadmap
5. Output format: Zod schema
6. Constraints: max concepts per node, etc.

## Common Mistakes
- Not specifying output format → unparseable response
- Too vague instructions → inconsistent quality
- No constraints → model goes off-script
- Forgetting user context → generic non-personalized output

## Links
[[LangGraph]]
[[Task Planning]]
[[AI Agent Concepts]]