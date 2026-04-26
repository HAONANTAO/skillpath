# Vector Search

## What is it
Finding the most similar items in a vector database
by comparing embedding vectors.
Semantic search — finds meaning, not just keywords.

## Keyword vs Vector Search

### Keyword Search (old way)
"useEffect cleanup" finds documents containing
those exact words.
Misses: "cleanup function in hooks", "return in useEffect"

### Vector Search (new way)
"useEffect cleanup" finds documents with similar meaning.
Finds: "cleanup function in hooks" ✅
Finds: "unsubscribe in React hooks" ✅
Misses nothing semantically related.

## How Pinecone does it
1. Query text → embedding → query vector
2. Compare query vector to all stored vectors
3. Return top K most similar (cosine similarity)
4. Filter by metadata if needed

## Hybrid Search
Combine keyword + vector search for best results.
Vector search finds semantic matches.
Keyword search finds exact technical terms.
Re-ranker merges and scores combined results.

## In SkillPath
Pure vector search is enough for MVP.
User's weak concept "useEffect dependencies" 
semantically matches stored memory 
"dependency array confusion" → correct retrieval.

## Metadata Filtering
Pinecone lets you filter by metadata before searching.
```javascript
const results = await index.query({
  vector: queryEmbedding,
  topK: 5,
  filter: {
    userId: { $eq: userId },
    type: { $eq: 'weak_concept' }
  }
})
```
Critical for SkillPath — only search current user's memory.

## Links
[[Embeddings]]
[[Pinecone]]
[[Memory Management]]