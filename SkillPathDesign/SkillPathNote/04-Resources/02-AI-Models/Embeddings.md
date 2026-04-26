# Embeddings

## What is it
Converting text into a vector of numbers that 
captures semantic meaning.
Similar meaning = similar vectors = close in space.

## Why it matters for SkillPath
- User's weak concepts are embedded and stored
- When searching, we find semantically similar concepts
- "useEffect cleanup" and "useEffect return function" 
  are close vectors — Agent knows they're related

## How it works
text → embedding model → [0.23, -0.81, 0.44, ...]
                          1536 numbers (text-embedding-3-small)

## Key Numbers
- text-embedding-3-small: 1536 dimensions
- text-embedding-3-large: 3072 dimensions
- Smaller = cheaper + faster, good enough for most cases

## Cosine Similarity
How we measure if two vectors are similar.
Score 0 to 1, closer to 1 = more similar.

## In SkillPath
1. User gets quiz question wrong
2. Wrong concept → embed → 1536-dim vector
3. Store in Pinecone with metadata
4. Next session → query Pinecone
5. Find top 5 similar weak concepts
6. Feed into Researcher Node as context

## Links
[[Memory Management]]
[[Pinecone]]
[[RAG vs Agent]]