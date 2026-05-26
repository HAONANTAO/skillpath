import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell, { Icon } from '../components/AppShell.jsx'
import { useToast } from '../components/Toast.jsx'
import { deriveMeta, timeAgo } from '../lib/pathHelpers.js'

const SORTS = [
  { id: 'recent',   label: 'Recent' },
  { id: 'progress', label: 'Progress' },
  { id: 'title',    label: 'Title' },
]
const STATUSES = [
  { id: 'all',       label: 'All' },
  { id: 'active',    label: 'In progress' },
  { id: 'completed', label: 'Completed' },
]

export default function MyPaths() {
  const navigate = useNavigate()
  const toast = useToast()
  const [paths, setPaths]     = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]     = useState('')
  const [status, setStatus]   = useState('all')
  const [sortBy, setSortBy]   = useState('recent')
  const [selected, setSelected] = useState(() => new Set())

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('/api/roadmap/my-paths', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setPaths(d.paths || []))
      .catch(err => toast.error(err.message || 'Failed to load paths'))
      .finally(() => setLoading(false))
  }, [toast])

  const visible = useMemo(() => {
    let list = paths
    if (status === 'active')    list = list.filter(p => p.progress < 100)
    if (status === 'completed') list = list.filter(p => p.progress >= 100)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(p => p.topic.toLowerCase().includes(q) || (p.goal || '').toLowerCase().includes(q))
    }
    const sorted = [...list]
    if (sortBy === 'recent')   sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (sortBy === 'progress') sorted.sort((a, b) => b.progress - a.progress)
    if (sortBy === 'title')    sorted.sort((a, b) => a.topic.localeCompare(b.topic))
    return sorted
  }, [paths, status, query, sortBy])

  function toggleSelected(id) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openPath(p) {
    const completed = Math.round((p.progress / 100) * p.weeks)
    const week = Math.min(p.weeks, completed + 1)
    localStorage.setItem('learn_pathId', p._id)
    localStorage.setItem('learn_week', String(week))
    navigate('/learn', { state: { pathId: p._id, week } })
  }

  async function deleteOne(p) {
    if (!window.confirm(`Delete "${p.topic}"? This can't be undone.`)) return
    const token = localStorage.getItem('token')
    const res = await fetch(`/api/roadmap/${p._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.message || 'Failed to delete path')
      return
    }
    setPaths(prev => prev.filter(x => x._id !== p._id))
    setSelected(prev => { const n = new Set(prev); n.delete(p._id); return n })
    if (localStorage.getItem('learn_pathId') === p._id) {
      localStorage.removeItem('learn_pathId')
      localStorage.removeItem('learn_week')
    }
    toast.success(`Deleted "${p.topic}"`)
  }

  async function deleteSelected() {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    if (!window.confirm(`Delete ${ids.length} paths? This can't be undone.`)) return
    const token = localStorage.getItem('token')
    const results = await Promise.allSettled(
      ids.map(id => fetch(`/api/roadmap/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }))
    )
    const failed = results.filter(r => r.status === 'rejected' || (r.value && !r.value.ok)).length
    const ok = ids.length - failed
    if (ok > 0) {
      setPaths(prev => prev.filter(x => !selected.has(x._id)))
      setSelected(new Set())
      toast.success(`Deleted ${ok} ${ok === 1 ? 'path' : 'paths'}`)
    }
    if (failed > 0) toast.error(`${failed} failed to delete`)
  }

  return (
    <AppShell active="my-paths">
      <div style={{ maxWidth: 960, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>My paths</h1>
          <p style={{ fontSize: 14, color: '#7a7a94' }}>
            {loading ? 'Loading…' : `${paths.length} ${paths.length === 1 ? 'path' : 'paths'} total`}
          </p>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by topic or goal…"
              style={{ width: '100%', background: '#131320', border: '1px solid #2a2a3d', borderRadius: 8, padding: '9px 14px', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: 13, outline: 'none', transition: 'border-color 150ms ease' }}
              onFocus={e => e.target.style.borderColor = '#7C6AF7'}
              onBlur={e => e.target.style.borderColor = '#2a2a3d'}
            />
          </div>

          <Pills options={STATUSES} value={status} onChange={setStatus} />
          <Pills options={SORTS}    value={sortBy} onChange={setSortBy} />

          <button
            onClick={() => navigate('/roadmap')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7C6AF7', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}
          >
            <Icon name="sparkles" size={14} color="#fff" /> New path
          </button>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(124,106,247,0.08)', border: '1px solid rgba(124,106,247,0.3)', borderRadius: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#c4c4d4' }}>{selected.size} selected</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setSelected(new Set())}
                style={{ background: 'transparent', border: '1px solid #2a2a3d', color: '#c4c4d4', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
              >Clear</button>
              <button
                onClick={deleteSelected}
                style={{ background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
              >Delete selected</button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <SkeletonList />
        ) : visible.length === 0 ? (
          <EmptyState query={query} status={status} onCreate={() => navigate('/roadmap')} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visible.map(p => (
              <PathRow
                key={p._id}
                path={p}
                selected={selected.has(p._id)}
                onToggle={() => toggleSelected(p._id)}
                onOpen={() => openPath(p)}
                onDelete={() => deleteOne(p)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

/* ── Sub-components ── */

function Pills({ options, value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', background: '#131320', border: '1px solid #2a2a3d', borderRadius: 8, padding: 3 }}>
      {options.map(o => {
        const on = value === o.id
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            style={{ background: on ? 'rgba(124,106,247,0.15)' : 'transparent', color: on ? '#fff' : '#7a7a94', border: 'none', borderRadius: 5, padding: '5px 11px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 150ms ease' }}
          >{o.label}</button>
        )
      })}
    </div>
  )
}

function PathRow({ path, selected, onToggle, onOpen, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const { tag, color } = deriveMeta(path.topic)
  const completedWeeks = Math.round((path.progress / 100) * path.weeks)
  const isComplete = path.progress >= 100

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, background: selected ? 'rgba(124,106,247,0.06)' : '#131320',
        border: `1px solid ${selected ? '#7C6AF7' : hovered ? '#4a4a68' : '#2a2a3d'}`,
        borderRadius: 10, padding: '14px 16px', transition: 'all 150ms ease',
      }}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        aria-label={`Select ${path.topic}`}
        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#7C6AF7', flexShrink: 0 }}
      />

      <div onClick={onOpen} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{path.topic}</div>
          <span style={{ fontSize: 11, fontWeight: 600, color, background: `${color}1a`, padding: '2px 8px', borderRadius: 4, flexShrink: 0 }}>{tag}</span>
          {isComplete && (
            <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.12)', padding: '2px 7px', borderRadius: 999, letterSpacing: '0.04em', textTransform: 'uppercase', flexShrink: 0 }}>Complete</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#7a7a94' }}>
          <span>Week {completedWeeks} of {path.weeks}</span>
          <span>·</span>
          <span>{path.progress}%</span>
          <span>·</span>
          <span>Created {timeAgo(path.createdAt)}</span>
        </div>
        <div style={{ marginTop: 8, height: 4, background: '#1e1e30', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${path.progress}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`, borderRadius: 999, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      <button
        onClick={onDelete}
        aria-label="Delete path"
        style={{ background: 'transparent', border: '1px solid #2a2a3d', borderRadius: 6, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a7a94', cursor: 'pointer', flexShrink: 0, transition: 'all 150ms ease' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)'; e.currentTarget.style.color = '#f87171' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a3d'; e.currentTarget.style.color = '#7a7a94' }}
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  )
}

function SkeletonList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ background: '#131320', border: '1px solid #2a2a3d', borderRadius: 10, padding: 18, height: 84 }}>
          <div style={{ width: '40%', height: 14, background: '#1e1e30', borderRadius: 4, marginBottom: 10 }} />
          <div style={{ width: '60%', height: 10, background: '#1e1e30', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ query, status, onCreate }) {
  const filtered = query.trim() || status !== 'all'
  return (
    <div style={{ background: '#131320', border: '1px dashed #2a2a3d', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{filtered ? '🔍' : '🗺️'}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
        {filtered ? 'No paths match your filters' : 'No paths yet'}
      </div>
      <div style={{ fontSize: 13, color: '#7a7a94', marginBottom: 20 }}>
        {filtered ? 'Try clearing the search or status filter.' : 'Generate your first AI-powered learning roadmap to get started.'}
      </div>
      {!filtered && (
        <button
          onClick={onCreate}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7C6AF7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          <Icon name="sparkles" size={14} color="#fff" /> Create a path
        </button>
      )}
    </div>
  )
}
