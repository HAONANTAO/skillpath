import { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

const ToastContext = createContext(null)

const COLORS = {
  info:    { bg: 'rgba(124,106,247,0.08)', border: 'rgba(124,106,247,0.35)', accent: '#9b8cf9' },
  success: { bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.35)',  accent: '#34d399' },
  error:   { bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.35)', accent: '#f87171' },
}

const ICONS = {
  info:    '✦',
  success: '✓',
  error:   '!',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counterRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  const push = useCallback((message, opts = {}) => {
    const id  = ++counterRef.current
    const ttl = opts.ttl ?? 4000
    setToasts(t => [...t, { id, message, type: opts.type || 'info' }])
    if (ttl > 0) setTimeout(() => dismiss(id), ttl)
    return id
  }, [dismiss])

  const api = useMemo(() => ({
    info:    (msg, opts) => push(msg, { ...opts, type: 'info' }),
    success: (msg, opts) => push(msg, { ...opts, type: 'success' }),
    error:   (msg, opts) => push(msg, { ...opts, type: 'error' }),
    dismiss,
  }), [push, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      {typeof document !== 'undefined' && createPortal(<ToastStack toasts={toasts} onDismiss={dismiss} />, document.body)}
    </ToastContext.Provider>
  )
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380, pointerEvents: 'none' }}>
      {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />)}
    </div>
  )
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const c = COLORS[toast.type] || COLORS.info
  const icon = ICONS[toast.type] || ICONS.info

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: '#131320',
        borderLeft: `3px solid ${c.accent}`,
        border: `1px solid ${c.border}`,
        borderLeftWidth: 3,
        borderRadius: 10,
        padding: '12px 14px 12px 12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        fontFamily: 'var(--font-sans)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(20px)',
        transition: 'opacity 220ms ease, transform 220ms var(--ease-out-expo, ease-out)',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: c.bg, border: `1px solid ${c.border}`, color: c.accent, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
        {icon}
      </div>
      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.45, color: '#c4c4d4', paddingTop: 1 }}>
        {toast.message}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{ background: 'transparent', border: 'none', color: '#5a5a78', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px' }}
        onMouseEnter={e => e.currentTarget.style.color = '#c4c4d4'}
        onMouseLeave={e => e.currentTarget.style.color = '#5a5a78'}
      >
        ×
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
