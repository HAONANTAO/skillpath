import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword as apiResetPassword, saveAuth } from '../services/authService.js'
import { useToast } from '../components/Toast.jsx'

function CheckIcon({ size = 24 }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function LockIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
}
function EyeIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
}
function EyeOffIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const toast    = useToast()
  const [params] = useSearchParams()
  const token    = params.get('token')

  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [showPwd, setShowPwd]         = useState(false)
  const [loading, setLoading]         = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [done, setDone]               = useState(false)

  // Missing-token error is derived from the URL — no effect needed
  const error = submitError || (!token ? 'Missing reset token — open the link from your email again.' : null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError(null)
    if (password.length < 6) { setSubmitError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setSubmitError('Passwords do not match'); return }

    setLoading(true)
    try {
      const { token: authToken, user } = await apiResetPassword(token, password)
      saveAuth(authToken, user)
      setDone(true)
      toast.success('Password updated — signing you in')
      setTimeout(() => navigate('/dashboard'), 1200)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--color-bg-base, #0a0a0f)',padding:24,fontFamily:'var(--font-sans)' }}>
      <div style={{ width:'100%',maxWidth:420,background:'var(--color-bg-surface-2, #131320)',border:'1px solid var(--color-border-default, #2a2a3d)',borderRadius:'var(--radius-xl, 16px)',padding:'36px 32px',boxShadow:'var(--shadow-3, 0 8px 32px rgba(0,0,0,0.5))',animation:'fadeUp 0.35s var(--ease-out-expo, ease-out)' }}>
        {done ? (
          <div style={{ textAlign:'center',padding:'24px 0' }}>
            <div style={{ width:56,height:56,background:'rgba(52,211,153,0.12)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',color:'var(--color-success, #34d399)' }}><CheckIcon/></div>
            <h2 style={{ fontFamily:'var(--font-display)',fontSize:'var(--text-xl, 22px)',color:'#fff',marginBottom:8 }}>Password updated</h2>
            <p style={{ fontSize:'var(--text-sm, 14px)',color:'var(--fg-muted, #7a7a94)' }}>Redirecting to your dashboard…</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily:'var(--font-display)',fontSize:'var(--text-2xl, 26px)',fontWeight:700,color:'#fff',marginBottom:8 }}>Set a new password</h1>
            <p style={{ fontSize:'var(--text-base, 15px)',color:'var(--fg-muted, #7a7a94)',marginBottom:24 }}>Choose a new password for your SkillPath account.</p>

            <form onSubmit={handleSubmit} noValidate>
              <PasswordField
                label="New password" id="new-password"
                value={password} onChange={setPassword}
                show={showPwd} onToggle={() => setShowPwd(v => !v)}
              />
              <PasswordField
                label="Confirm password" id="confirm-password"
                value={confirm} onChange={setConfirm}
                show={showPwd} onToggle={() => setShowPwd(v => !v)}
              />

              {error && (
                <div style={{ background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.25)',borderRadius:'var(--radius-md, 8px)',padding:'10px 14px',fontSize:'var(--text-sm, 14px)',color:'#f87171',marginBottom:12 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                style={{ width:'100%',background:'var(--accent, #7C6AF7)',color:'#fff',border:'none',borderRadius:'var(--radius-md, 8px)',fontFamily:'var(--font-sans)',fontSize:'var(--text-base, 15px)',fontWeight:600,padding:'13px 20px',cursor:(loading || !token) ? 'not-allowed' : 'pointer',marginTop:8,opacity:(loading || !token) ? 0.6 : 1 }}
              >
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>

            <p style={{ textAlign:'center',marginTop:24,fontSize:'var(--text-sm, 14px)',color:'var(--fg-muted, #7a7a94)' }}>
              <span onClick={() => navigate('/login')} style={{ color:'var(--accent, #7C6AF7)',fontWeight:500,cursor:'pointer' }}>Back to sign in</span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

function PasswordField({ label, id, value, onChange, show, onToggle }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label htmlFor={id} style={{ display:'block',fontSize:'var(--text-sm, 14px)',fontWeight:500,color:'var(--fg-secondary, #c4c4d4)',marginBottom:6 }}>{label}</label>
      <div style={{ position:'relative' }}>
        <span style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--fg-muted, #7a7a94)',pointerEvents:'none' }}><LockIcon/></span>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          style={{ width:'100%',background:'var(--color-bg-surface-3, #1a1a2e)',border:'1px solid var(--color-border-default, #2a2a3d)',borderRadius:'var(--radius-md, 8px)',padding:'11px 40px 11px 38px',color:'#fff',fontFamily:'var(--font-sans)',fontSize:'var(--text-base, 15px)',outline:'none',transition:'border-color 150ms ease' }}
          onFocus={e => e.target.style.borderColor = 'var(--accent, #7C6AF7)'}
          onBlur={e  => e.target.style.borderColor = 'var(--color-border-default, #2a2a3d)'}
        />
        <button
          type="button" onClick={onToggle}
          style={{ position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',color:'var(--fg-muted, #7a7a94)',cursor:'pointer',padding:6,display:'flex',alignItems:'center' }}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOffIcon/> : <EyeIcon/>}
        </button>
      </div>
    </div>
  )
}
