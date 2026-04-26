# LangSmith

## What is it
Anthropic's observability platform for LLM applications.
Traces every LLM call, tool use, and Agent step.
Essential for debugging and optimization.

## Why you need it
Without LangSmith:
- Agent fails → no idea why
- Costs too much → no idea where
- Slow response → no idea which step

With LangSmith:
- See every prompt sent to the LLM
- See every tool call and result
- See token usage per step
- Replay failed runs
- Compare prompt versions

## Key Features

### Tracing
Automatically records every step of your Agent.
Each run shows: input → LLM calls → tool calls → output

### Evaluation
Test your Agent against a dataset of examples.
Measure quality scores over time.
Know when a prompt change makes things better or worse.

### Playground
Test prompts interactively.
Compare different models side by side.

## Setup
```javascript
process.env.LANGCHAIN_API_KEY = "your-key"
process.env.LANGCHAIN_TRACING_V2 = "true"
process.env.LANGCHAIN_PROJECT = "SkillPath"
```

That's it — LangChain/LangGraph auto-sends traces.

## In SkillPath
Use LangSmith to:
1. Debug Planner Node when roadmap quality is poor
2. Monitor token usage per user session
3. Identify which node is slowest
4. Optimize prompts based on real usage data

## Interview Value
"I used LangSmith to monitor production usage,
identify that the Planner Node was consuming 60%
of tokens, and optimized the prompt to reduce
cost by 40% without quality loss."

## Links
[[LangGraph]]
[[Prompt Engineering]]
[[AI Agent Concepts]]