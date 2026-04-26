import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getToken } from '../services/authService.js'

/* ── Icons ── */
function VideoIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
}
function ArticleIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
}
function DocsIcon({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
}
function BackIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
}
function ClockIcon({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function QuizIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
}
function CheckIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function ExternalIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
}
function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}

const iconColors = {
  video:   { bg: 'rgba(124,106,247,0.15)', color: 'var(--color-purple-400)' },
  article: { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa' },
  docs:    { bg: 'rgba(52,211,153,0.12)',  color: '#34d399' },
  exercise:{ bg: 'rgba(247,198,106,0.12)', color: '#f7c66a' },
}

function ResourceIcon({ type, size = 18 }) {
  if (type === 'video')   return <VideoIcon size={size} />
  if (type === 'docs')    return <DocsIcon size={size} />
  return <ArticleIcon size={size} />
}

function ResourceSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', background: 'var(--color-bg-surface-2)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: '#1e1e2e' }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 14, width: '60%', background: '#1e1e2e', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 11, width: '30%', background: '#1a1a2e', borderRadius: 4 }} />
      </div>
      <div style={{ width: 64, height: 32, background: '#1e1e2e', borderRadius: 'var(--radius-md)' }} />
    </div>
  )
}

export default function LearningNode() {
  const navigate  = useNavigate()
  const location  = useLocation()

  // Prefer router state, fall back to localStorage (handles refresh + Dashboard navigate)
  const statePathId = location.state?.pathId
  const stateWeek   = location.state?.week

  const pathId = statePathId || localStorage.getItem('learn_pathId') || null
  const week   = stateWeek   != null ? stateWeek : parseInt(localStorage.getItem('learn_week') || '1', 10)

  // Persist whenever we have fresh values from router state
  useEffect(() => {
    if (statePathId) localStorage.setItem('learn_pathId', statePathId)
    if (stateWeek  != null) localStorage.setItem('learn_week', String(stateWeek))
  }, [statePathId, stateWeek])

  const [node,     setNode]     = useState(null)
  const [pathMeta, setPathMeta] = useState(null)
  const [totalWeeks, setTotalWeeks] = useState(6)
  const [resources, setResources] = useState([])
  const [nodeLoading,      setNodeLoading]      = useState(!!pathId)
  const [resourcesLoading, setResourcesLoading] = useState(!!pathId)
  const [resourcesError,   setResourcesError]   = useState(null)
  const [completed,        setCompleted]        = useState(false)
  const [resourceOpened,   setResourceOpened]   = useState({})

  // Fetch path + node data
  useEffect(() => {
    if (!pathId) return
    const token = getToken()
    fetch(`/api/roadmap/${pathId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(({ path }) => {
        setPathMeta(path)
        setTotalWeeks(path.weeks)
        const found = path.nodes.find(n => n.week === week)
        setNode(found || null)
      })
      .catch(console.error)
      .finally(() => setNodeLoading(false))
  }, [pathId, week])

  // Fetch real resources via Tavily once we have the node
  useEffect(() => {
    if (!pathId || !node) return
    const token = getToken()
    setResourcesLoading(true)
    setResourcesError(null)
    fetch(`/api/roadmap/${pathId}/node/${week}/resources`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.resources) setResources(data.resources)
        else setResourcesError(data.message || 'Failed to load resources')
      })
      .catch(() => setResourcesError('Could not connect to resource finder'))
      .finally(() => setResourcesLoading(false))
  }, [pathId, node])

  function openResource(i, url) {
    setResourceOpened(prev => ({ ...prev, [i]: true }))
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => setResourceOpened(prev => ({ ...prev, [i]: false })), 1800)
  }

  // Fallback display values when not loaded from API
  const displayTitle    = node?.title    || 'State management & the component lifecycle'
  const displayDesc     = node?.description || 'Understand how React tracks and updates state, when components re-render, and how to use hooks to manage side effects cleanly.'
  const displayTopics   = node?.topics   || ['useState and the render cycle', 'useEffect and cleanup functions', 'Derived state vs. stored state', 'Lifting state up the tree', 'Common re-render pitfalls']
  const displayPathName = pathMeta?.topic || 'React Fundamentals'
  const currentWeek     = node?.week     || week
  const progressPct     = Math.round((currentWeek - 1) / totalWeeks * 100)

  // Week beyond end-of-path → course complete screen
  if (!nodeLoading && pathId && pathMeta && !node) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: 24, background: 'var(--color-bg-base)', fontFamily: 'var(--font-sans)' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>
          {week > totalWeeks ? 'You completed the course!' : 'Week not found'}
        </h1>
        <p style={{ fontSize: 15, color: '#7a7a94', maxWidth: 400, lineHeight: 1.6, marginBottom: 32 }}>
          {week > totalWeeks
            ? `You've finished all ${totalWeeks} weeks of "${pathMeta.topic}". Head to the dashboard to start a new path.`
            : `Week ${week} doesn't exist in this path.`}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: '#7C6AF7', color: '#fff', border: 'none', borderRadius: 9999, padding: '14px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--color-bg-base)', fontFamily: 'var(--font-sans)', minHeight: '100vh' }}>
      {/* Topbar */}
      <nav style={{ height: 52, borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'none', padding: '6px 8px', borderRadius: 'var(--radius-md)', transition: 'var(--transition-fast)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-surface-3)'; e.currentTarget.style.color = 'var(--fg)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--fg-muted)' }}>
          <BackIcon /> My Paths
        </button>
        <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>/</span>
        <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>{displayPathName}</span>
        <span style={{ color: 'var(--fg-muted)', fontSize: 13 }}>/</span>
        <span style={{ color: 'var(--fg)', fontSize: 13, fontWeight: 500 }}>Week {currentWeek}</span>
      </nav>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>
        {nodeLoading ? (
          /* Node skeleton */
          <div style={{ animation: 'fadeUp 0.3s var(--ease-out-expo)' }}>
            {[80, 320, 20, 80].map((w, i) => (
              <div key={i} style={{ height: i === 1 ? 36 : 16, width: `${w}%`, background: '#1e1e2e', borderRadius: 6, marginBottom: 16 }} />
            ))}
          </div>
        ) : (
          <>
            {/* Week badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-subtle)', color: 'var(--color-purple-400)', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(124,106,247,0.2)', marginBottom: 16 }}>
              <ClockIcon size={12} /> Week {currentWeek} of {totalWeeks}
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--fg)', marginBottom: 8 }}>
              {displayTitle}
            </h1>
            <p style={{ fontSize: 15, color: 'var(--fg-muted)', lineHeight: 1.6, marginBottom: 28 }}>
              {displayDesc}
            </p>

            {/* Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { icon: <ClockIcon />, text: `${displayTopics.length * 30} min est.` },
                { icon: <DocsIcon size={14} />, text: `${resources.length || 3} resources` },
                { icon: <CheckIcon />, text: `${displayTopics.length} concepts` },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg-muted)' }}>{m.icon}{m.text}</div>
              ))}
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-secondary)' }}>Course progress</span>
                <span style={{ fontSize: 12, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>{currentWeek} / {totalWeeks} weeks</span>
              </div>
              <div style={{ height: 6, background: 'var(--color-bg-surface-3)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg,var(--color-purple-700),var(--color-purple-500))', borderRadius: 'var(--radius-full)', width: `${progressPct}%`, transition: 'width 0.6s var(--ease-out-expo)' }} />
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                {Array.from({ length: totalWeeks }).map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 'var(--radius-full)', background: i < currentWeek - 1 ? 'var(--color-purple-500)' : i === currentWeek - 1 ? 'rgba(124,106,247,0.6)' : 'var(--color-bg-surface-3)', transition: 'background 0.3s ease' }} />
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--color-border-subtle)', margin: '8px 0 32px' }} />

            {/* Key Concepts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 16 }}>
              Key concepts
              <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 40 }}>
              {displayTopics.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', background: 'var(--color-bg-surface-2)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)', transition: 'border-color 0.15s ease,transform 0.15s ease', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-default)'; e.currentTarget.style.transform = 'none' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === displayTopics.length - 1 ? 'var(--color-gold-500)' : 'var(--color-purple-500)', flexShrink: 0, marginTop: 5 }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-secondary)', lineHeight: 1.4 }}>{c}</span>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: 'var(--color-border-subtle)', margin: '8px 0 32px' }} />

            {/* Resources */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 16 }}>
              Resources
              <div style={{ flex: 1, height: 1, background: 'var(--color-border-subtle)' }} />
              {resourcesLoading && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--fg-muted)', fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>
                  <SpinnerIcon /> Searching the web…
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
              {resourcesLoading ? (
                [0, 1, 2].map(i => <ResourceSkeleton key={i} />)
              ) : resourcesError ? (
                <div style={{ padding: '16px 20px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius-lg)', fontSize: 13, color: '#f87171' }}>
                  {resourcesError}
                </div>
              ) : resources.length === 0 ? (
                <div style={{ padding: '16px 20px', background: 'var(--color-bg-surface-2)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)', fontSize: 13, color: 'var(--fg-muted)' }}>
                  No resources found for this topic.
                </div>
              ) : (
                resources.map((r, i) => {
                  const ic = iconColors[r.type] || iconColors.article
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', background: 'var(--color-bg-surface-2)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)', transition: 'border-color 0.15s ease,transform 0.15s ease,box-shadow 0.15s ease', cursor: 'default' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-1)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-default)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: ic.bg, color: ic.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ResourceIcon type={r.type} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 'var(--radius-sm)', background: ic.bg, color: ic.color }}>{r.type}</span>
                          {r.duration && (
                            <span style={{ fontSize: 12, color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><ClockIcon size={11} />{r.duration}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => openResource(i, r.url)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--radius-md)', border: `1px solid ${resourceOpened[i] ? 'var(--color-purple-500)' : 'var(--color-border-default)'}`, background: 'transparent', color: resourceOpened[i] ? 'var(--color-purple-400)' : 'var(--fg-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'var(--transition-fast)', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'var(--font-sans)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-purple-500)'; e.currentTarget.style.color = 'var(--color-purple-400)'; e.currentTarget.style.background = 'var(--accent-subtle)' }}
                        onMouseLeave={e => { if (!resourceOpened[i]) { e.currentTarget.style.borderColor = 'var(--color-border-default)'; e.currentTarget.style.color = 'var(--fg-secondary)'; e.currentTarget.style.background = 'transparent' } }}>
                        {resourceOpened[i] ? <><CheckIcon /> Opened</> : <><ExternalIcon /> Open</>}
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            <div style={{ height: 1, background: 'var(--color-border-subtle)', margin: '8px 0 32px' }} />

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
              <button onClick={() => navigate('/quiz', { state: { pathId, week } })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '16px 24px', background: 'var(--color-purple-500)', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)', border: 'none', borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'background 0.15s ease,transform 0.15s ease,box-shadow 0.15s ease', letterSpacing: '-0.01em' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-purple-400)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,106,247,0.35)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-purple-500)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                <QuizIcon /> Start quiz
              </button>
              <button onClick={() => setCompleted(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px 24px', background: completed ? 'rgba(52,211,153,0.08)' : 'transparent', color: completed ? 'var(--color-success)' : 'var(--fg-muted)', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-sans)', border: `1px solid ${completed ? 'var(--color-success)' : 'var(--color-border-default)'}`, borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'var(--transition-fast)' }}
                onMouseEnter={e => { if (!completed) { e.currentTarget.style.borderColor = 'var(--color-success)'; e.currentTarget.style.color = 'var(--color-success)'; e.currentTarget.style.background = 'rgba(52,211,153,0.06)' } }}
                onMouseLeave={e => { if (!completed) { e.currentTarget.style.borderColor = 'var(--color-border-default)'; e.currentTarget.style.color = 'var(--fg-muted)'; e.currentTarget.style.background = 'transparent' } }}>
                <CheckIcon /> {completed ? 'Completed' : 'Mark as complete'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
