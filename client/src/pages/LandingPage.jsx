import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const S = {
  nav: { position:'fixed',top:0,left:0,right:0,zIndex:'var(--z-sticky)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 48px',height:64,background:'rgba(10,10,15,0.85)',backdropFilter:'blur(12px)',borderBottom:'1px solid var(--color-border-subtle)' },
  navLinks: { display:'flex',gap:32,listStyle:'none',margin:0,padding:0 },
  navLink: { fontSize:14,color:'var(--fg-muted)',textDecoration:'none' },
  navCta: { background:'var(--accent)',color:'#fff',border:'none',cursor:'pointer',padding:'8px 20px',borderRadius:'var(--radius-full)',fontSize:14,fontWeight:500,fontFamily:'var(--font-sans)',transition:'background 150ms ease' },
  section: { padding:'96px 48px',maxWidth:1200,margin:'0 auto' },
  heroSection: { minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',paddingTop:120,paddingBottom:80,position:'relative',maxWidth:'none' },
  heroGlow: { position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',width:700,height:400,background:'radial-gradient(ellipse at center,rgba(124,106,247,0.07) 0%,transparent 70%)',pointerEvents:'none' },
  badge: { display:'inline-flex',alignItems:'center',gap:8,padding:'6px 14px',borderRadius:'var(--radius-full)',border:'1px solid rgba(124,106,247,0.35)',background:'rgba(124,106,247,0.08)',fontSize:11,fontWeight:600,letterSpacing:'0.08em',color:'var(--color-purple-300)',marginBottom:28,textTransform:'uppercase' },
  badgeDot: { width:6,height:6,borderRadius:'50%',background:'var(--accent)',boxShadow:'0 0 6px rgba(124,106,247,0.8)',animation:'pulse-dot 2s ease-in-out infinite' },
  heroHeadline: { fontFamily:'var(--font-display)',fontSize:'clamp(40px,5.5vw,72px)',fontWeight:700,lineHeight:1.08,letterSpacing:'-0.03em',color:'var(--fg)',maxWidth:820,marginBottom:24 },
  heroSub: { fontSize:18,color:'var(--fg-muted)',lineHeight:1.6,maxWidth:520,marginBottom:40 },
  heroActions: { display:'flex',gap:12,alignItems:'center',marginBottom:72 },
  btnPrimary: { background:'var(--accent)',color:'#fff',border:'none',cursor:'pointer',padding:'14px 32px',borderRadius:'var(--radius-full)',fontSize:16,fontWeight:600,fontFamily:'var(--font-sans)',transition:'all 200ms var(--ease-out-expo)',boxShadow:'var(--shadow-glow)' },
  btnGhost: { background:'transparent',color:'var(--fg-muted)',border:'1px solid var(--color-border-default)',cursor:'pointer',padding:'14px 24px',borderRadius:'var(--radius-full)',fontSize:16,fontWeight:500,fontFamily:'var(--font-sans)',display:'flex',alignItems:'center',gap:8,transition:'all 150ms ease' },
  mockupWrapper: { position:'relative',width:'100%',maxWidth:860,margin:'0 auto' },
  mockupFrame: { background:'var(--color-bg-surface-2)',border:'1px solid var(--color-border-default)',borderRadius:16,overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,0.6),var(--shadow-glow)' },
  mockupTitlebar: { display:'flex',alignItems:'center',gap:8,padding:'12px 16px',background:'var(--color-bg-surface-3)',borderBottom:'1px solid var(--color-border-subtle)' },
  statsBand: { background:'var(--color-bg-surface-2)',borderTop:'1px solid var(--color-border-subtle)',borderBottom:'1px solid var(--color-border-subtle)',padding:48,maxWidth:'none' },
  statsInner: { maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:0 },
  statItem: { textAlign:'center',padding:16,borderRight:'1px solid var(--color-border-subtle)' },
  statNum: { fontFamily:'var(--font-display)',fontSize:48,fontWeight:700,letterSpacing:'-0.03em',color:'var(--fg)',lineHeight:1,marginBottom:8 },
  statLabel: { fontSize:13,color:'var(--fg-muted)' },
  sectionLabel: { display:'inline-block',fontSize:11,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--accent)',marginBottom:12 },
  sectionHeading: { fontFamily:'var(--font-display)',fontSize:40,fontWeight:700,letterSpacing:'-0.02em',lineHeight:1.1,marginBottom:16 },
  sectionSub: { fontSize:16,color:'var(--fg-muted)',maxWidth:480,lineHeight:1.6,marginBottom:64 },
  featuresGrid: { display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24 },
  featureCard: { background:'var(--color-bg-surface-2)',border:'1px solid var(--color-border-default)',borderRadius:16,padding:32,transition:'all 250ms var(--ease-out-expo)',position:'relative',overflow:'hidden' },
  featureIconBg: { width:48,height:48,borderRadius:12,background:'rgba(124,106,247,0.12)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20 },
  featureTitle: { fontSize:18,fontWeight:600,marginBottom:12,fontFamily:'var(--font-display)' },
  featureDesc: { fontSize:14,color:'var(--fg-muted)',lineHeight:1.65 },
  featureTag: { display:'inline-flex',marginTop:16,fontSize:11,fontWeight:600,letterSpacing:'0.06em',color:'var(--color-purple-300)',background:'rgba(124,106,247,0.08)',border:'1px solid rgba(124,106,247,0.2)',borderRadius:'var(--radius-sm)',padding:'3px 8px',textTransform:'uppercase' },
  howSection: { background:'var(--color-bg-surface-1)',maxWidth:'none' },
  stepsRow: { display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:0,position:'relative' },
  step: { textAlign:'center',padding:'0 32px' },
  stepNum: { width:64,height:64,borderRadius:'50%',background:'var(--color-bg-surface-2)',border:'1px solid var(--color-border-default)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',fontFamily:'var(--font-mono)',fontSize:18,fontWeight:600,color:'var(--accent)',position:'relative',zIndex:1 },
  stepTitle: { fontSize:18,fontWeight:600,marginBottom:12,fontFamily:'var(--font-display)' },
  stepDesc: { fontSize:14,color:'var(--fg-muted)',lineHeight:1.65 },
  ctaSection: { textAlign:'center',padding:'120px 48px',maxWidth:'none',position:'relative',overflow:'hidden' },
  ctaGlow: { position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:600,height:300,background:'radial-gradient(ellipse,rgba(124,106,247,0.1) 0%,transparent 70%)',pointerEvents:'none' },
  ctaInner: { position:'relative',maxWidth:600,margin:'0 auto' },
  ctaHeadline: { fontFamily:'var(--font-display)',fontSize:'clamp(32px,4vw,52px)',fontWeight:700,letterSpacing:'-0.02em',lineHeight:1.1,marginBottom:20 },
  ctaSub: { fontSize:16,color:'var(--fg-muted)',marginBottom:40,lineHeight:1.6 },
  ctaNote: { fontSize:12,color:'var(--fg-muted)',marginTop:16 },
  footer: { borderTop:'1px solid var(--color-border-subtle)',padding:'40px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',maxWidth:'none' },
  footerLinks: { display:'flex',gap:24,listStyle:'none',margin:0,padding:0 },
  footerLink: { fontSize:13,color:'var(--fg-muted)',textDecoration:'none' },
  footerCopy: { fontSize:13,color:'var(--fg-muted)' },
}

function WeekCard({ label, topic, lessons, progress, active }) {
  return (
    <div style={{ flex:1,background:'var(--color-bg-surface-3)',border:`1px solid ${active?'var(--accent)':'var(--color-border-default)'}`,borderRadius:10,padding:16,position:'relative',overflow:'hidden',boxShadow:active?'var(--shadow-glow-sm)':'none' }}>
      {active && <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,var(--accent),var(--color-purple-300))' }}/>}
      <div style={{ fontSize:10,textTransform:'uppercase',letterSpacing:'0.1em',color:'var(--fg-muted)',marginBottom:8,fontWeight:600 }}>{label}</div>
      <div style={{ fontSize:13,fontWeight:600,color:'var(--fg)',marginBottom:10,lineHeight:1.3 }}>{topic}</div>
      <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
        {lessons.map((l, i) => (
          <div key={i} style={{ display:'flex',alignItems:'center',gap:7,fontSize:11,color:l.done?'var(--fg-secondary)':'var(--fg-muted)' }}>
            <div style={{ width:14,height:14,borderRadius:'50%',border:`1.5px solid ${l.done?'var(--accent)':'var(--color-border-strong)'}`,background:l.done?'var(--accent)':'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center' }}>
              {l.done && <span style={{ display:'block',width:5,height:3,borderLeft:'1.5px solid #fff',borderBottom:'1.5px solid #fff',transform:'rotate(-45deg) translateY(-1px)' }}/>}
            </div>
            {l.text}
          </div>
        ))}
      </div>
      <div style={{ display:'flex',alignItems:'center',gap:10,marginTop:10 }}>
        <div style={{ flex:1,height:4,background:'var(--color-border-default)',borderRadius:99,overflow:'hidden' }}>
          <div style={{ height:'100%',borderRadius:99,background:'linear-gradient(90deg,var(--accent),var(--color-purple-300))',width:`${progress}%` }}/>
        </div>
        <span style={{ fontSize:10,color:'var(--fg-muted)',fontFamily:'var(--font-mono)' }}>{progress}%</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.12 })
    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div style={{ background:'var(--color-bg-base)',color:'var(--fg)',fontFamily:'var(--font-sans)' }}>
      {/* NAV */}
      <nav style={S.nav}>
        <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:20,color:'#fff',letterSpacing:'-0.02em' }}>
          Skill<span style={{ color:'var(--accent)' }}>Path</span>
        </div>
        <ul style={S.navLinks}>
          {['Features','How it works','Pricing'].map(l => (
            <li key={l}><a href="#" style={S.navLink}>{l}</a></li>
          ))}
        </ul>
        <button style={S.navCta} onClick={() => navigate('/login')}>Start learning free</button>
      </nav>

      {/* HERO */}
      <section style={S.heroSection}>
        <div style={S.heroGlow}/>
        <div className="badge fade-up" style={S.badge}>
          <span style={S.badgeDot}/>
          AI-powered learning · Now in beta
        </div>
        <h1 className="fade-up" style={S.heroHeadline}>
          Your personal{' '}
          <em style={{ fontStyle:'normal',background:'linear-gradient(135deg,#9b8cf9 0%,#7C6AF7 50%,#f7c66a 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' }}>
            AI coach
          </em>
          <br/>for mastering anything
        </h1>
        <p className="fade-up" style={S.heroSub}>
          Tell SkillPath what you want to learn. It builds your roadmap, curates resources, and remembers where you struggle — so you don't have to.
        </p>
        <div className="fade-up" style={S.heroActions}>
          <button style={S.btnPrimary} onClick={() => navigate('/login')}>Start learning free</button>
          <button style={S.btnGhost} onClick={() => navigate('/roadmap')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            See how it works
          </button>
        </div>

        {/* PRODUCT MOCKUP */}
        <div className="fade-up" style={S.mockupWrapper}>
          <div style={S.mockupFrame}>
            <div style={S.mockupTitlebar}>
              <div style={{ width:10,height:10,borderRadius:'50%',background:'#f87171',opacity:0.7 }}/>
              <div style={{ width:10,height:10,borderRadius:'50%',background:'#f7c66a',opacity:0.7 }}/>
              <div style={{ width:10,height:10,borderRadius:'50%',background:'#34d399',opacity:0.7 }}/>
              <span style={{ marginLeft:8,fontSize:12,color:'var(--fg-muted)',fontFamily:'var(--font-mono)' }}>skillpath.app / my-path / react-mastery</span>
            </div>
            <div style={{ padding:24 }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
                <div style={{ fontSize:15,fontWeight:600,color:'var(--fg)',fontFamily:'var(--font-display)' }}>React Mastery — 4-week path</div>
                <div style={{ fontSize:11,color:'var(--color-gold-500)',background:'rgba(247,198,106,0.1)',border:'1px solid rgba(247,198,106,0.2)',borderRadius:'var(--radius-sm)',padding:'3px 8px',fontWeight:600 }}>Week 2 of 4</div>
              </div>
              <div style={{ display:'flex',gap:12,marginBottom:16 }}>
                <WeekCard label="Week 1" topic="Core Concepts" lessons={[{text:'JSX & rendering',done:true},{text:'Props & state',done:true},{text:'Event handling',done:true}]} progress={100} active={false}/>
                <WeekCard label="Week 2" topic="Hooks & Effects" lessons={[{text:'useState deep dive',done:true},{text:'useEffect patterns',done:true},{text:'Custom hooks',done:false}]} progress={68} active={true}/>
                <WeekCard label="Week 3" topic="State Management" lessons={[{text:'Context API',done:false},{text:'Zustand basics',done:false},{text:'Data fetching',done:false}]} progress={0} active={false}/>
                <WeekCard label="Week 4" topic="Real-world Projects" lessons={[{text:'Component patterns',done:false},{text:'Testing with Vitest',done:false},{text:'Deploy to Vercel',done:false}]} progress={0} active={false}/>
              </div>
              <div style={{ background:'rgba(124,106,247,0.06)',border:'1px solid rgba(124,106,247,0.2)',borderRadius:8,padding:'12px 14px',display:'flex',alignItems:'flex-start',gap:10 }}>
                <div style={{ width:28,height:28,borderRadius:8,background:'rgba(124,106,247,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C6AF7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div style={{ fontSize:12,color:'var(--fg-secondary)',lineHeight:1.5 }}>
                  <strong style={{ color:'var(--color-purple-300)',fontWeight:500 }}>AI Coach:</strong> You struggled with useEffect cleanup in your last session. Next up: a focused 8-min exercise on dependency arrays.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={S.statsBand}>
        <div style={S.statsInner}>
          {[['2.4×','faster skill acquisition vs. self-study'],['50k+','learners on active paths'],['200+','curated learning paths'],['94%','completion rate (vs. 13% industry avg)']].map(([num,label],i) => (
            <div key={i} className="fade-up" style={{ ...S.statItem, borderRight: i < 3 ? '1px solid var(--color-border-subtle)' : 'none' }}>
              <div style={S.statNum}>{num}</div>
              <div style={S.statLabel}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section style={S.section}>
        <div className="fade-up" style={S.sectionLabel}>Why SkillPath</div>
        <h2 className="fade-up" style={S.sectionHeading}>Built for how developers actually learn</h2>
        <p className="fade-up" style={S.sectionSub}>Not another course platform. An AI that adapts to you — your pace, your gaps, your goals.</p>
        <div style={S.featuresGrid}>
          {[
            { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM3 9h18M9 21V9"/></svg>, title:'Personalized roadmaps', desc:'Answer 3 questions. Get a week-by-week learning path scoped exactly to your skill level, time availability, and end goal.', tag:'Adaptive AI', gold:false },
            { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>, title:'Smart resource curation', desc:'No more link rabbit holes. SkillPath surfaces the best docs, videos, and exercises for each concept — ranked by your learning style.', tag:'Curated daily', gold:true },
            { icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0V4.5A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 8A2.5 2.5 0 0 1 17 10.5v9a2.5 2.5 0 0 1-5 0v-9A2.5 2.5 0 0 1 14.5 8z"/></svg>, title:'Weak-point memory', desc:'SkillPath remembers where you got stuck — last session, last week, last month — and resurfaces those concepts before you move on.', tag:'Spaced repetition', gold:false },
          ].map((f, i) => (
            <div key={i} className="fade-up" style={S.featureCard}>
              <div style={{ ...S.featureIconBg, background: f.gold?'rgba(247,198,106,0.1)':'rgba(124,106,247,0.12)' }}>{f.icon}</div>
              <div style={S.featureTitle}>{f.title}</div>
              <div style={S.featureDesc}>{f.desc}</div>
              <span style={{ ...S.featureTag, color:f.gold?'var(--color-gold-400)':'var(--color-purple-300)', background:f.gold?'rgba(247,198,106,0.08)':'rgba(124,106,247,0.08)', borderColor:f.gold?'rgba(247,198,106,0.2)':'rgba(124,106,247,0.2)' }}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ ...S.section, ...S.howSection }}>
        <div style={{ maxWidth:1200,margin:'0 auto' }}>
          <div className="fade-up" style={{ ...S.sectionLabel,display:'block',textAlign:'center' }}>How it works</div>
          <h2 className="fade-up" style={{ ...S.sectionHeading,textAlign:'center',margin:'0 auto 16px' }}>Three steps to unstuck</h2>
          <p className="fade-up" style={{ ...S.sectionSub,textAlign:'center',margin:'0 auto 64px' }}>From "I want to learn X" to shipping real projects — faster than you'd expect.</p>
          <div style={{ ...S.stepsRow }}>
            {[
              { num:'01', title:'Tell SkillPath your goal', desc:'Name the skill. Set your deadline. SkillPath asks what you already know and calibrates a path in seconds — no lengthy quiz.' },
              { num:'02', title:'Follow your daily plan', desc:'Each day surfaces the right lessons, exercises, and code challenges at the right difficulty. Fits in 20–60 minutes around your schedule.' },
              { num:'03', title:'Build — then ship', desc:'End every path with a portfolio-ready project. Your coach reviews your code, flags weak spots, and certifies your completion.' },
            ].map((s, i) => (
              <div key={i} className="fade-up" style={S.step}>
                <div style={S.stepNum}>{s.num}</div>
                <div style={S.stepTitle}>{s.title}</div>
                <div style={S.stepDesc}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div style={S.ctaSection}>
        <div style={S.ctaGlow}/>
        <div style={S.ctaInner}>
          <div className="fade-up" style={{ ...S.badge,margin:'0 auto 28px' }}><span style={S.badgeDot}/>Free during beta</div>
          <h2 className="fade-up" style={S.ctaHeadline}>Ready to level up?</h2>
          <p className="fade-up" style={S.ctaSub}>Join 50,000+ developers who stopped drifting through tutorials and started building real skills.</p>
          <button className="fade-up" style={{ ...S.btnPrimary,fontSize:17,padding:'16px 40px' }} onClick={() => navigate('/login')}>Start learning free</button>
          <p className="fade-up" style={S.ctaNote}>No credit card. No time limit. Cancel whenever.</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={S.footer}>
        <div style={{ fontFamily:'var(--font-display)',fontWeight:700,fontSize:18,color:'#fff',letterSpacing:'-0.02em' }}>
          Skill<span style={{ color:'var(--accent)' }}>Path</span>
        </div>
        <ul style={S.footerLinks}>
          {['Privacy','Terms','Status','GitHub'].map(l => (
            <li key={l}><a href="#" style={S.footerLink}>{l}</a></li>
          ))}
        </ul>
        <span style={S.footerCopy}>© 2026 SkillPath</span>
      </footer>
    </div>
  )
}
