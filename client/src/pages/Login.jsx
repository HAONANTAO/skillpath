import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, register as apiRegister, saveAuth } from '../services/authService.js'

/* ── Icons ── */
function EmailIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
}
function LockIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
}
function UserIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function EyeIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
}
function EyeOffIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
}
function CheckIcon({ size = 24 }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2045c0-.638-.0573-1.252-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.6149z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8064.54-1.8368.859-3.0477.859-2.3446 0-4.3282-1.5836-5.036-3.7105H.957v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.5954.1023-1.1732.282-1.71V4.9582H.957A8.9965 8.9965 0 0 0 0 9c0 1.452.3477 2.8264.957 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4627.891 11.4255 0 9 0 5.4818 0 2.4382 2.0168.957 4.9582L3.964 7.29C4.6718 5.1632 6.6554 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  )
}

/* ── Canvas Node Graph ── */
function NodeGraph() {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const DPR = window.devicePixelRatio || 1
    const W = 340, H = 220
    canvas.width = W * DPR; canvas.height = H * DPR
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
    ctx.scale(DPR, DPR)

    const nodes = [
      { x:80,  y:110, r:5,   ring:14, color:'#7C6AF7', label:'start',   lx:-22, ly:25 },
      { x:150, y:60,  r:4,   ring:10, color:'#9b8cf9', label:'react',   lx:-22, ly:-14 },
      { x:150, y:160, r:4,   ring:10, color:'#f7c66a', label:'python',  lx:-26, ly:18 },
      { x:240, y:40,  r:3,   ring:7,  color:'#bdb0fb', label:'next.js', lx:-24, ly:-11 },
      { x:240, y:100, r:5,   ring:12, color:'#7C6AF7', label:'ts',      lx:-26, ly:16 },
      { x:240, y:140, r:3,   ring:7,  color:'#fad48a', label:'fastapi', lx:-26, ly:16 },
      { x:240, y:190, r:2,   ring:5,  color:'#fde3b0', label:null,      lx:0,   ly:0 },
      { x:310, y:80,  r:2.5, ring:6,  color:'#d8d2fd', label:null,      lx:0,   ly:0 },
      { x:310, y:120, r:2.5, ring:6,  color:'#d8d2fd', label:null,      lx:0,   ly:0 },
    ]
    const edges = [[0,1,false],[0,2,false],[1,3,false],[1,4,false],[2,5,true],[2,6,true],[4,7,false],[4,8,false]]
    const particles = edges.map((_,i) => ({ t: i/edges.length, speed: 0.0018 + Math.random()*0.001 }))
    let startTime = null

    function draw(ts) {
      if (!startTime) startTime = ts
      const elapsed = (ts - startTime) / 1000
      ctx.clearRect(0, 0, W, H)

      edges.forEach(([ai,bi,isGold], i) => {
        const a = nodes[ai], b = nodes[bi]
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y)
        ctx.strokeStyle = isGold ? 'rgba(247,198,106,0.12)' : 'rgba(124,106,247,0.15)'
        ctx.lineWidth = 1; ctx.stroke()

        const p = particles[i]; p.t += p.speed; if (p.t > 1) p.t -= 1
        const px = a.x + (b.x-a.x)*p.t, py = a.y + (b.y-a.y)*p.t
        const t0 = Math.max(0, p.t-0.22)
        const tx0 = a.x+(b.x-a.x)*t0, ty0 = a.y+(b.y-a.y)*t0
        const grad = ctx.createLinearGradient(tx0,ty0,px,py)
        grad.addColorStop(0,'transparent')
        grad.addColorStop(1, isGold?'rgba(247,198,106,0.55)':'rgba(124,106,247,0.6)')
        ctx.beginPath(); ctx.moveTo(tx0,ty0); ctx.lineTo(px,py)
        ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.stroke()

        const dg = ctx.createRadialGradient(px,py,0,px,py,4)
        dg.addColorStop(0, isGold?'rgba(247,198,106,0.9)':'rgba(155,140,249,0.9)')
        dg.addColorStop(1,'transparent')
        ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.fillStyle=dg; ctx.fill()
      })

      nodes.forEach((n, i) => {
        const pulse = Math.sin(elapsed*1.4+i*0.9)*0.5+0.5
        const isGold = ['#f7c66a','#fad48a','#fde3b0'].includes(n.color)
        const ro = 0.12+pulse*0.18
        ctx.beginPath(); ctx.arc(n.x,n.y,n.ring+pulse*2,0,Math.PI*2)
        ctx.fillStyle = isGold?`rgba(247,198,106,${ro})`:`rgba(124,106,247,${ro})`; ctx.fill()
        ctx.beginPath(); ctx.arc(n.x,n.y,n.ring,0,Math.PI*2)
        ctx.strokeStyle = isGold?`rgba(247,198,106,${0.25+pulse*0.25})`:`rgba(124,106,247,${0.3+pulse*0.3})`
        ctx.lineWidth=1.2; ctx.stroke()
        const cg = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*2.5)
        cg.addColorStop(0,n.color); cg.addColorStop(1,'transparent')
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*2.5,0,Math.PI*2); ctx.fillStyle=cg; ctx.fill()
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle=n.color; ctx.fill()
        if (n.label) { ctx.font='9px "JetBrains Mono",monospace'; ctx.fillStyle='rgba(122,122,148,0.8)'; ctx.fillText(n.label,n.x+n.lx,n.y+n.ly) }
      })
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return <canvas ref={canvasRef} style={{ display:'block',width:340,height:220,maxWidth:'100%',margin:'0 auto 48px' }}/>
}

/* ── Field Component ── */
function Field({ label, id, type='text', placeholder, value, onChange, error, autoComplete, extra }) {
  const [showPw, setShowPw] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPw ? 'text' : 'password') : type

  return (
    <div style={{ marginBottom:16 }}>
      {(label || extra) && (
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6 }}>
          {label && <label htmlFor={id} style={{ fontSize:'var(--text-sm)',fontWeight:'var(--weight-medium)',color:'var(--fg-secondary)',letterSpacing:'0.02em' }}>{label}</label>}
          {extra}
        </div>
      )}
      <div style={{ position:'relative' }}>
        <span style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--fg-muted)',pointerEvents:'none',display:'flex' }}>
          {type==='email' && <EmailIcon/>}
          {type==='password' && <LockIcon/>}
          {type==='text' && <UserIcon/>}
        </span>
        <input
          id={id} type={inputType} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)} autoComplete={autoComplete}
          style={{ width:'100%',background:'var(--color-bg-surface-2)',border:`1px solid ${error?'var(--color-error)':'var(--color-border-default)'}`,borderRadius:'var(--radius-md)',color:'var(--fg)',fontFamily:'var(--font-sans)',fontSize:'var(--text-base)',padding:`12px ${isPassword?'42px':'14px'} 12px 42px`,outline:'none',transition:'border-color 150ms ease,box-shadow 150ms ease' }}
          onFocus={e => { e.target.style.borderColor='var(--color-border-focus)'; e.target.style.boxShadow='0 0 0 3px rgba(124,106,247,0.15)' }}
          onBlur={e => { e.target.style.borderColor=error?'var(--color-error)':'var(--color-border-default)'; e.target.style.boxShadow='none' }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPw(v=>!v)} style={{ position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',color:'var(--fg-muted)',cursor:'pointer',display:'flex',background:'none',border:'none',padding:0 }}>
            {showPw ? <EyeOffIcon/> : <EyeIcon/>}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize:'var(--text-xs)',color:'var(--color-error)',marginTop:5 }}>{error}</p>}
    </div>
  )
}

/* ── Forgot Password Modal ── */
function ForgotModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:'var(--z-modal)',display:'flex',alignItems:'center',justifyContent:'center',animation:'fadeIn 200ms ease' }} onClick={e => e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'var(--color-bg-surface-3)',border:'1px solid var(--color-border-default)',borderRadius:'var(--radius-xl)',padding:32,width:'100%',maxWidth:380,boxShadow:'var(--shadow-3)',animation:'slideUp 250ms var(--ease-out-expo)' }}>
        {!sent ? (
          <>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
              <h3 style={{ fontFamily:'var(--font-display)',fontSize:'var(--text-lg)',fontWeight:'var(--weight-semibold)',color:'var(--fg)' }}>Reset your password</h3>
              <button onClick={onClose} style={{ background:'none',border:'none',color:'var(--fg-muted)',cursor:'pointer',padding:2 }}>✕</button>
            </div>
            <p style={{ fontSize:'var(--text-sm)',color:'var(--fg-muted)',marginBottom:20,lineHeight:1.55 }}>Enter your email and we'll send you a reset link.</p>
            <form onSubmit={e => { e.preventDefault(); if(email) setSent(true) }}>
              <Field id="reset-email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} autoComplete="email"/>
              <button type="submit" disabled={!email} style={{ width:'100%',background:'var(--accent)',color:'#fff',border:'none',borderRadius:'var(--radius-md)',fontFamily:'var(--font-sans)',fontSize:'var(--text-base)',fontWeight:'var(--weight-semibold)',padding:'13px 20px',cursor:email?'pointer':'not-allowed',marginTop:8,opacity:email?1:0.5 }}>Send reset link</button>
            </form>
          </>
        ) : (
          <div style={{ textAlign:'center',padding:'32px 0',animation:'fadeUp 0.4s var(--ease-out-expo)' }}>
            <div style={{ width:56,height:56,background:'rgba(52,211,153,0.12)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',color:'var(--color-success)' }}><CheckIcon/></div>
            <h2 style={{ fontFamily:'var(--font-display)',fontSize:'var(--text-xl)',marginBottom:8 }}>Check your inbox</h2>
            <p style={{ fontSize:'var(--text-sm)',color:'var(--fg-muted)',marginBottom:20 }}>We sent a reset link to <strong style={{ color:'var(--fg-secondary)' }}>{email}</strong></p>
            <button onClick={onClose} style={{ background:'var(--accent)',color:'#fff',border:'none',borderRadius:'var(--radius-md)',padding:'12px 24px',cursor:'pointer',fontFamily:'var(--font-sans)',fontWeight:'var(--weight-semibold)' }}>Back to sign in</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Login Form ── */
function LoginForm({ onSwitch }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [success, setSuccess] = useState(false)

  function validate() {
    const e = {}
    if (!email) e.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email.'
    if (!password) e.password = 'Password is required.'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    setApiError(null)
    try {
      const { token, user } = await apiLogin(email, password)
      saveAuth(token, user)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 900)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div style={{ textAlign:'center',padding:'32px 0',animation:'fadeUp 0.4s var(--ease-out-expo)' }}>
      <div style={{ width:56,height:56,background:'rgba(52,211,153,0.12)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',color:'var(--color-success)' }}><CheckIcon/></div>
      <h2 style={{ fontFamily:'var(--font-display)',fontSize:'var(--text-xl)',marginBottom:8 }}>Signed in</h2>
      <p style={{ fontSize:'var(--text-sm)',color:'var(--fg-muted)' }}>Redirecting to your dashboard…</p>
    </div>
  )

  return (
    <div style={{ animation:'fadeUp 0.35s var(--ease-out-expo)' }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:'var(--font-display)',fontSize:'var(--text-2xl)',fontWeight:'var(--weight-bold)',letterSpacing:'var(--tracking-tight)',color:'var(--fg)',marginBottom:8 }}>Welcome back</h1>
        <p style={{ fontSize:'var(--text-base)',color:'var(--fg-muted)' }}>Pick up where you left off.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Email address" id="login-email" type="email" placeholder="you@example.com" value={email} onChange={v=>{setEmail(v);setErrors(p=>({...p,email:null}))}} error={errors.email} autoComplete="email"/>
        <Field id="login-password" type="password" placeholder="Your password" value={password} onChange={v=>{setPassword(v);setErrors(p=>({...p,password:null}))}} error={errors.password} autoComplete="current-password"
          extra={<div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%' }}>
            <label htmlFor="login-password" style={{ fontSize:'var(--text-sm)',fontWeight:'var(--weight-medium)',color:'var(--fg-secondary)' }}>Password</label>
            <span onClick={()=>setShowForgot(true)} style={{ fontSize:'var(--text-sm)',color:'var(--fg-muted)',cursor:'pointer' }}>Forgot password?</span>
          </div>}
        />
        {apiError && (
          <div style={{ background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.25)',borderRadius:'var(--radius-md)',padding:'10px 14px',fontSize:'var(--text-sm)',color:'#f87171',marginBottom:12 }}>
            {apiError}
          </div>
        )}
        <button type="submit" disabled={loading} style={{ width:'100%',background:'var(--accent)',color:'#fff',border:'none',borderRadius:'var(--radius-md)',fontFamily:'var(--font-sans)',fontSize:'var(--text-base)',fontWeight:'var(--weight-semibold)',padding:'13px 20px',cursor:loading?'not-allowed':'pointer',marginTop:8,transition:'background 150ms ease',opacity:loading?0.7:1 }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div style={{ display:'flex',alignItems:'center',gap:12,margin:'20px 0' }}>
        <div style={{ flex:1,height:1,background:'var(--color-border-subtle)' }}/>
        <span style={{ fontSize:'var(--text-xs)',color:'var(--fg-muted)',letterSpacing:'0.06em' }}>or</span>
        <div style={{ flex:1,height:1,background:'var(--color-border-subtle)' }}/>
      </div>
      <button style={{ width:'100%',background:'transparent',color:'var(--fg-secondary)',border:'1px solid var(--color-border-default)',borderRadius:'var(--radius-md)',fontFamily:'var(--font-sans)',fontSize:'var(--text-base)',fontWeight:'var(--weight-medium)',padding:'12px 20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'border-color 150ms ease' }}
        onMouseEnter={e=>e.currentTarget.style.borderColor='var(--color-border-strong)'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='var(--color-border-default)'}>
        <GoogleIcon/> Continue with Google
      </button>
      <p style={{ textAlign:'center',marginTop:28,fontSize:'var(--text-sm)',color:'var(--fg-muted)' }}>
        Don't have an account?{' '}<span onClick={onSwitch} style={{ color:'var(--accent)',fontWeight:'var(--weight-medium)',cursor:'pointer' }}>Create one</span>
      </p>
      {showForgot && <ForgotModal onClose={()=>setShowForgot(false)}/>}
    </div>
  )
}

/* ── Register Form ── */
function RegisterForm({ onSwitch }) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function pwStrength(pw) {
    if (!pw) return 0
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }
  const strength = pwStrength(password)
  const strengthLabel = ['','Weak','Fair','Good','Strong'][strength]
  const strengthColor = ['','#f87171','#f7c66a','#60a5fa','#34d399'][strength]

  function validate() {
    const e = {}
    if (!name.trim()) e.name = 'Name is required.'
    if (!email) e.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email.'
    if (!password) e.password = 'Password is required.'
    else if (password.length < 8) e.password = 'Use at least 8 characters.'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    setApiError(null)
    try {
      const { token, user } = await apiRegister(name, email, password)
      saveAuth(token, user)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 900)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div style={{ textAlign:'center',padding:'32px 0',animation:'fadeUp 0.4s var(--ease-out-expo)' }}>
      <div style={{ width:56,height:56,background:'rgba(52,211,153,0.12)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',color:'var(--color-success)' }}><CheckIcon/></div>
      <h2 style={{ fontFamily:'var(--font-display)',fontSize:'var(--text-xl)',marginBottom:8 }}>Account created!</h2>
      <p style={{ fontSize:'var(--text-sm)',color:'var(--fg-muted)' }}>Setting up your learning path…</p>
    </div>
  )

  return (
    <div style={{ animation:'fadeUp 0.35s var(--ease-out-expo)' }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontFamily:'var(--font-display)',fontSize:'var(--text-2xl)',fontWeight:'var(--weight-bold)',letterSpacing:'var(--tracking-tight)',color:'var(--fg)',marginBottom:8 }}>Start learning</h1>
        <p style={{ fontSize:'var(--text-base)',color:'var(--fg-muted)' }}>Build real skills. Your path starts here.</p>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Full name" id="reg-name" type="text" placeholder="Ada Lovelace" value={name} onChange={v=>{setName(v);setErrors(p=>({...p,name:null}))}} error={errors.name} autoComplete="name"/>
        <Field label="Email address" id="reg-email" type="email" placeholder="you@example.com" value={email} onChange={v=>{setEmail(v);setErrors(p=>({...p,email:null}))}} error={errors.email} autoComplete="email"/>
        <Field label="Password" id="reg-password" type="password" placeholder="Min. 8 characters" value={password} onChange={v=>{setPassword(v);setErrors(p=>({...p,password:null}))}} error={errors.password} autoComplete="new-password"/>
        {password && (
          <div style={{ marginTop:-8,marginBottom:14 }}>
            <div style={{ display:'flex',gap:4,marginBottom:5 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ flex:1,height:3,borderRadius:99,background:i<=strength?strengthColor:'var(--color-border-default)',transition:'background 250ms ease' }}/>
              ))}
            </div>
            <span style={{ fontSize:'var(--text-xs)',color:strengthColor }}>{strengthLabel}</span>
          </div>
        )}
        {apiError && (
          <div style={{ background:'rgba(248,113,113,0.08)',border:'1px solid rgba(248,113,113,0.25)',borderRadius:'var(--radius-md)',padding:'10px 14px',fontSize:'var(--text-sm)',color:'#f87171',marginBottom:12 }}>
            {apiError}
          </div>
        )}
        <button type="submit" disabled={loading} style={{ width:'100%',background:'var(--accent)',color:'#fff',border:'none',borderRadius:'var(--radius-md)',fontFamily:'var(--font-sans)',fontSize:'var(--text-base)',fontWeight:'var(--weight-semibold)',padding:'13px 20px',cursor:loading?'not-allowed':'pointer',marginTop:8,opacity:loading?0.7:1 }}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p style={{ textAlign:'center',marginTop:28,fontSize:'var(--text-sm)',color:'var(--fg-muted)' }}>
        Already have an account?{' '}<span onClick={onSwitch} style={{ color:'var(--accent)',fontWeight:'var(--weight-medium)',cursor:'pointer' }}>Sign in</span>
      </p>
    </div>
  )
}

/* ── Main Login Page ── */
export default function Login() {
  const [view, setView] = useState('login')

  return (
    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',minHeight:'100vh',width:'100%' }}>
      {/* Form panel */}
      <div style={{ display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'48px 40px',minHeight:'100vh',background:'var(--color-bg-base)' }}>
        <div style={{ width:'100%',maxWidth:400 }}>
          <div style={{ marginBottom:40,fontFamily:'var(--font-display)',fontWeight:700,fontSize:22,color:'#fff',letterSpacing:'-0.02em' }}>
            Skill<span style={{ color:'var(--accent)' }}>Path</span>
          </div>
          {view === 'login'
            ? <LoginForm key="login" onSwitch={() => setView('register')}/>
            : <RegisterForm key="register" onSwitch={() => setView('login')}/>
          }
        </div>
      </div>

      {/* Visual panel */}
      <div style={{ background:'var(--color-bg-surface-1)',borderLeft:'1px solid var(--color-border-subtle)',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',padding:'64px 56px',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',width:600,height:600,background:'radial-gradient(circle,rgba(124,106,247,0.07) 0%,transparent 70%)',top:'50%',left:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none' }}/>
        <div style={{ position:'relative',zIndex:1,maxWidth:420,width:'100%' }}>
          <NodeGraph/>
          <p style={{ fontFamily:'var(--font-display)',fontSize:'var(--text-2xl)',fontWeight:'var(--weight-bold)',lineHeight:1.25,letterSpacing:'var(--tracking-tight)',color:'var(--fg)',marginBottom:16 }}>
            Your personal AI<br/>coach for <em style={{ fontStyle:'normal',color:'var(--accent)' }}>real skills.</em>
          </p>
          <p style={{ fontSize:'var(--text-base)',color:'var(--fg-muted)',lineHeight:1.6,marginBottom:36 }}>
            Structured learning paths, interactive exercises, and an AI coach that adapts to how you learn.
          </p>
          <ul style={{ listStyle:'none',margin:0,padding:0,display:'flex',flexDirection:'column',gap:14 }}>
            {['AI-guided paths tailored to your goals','Interactive coding challenges at every step','Progress tracking across every skill'].map((f,i) => (
              <li key={i} style={{ display:'flex',alignItems:'flex-start',gap:12,fontSize:'var(--text-sm)',color:'var(--fg-secondary)',lineHeight:1.5 }}>
                <span style={{ width:20,height:20,borderRadius:'50%',background:'var(--accent-subtle)',border:'1px solid rgba(124,106,247,0.3)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',marginTop:1 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`@media(max-width:800px){.login-page{grid-template-columns:1fr!important}.visual-panel{display:none!important}}`}</style>
    </div>
  )
}
