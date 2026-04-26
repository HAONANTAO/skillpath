import { Pinecone } from '@pinecone-database/pinecone'
import OpenAI from 'openai'

const INDEX_NAME = 'skillpath-memory'
const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIM = 1536

let _pinecone = null
let _index = null
let _openai = null

function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

async function getIndex() {
  if (_index) return _index

  if (!_pinecone) _pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })

  // Create index if it doesn't exist
  const existing = await _pinecone.listIndexes()
  const names = existing.indexes?.map(i => i.name) ?? []

  if (!names.includes(INDEX_NAME)) {
    await _pinecone.createIndex({
      name: INDEX_NAME,
      dimension: EMBEDDING_DIM,
      metric: 'cosine',
      spec: { serverless: { cloud: 'aws', region: 'us-east-1' } },
    })
    // Wait for index to be ready
    await new Promise(r => setTimeout(r, 8000))
  }

  _index = _pinecone.index(INDEX_NAME)
  return _index
}

async function embed(text) {
  const res = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  })
  return res.data[0].embedding
}

/**
 * Store a weak concept for a user.
 * @param {string} userId   - MongoDB user _id string
 * @param {string} concept  - e.g. "useCallback"
 * @param {string} topic    - e.g. "React Fundamentals"
 */
export async function storeWeakConcept(userId, concept, topic) {
  const index = await getIndex()
  const text  = `${concept} in ${topic}`
  const vector = await embed(text)

  await index.upsert([{
    id:       `${userId}-${concept}-${topic}`.replace(/\s+/g, '_').toLowerCase(),
    values:   vector,
    metadata: { userId, concept, topic, storedAt: new Date().toISOString() },
  }])
}

/**
 * Retrieve weak concepts for a user, optionally filtered by topic.
 * @param {string} userId
 * @param {string} [topic]
 * @returns {Promise<Array<{concept: string, topic: string, score: number}>>}
 */
export async function getWeakConcepts(userId, topic) {
  const index  = await getIndex()
  const query  = topic ? `weak concepts in ${topic}` : 'weak concepts'
  const vector = await embed(query)

  const results = await index.query({
    vector,
    topK: 20,
    filter: topic
      ? { userId: { $eq: userId }, topic: { $eq: topic } }
      : { userId: { $eq: userId } },
    includeMetadata: true,
  })

  return (results.matches || []).map(m => ({
    concept: m.metadata.concept,
    topic:   m.metadata.topic,
    score:   m.score,
  }))
}
