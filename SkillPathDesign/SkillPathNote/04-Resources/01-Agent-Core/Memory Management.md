# Memory Management

## What is it
The ability of an Agent to store, retrieve, and use
information across multiple interactions and sessions.

Without memory, every conversation starts from zero.
With memory, the Agent knows who you are and what 
you've done before.

## Types of Memory

### Short-term Memory (In-context)
- Lives inside the current conversation window
- Stored in LangGraph State or message history
- Lost when the session ends
- Fast and cheap to access
- Example: "User just answered Question 3 correctly"

### Long-term Memory (Vector Store)
- Persists across sessions
- Stored in Pinecone as vector embeddings
- Retrieved via semantic similarity search
- Example: "User struggles with useEffect dependency arrays"

### Episodic Memory (Database)
- Structured historical records
- Stored in MongoDB
- Exact lookup, not semantic
- Example: "User completed Week 2 on April 15"

## How Vector Memory Works
1. Convert information to a vector (text-embedding-3-small)
2. Store vector + metadata in Pinecone
3. When needed, search by similarity
4. Return the most relevant memories

## In SkillPath
- **Short-term** — Current learning session context
- **Long-term** — User's weak points, mastered concepts
- **Episodic** — Quiz history, completed nodes, scores

## In DocuMind
- **Long-term** — Document chunks stored as vectors
- When user asks a question, retrieve relevant chunks

## The Difference
DocuMind uses memory to store documents.
SkillPath uses memory to understand the user.

## Key Insight
Memory is what makes SkillPath feel like a real coach
instead of a one-time chatbot interaction.

## Links
[[AI Agent Concepts]]
[[RAG vs Agent]]
[[LangGraph]]
[[Tool Calling]]