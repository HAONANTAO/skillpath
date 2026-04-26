# Pinecone

## What is it
A managed vector database — stores and searches
embeddings at scale.

## Core Concepts

### Index
The database. SkillPath uses one index.
- Dimension: 1536 (matches text-embedding-3-small)
- Metric: cosine similarity

### Namespace
Like a folder inside the index.
SkillPath uses one namespace per user:
user_{userId} → isolates each user's memory

### Vector
Each stored item has:
- id: unique string
- values: [1536 numbers]
- metadata: { type, concept, topic, mastery, date }

### Upsert
Insert or update a vector.
If id exists, overwrite. If not, create new.

## Query Flow
1. Convert search text to embedding
2. Send to Pinecone: "find top 5 similar vectors"
3. Pinecone returns closest matches + metadata
4. Use metadata to personalize content

## In SkillPath vs DocuMind

### DocuMind
- Stores document chunks
- Query: "find chunks related to user's question"
- Purpose: answer questions about documents

### SkillPath  
- Stores user's weak concepts
- Query: "find this user's weak points"
- Purpose: personalize learning experience

## Cost
Free tier: 1 index, enough for MVP
~100k vectors free — plenty for early users

## Links
[[Memory Management]]
[[Embeddings]]
[[RAG vs Agent]]