# Reasoning Models

## What is it
LLMs that think step-by-step internally before
producing a final answer.
Also called "thinking models" or "extended thinking."

## Key Models (2026)
- **OpenAI o3/o4** — best for math, code, logic
- **Claude Opus 4.6** — extended thinking mode
- **Gemini 2.5 Pro** — strong reasoning + long context
- **DeepSeek R2** — open source, cost-effective

## How it works
Normal model: input → output
Reasoning model: input → [internal thinking] → output

The internal thinking is hidden "scratchpad" where
the model works through the problem before answering.

## When to use in SkillPath

### Use reasoning models for:
- Planner Node — complex curriculum design
- Evaluator Node — nuanced assessment of answers
- Difficult concept explanations

### Don't use for:
- Simple quiz generation (too expensive)
- Resource ranking (GPT-4o-mini is fine)
- Basic chat responses

## Cost Reality
Reasoning models are 5-10x more expensive.
Use them surgically, not everywhere.
o3-mini is a good balance of cost + reasoning quality.

## Interview Angle
"I considered using reasoning models for the Planner
Node but found GPT-4o with Chain-of-Thought prompting
achieved 90% of the quality at 20% of the cost.
Reasoning models are overkill for structured output tasks."

## Links
[[Prompt Engineering]]
[[Cost Control]]
[[Task Planning]]