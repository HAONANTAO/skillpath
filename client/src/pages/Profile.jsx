import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  fetchMe, updateProfile, changePassword as apiChangePassword, clearAuth,
} from '../services/authService.js'
import { useToast } from '../components/Toast.jsx'

/* ── Icons ── */
function ArrowLeft() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
}
function MailIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
}
function CalendarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function GoogleBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)', fontSize: 11, fontWeight: 600, color: '#60a5fa' }}>
      <svg width="11" height="11" viewBox="0 0 18 18" fill="none">
        <path d="M17.64 9.2045c0-.638-.0573-1.252-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.6149z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8064.54-1.8368.859-3.0477.859-2.3446 0-4.3282-1.5836-5.036-3.7105H.957v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.5954.1023-1.1732.282-1.71V4.9582H.957A8.9965 8.9965 0 0 0 0 9c0 1.452.3477 2.8264.957 4.0418L3.964 10.71z" fill="#FBBC05"/>
        <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4627.891 11.4255 0 9 0 5.4818 0 2.4382 2.0168.957 4.9582L3.964 7.29C4.6718 5.1632 6.6554 3.5795 9 3.5795z" fill="#EA4335"/>
      </svg>
      Google linked
    </span>
  )
}

function Avatar({ src, initials, size = 96 }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: '#1a1a2e', border: '2px solid #2a2a3d' }}
      />
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#7C6AF7,#5a4fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', border: '2px solid #2a2a3d' }}>
      {initials}
    </div>
  )
}

function initialsFor(name, email) {
  if (name?.trim()) {
    return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase()
  }
  return (email?.[0] || 'U').toUpperCase()
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/* ── Page ── */
export default function Profile() {
  const navigate = useNavigate()
  const toast    = useToast()
  const [me, setMe]             = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    fetchMe()
      .then(({ user }) => setMe(user))
      .catch(err => {
        setError(err.message)
        if (err.message === 'Not authorised' || err.message === 'Invalid token') {
          clearAuth()
          navigate('/login')
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) {
    return (
      <Shell>
        <div style={{ color: '#7a7a94', fontSize: 14, padding: 60, textAlign: 'center' }}>Loading…</div>
      </Shell>
    )
  }
  if (error || !me) {
    return (
      <Shell>
        <div style={{ color: '#f87171', fontSize: 14, padding: 60, textAlign: 'center' }}>{error || 'Failed to load profile'}</div>
      </Shell>
    )
  }

  return (
    <Shell>
      <header style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
        <Avatar src={me.avatarUrl} initials={initialsFor(me.name, me.email)} size={88} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6, lineHeight: 1.15 }}>
            {me.name || 'SkillPath user'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#7a7a94' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><MailIcon/> {me.email}</span>
            {me.createdAt && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><CalendarIcon/> Joined {formatDate(me.createdAt)}</span>
            )}
            {me.googleLinked && <GoogleBadge/>}
          </div>
        </div>
      </header>

      <NameSection me={me} setMe={setMe} toast={toast} />
      <PasswordSection me={me} toast={toast} />
      {me.googleLinked && !me.hasPassword && (
        <Note>
          Your avatar is synced from Google. To change it, update your profile picture in your Google account — it'll refresh next time you sign in.
        </Note>
      )}
    </Shell>
  )
}

/* ── Layout ── */
function Shell({ children }) {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base, #0a0a0f)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px 80px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#7a7a94', fontFamily: 'var(--font-sans)', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 24 }}
          onMouseEnter={e => e.currentTarget.style.color = '#c4c4d4'}
          onMouseLeave={e => e.currentTarget.style.color = '#7a7a94'}
        >
          <ArrowLeft/> Back to dashboard
        </button>
        {children}
      </div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <section style={{ background: '#131320', border: '1px solid #2a2a3d', borderRadius: 12, padding: '22px 24px', marginBottom: 16 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 14 }}>{title}</h2>
      {children}
    </section>
  )
}

function Note({ children }) {
  return (
    <div style={{ background: 'rgba(124,106,247,0.06)', border: '1px solid rgba(124,106,247,0.2)', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#9b8cf9', lineHeight: 1.5 }}>
      {children}
    </div>
  )
}

/* ── Name ── */
function NameSection({ me, setMe, toast }) {
  const [name, setName]       = useState(me.name || '')
  const [saving, setSaving]   = useState(false)
  const dirty = name.trim() !== (me.name || '').trim()

  async function handleSave(e) {
    e.preventDefault()
    if (!dirty || saving) return
    setSaving(true)
    try {
      const { user } = await updateProfile({ name: name.trim() })
      setMe(prev => ({ ...prev, name: user.name }))
      // Keep localStorage in sync so the sidebar/dropdown update instantly
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, name: user.name }))
      toast.success('Name updated')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Display name">
      <form onSubmit={handleSave}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={60}
          placeholder="What should we call you?"
          style={{ width: '100%', background: '#1a1a2e', border: '1px solid #2a2a3d', borderRadius: 8, padding: '11px 14px', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: 14, outline: 'none', transition: 'border-color 150ms ease' }}
          onFocus={e => e.target.style.borderColor = '#7C6AF7'}
          onBlur={e => e.target.style.borderColor = '#2a2a3d'}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button
            type="submit"
            disabled={!dirty || saving}
            style={{ background: dirty && !saving ? '#7C6AF7' : '#2a2a3d', color: dirty && !saving ? '#fff' : '#5a5a78', border: 'none', borderRadius: 8, padding: '9px 18px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: dirty && !saving ? 'pointer' : 'not-allowed', transition: 'all 150ms ease' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Card>
  )
}

/* ── Password ── */
function PasswordSection({ me, toast }) {
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd]         = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState(null)

  const needsCurrent = me.hasPassword
  const valid =
    newPwd.length >= 6 &&
    newPwd === confirmPwd &&
    (!needsCurrent || currentPwd.length > 0)

  async function handleSave(e) {
    e.preventDefault()
    setError(null)
    if (!valid || saving) return
    setSaving(true)
    try {
      await apiChangePassword({
        currentPassword: needsCurrent ? currentPwd : undefined,
        newPassword:     newPwd,
      })
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
      toast.success(me.hasPassword ? 'Password updated' : 'Password set')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title={me.hasPassword ? 'Change password' : 'Set a password'}>
      {!me.hasPassword && (
        <p style={{ fontSize: 13, color: '#7a7a94', marginBottom: 14, lineHeight: 1.55 }}>
          You signed in with Google, so you don't have a password yet. Setting one lets you sign in with email + password too.
        </p>
      )}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {needsCurrent && (
          <PasswordField label="Current password" value={currentPwd} onChange={setCurrentPwd} autoComplete="current-password" />
        )}
        <PasswordField label="New password" value={newPwd} onChange={setNewPwd} autoComplete="new-password" hint="At least 6 characters" />
        <PasswordField label="Confirm new password" value={confirmPwd} onChange={setConfirmPwd} autoComplete="new-password" />

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#f87171' }}>{error}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            type="submit"
            disabled={!valid || saving}
            style={{ background: valid && !saving ? '#7C6AF7' : '#2a2a3d', color: valid && !saving ? '#fff' : '#5a5a78', border: 'none', borderRadius: 8, padding: '9px 18px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: valid && !saving ? 'pointer' : 'not-allowed', transition: 'all 150ms ease' }}
          >
            {saving ? 'Saving…' : me.hasPassword ? 'Update password' : 'Set password'}
          </button>
        </div>
      </form>
    </Card>
  )
}

function PasswordField({ label, value, onChange, autoComplete, hint }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#c4c4d4', marginBottom: 6, letterSpacing: '0.04em' }}>{label}</label>
      <input
        type="password"
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={hint || '••••••••'}
        style={{ width: '100%', background: '#1a1a2e', border: '1px solid #2a2a3d', borderRadius: 8, padding: '11px 14px', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: 14, outline: 'none', transition: 'border-color 150ms ease' }}
        onFocus={e => e.target.style.borderColor = '#7C6AF7'}
        onBlur={e => e.target.style.borderColor = '#2a2a3d'}
      />
      {hint && <div style={{ fontSize: 11, color: '#7a7a94', marginTop: 5 }}>{hint}</div>}
    </div>
  )
}
