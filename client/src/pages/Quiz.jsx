import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const QUIZ_DATA = [
  { id:1, question:"What does the React hook `useMemo` primarily optimize?", options:["Re-renders caused by state changes in child components","Expensive computations by memoizing their return values","Side effects like data fetching and subscriptions","References to DOM elements across renders"], correct:1, explanation:"`useMemo` caches the result of a computation between re-renders. It only recomputes when one of its dependencies changes — preventing unnecessary recalculation of expensive operations on every render." },
  { id:2, question:"Which HTTP status code indicates a resource was successfully created?", options:["200 OK","204 No Content","201 Created","202 Accepted"], correct:2, explanation:"201 Created is the correct response to a POST request that results in a new resource being created. The response typically includes a `Location` header pointing to the new resource's URL." },
  { id:3, question:"In JavaScript, what is the output of `typeof null`?", options:["`\"null\"`","`\"undefined\"`","`\"object\"`","`\"symbol\"`"], correct:2, explanation:"This is a well-known JavaScript quirk. `typeof null` returns `\"object\"` — a bug in the original implementation that was never fixed to preserve backwards compatibility." },
  { id:4, question:"Which CSS property controls the stacking order of elements?", options:["`stack-order`","`z-index`","`layer`","`depth`"], correct:1, explanation:"`z-index` controls the stacking context of positioned elements. Higher values appear on top. It only takes effect when `position` is set to `relative`, `absolute`, `fixed`, or `sticky`." },
  { id:5, question:"What is the time complexity of binary search on a sorted array?", options:["O(n)","O(n²)","O(n log n)","O(log n)"], correct:3, explanation:"Binary search halves the search space on each step. For an array of n elements, you need at most log₂(n) comparisons — making it O(log n). This is why binary search is so efficient on large sorted datasets." },
]

const LABELS = ['A','B','C','D']
const TIMER_SECONDS = 90
const TOPIC = { title:'React Fundamentals', week:3 }

function renderCode(text) {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith('`') && part.endsWith('`')
      ? <code key={i} style={{ fontFamily:'var(--font-mono)',fontSize:'0.85em',background:'rgba(124,106,247,0.12)',color:'#bdb0fb',padding:'2px 6px',borderRadius:4 }}>{part.slice(1,-1)}</code>
      : part
  )
}

function ClockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function CheckIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function XIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function ChevronRight() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
}
function BookOpen() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
}
function TrophyIcon() {
  return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
}

/* ── Option Card ── */
function OptionCard({ label, text, state, onClick, disabled }) {
  const [hovered, setHovered] = useState(false)
  const isHoverable = !disabled && state === 'idle'
  const styles = {
    idle:           { bg:'#131320', border:'1px solid #2a2a3d', labelBg:'#1a1a2e', labelColor:'#7a7a94', textColor:'#c4c4d4' },
    selected:       { bg:'rgba(124,106,247,0.08)', border:'1px solid #7C6AF7', labelBg:'#7C6AF7', labelColor:'#fff', textColor:'#fff' },
    correct:        { bg:'rgba(52,211,153,0.08)', border:'1px solid #34d399', labelBg:'#34d399', labelColor:'#0a0a0f', textColor:'#fff' },
    wrong:          { bg:'rgba(248,113,113,0.08)', border:'1px solid #f87171', labelBg:'#f87171', labelColor:'#fff', textColor:'#c4c4d4' },
    'reveal-correct':{ bg:'rgba(52,211,153,0.05)', border:'1px solid rgba(52,211,153,0.4)', labelBg:'rgba(52,211,153,0.15)', labelColor:'#34d399', textColor:'#c4c4d4' },
  }
  const s = styles[state] || styles.idle
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => isHoverable && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display:'flex',alignItems:'flex-start',gap:14,background:hovered&&isHoverable?'rgba(124,106,247,0.05)':s.bg,border:hovered&&isHoverable?'1px solid #4a4a68':s.border,borderRadius:12,padding:'16px 18px',cursor:disabled?'default':'pointer',width:'100%',textAlign:'left',transform:hovered&&isHoverable?'translateY(-1px)':'none',transition:'all 0.15s ease',boxShadow:state==='selected'?'0 0 0 1px rgba(124,106,247,0.3)':'none',minHeight:56,fontFamily:'var(--font-sans)' }}>
      <div style={{ flexShrink:0,width:32,height:32,borderRadius:8,background:s.labelBg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontSize:13,fontWeight:700,color:s.labelColor,transition:'all 0.15s ease',marginTop:1 }}>
        {state==='correct' ? <CheckIcon/> : state==='wrong' ? <XIcon/> : label}
      </div>
      <div style={{ flex:1,fontSize:15,lineHeight:1.5,color:s.textColor,fontWeight:state==='selected'?500:400,transition:'color 0.15s ease',paddingTop:4 }}>
        {renderCode(text)}
      </div>
    </button>
  )
}

/* ── Explanation ── */
function Explanation({ text, isCorrect }) {
  return (
    <div style={{ background:isCorrect?'rgba(52,211,153,0.06)':'rgba(248,113,113,0.06)',border:`1px solid ${isCorrect?'rgba(52,211,153,0.25)':'rgba(248,113,113,0.2)'}`,borderRadius:12,padding:'16px 18px',animation:'slideUp 0.3s var(--ease-out-expo)' }}>
      <div style={{ display:'flex',gap:10,alignItems:'flex-start' }}>
        <div style={{ color:isCorrect?'#34d399':'#f87171',flexShrink:0,marginTop:1 }}><BookOpen/></div>
        <div>
          <div style={{ fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:isCorrect?'#34d399':'#f87171',marginBottom:6 }}>
            {isCorrect ? 'Correct' : 'Incorrect'} — Explanation
          </div>
          <p style={{ fontSize:14,lineHeight:1.6,color:'#c4c4d4',margin:0 }}>{renderCode(text)}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Score Screen ── */
function ScoreScreen({ score, total, onRestart }) {
  const navigate = useNavigate()
  const pct = Math.round((score/total)*100)
  const grade = pct===100?'Perfect score':pct>=80?'Strong result':pct>=60?'Solid effort':'Keep practicing'
  const gradeColor = pct>=80?'#34d399':pct>=60?'#f7c66a':'#f87171'
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',padding:24,textAlign:'center',animation:'fadeIn 0.5s ease',background:'var(--color-bg-base)' }}>
      <div style={{ position:'relative',marginBottom:32 }}>
        <div style={{ position:'absolute',inset:-20,background:`radial-gradient(circle,${gradeColor}18 0%,transparent 70%)`,borderRadius:'50%' }}/>
        <div style={{ color:gradeColor,position:'relative' }}><TrophyIcon/></div>
      </div>
      <div style={{ fontSize:11,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'#7a7a94',marginBottom:12 }}>Quiz complete</div>
      <h1 style={{ fontFamily:'var(--font-display)',fontSize:'clamp(48px,12vw,72px)',fontWeight:700,lineHeight:1,color:gradeColor,letterSpacing:'-0.02em',marginBottom:8 }}>{pct}%</h1>
      <div style={{ fontSize:18,fontWeight:600,color:'#fff',marginBottom:6,fontFamily:'var(--font-display)' }}>{grade}</div>
      <div style={{ fontSize:14,color:'#7a7a94',marginBottom:40 }}>{score} of {total} correct — {TOPIC.title}</div>
      <div style={{ width:'100%',maxWidth:360,background:'#1e1e30',height:8,borderRadius:999,marginBottom:40,overflow:'hidden' }}>
        <div style={{ height:'100%',width:`${pct}%`,background:`linear-gradient(90deg,${gradeColor}aa,${gradeColor})`,borderRadius:999,transition:'width 1s var(--ease-out-expo)',boxShadow:`0 0 10px ${gradeColor}44` }}/>
      </div>
      <div style={{ display:'flex',gap:12 }}>
        <button onClick={onRestart} style={{ background:'#7C6AF7',color:'#fff',border:'none',borderRadius:9999,padding:'14px 32px',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:'var(--font-sans)',transition:'all 0.15s ease',boxShadow:'0 0 24px rgba(124,106,247,0.35)' }}
          onMouseEnter={e=>{e.target.style.background='#9b8cf9';e.target.style.transform='translateY(-1px)'}}
          onMouseLeave={e=>{e.target.style.background='#7C6AF7';e.target.style.transform='none'}}>
          Retake quiz
        </button>
        <button onClick={() => navigate('/dashboard')} style={{ background:'transparent',color:'#7a7a94',border:'1px solid #2a2a3d',borderRadius:9999,padding:'14px 32px',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:'var(--font-sans)',transition:'all 0.15s ease' }}
          onMouseEnter={e=>{e.target.style.color='#fff';e.target.style.borderColor='#4a4a68'}}
          onMouseLeave={e=>{e.target.style.color='#7a7a94';e.target.style.borderColor='#2a2a3d'}}>
          Dashboard
        </button>
      </div>
    </div>
  )
}

/* ── Main Quiz ── */
export default function Quiz() {
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [timedOut, setTimedOut] = useState(false)
  const timerRef = useRef(null)
  const explanationRef = useRef(null)

  const q = QUIZ_DATA[qIdx]
  const total = QUIZ_DATA.length
  const isCorrect = selected === q.correct

  useEffect(() => {
    if (submitted) return
    setTimeLeft(TIMER_SECONDS); setTimedOut(false)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setTimedOut(true); setSubmitted(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [qIdx])

  useEffect(() => { if (submitted) clearInterval(timerRef.current) }, [submitted])

  function handleSubmit() {
    if (selected === null && !timedOut) return
    setSubmitted(true)
    if (selected === q.correct) setScore(s => s+1)
    setTimeout(() => explanationRef.current?.scrollIntoView({ behavior:'smooth', block:'nearest' }), 100)
  }

  function handleNext() {
    if (qIdx + 1 >= total) { setDone(true) } else {
      setQIdx(i => i+1); setSelected(null); setSubmitted(false); setTimedOut(false)
      window.scrollTo({ top:0, behavior:'smooth' })
    }
  }

  function handleRestart() {
    setQIdx(0); setSelected(null); setSubmitted(false); setScore(0); setDone(false); setTimedOut(false); setTimeLeft(TIMER_SECONDS)
  }

  function getOptionState(idx) {
    if (!submitted) return selected === idx ? 'selected' : 'idle'
    if (idx === q.correct) return 'correct'
    if (idx === selected && selected !== q.correct) return 'wrong'
    return 'idle'
  }

  const mins = Math.floor(timeLeft/60), secs = timeLeft%60
  const isLow = timeLeft <= 20
  const pct = ((qIdx+1)/total)*100

  if (done) return <ScoreScreen score={score} total={total} onRestart={handleRestart}/>

  return (
    <div style={{ minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',background:'var(--color-bg-base)',padding:'0 0 120px',fontFamily:'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ width:'100%',maxWidth:680,padding:'24px 24px 0' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <div style={{ fontSize:11,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',color:'#7C6AF7',background:'rgba(124,106,247,0.1)',padding:'3px 10px',borderRadius:9999,border:'1px solid rgba(124,106,247,0.2)' }}>Week {TOPIC.week}</div>
            <span style={{ color:'#3a3a52',fontSize:13 }}>·</span>
            <span style={{ fontSize:13,color:'#7a7a94',fontWeight:500 }}>{TOPIC.title}</span>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:5,color:isLow?'#f87171':'#7a7a94',fontSize:13,fontWeight:500,transition:'color 0.3s ease' }}>
            <span style={{ color:isLow?'#f87171':'#7a7a94' }}><ClockIcon/></span>
            <span style={{ fontFamily:'var(--font-mono)',letterSpacing:'0.04em' }}>{mins}:{secs.toString().padStart(2,'0')}</span>
          </div>
        </div>
        <div style={{ height:4,background:'#1e1e30',borderRadius:999,overflow:'hidden',marginBottom:8 }}>
          <div style={{ height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#7C6AF7,#9b8cf9)',borderRadius:999,transition:'width 0.5s var(--ease-out-expo)',boxShadow:'0 0 10px rgba(124,106,247,0.4)' }}/>
        </div>
        <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'#7a7a94',fontWeight:500 }}>
          <span>Question {qIdx+1} of {total}</span>
          <span>{score} correct</span>
        </div>
      </div>

      {/* Question */}
      <div style={{ width:'100%',maxWidth:680,padding:'20px 24px 0',animation:'slideUp 0.35s var(--ease-out-expo)' }}>
        <div style={{ background:'#131320',border:'1px solid #2a2a3d',borderRadius:16,padding:'28px 28px 24px',boxShadow:'0 4px 24px rgba(0,0,0,0.4)',marginBottom:16,position:'relative',overflow:'hidden' }}>
          <div style={{ position:'absolute',top:-40,right:-40,width:120,height:120,background:'radial-gradient(circle,rgba(124,106,247,0.08) 0%,transparent 70%)',pointerEvents:'none' }}/>
          <div style={{ fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'#7a7a94',marginBottom:14 }}>Question {qIdx+1}</div>
          <h2 style={{ fontFamily:'var(--font-display)',fontSize:'clamp(18px,3.5vw,22px)',fontWeight:700,lineHeight:1.4,color:'#fff',letterSpacing:'-0.01em',position:'relative',margin:0 }}>
            {renderCode(q.question)}
          </h2>
          {timedOut && (
            <div style={{ marginTop:16,padding:'8px 14px',background:'rgba(248,113,113,0.1)',borderRadius:8,border:'1px solid rgba(248,113,113,0.2)',fontSize:13,color:'#f87171',fontWeight:500 }}>
              Time's up — the correct answer is highlighted below.
            </div>
          )}
        </div>

        {/* Options */}
        <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:20 }}>
          {q.options.map((opt,idx) => (
            <OptionCard key={`${qIdx}-${idx}`} label={LABELS[idx]} text={opt} state={getOptionState(idx)} onClick={() => !submitted && setSelected(idx)} disabled={submitted}/>
          ))}
        </div>

        {/* Explanation */}
        {submitted && (
          <div ref={explanationRef} style={{ marginBottom:20 }}>
            <Explanation text={q.explanation} isCorrect={!timedOut && isCorrect}/>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex',gap:12 }}>
          {!submitted ? (
            <button onClick={handleSubmit} disabled={selected===null}
              style={{ flex:1,background:selected!==null?'#7C6AF7':'transparent',color:selected!==null?'#fff':'#3a3a52',border:selected!==null?'none':'1px solid #2a2a3d',borderRadius:9999,padding:'14px 28px',fontSize:15,fontWeight:600,cursor:selected!==null?'pointer':'not-allowed',transition:'all 0.15s ease',fontFamily:'var(--font-sans)',boxShadow:selected!==null?'0 0 20px rgba(124,106,247,0.3)':'none',minHeight:50 }}
              onMouseEnter={e=>{if(selected!==null){e.target.style.background='#9b8cf9';e.target.style.transform='translateY(-1px)'}}}
              onMouseLeave={e=>{if(selected!==null){e.target.style.background='#7C6AF7';e.target.style.transform='none'}}}>
              Submit answer
            </button>
          ) : (
            <button onClick={handleNext}
              style={{ flex:1,background:qIdx+1>=total?'#f7c66a':'#7C6AF7',color:qIdx+1>=total?'#0a0a0f':'#fff',border:'none',borderRadius:9999,padding:'14px 28px',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:'var(--font-sans)',transition:'all 0.15s ease',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:qIdx+1>=total?'0 0 20px rgba(247,198,106,0.3)':'0 0 20px rgba(124,106,247,0.3)',minHeight:50 }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.opacity='0.9'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.opacity='1'}}>
              {qIdx+1>=total?'See results':'Next question'}<ChevronRight/>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
