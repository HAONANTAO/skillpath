# Multi-Agent Systems

## What is it
Multiple AI Agents working together, each with a 
specialized role, to complete tasks that would be
too complex for a single agent.

## Why Multiple Agents?
- A single agent context window gets overwhelmed
- Different tasks need different specialized skills
- Parallel execution is faster
- Easier to debug and maintain

## Common Architectures

### Supervisor + Workers
One orchestrator agent breaks down the task
and delegates to specialized worker agents.