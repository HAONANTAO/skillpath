import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell, { Icon } from '../components/AppShell.jsx'
import { useToast } from '../components/Toast.jsx'
import { deriveMeta } from '../lib/pathHelpers.js'

export default function WeakConcepts() {
  const navigate = useNavigate()
  const toast = useToast()
  const [concepts, setConcepts]   = useState([])
  const [paths, setPaths]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [query, setQuery]         = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    // Pull both in parallel — concepts need paths to wire up the "review" link
    Promise.allSettled([
      fetch('/api/roadmap/weak-concepts', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/roadmap/my-paths',      { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([w, p]) => {
        if (w.status === 'fulfilled') setConcepts(w.value.concepts || [])
        if (p.status === 'fulfilled') setPaths(p.value.paths || [])
      })
      .catch(err => toast.error(err.message || 'Failed to load weak concepts'))
      .finally(() => setLoading(false))
  }, [toast])

  // Group concepts by topic; each group lists its concepts (deduped)
  const groups = useMemo(() => {
    const byTopic = new Map()
    for (const c of concepts) {
      if (!byTopic.has(c.topic)) byTopic.set(c.topic, new Map())
      const inner = byTopic.get(c.topic)
      // Dedupe concept names within a topic; keep the highest score we've seen
      const prev = inner.get(c.concept) || { count: 0, score: 0 }
      inner.set(c.concept, { count: prev.count + 1, score: Math.max(prev.score, c.score || 0) })
    }
    let arr = Array.from(byTopic.entries()).map(([topic, conceptMap]) => ({
      topic,
      concepts: Array.from(conceptMap.entries())
        .map(([name, meta]) => ({ name, ...meta }))
        .sort((a, b) => b.count - a.count || b.score - a.score),
    }))
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      arr = arr
        .map(g => ({
          topic: g.topic,
          concepts: g.concepts.filter(c => c.name.toLowerCase().includes(q) || g.topic.toLowerCase().includes(q)),
        }))
        .filter(g => g.concepts.length > 0)
    }
    return arr.sort((a, b) => b.concepts.length - a.concepts.length)
  }, [concepts, query])

  function reviewTopic(topic) {
    // Find the first existing path whose topic matches and open its current week
    const match = paths.find(p => p.topic === topic) || paths.find(p => p.topic.toLowerCase().includes(topic.toLowerCase()))
    if (!match) {
      toast.info('No active path for this topic — create one to start reviewing')
      navigate('/roadmap')
      return
    }
    const completedWeeks = Math.round((match.progress / 100) * match.weeks)
    const week = Math.min(match.weeks, completedWeeks + 1)
    localStorage.setItem('learn_pathId', match._id)
    localStorage.setItem('learn_week', String(week))
    navigate('/learn', { state: { pathId: match._id, week } })
  }

  const totalConcepts = groups.reduce((sum, g) => sum + g.concepts.length, 0)

  return (
    <AppShell active="weak-concepts">
      <div style={{ maxWidth: 880, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>Weak concepts</h1>
          <p style={{ fontSize: 14, color: '#7a7a94' }}>
            {loading
              ? 'Loading…'
              : totalConcepts === 0
                ? 'No weak concepts tracked yet — take a quiz and miss a few questions to populate this.'
                : `${totalConcepts} ${totalConcepts === 1 ? 'concept' : 'concepts'} across ${groups.length} ${groups.length === 1 ? 'topic' : 'topics'}`}
          </p>
        </div>

        {!loading && totalConcepts > 0 && (
          <div style={{ marginBottom: 16 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search a concept or topic…"
              style={{ width: '100%', maxWidth: 360, background: '#131320', border: '1px solid #2a2a3d', borderRadius: 8, padding: '9px 14px', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: 13, outline: 'none', transition: 'border-color 150ms ease' }}
              onFocus={e => e.target.style.borderColor = '#7C6AF7'}
              onBlur={e => e.target.style.borderColor = '#2a2a3d'}
            />
          </div>
        )}

        {loading ? (
          <SkeletonGroups />
        ) : totalConcepts === 0 ? (
          <EmptyState onStart={() => navigate('/roadmap')} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {groups.map(g => (
              <TopicGroup
                key={g.topic}
                topic={g.topic}
                concepts={g.concepts}
                onReview={() => reviewTopic(g.topic)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

function TopicGroup({ topic, concepts, onReview }) {
  const { color } = deriveMeta(topic)
  return (
    <section style={{ background: '#131320', border: '1px solid #2a2a3d', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topic}</h2>
          <span style={{ fontSize: 12, color: '#7a7a94', flexShrink: 0 }}>· {concepts.length} {concepts.length === 1 ? 'concept' : 'concepts'}</span>
        </div>
        <button
          onClick={onReview}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'transparent', border: '1px solid #2a2a3d', color: '#c4c4d4', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0, transition: 'all 150ms ease' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#7C6AF7'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a3d'; e.currentTarget.style.color = '#c4c4d4' }}
        >
          <Icon name="sparkles" size={12} /> Review
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {concepts.map(c => (
          <ConceptChip key={c.name} name={c.name} count={c.count} />
        ))}
      </div>
    </section>
  )
}

function ConceptChip({ name, count }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.22)', borderRadius: 6, padding: '5px 10px', fontSize: 12, color: '#f87171', fontWeight: 500 }}>
      <span>{name}</span>
      {count > 1 && (
        <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(248,113,113,0.2)', color: '#fca5a5', padding: '1px 6px', borderRadius: 999 }}>×{count}</span>
      )}
    </span>
  )
}

function SkeletonGroups() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[0, 1].map(i => (
        <div key={i} style={{ background: '#131320', border: '1px solid #2a2a3d', borderRadius: 12, padding: 20 }}>
          <div style={{ width: 160, height: 14, background: '#1e1e30', borderRadius: 4, marginBottom: 14 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {[60, 80, 50, 100, 70].map((w, j) => (
              <div key={j} style={{ width: w, height: 26, background: '#1e1e30', borderRadius: 6 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onStart }) {
  return (
    <div style={{ background: '#131320', border: '1px dashed #2a2a3d', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>No weak concepts yet</div>
      <div style={{ fontSize: 13, color: '#7a7a94', marginBottom: 20, maxWidth: 380, marginInline: 'auto', lineHeight: 1.5 }}>
        Concepts you miss on quizzes show up here, grouped by topic. They also feed the planner so new paths reinforce them automatically.
      </div>
      <button
        onClick={onStart}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7C6AF7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
      >
        <Icon name="sparkles" size={14} color="#fff" /> Start a path
      </button>
    </div>
  )
}
