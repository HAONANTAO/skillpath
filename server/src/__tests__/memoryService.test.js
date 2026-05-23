import { describe, it, expect, beforeEach, vi } from 'vitest'

// vi.hoisted ensures these mocks exist before vi.mock factories run.
// Using plain `let`/`var` would leave the factory's closure referencing
// undefined values (because vi.mock is hoisted above non-import code).
const mocks = vi.hoisted(() => ({
  upsert:         { fn: null },
  query:          { fn: null },
  listIndexes:    { fn: null },
  createIndex:    { fn: null },
  embeddings:     { fn: null },
}))

// Populate inside vi.hoisted-scope after the fact — vi from outer scope works here
mocks.upsert.fn      = vi.fn().mockResolvedValue({})
mocks.query.fn       = vi.fn().mockResolvedValue({ matches: [] })
mocks.listIndexes.fn = vi.fn().mockResolvedValue({ indexes: [{ name: 'skillpath-memory' }] })
mocks.createIndex.fn = vi.fn().mockResolvedValue({})
mocks.embeddings.fn  = vi.fn().mockResolvedValue({ data: [{ embedding: new Array(1536).fill(0.1) }] })

vi.mock('@pinecone-database/pinecone', () => {
  class Pinecone {
    constructor() {
      this.listIndexes = mocks.listIndexes.fn
      this.createIndex = mocks.createIndex.fn
    }
    index() {
      return { upsert: mocks.upsert.fn, query: mocks.query.fn }
    }
  }
  return { Pinecone }
})

vi.mock('openai', () => {
  class OpenAI {
    constructor() {
      this.embeddings = { create: mocks.embeddings.fn }
    }
  }
  return { default: OpenAI }
})

// Import AFTER vi.mock registrations so memoryService binds to the mocked deps
const { storeWeakConcept, getWeakConcepts } = await import('../services/memoryService.js')

describe('memoryService', () => {
  beforeEach(() => {
    // Clear call history but keep implementations
    mocks.upsert.fn.mockClear()
    mocks.query.fn.mockClear()
    mocks.embeddings.fn.mockClear()
    mocks.query.fn.mockResolvedValue({ matches: [] })
    mocks.embeddings.fn.mockResolvedValue({ data: [{ embedding: new Array(1536).fill(0.1) }] })
  })

  describe('storeWeakConcept', () => {
    it('embeds "<concept> in <topic>" and upserts with sanitized id + metadata', async () => {
      await storeWeakConcept('user-123', 'useCallback', 'React Hooks')

      expect(mocks.embeddings.fn).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'useCallback in React Hooks',
      })
      expect(mocks.upsert.fn).toHaveBeenCalledTimes(1)
      const [vectors] = mocks.upsert.fn.mock.calls[0]
      expect(vectors).toHaveLength(1)
      // id format: lowercased + whitespace → underscore
      expect(vectors[0].id).toBe('user-123-usecallback-react_hooks')
      expect(vectors[0].metadata).toMatchObject({
        userId:  'user-123',
        concept: 'useCallback',
        topic:   'React Hooks',
      })
      expect(vectors[0].metadata.storedAt).toBeTypeOf('string')
      expect(vectors[0].values).toHaveLength(1536)
    })
  })

  describe('getWeakConcepts', () => {
    it('queries Pinecone with both userId and topic filter when topic is provided', async () => {
      mocks.query.fn.mockResolvedValueOnce({
        matches: [
          { score: 0.92, metadata: { concept: 'useState',  topic: 'React' } },
          { score: 0.81, metadata: { concept: 'useEffect', topic: 'React' } },
        ],
      })

      const result = await getWeakConcepts('user-123', 'React')

      expect(mocks.query.fn).toHaveBeenCalledWith(expect.objectContaining({
        topK: 20,
        includeMetadata: true,
        filter: { userId: { $eq: 'user-123' }, topic: { $eq: 'React' } },
      }))
      expect(result).toEqual([
        { concept: 'useState',  topic: 'React', score: 0.92 },
        { concept: 'useEffect', topic: 'React', score: 0.81 },
      ])
    })

    it('queries with only userId filter when topic is omitted', async () => {
      await getWeakConcepts('user-123')
      const lastCall = mocks.query.fn.mock.calls[mocks.query.fn.mock.calls.length - 1][0]
      expect(lastCall.filter).toEqual({ userId: { $eq: 'user-123' } })
    })

    it('returns an empty array when Pinecone returns no matches', async () => {
      mocks.query.fn.mockResolvedValueOnce({ matches: [] })
      const result = await getWeakConcepts('user-with-no-history')
      expect(result).toEqual([])
    })

    it('handles missing matches field defensively', async () => {
      mocks.query.fn.mockResolvedValueOnce({})
      const result = await getWeakConcepts('user-123')
      expect(result).toEqual([])
    })
  })
})
