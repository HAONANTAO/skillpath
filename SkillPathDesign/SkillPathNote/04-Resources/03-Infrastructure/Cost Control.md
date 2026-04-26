# Cost Control

## Why it matters
Open registration means anyone can use your OpenAI credits.
Without protection, one bad actor can drain your account overnight.
Cost control = the difference between a real product and a toy.

## SkillPath Four-Layer Protection

### Layer 1 — IP Rate Limiting
Prevent mass account creation from same IP.
```javascript
import rateLimit from 'express-rate-limit'

const registerLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // max 3 accounts per IP per day
  message: 'Too many accounts created from this IP'
})

app.post('/api/auth/register', registerLimiter, registerHandler)
```

### Layer 2 — Per-User Daily Token Quota
Each free user gets 50,000 tokens per day.
Tracked in MongoDB, resets at midnight.
```javascript
// Check quota before every LLM call
const user = await User.findById(userId)
if (user.dailyTokensUsed >= 50000) {
  return res.status(429).json({ 
    error: 'Daily limit reached. Resets at midnight.' 
  })
}

// Update after LLM call
await User.findByIdAndUpdate(userId, {
  $inc: { dailyTokensUsed: tokensUsed }
})
```

### Layer 3 — Model Tiering
Use cheap models for simple tasks, expensive only when needed.

| Task | Model | Cost per 1M tokens |
|---|---|---|
| Quiz generation | GPT-4o-mini | $0.15 input |
| Simple chat | GPT-4o-mini | $0.15 input |
| Roadmap planning | GPT-4o | $2.50 input |
| Resource ranking | GPT-4o-mini | $0.15 input |

Rule: Only use GPT-4o when task requires deep reasoning.
Everything else → GPT-4o-mini.
Saves ~70% on model costs.

### Layer 4 — Global Circuit Breaker
If total daily OpenAI spend > $2, auto-shutdown all LLM calls.
Send email alert immediately.
```javascript
// Cron job runs every hour
const checkDailySpend = async () => {
  const spend = await getDailyOpenAISpend()
  if (spend > 2.00) {
    await setGlobalFlag('llm_disabled', true)
    await sendAlertEmail(`Daily spend: $${spend}`)
  }
}
```

## Token Optimization Tips

### Prompt Compression
Remove unnecessary words from prompts.
"Please kindly generate a comprehensive learning roadmap"
→ "Generate learning roadmap"
Saves 5-10 tokens per call, adds up at scale.

### Caching
Cache identical requests for 24 hours.
If 10 users ask for "Learn React roadmap",
only call OpenAI once.
Use Redis or MongoDB for caching.

### Context Window Management
Don't send entire conversation history every time.
Summarize old messages: "Previously: user learned JSX basics"
Instead of sending 20 full messages.

### Batch Processing
For non-urgent tasks, use OpenAI Batch API.
50% cheaper, processes within 24 hours.

## Budget Target
- 50 DAU (daily active users)
- Average 3 learning sessions per user per day
- Target: < $30/month OpenAI cost

## Interview Value
"I designed a four-layer cost control system that
supports 50 daily active users under $30/month.
The key insight was model tiering — using GPT-4o-mini
for 80% of calls and reserving GPT-4o only for
complex planning tasks, which reduced costs by 70%."

## Links
[[AI Agent Concepts]]
[[LangGraph]]
[[Prompt Engineering]]
[[LangSmith]]