# LLM Observability

## What is it
Monitoring, tracing, and debugging LLM applications
in production.
Same concept as traditional app monitoring,
but adapted for non-deterministic AI systems.

## Why harder than normal apps
Normal app: same input → same output always.
LLM app: same input → different output each time.
Traditional monitoring doesn't capture this well.

## Key Metrics to Track

### Latency
- Time to first token (TTFT) — user experience
- Total generation time — workflow performance
- Per-node latency in LangGraph

### Quality
- User satisfaction scores
- Quiz accuracy rates
- Roadmap completion rates
- Re-generation rates (user rejected output)

### Cost
- Tokens per session
- Cost per user per day
- Cost per feature (planning vs quiz)

### Reliability
- Error rates per node
- Retry rates
- Timeout frequency

## Tools

### LangSmith (recommended for SkillPath)
- Auto-traces all LangChain/LangGraph calls
- Visual trace explorer
- Prompt versioning
- Evaluation datasets

### Helicone
- Lightweight proxy
- Cost tracking
- Caching layer

### Sentry
- Error tracking
- Not LLM-specific but catches crashes

## In SkillPath
LangSmith traces every Agent run.
When a user complains "my roadmap was wrong",
you can replay the exact run and see:
- What prompt was sent
- What the model returned
- Which node failed
- How many tokens were used

## Interview Value
"I used LangSmith to identify that 30% of Planner
Node failures were caused by malformed JSON output.
I added Zod validation with automatic retry logic,
reducing failure rate from 30% to under 2%."

## Links
[[LangSmith]]
[[LangGraph]]
[[Cost Control]]
[[Prompt Engineering]]