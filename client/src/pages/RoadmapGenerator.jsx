import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── Icons ── */
const Icon = ({ name, size=20, color='currentColor' }) => {
  const paths = {
    sparkles: <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>,
    lock: <><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    refresh: <><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

/* ── Data ── */
const TEMPLATES = {
  react: [
    { topic:'JavaScript foundations', concepts:['ES6+ syntax','Promises & async/await','Array methods','Destructuring'], duration:'~8 hrs', difficulty:'Beginner' },
    { topic:'React core concepts', concepts:['JSX','Components & props','useState & useEffect','Event handling'], duration:'~10 hrs', difficulty:'Beginner' },
    { topic:'State management', concepts:['useContext','useReducer','Lifting state','Component patterns'], duration:'~8 hrs', difficulty:'Intermediate' },
    { topic:'Routing & data fetching', concepts:['React Router v6','useNavigate','fetch & Axios','Loading states'], duration:'~10 hrs', difficulty:'Intermediate' },
    { topic:'Performance & patterns', concepts:['useMemo & useCallback','Code splitting','React.memo','Custom hooks'], duration:'~8 hrs', difficulty:'Intermediate' },
    { topic:'Testing & deployment', concepts:['React Testing Library','Unit tests','Vite build','Deploying to Vercel'], duration:'~6 hrs', difficulty:'Advanced' },
  ],
  python: [
    { topic:'Python syntax & types', concepts:['Variables & types','Control flow','Functions','List comprehensions'], duration:'~6 hrs', difficulty:'Beginner' },
    { topic:'Data structures', concepts:['Lists, dicts, sets','Tuples','Stack & queue patterns','Nested structures'], duration:'~8 hrs', difficulty:'Beginner' },
    { topic:'OOP in Python', concepts:['Classes & objects','Inheritance','Dunder methods','Dataclasses'], duration:'~10 hrs', difficulty:'Intermediate' },
    { topic:'File I/O & APIs', concepts:['File handling','JSON parsing','requests library','REST clients'], duration:'~8 hrs', difficulty:'Intermediate' },
    { topic:'Data & scripting', concepts:['pandas basics','NumPy arrays','Automation scripts','argparse'], duration:'~10 hrs', difficulty:'Intermediate' },
    { topic:'Testing & packaging', concepts:['pytest','fixtures','pyproject.toml','Publishing to PyPI'], duration:'~8 hrs', difficulty:'Advanced' },
  ],
  default: [
    { topic:'Core fundamentals', concepts:['Key concepts','Mental models','Terminology','First project'], duration:'~6 hrs', difficulty:'Beginner' },
    { topic:'Building blocks', concepts:['Core primitives','Common patterns','Tooling setup','Practice exercises'], duration:'~8 hrs', difficulty:'Beginner' },
    { topic:'Intermediate patterns', concepts:['Design patterns','Error handling','Testing basics','Code review'], duration:'~10 hrs', difficulty:'Intermediate' },
    { topic:'Real-world application', concepts:['Project structure','Best practices','Performance','Debugging'], duration:'~8 hrs', difficulty:'Intermediate' },
    { topic:'Advanced techniques', concepts:['Advanced patterns','Optimization','Security','Scalability'], duration:'~10 hrs', difficulty:'Advanced' },
    { topic:'Production readiness', concepts:['CI/CD','Monitoring','Documentation','Team workflows'], duration:'~8 hrs', difficulty:'Advanced' },
  ],
}

function getRoadmap(topic, weeks) {
  const key = topic.toLowerCase().includes('react') ? 'react' : topic.toLowerCase().includes('python') ? 'python' : 'default'
  const base = TEMPLATES[key]
  return Array.from({ length: weeks }, (_, i) => ({ week: i+1, ...base[i % base.length] }))
}

/* ── Loading State ── */
function LoadingState() {
  const [step, setStep] = useState(0)
  const steps = ['Analyzing your goal…','Structuring weekly milestones…','Selecting key concepts…','Sequencing your roadmap…','Finalizing your path…']
  useEffect(() => {
    const t = setInterval(() => setStep(s => s < steps.length-1 ? s+1 : s), 600)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 24px',gap:32,animation:'fadeUp 0.4s var(--ease-out-expo)' }}>
      <div style={{ position:'relative',width:96,height:96 }}>
        <div style={{ position:'absolute',inset:0,borderRadius:'50%',background:'radial-gradient(circle at 40% 40%,#7C6AF7 0%,#4e3fcf 60%,#2a2060 100%)',animation:'glowPulse 2s ease-in-out infinite' }}/>
        <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
          <Icon name="sparkles" size={36} color="#fff"/>
        </div>
      </div>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'var(--font-display)',fontSize:22,fontWeight:700,color:'#fff',marginBottom:8 }}>Building your roadmap…</div>
        <div style={{ fontSize:14,color:'var(--fg-muted)',height:20,transition:'all 0.3s ease' }}>{steps[step]}</div>
      </div>
      <div style={{ display:'flex',gap:8 }}>
        {steps.map((_,i) => (
          <div key={i} style={{ width:i===step?24:6,height:6,borderRadius:999,background:i<=step?'var(--accent)':'#2a2a3d',transition:'all 0.4s var(--ease-out-expo)' }}/>
        ))}
      </div>
    </div>
  )
}

/* ── Week Card ── */
function WeekCard({ data, index, unlocked, completed }) {
  const [hovered, setHovered] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const isLocked = !unlocked
  const diffColor = { Beginner:{bg:'rgba(52,211,153,0.12)',text:'#34d399'}, Intermediate:{bg:'rgba(124,106,247,0.12)',text:'#9b8cf9'}, Advanced:{bg:'rgba(247,198,106,0.12)',text:'#f7c66a'} }[data.difficulty] || { bg:'rgba(124,106,247,0.12)',text:'#9b8cf9' }
  const progress = completed ? 100 : unlocked ? 35+index*8 : 0

  return (
    <div onMouseEnter={() => !isLocked && setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => !isLocked && setExpanded(e=>!e)}
      style={{ background:isLocked?'#0f0f1a':'#131320', border:`1px solid ${hovered?'#4a4a68':isLocked?'#1e1e2e':'#2a2a3d'}`, borderRadius:12, padding:20, cursor:isLocked?'default':'pointer', transition:'all 250ms var(--ease-out-expo)', transform:hovered&&!isLocked?'translateY(-2px)':'none', boxShadow:hovered&&!isLocked?'0 8px 32px rgba(0,0,0,0.5)':'0 2px 8px rgba(0,0,0,0.3)', opacity:isLocked?0.55:1, animation:`cardIn 0.4s var(--ease-out-expo) ${index*0.07}s both`, position:'relative', overflow:'hidden' }}>
      {!isLocked && !completed && <div style={{ position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(124,106,247,0.4),transparent)' }}/>}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12 }}>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <div style={{ width:32,height:32,borderRadius:8,background:isLocked?'#1a1a2e':completed?'rgba(52,211,153,0.15)':'rgba(124,106,247,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
            {completed ? <Icon name="check" size={14} color="#34d399"/> : isLocked ? <Icon name="lock" size={14} color="#3a3a52"/> : <span style={{ fontFamily:'var(--font-mono)',fontSize:11,fontWeight:600,color:'var(--accent)' }}>W{data.week}</span>}
          </div>
          <span style={{ fontSize:11,fontWeight:600,color:'#7a7a94',letterSpacing:'0.06em',textTransform:'uppercase' }}>Week {data.week}</span>
        </div>
        <span style={{ fontSize:11,fontWeight:600,letterSpacing:'0.04em',textTransform:'uppercase',background:diffColor.bg,color:diffColor.text,padding:'3px 8px',borderRadius:4 }}>{data.difficulty}</span>
      </div>
      <div style={{ fontFamily:'var(--font-display)',fontSize:16,fontWeight:700,color:isLocked?'#3a3a52':'#fff',marginBottom:6 }}>{data.topic}</div>
      <div style={{ display:'flex',alignItems:'center',gap:4,marginBottom:12 }}><Icon name="clock" size={12} color="#7a7a94"/><span style={{ fontSize:12,color:'#7a7a94' }}>{data.duration}</span></div>
      {!isLocked && (
        <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:14 }}>
          {data.concepts.slice(0, expanded ? undefined : 3).map((c,i) => (
            <span key={i} style={{ fontSize:12,color:'#c4c4d4',background:'#1a1a2e',border:'1px solid #2a2a3d',padding:'3px 8px',borderRadius:4 }}>{c}</span>
          ))}
          {!expanded && data.concepts.length > 3 && <span style={{ fontSize:12,color:'#7a7a94',background:'#1a1a2e',border:'1px dashed #2a2a3d',padding:'3px 8px',borderRadius:4 }}>+{data.concepts.length-3} more</span>}
        </div>
      )}
      {isLocked && <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:14 }}>{data.concepts.map((_,i) => <span key={i} style={{ fontSize:12,color:'transparent',background:'#1e1e2e',padding:'3px 8px',borderRadius:4,minWidth:60+(i%3)*20 }}>{'░'.repeat(8)}</span>)}</div>}
      {!isLocked && (
        <div>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
            <span style={{ fontSize:11,color:'#7a7a94' }}>{completed?'Completed':progress>0?'In progress':'Not started'}</span>
            <span style={{ fontSize:11,color:completed?'#34d399':'var(--accent)',fontWeight:600 }}>{progress}%</span>
          </div>
          <div style={{ height:3,borderRadius:999,background:'#1e1e2e',overflow:'hidden' }}>
            <div style={{ height:'100%',width:`${progress}%`,borderRadius:999,background:completed?'linear-gradient(90deg,#34d399,#10b981)':'linear-gradient(90deg,var(--accent),#9b8cf9)',transition:'width 1s var(--ease-out-expo)' }}/>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main ── */
export default function RoadmapGenerator() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ topic:'', goal:'', weeks:6 })
  const [phase, setPhase] = useState('input')
  const [roadmap, setRoadmap] = useState([])
  const [layout, setLayout] = useState('grid')
  const resultRef = useRef(null)

  const canGenerate = form.topic.trim().length > 0

  function handleGenerate() {
    if (!canGenerate) return
    setPhase('loading')
    const data = getRoadmap(form.topic, form.weeks)
    setTimeout(() => {
      setRoadmap(data); setPhase('result')
      setTimeout(() => resultRef.current && window.scrollTo({ top: resultRef.current.offsetTop-20, behavior:'smooth' }), 100)
    }, 3200)
  }

  function handleReset() { setPhase('input'); setRoadmap([]) }

  const getCardState = (w) => ({ unlocked: w <= 2, completed: w === 1 })

  return (
    <div style={{ minHeight:'100vh',background:'#0a0a0f',fontFamily:'var(--font-sans)' }}>
      <div style={{ position:'fixed',top:-200,left:'50%',transform:'translateX(-50%)',width:800,height:400,background:'radial-gradient(ellipse at 50% 0%,rgba(124,106,247,0.07) 0%,transparent 70%)',pointerEvents:'none',zIndex:0 }}/>

      {/* Nav */}
      <nav style={{ position:'sticky',top:0,zIndex:100,background:'rgba(10,10,15,0.85)',backdropFilter:'blur(12px)',borderBottom:'1px solid #1e1e2e',padding:'0 24px',display:'flex',alignItems:'center',height:56,gap:12 }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width:28,height:28,borderRadius:6,background:'linear-gradient(135deg,#7C6AF7,#4e3fcf)',display:'flex',alignItems:'center',justifyContent:'center' }}><Icon name="zap" size={14} color="#fff"/></div>
          <span style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:16,color:'#fff' }}>SkillPath</span>
        </div>
        <div style={{ flex:1 }}/>
        {phase === 'result' && (
          <button onClick={handleReset} style={{ display:'flex',alignItems:'center',gap:6,background:'transparent',border:'1px solid #2a2a3d',borderRadius:8,padding:'6px 14px',color:'#c4c4d4',fontSize:13,fontWeight:500,cursor:'pointer' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#4a4a68';e.currentTarget.style.color='#fff'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#2a2a3d';e.currentTarget.style.color='#c4c4d4'}}>
            <Icon name="refresh" size={14}/> New roadmap
          </button>
        )}
        <div style={{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#4e3fcf,#7C6AF7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff' }}>J</div>
      </nav>

      <main style={{ maxWidth:760,margin:'0 auto',padding:'48px 20px 80px',position:'relative',zIndex:1 }}>
        {/* Header */}
        <div style={{ textAlign:'center',marginBottom:48,animation:'fadeUp 0.5s var(--ease-out-expo)' }}>
          <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:'rgba(124,106,247,0.1)',border:'1px solid rgba(124,106,247,0.2)',borderRadius:999,padding:'5px 14px',marginBottom:20 }}>
            <Icon name="sparkles" size={13} color="#7C6AF7"/>
            <span style={{ fontSize:12,color:'#9b8cf9',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase' }}>AI Roadmap Generator</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)',fontSize:'clamp(28px,5vw,42px)',fontWeight:700,color:'#fff',lineHeight:1.15,letterSpacing:'-0.02em',marginBottom:14 }}>Build your learning path</h1>
          <p style={{ fontSize:16,color:'#7a7a94',maxWidth:480,margin:'0 auto',lineHeight:1.6 }}>Tell us what you want to learn. We'll map a week-by-week roadmap tailored to your goal.</p>
        </div>

        {/* Form */}
        {(phase === 'input' || phase === 'loading') && (
          <div style={{ background:'#131320',border:'1px solid #2a2a3d',borderRadius:16,padding:'clamp(20px,4vw,32px)',boxShadow:'0 4px 24px rgba(0,0,0,0.4)',animation:'fadeUp 0.5s var(--ease-out-expo) 0.05s both',opacity:phase==='loading'?0.5:1,pointerEvents:phase==='loading'?'none':'auto',transition:'opacity 0.4s ease' }}>
            <div style={{ display:'flex',flexDirection:'column',gap:24 }}>
              {/* Topic */}
              <div>
                <label style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:600,color:'#c4c4d4',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:10 }}>
                  <Icon name="book" size={13} color="#7a7a94"/> What do you want to learn?
                </label>
                <input type="text" placeholder="e.g. React, Python, System Design, SQL…" value={form.topic} onChange={e => setForm(f=>({...f,topic:e.target.value}))} onKeyDown={e => e.key==='Enter'&&canGenerate&&handleGenerate()}
                  style={{ width:'100%',background:'#0f0f1a',border:'1px solid #2a2a3d',borderRadius:8,padding:'12px 16px',fontSize:15,color:'#fff',outline:'none',transition:'border-color 150ms ease',fontFamily:'var(--font-sans)' }}
                  onFocus={e=>e.target.style.borderColor='#7C6AF7'} onBlur={e=>e.target.style.borderColor='#2a2a3d'}/>
              </div>
              {/* Goal */}
              <div>
                <label style={{ display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:600,color:'#c4c4d4',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:10 }}>
                  <Icon name="target" size={13} color="#7a7a94"/> What's your goal?
                </label>
                <input type="text" placeholder="e.g. Build a SaaS app, land a frontend job…" value={form.goal} onChange={e => setForm(f=>({...f,goal:e.target.value}))}
                  style={{ width:'100%',background:'#0f0f1a',border:'1px solid #2a2a3d',borderRadius:8,padding:'12px 16px',fontSize:15,color:'#fff',outline:'none',transition:'border-color 150ms ease',fontFamily:'var(--font-sans)' }}
                  onFocus={e=>e.target.style.borderColor='#7C6AF7'} onBlur={e=>e.target.style.borderColor='#2a2a3d'}/>
              </div>
              {/* Weeks */}
              <div>
                <label style={{ display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:12,fontWeight:600,color:'#c4c4d4',letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:14 }}>
                  <span style={{ display:'flex',alignItems:'center',gap:6 }}><Icon name="clock" size={13} color="#7a7a94"/> How many weeks?</span>
                  <span style={{ fontFamily:'var(--font-mono)',fontSize:13,color:'var(--accent)',background:'rgba(124,106,247,0.1)',padding:'2px 10px',borderRadius:6,letterSpacing:0,textTransform:'none' }}>{form.weeks} {form.weeks===1?'week':'weeks'}</span>
                </label>
                <input type="range" min={2} max={12} step={1} value={form.weeks} onChange={e => setForm(f=>({...f,weeks:parseInt(e.target.value)}))}
                  style={{ width:'100%',WebkitAppearance:'none',appearance:'none',background:'transparent',cursor:'pointer' }}/>
                <style>{`input[type=range]::-webkit-slider-runnable-track{background:#2a2a3d;height:4px;border-radius:999px}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#7C6AF7;margin-top:-7px;box-shadow:0 0 0 3px rgba(124,106,247,0.2)}`}</style>
                <div style={{ display:'flex',justifyContent:'space-between',marginTop:6 }}>
                  {[2,4,6,8,10,12].map(w => (
                    <span key={w} onClick={() => setForm(f=>({...f,weeks:w}))} style={{ fontSize:11,color:form.weeks===w?'var(--accent)':'#3a3a52',fontFamily:'var(--font-mono)',cursor:'pointer',transition:'color 150ms ease' }}>{w}w</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate button */}
        {phase === 'input' && (
          <div style={{ display:'flex',justifyContent:'center',marginTop:24,animation:'fadeUp 0.5s var(--ease-out-expo) 0.1s both' }}>
            <button onClick={handleGenerate} disabled={!canGenerate} style={{ display:'flex',alignItems:'center',gap:10,background:canGenerate?'linear-gradient(135deg,#7C6AF7,#9080f9)':'#1a1a2e',border:'none',borderRadius:12,padding:'15px 36px',fontSize:16,fontWeight:700,fontFamily:'var(--font-display)',color:canGenerate?'#fff':'#3a3a52',cursor:canGenerate?'pointer':'not-allowed',transition:'all 200ms var(--ease-out-expo)',boxShadow:canGenerate?'0 0 24px rgba(124,106,247,0.3)':'none',letterSpacing:'-0.01em' }}
              onMouseEnter={e=>{if(canGenerate){e.currentTarget.style.transform='translateY(-2px) scale(1.01)';e.currentTarget.style.boxShadow='0 8px 36px rgba(124,106,247,0.45)'}}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=canGenerate?'0 0 24px rgba(124,106,247,0.3)':'none'}}>
              <Icon name="sparkles" size={18}/> Generate my roadmap <Icon name="arrow" size={16}/>
            </button>
          </div>
        )}

        {/* Loading */}
        {phase === 'loading' && <LoadingState/>}

        {/* Result */}
        {phase === 'result' && (
          <div ref={resultRef} style={{ animation:'fadeUp 0.5s var(--ease-out-expo)' }}>
            <div style={{ background:'#131320',border:'1px solid #2a2a3d',borderRadius:16,padding:'20px 24px',marginBottom:24,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap' }}>
              <div style={{ flex:1,minWidth:200 }}>
                <div style={{ fontSize:11,color:'#7a7a94',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:4 }}>Your roadmap</div>
                <div style={{ fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,color:'#fff' }}>{form.topic||'Custom path'}</div>
                {form.goal && <div style={{ fontSize:13,color:'#7a7a94',marginTop:4 }}>Goal: {form.goal}</div>}
              </div>
              <div style={{ display:'flex',gap:12,flexWrap:'wrap' }}>
                {[['Weeks',roadmap.length],['Unlocked','2'],['Progress','14%']].map(([l,v]) => (
                  <div key={l} style={{ background:'#0f0f1a',border:'1px solid #2a2a3d',borderRadius:8,padding:'8px 16px',textAlign:'center' }}>
                    <div style={{ fontFamily:'var(--font-mono)',fontSize:18,fontWeight:600,color:'#fff' }}>{v}</div>
                    <div style={{ fontSize:11,color:'#7a7a94',marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex',gap:8 }}>
                <button onClick={handleReset} style={{ display:'flex',alignItems:'center',gap:6,background:'transparent',border:'1px solid #2a2a3d',borderRadius:8,padding:'8px 14px',color:'#7a7a94',fontSize:13,cursor:'pointer',transition:'all 150ms ease' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='#4a4a68';e.currentTarget.style.color='#fff'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='#2a2a3d';e.currentTarget.style.color='#7a7a94'}}>
                  <Icon name="refresh" size={13}/> Regenerate
                </button>
                <button style={{ display:'flex',alignItems:'center',gap:6,background:'rgba(124,106,247,0.1)',border:'1px solid rgba(124,106,247,0.25)',borderRadius:8,padding:'8px 14px',color:'#9b8cf9',fontSize:13,cursor:'pointer' }}>
                  <Icon name="download" size={13}/> Save path
                </button>
              </div>
            </div>

            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
              <div style={{ fontSize:13,color:'#7a7a94' }}>{roadmap.length} weeks · 2 unlocked</div>
              <div style={{ display:'flex',gap:4,background:'#0f0f1a',border:'1px solid #2a2a3d',borderRadius:8,padding:3 }}>
                {['grid','list'].map(l => (
                  <button key={l} onClick={() => setLayout(l)} style={{ background:layout===l?'#1a1a2e':'transparent',border:'none',borderRadius:6,padding:'5px 12px',fontSize:12,color:layout===l?'#fff':'#7a7a94',cursor:'pointer',fontWeight:layout===l?600:400,textTransform:'capitalize',transition:'all 150ms ease' }}>{l}</button>
                ))}
              </div>
            </div>

            <div style={{ display:layout==='grid'?'grid':'flex',flexDirection:layout==='list'?'column':undefined,gridTemplateColumns:layout==='grid'?'repeat(auto-fill,minmax(280px,1fr))':undefined,gap:12 }}>
              {roadmap.map((week, i) => {
                const { unlocked, completed } = getCardState(week.week)
                return <WeekCard key={week.week} data={week} index={i} unlocked={unlocked} completed={completed}/>
              })}
            </div>

            <div style={{ marginTop:32,textAlign:'center',padding:24,background:'#131320',border:'1px solid #2a2a3d',borderRadius:16 }}>
              <div style={{ fontFamily:'var(--font-display)',fontSize:18,fontWeight:700,color:'#fff',marginBottom:6 }}>Ready to start Week 1?</div>
              <div style={{ fontSize:14,color:'#7a7a94',marginBottom:20 }}>Your roadmap is ready. Start your first lesson and build momentum.</div>
              <button onClick={() => navigate('/learn')} style={{ background:'linear-gradient(135deg,#7C6AF7,#9080f9)',border:'none',borderRadius:10,padding:'12px 28px',fontSize:15,fontWeight:700,fontFamily:'var(--font-display)',color:'#fff',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:8,transition:'all 200ms ease',boxShadow:'0 0 20px rgba(124,106,247,0.3)' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(124,106,247,0.45)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 0 20px rgba(124,106,247,0.3)'}}>
                Start learning <Icon name="arrow" size={15}/>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
