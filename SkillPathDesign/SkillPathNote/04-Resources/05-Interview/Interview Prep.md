# Interview Prep — SkillPath

## One-liner
"SkillPath is a full-stack AI Agent application —
an adaptive learning coach that plans your roadmap,
finds resources, quizzes you, and remembers your
weak points using LangGraph.js and Pinecone."

---

## Project Questions

### Q: Tell me about SkillPath
SkillPath is a full-stack AI Agent built with MERN
and LangGraph.js. Unlike a chatbot, it autonomously
plans a personalized learning path, calls search tools
to find resources, generates adaptive quizzes, and uses
Pinecone vector memory to remember each user's weak
points across sessions.

I built it because I wanted to show the difference
between a RAG system (DocuMind) and a true Agent system.
SkillPath is also something I use myself — I used it
to pass my Victorian motorcycle learner permit test.

### Q: What makes it different from ChatGPT?
GPT is a library. SkillPath is a coach.
A library has all the knowledge but doesn't know you.
A coach remembers you, plans for you, tests you,
and won't let you move forward until you understand.

Three concrete differences:
1. GPT forgets you every session. SkillPath remembers
   your weak points via Pinecone across all sessions.
2. GPT waits for you to ask. SkillPath proactively
   plans your entire learning journey upfront.
3. GPT never tests you. SkillPath blocks progress
   until you pass a quiz with 60%+ score.

### Q: Why LangGraph instead of LangChain?
LangChain Chains are linear — A → B → C, no going back.
LangGraph is a state machine — it can loop, branch,
and handle conditional logic natively.

SkillPath needs to loop back when a user scores below
60% on a quiz. With LangChain, I'd have to build
this logic manually. With LangGraph, it's a
Conditional Edge — one line of config.

### Q: Walk me through the architecture
1. User inputs topic + goal + number of weeks
2. Planner Node (GPT-4o) generates structured roadmap
   validated by Zod schema
3. Researcher Node calls Tavily Search + YouTube API
   in parallel to find resources
4. Memory Node queries Pinecone for user's weak points
   and adjusts content difficulty
5. Quiz Node (GPT-4o-mini) generates 5 questions
6. Evaluator Node grades answers
7. Score < 60% → loop back to Researcher Node
8. Score ≥ 60% → advance to next learning node
9. Wrong concepts embedded and stored in Pinecone
10. Every step streamed to React frontend via SSE

### Q: How does the memory system work?
Three layers:
- Short-term: LangGraph State (current session context)
- Long-term: Pinecone vectors (weak concepts, mastery)
- Episodic: MongoDB (quiz history, completed nodes)

When a user gets a question wrong, that concept
is converted to a 1536-dim vector using
text-embedding-3-small and stored in Pinecone
under their user namespace with metadata.

Next session, the Memory Node queries Pinecone first,
finds the top 5 weak concepts, and feeds them into
the Researcher Node as priority topics.

### Q: How do you handle costs with open registration?
Four-layer protection:
1. IP rate limiting — max 3 accounts per IP per day
2. Per-user daily token quota — 50K tokens, tracked in MongoDB
3. Model tiering — GPT-4o-mini for 80% of calls,
   GPT-4o only for complex planning
4. Circuit breaker — auto-shutdown if daily spend > $2

Target: 50 DAU under $30/month OpenAI cost.
Model tiering alone saves ~70% on costs.

### Q: What was the hardest technical challenge?
Designing the Conditional Edge logic in LangGraph.
The Evaluator Node needs to decide: retry or advance?

Edge cases:
- User repeatedly fails same concept (infinite loop risk)
- User barely passes but is clearly struggling
- Network timeout mid-evaluation

Solution: Added a max_retries counter in LangGraph State.
After 3 failed attempts on same node, force advance
with a flag that marks the concept for intensive review.

### Q: How is SkillPath different from DocuMind?
DocuMind: RAG system, passive, document-focused.
User asks → retrieve chunks → generate answer.

SkillPath: Agent system, active, user-focused.
Agent plans → searches → tests → adapts → loops.

DocuMind uses Pinecone to store documents.
SkillPath uses Pinecone to understand the user.

One is a smarter search engine.
The other is an autonomous learning system.

### Q: What would you add next?
1. Multi-modal support — analyze code the user writes
2. Spaced repetition algorithm for review scheduling
3. Learning group feature — study with others
4. MCP integration — expose SkillPath as an MCP server
   so any AI assistant can access user's learning data

---

## Technical Deep-dive Questions

### Q: Explain vector embeddings
Text converted to a fixed-size array of numbers
capturing semantic meaning. Similar meaning = similar
vectors = small cosine distance in vector space.
text-embedding-3-small produces 1536-dim vectors.

### Q: What is cosine similarity?
Measures angle between two vectors.
Score 0 to 1. Closer to 1 = more similar.
Used by Pinecone to find nearest neighbor vectors.

### Q: How does SSE work?
Server-Sent Events — one-directional HTTP stream.
Server keeps connection open and pushes chunks.
Better than WebSocket for AI because we only need
server → client direction.

### Q: Why Zod for structured output?
LLMs return unpredictable text.
Agent nodes need exact JSON structures.
Zod validates schema and throws typed errors.
Without Zod, malformed LLM output crashes the app.

### Q: How did you use LangSmith?
Traced every Agent run in production.
Used it to identify that 30% of Planner Node
failures were malformed JSON. Added Zod + retry
logic, reduced failure rate to under 2%.
Also used to optimize prompts by comparing
token usage across versions.

---

## Behavioral Questions

### Q: Tell me about a time you debugged a hard problem
The Chinese PDF filename encoding bug in DocuMind.
Files uploaded with Chinese names were corrupted.
Traced it to latin1/utf8 mismatch in pdf-parse.
Fixed by downgrading to pdf-parse 1.1.1 and
adding explicit encoding conversion.
Taught me to always check library version changelogs.

### Q: How do you stay up to date with AI?
- Build real projects (DocuMind, SkillPath)
- Follow Anthropic and OpenAI release notes
- DeepLearning.AI courses for structured learning
- LangChain blog for practical Agent patterns

### Q: Why AI Full-Stack specifically?
Most AI engineers are Python-only and can't ship
a complete product. Most full-stack devs don't
understand LLMs or Agent architecture.
I bridge both — I can build the Agent logic AND
the production frontend/backend that users actually use.
That's a rare combination in the current market.

---

## Real Story (Always end with this)
"I used SkillPath to pass my Victorian motorcycle
learner permit test in 14 days. I input the topic,
set my goal as passing the knowledge test, and the
Agent built a 2-week plan, found the right resources
from the VicRoads handbook, and kept quizzing me on
the road rules I kept getting wrong — like give way
rules at unmarked intersections. I passed first attempt."

This story shows: real product, real user, real result.

---

## Links
[[AI Agent Concepts]]
[[LangGraph]]
[[Memory Management]]
[[RAG vs Agent]]
[[Cost Control]]
[[LangSmith]]