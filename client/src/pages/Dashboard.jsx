import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ICONS = {
  grid:         <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  book:         <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
  compass:      <><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></>,
  trophy:       <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></>,
  user:         <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  settings:     <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  bell:         <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  search:       <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
  flame:        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/>,
  target:       <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  check_circle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  alert_circle: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  arrow_right:  <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
  chevron_right:<polyline points="9 18 15 12 9 6"/>,
  bar_chart:    <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  zap:          <path d="M13 2L4.09 12.6A1 1 0 0 0 5 14h6l-1 8 9-10.6A1 1 0 0 0 18 10h-6l1-8z"/>,
  clock:        <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  sparkles:     <><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/></>,
  menu:         <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  x:            <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
};

const Icon = ({ name, size = 16, color = 'currentColor', sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {ICONS[name] || null}
  </svg>
);

const Avatar = ({ initials = 'JD', size = 32 }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#7C6AF7,#5a4fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color: '#fff', flexShrink: 0, letterSpacing: '-0.01em' }}>
    {initials}
  </div>
);

const ProgressBar = ({ value, color = '#7C6AF7', height = 5, animated = false }) => (
  <div style={{ height, background: '#1e1e2e', borderRadius: height, overflow: 'hidden' }}>
    <div
      className={animated ? 'progress-bar-fill' : ''}
      style={{ width: `${value}%`, height: '100%', background: color, borderRadius: height }}
    />
  </div>
);

const Badge = ({ children, color = 'purple' }) => {
  const t = {
    purple: ['rgba(124,106,247,0.15)', '#9b8cf9'],
    gold:   ['rgba(247,198,106,0.15)', '#f7c66a'],
    green:  ['rgba(52,211,153,0.12)',  '#34d399'],
    blue:   ['rgba(96,165,250,0.12)',  '#60a5fa'],
    gray:   ['rgba(122,122,148,0.12)', '#7a7a94'],
  }[color] || ['rgba(124,106,247,0.15)', '#9b8cf9'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.04em', background: t[0], color: t[1], textTransform: 'uppercase' }}>
      {children}
    </span>
  );
};

const NAV_MAIN = [
  { id: 'dashboard',   icon: 'grid',    label: 'Dashboard' },
  { id: 'paths',       icon: 'book',    label: 'My Paths' },
  { id: 'explore',     icon: 'compass', label: 'Explore' },
  { id: 'leaderboard', icon: 'trophy',  label: 'Leaderboard' },
];
const NAV_BOTTOM = [
  { id: 'profile',  icon: 'user',     label: 'Profile' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
];

function SidebarContent({ active, onNav, onClose }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: 28 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
          Skill<span style={{ color: '#7C6AF7' }}>Path</span>
        </div>
        {onClose && (
          <div onClick={onClose} style={{ cursor: 'pointer', color: '#7a7a94', display: 'flex' }}>
            <Icon name="x" size={16} />
          </div>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#3a3a52', padding: '0 10px', marginBottom: 4, textTransform: 'uppercase' }}>Learn</div>
        {NAV_MAIN.map(item => (
          <div
            key={item.id}
            onClick={() => { onNav(item.id); onClose?.(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7,
              fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 150ms ease',
              color: active === item.id ? '#fff' : '#7a7a94',
              background: active === item.id ? 'rgba(124,106,247,0.12)' : 'transparent',
            }}
          >
            <Icon name={item.icon} size={15} color={active === item.id ? '#7C6AF7' : 'currentColor'} />
            {item.label}
          </div>
        ))}
        <div style={{ height: 1, background: '#1e1e2e', margin: '10px 0' }} />
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#3a3a52', padding: '0 10px', marginBottom: 4, textTransform: 'uppercase' }}>Account</div>
        {NAV_BOTTOM.map(item => (
          <div
            key={item.id}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 150ms ease', color: '#7a7a94' }}
          >
            <Icon name={item.icon} size={15} />
            {item.label}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #1e1e2e', paddingTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar initials="JD" size={32} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Jamie Dev</div>
          <div style={{ fontSize: 11, color: '#7a7a94' }}>Pro plan</div>
        </div>
      </div>
    </>
  );
}

function DesktopSidebar({ active, onNav }) {
  return (
    <aside style={{ width: 220, background: '#0f0f1a', borderRight: '1px solid #1e1e2e', display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0, padding: '20px 12px' }}>
      <SidebarContent active={active} onNav={onNav} />
    </aside>
  );
}

function MobileSidebar({ active, onNav, open, onClose }) {
  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 299 }} />}
      <aside style={{
        width: 220, background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(12px)',
        borderRight: '1px solid #1e1e2e', display: 'flex', flexDirection: 'column',
        height: '100%', flexShrink: 0, padding: '20px 12px',
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 300,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 250ms cubic-bezier(0.16,1,0.3,1)',
      }}>
        <SidebarContent active={active} onNav={onNav} onClose={onClose} />
      </aside>
    </>
  );
}

function Heatmap() {
  const weeks = 26;
  const today = new Date(2026, 3, 24);
  const [tooltip, setTooltip] = useState(null);

  const seed = (d) => {
    let h = 0;
    for (let i = 0; i < d.length; i++) h = Math.imul(31, h) + d.charCodeAt(i) | 0;
    return Math.abs(h);
  };

  const data = {};
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - ((weeks - 1 - w) * 7 + (6 - d)));
      const key = date.toISOString().slice(0, 10);
      const s = seed(key);
      const weekday = date.getDay();
      const isWeekend = weekday === 0 || weekday === 6;
      const base = isWeekend ? 0.35 : 0.65;
      const r = (s % 100) / 100;
      let level = 0;
      if (r < base * 0.25) level = 0;
      else if (r < base * 0.55) level = 1;
      else if (r < base * 0.78) level = 2;
      else if (r < base * 0.92) level = 3;
      else level = 4;
      data[key] = { level, minutes: [0, 15, 35, 65, 120][level] };
    }
  }

  const colors = ['#1a1a2e', 'rgba(124,106,247,0.25)', 'rgba(124,106,247,0.45)', 'rgba(124,106,247,0.7)', '#7C6AF7'];

  const months = [];
  for (let w = 0; w < weeks; w++) {
    const d = new Date(today);
    d.setDate(today.getDate() - ((weeks - 1 - w) * 7));
    if (w === 0 || d.getMonth() !== new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((weeks - 1 - (w - 1)) * 7)).getMonth()) {
      months.push({ week: w, label: d.toLocaleDateString('en-US', { month: 'short' }) });
    }
  }

  const cols = [];
  for (let w = 0; w < weeks; w++) {
    const cells = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - ((weeks - 1 - w) * 7 + (6 - d)));
      const key = date.toISOString().slice(0, 10);
      const entry = data[key] || { level: 0, minutes: 0 };
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      cells.push(
        <div
          key={d}
          style={{ width: 13, height: 13, borderRadius: 3, background: colors[entry.level], cursor: 'pointer', transition: 'opacity 150ms ease' }}
          onMouseEnter={(e) => setTooltip({ label, minutes: entry.minutes, x: e.clientX, y: e.clientY })}
          onMouseLeave={() => setTooltip(null)}
        />
      );
    }
    cols.push(<div key={w} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{cells}</div>);
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', marginLeft: 24, marginBottom: 4, position: 'relative', height: 16 }}>
        {months.map((m, i) => (
          <div key={i} style={{ position: 'absolute', left: m.week * 15, fontSize: 11, color: '#7a7a94', fontWeight: 500 }}>{m.label}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {dayLabels.map((l, i) => (
            <div key={i} style={{ width: 13, height: 13, fontSize: 10, color: i % 2 === 1 ? '#7a7a94' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{l}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
          {cols}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 11, color: '#7a7a94' }}>Less</span>
        {colors.map((c, i) => <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: c }} />)}
        <span style={{ fontSize: 11, color: '#7a7a94' }}>More</span>
      </div>
      {tooltip && (
        <div style={{ position: 'fixed', left: tooltip.x + 12, top: tooltip.y - 36, background: '#1e1e30', border: '1px solid #2a2a3d', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#c4c4d4', pointerEvents: 'none', zIndex: 500, whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <span style={{ color: '#fff', fontWeight: 600 }}>{tooltip.minutes > 0 ? `${tooltip.minutes} min` : 'No activity'}</span>
          <span style={{ color: '#7a7a94' }}> — {tooltip.label}</span>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, iconColor, iconBg, label, value, sub, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="fade-up"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${delay}ms`,
        background: '#131320',
        border: `1px solid ${hovered ? '#4a4a68' : '#2a2a3d'}`,
        borderRadius: 12, padding: '20px 22px',
        transition: 'border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={18} color={iconColor} />
        </div>
        {sub && <span style={{ fontSize: 11, color: '#34d399', fontWeight: 600, background: 'rgba(52,211,153,0.1)', padding: '3px 8px', borderRadius: 20 }}>{sub}</span>}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#7a7a94', marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function PathCard({ title, tag, tagColor, progress, lessonsLeft, timeLeft, color, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  return (
    <div
      className="fade-up"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay: `${delay}ms`,
        background: '#131320',
        border: `1px solid ${hovered ? '#4a4a68' : '#2a2a3d'}`,
        borderRadius: 12, padding: 20,
        transition: 'border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div style={{ height: 3, borderRadius: '8px 8px 0 0', background: color, margin: '-20px -20px 16px', opacity: 0.8 }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: 5 }}>{title}</div>
          <Badge color={tagColor}>{tag}</Badge>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{progress}%</div>
      </div>
      <ProgressBar value={progress} color={color} height={6} animated />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7a7a94' }}>
            <Icon name="book" size={12} color="#7a7a94" />
            {lessonsLeft} lessons left
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7a7a94' }}>
            <Icon name="clock" size={12} color="#7a7a94" />
            {timeLeft}
          </div>
        </div>
        <button
          onClick={() => navigate('/learn')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7C6AF7', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 150ms ease' }}
          onMouseEnter={e => e.currentTarget.style.background = '#9080f9'}
          onMouseLeave={e => e.currentTarget.style.background = '#7C6AF7'}
        >
          Continue <Icon name="arrow_right" size={13} color="#fff" />
        </button>
      </div>
    </div>
  );
}

function ActivityItem({ icon, iconColor, iconBg, title, sub, time }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #1e1e2e' }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={15} color={iconColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#7a7a94', marginTop: 1 }}>{sub}</div>
      </div>
      <div style={{ fontSize: 11, color: '#3a3a52', fontWeight: 500, whiteSpace: 'nowrap' }}>{time}</div>
    </div>
  );
}

export default function Dashboard() {
  const [navActive, setNavActive] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const paths = [
    { title: 'React Fundamentals',   tag: 'Frontend', tagColor: 'purple', progress: 68, lessonsLeft: 8,  timeLeft: '~3h left', color: '#7C6AF7', delay: 0 },
    { title: 'Node.js & REST APIs',  tag: 'Backend',  tagColor: 'blue',   progress: 41, lessonsLeft: 15, timeLeft: '~6h left', color: '#60a5fa', delay: 60 },
    { title: 'TypeScript Essentials',tag: 'Language', tagColor: 'green',  progress: 12, lessonsLeft: 22, timeLeft: '~9h left', color: '#34d399', delay: 120 },
  ];

  const activities = [
    { icon: 'check_circle', iconColor: '#34d399', iconBg: 'rgba(52,211,153,0.1)',   title: 'Completed: useEffect deep dive',      sub: 'React Fundamentals · Lesson 16',       time: '2h ago' },
    { icon: 'check_circle', iconColor: '#34d399', iconBg: 'rgba(52,211,153,0.1)',   title: 'Completed: Async/await patterns',     sub: 'Node.js & REST APIs · Lesson 7',       time: 'Yesterday' },
    { icon: 'trophy',       iconColor: '#f7c66a', iconBg: 'rgba(247,198,106,0.1)', title: 'Badge unlocked: Hook Master',         sub: 'Completed 5 hook-related lessons',      time: 'Yesterday' },
    { icon: 'zap',          iconColor: '#7C6AF7', iconBg: 'rgba(124,106,247,0.1)', title: 'Quiz passed: Closures & scope',       sub: '9/10 correct · 90% accuracy',           time: '2d ago' },
    { icon: 'check_circle', iconColor: '#34d399', iconBg: 'rgba(52,211,153,0.1)',   title: 'Completed: Event loop explained',     sub: 'Node.js & REST APIs · Lesson 6',       time: '2d ago' },
  ];

  const weakPoints = [
    { label: 'useCallback',          path: 'React Fundamentals' },
    { label: 'Middleware chaining',  path: 'Node.js' },
    { label: 'Generic types',        path: 'TypeScript' },
    { label: 'Promise.all',          path: 'Async JS' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0a0f' }}>
      {/* Desktop sidebar — hidden below 769px via media query in index.css */}
      <div className="desktop-sidebar-wrapper" style={{ height: '100%' }}>
        <DesktopSidebar active={navActive} onNav={setNavActive} />
      </div>

      {/* Mobile drawer */}
      <MobileSidebar active={navActive} onNav={setNavActive} open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{ height: 60, borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              onClick={() => setMobileOpen(true)}
              className="mobile-menu-btn"
              style={{ cursor: 'pointer', color: '#7a7a94', padding: 4, display: 'none' }}
            >
              <Icon name="menu" size={20} />
            </div>
            <div className="mobile-logo" style={{ fontSize: 16, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-display)', display: 'none' }}>
              Skill<span style={{ color: '#7C6AF7' }}>Path</span>
            </div>
          </div>

          <div className="topbar-search" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: 10, pointerEvents: 'none' }}>
              <Icon name="search" size={14} color="#7a7a94" />
            </div>
            <input
              placeholder="Search lessons, paths…"
              style={{ fontFamily: 'var(--font-sans)', fontSize: 13, background: '#131320', border: '1px solid #2a2a3d', borderRadius: 8, padding: '7px 12px 7px 32px', color: '#c4c4d4', outline: 'none', width: 220, transition: 'border-color 150ms ease' }}
              onFocus={e => e.target.style.borderColor = '#7C6AF7'}
              onBlur={e => e.target.style.borderColor = '#2a2a3d'}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#131320', border: '1px solid #2a2a3d', borderRadius: 9, cursor: 'pointer', color: '#7a7a94', transition: 'border-color 150ms ease' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#4a4a68'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3d'}
            >
              <Icon name="bell" size={16} />
              <div style={{ position: 'absolute', top: 7, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#7C6AF7', border: '2px solid #0a0a0f' }} />
            </div>
            <Avatar initials="JD" size={36} />
          </div>
        </header>

        {/* Scrollable content */}
        <main className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* Welcome row */}
          <div className="fade-up" style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: '#7a7a94', fontWeight: 500, marginBottom: 4 }}>Thursday, April 24</div>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, fontFamily: 'var(--font-display)' }}>
                  Welcome back, <span style={{ color: '#7C6AF7' }}>Jamie</span>
                </h1>
                <p style={{ fontSize: 14, color: '#7a7a94', marginTop: 5 }}>You're on a 14-day streak. Keep it going.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(247,198,106,0.08)', border: '1px solid rgba(247,198,106,0.2)', borderRadius: 10, padding: '10px 16px' }}>
                <Icon name="flame" size={18} color="#f7c66a" sw={1.5} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#f7c66a', fontFamily: 'var(--font-display)', lineHeight: 1 }}>14</div>
                  <div style={{ fontSize: 11, color: '#7a7a94', fontWeight: 500 }}>day streak</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
            <StatCard icon="book"      iconColor="#7C6AF7" iconBg="rgba(124,106,247,0.12)" label="Active paths"     value="3"   sub="+1 this month"     delay={0} />
            <StatCard icon="bar_chart" iconColor="#60a5fa" iconBg="rgba(96,165,250,0.10)"  label="Weeks completed"  value="18"                          delay={60} />
            <StatCard icon="target"    iconColor="#34d399" iconBg="rgba(52,211,153,0.10)"  label="Quiz accuracy"    value="87%" sub="+4% vs last week"   delay={120} />
            <StatCard icon="flame"     iconColor="#f7c66a" iconBg="rgba(247,198,106,0.10)" label="Current streak"   value="14d"                          delay={180} />
          </div>

          {/* Middle grid */}
          <div className="middle-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 24 }}>

            {/* Active paths */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>Active paths</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#7C6AF7', cursor: 'pointer', fontWeight: 500 }}>
                  View all <Icon name="chevron_right" size={14} color="#7C6AF7" />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {paths.map((p, i) => <PathCard key={i} {...p} />)}
              </div>
            </section>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Recent activity */}
              <section style={{ background: '#131320', border: '1px solid #2a2a3d', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>Recent activity</h2>
                  <Icon name="clock" size={14} color="#7a7a94" />
                </div>
                <div>
                  {activities.map((a, i) => (
                    <div key={i} style={{ borderBottom: i < activities.length - 1 ? '1px solid #1e1e2e' : 'none' }}>
                      <ActivityItem {...a} />
                    </div>
                  ))}
                </div>
              </section>

              {/* Weak points */}
              <section style={{ background: '#131320', border: '1px solid #2a2a3d', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Icon name="alert_circle" size={15} color="#f87171" />
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>Weak points to review</h2>
                </div>
                <p style={{ fontSize: 12, color: '#7a7a94', marginBottom: 14, lineHeight: 1.5 }}>
                  These concepts tripped you up on recent quizzes. Worth revisiting.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {weakPoints.map((w, i) => (
                    <div
                      key={i}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, fontSize: 12, fontWeight: 500, padding: '5px 10px', cursor: 'pointer', transition: 'background 150ms ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.14)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                    >
                      <Icon name="zap" size={11} color="#f87171" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{w.label}</div>
                        <div style={{ fontSize: 10, color: 'rgba(248,113,113,0.6)', fontWeight: 400 }}>{w.path}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', background: 'rgba(248,113,113,0.1)', color: '#f87171', border: 'none', borderRadius: 8, padding: '8px 16px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 150ms ease', marginTop: 16 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                >
                  <Icon name="sparkles" size={13} color="#f87171" />
                  Start review session
                </button>
              </section>

            </div>
          </div>

          {/* Heatmap */}
          <section className="fade-up" style={{ background: '#131320', border: '1px solid #2a2a3d', borderRadius: 12, padding: '22px 24px', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: 3 }}>Learning activity</h2>
                <p style={{ fontSize: 13, color: '#7a7a94' }}>Daily learning over the past 26 weeks</p>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {[['94', 'days active'], ['847', 'min total'], ['62%', 'consistency']].map(([v, l]) => (
                  <div key={l} style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 11, color: '#7a7a94', marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <Heatmap />
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
