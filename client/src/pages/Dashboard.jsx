import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast.jsx';

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
  plus:         <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
};

const Icon = ({ name, size = 16, color = 'currentColor', sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {ICONS[name] || null}
  </svg>
);

const Avatar = ({ initials = 'U', size = 32, src = '' }) => {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: '#1a1a2e' }}
      />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#7C6AF7,#5a4fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color: '#fff', flexShrink: 0, letterSpacing: '-0.01em' }}>
      {initials}
    </div>
  );
};

function ProfileMenu({ initials, email, name, avatarUrl, onLogout, onViewProfile }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [open]);

  return (
    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Open profile menu"
        aria-expanded={open}
        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%', outline: open ? '2px solid #7C6AF7' : 'none', outlineOffset: 2, transition: 'outline-color 150ms ease' }}
      >
        <Avatar initials={initials} size={36} src={avatarUrl} />
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: 220, background: '#131320', border: '1px solid #2a2a3d', borderRadius: 10, boxShadow: '0 12px 32px rgba(0,0,0,0.5)', padding: 6, zIndex: 100, animation: 'fadeIn 150ms ease' }}>
          <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid #1e1e2e', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name || 'SkillPath user'}
            </div>
            <div style={{ fontSize: 12, color: '#7a7a94', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {email || ''}
            </div>
          </div>
          <button
            onClick={() => { setOpen(false); onViewProfile(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'transparent', border: 'none', padding: '8px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, color: '#c4c4d4', fontFamily: 'var(--font-sans)', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,106,247,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Icon name="user" size={14} color="#c4c4d4" />
            View profile
          </button>
          <button
            onClick={() => { setOpen(false); onLogout(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'transparent', border: 'none', padding: '8px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, color: '#f87171', fontFamily: 'var(--font-sans)', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Icon name="settings" size={14} color="#f87171" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

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
  { id: 'dashboard',     icon: 'grid',         label: 'Dashboard',     to: '/dashboard' },
  { id: 'new-path',      icon: 'sparkles',     label: 'New path',      to: '/roadmap'   },
  { id: 'my-paths',      icon: 'book',         label: 'My paths',      to: '/my-paths'  },
  { id: 'weak-concepts', icon: 'alert_circle', label: 'Weak concepts', to: '/weak-concepts' },
];
const NAV_BOTTOM = [
  { id: 'profile', icon: 'user',     label: 'Profile', to: '/profile' },
  { id: 'logout',  icon: 'settings', label: 'Log out' },
];

function SidebarContent({ active, onNav, onClose, onLogout, userName, initials, avatarUrl }) {
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
            onClick={() => { onNav(item); onClose?.(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7,
              fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 150ms ease',
              color: active === item.id ? '#fff' : '#7a7a94',
              background: active === item.id ? 'rgba(124,106,247,0.12)' : 'transparent',
            }}
            onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.background = 'rgba(124,106,247,0.06)' }}
            onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.background = 'transparent' }}
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
            onClick={() => {
              if (item.id === 'logout') onLogout()
              else if (item.to) { onNav(item); onClose?.() }
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 150ms ease', color: active === item.id ? '#fff' : '#7a7a94', background: active === item.id ? 'rgba(124,106,247,0.12)' : 'transparent' }}
            onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.background = 'rgba(124,106,247,0.06)' }}
            onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.background = 'transparent' }}
          >
            <Icon name={item.icon} size={15} color={active === item.id ? '#7C6AF7' : 'currentColor'} />
            {item.label}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid #1e1e2e', paddingTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar initials={initials} size={32} src={avatarUrl} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{userName || 'Loading…'}</div>
          <div style={{ fontSize: 11, color: '#7a7a94' }}>SkillPath</div>
        </div>
      </div>
    </>
  );
}

function DesktopSidebar({ active, onNav, onLogout, userName, initials, avatarUrl }) {
  return (
    <aside style={{ width: 220, background: '#0f0f1a', borderRight: '1px solid #1e1e2e', display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0, padding: '20px 12px' }}>
      <SidebarContent active={active} onNav={onNav} onLogout={onLogout} userName={userName} initials={initials} avatarUrl={avatarUrl} />
    </aside>
  );
}

function MobileSidebar({ active, onNav, open, onClose, onLogout, userName, initials, avatarUrl }) {
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
        <SidebarContent active={active} onNav={onNav} onClose={onClose} onLogout={onLogout} userName={userName} initials={initials} avatarUrl={avatarUrl} />
      </aside>
    </>
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

function PathCard({ pathId, title, tag, tagColor, progress, lessonsLeft, timeLeft, color, isComplete, delay = 0, onSubmitRename, onDelete }) {
  const [hovered, setHovered]   = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState(title);
  const inputRef                = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [menuOpen])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  function startEditing() {
    setDraft(title)
    setEditing(true)
  }

  function commitEdit() {
    const next = draft.trim()
    setEditing(false)
    if (!next || next === title) return
    onSubmitRename?.(pathId, next)
  }

  function cancelEdit() {
    setDraft(title)
    setEditing(false)
  }

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
        position: 'relative',
      }}
    >
      <div style={{ height: 3, borderRadius: '8px 8px 0 0', background: color, margin: '-20px -20px 16px', opacity: 0.8 }} />

      {/* Kebab menu — visible on hover, or when menu is open */}
      {pathId && (
        <div style={{ position: 'absolute', top: 14, right: 14, opacity: (hovered || menuOpen) ? 1 : 0, transition: 'opacity 150ms ease' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
            aria-label="Path options"
            style={{ background: 'transparent', border: '1px solid #2a2a3d', borderRadius: 6, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a7a94', cursor: 'pointer', padding: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#4a4a68' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#7a7a94'; e.currentTarget.style.borderColor = '#2a2a3d' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
          </button>
          {menuOpen && (
            <div
              onClick={e => e.stopPropagation()}
              style={{ position: 'absolute', top: 30, right: 0, background: '#1a1a2e', border: '1px solid #2a2a3d', borderRadius: 8, padding: 4, minWidth: 140, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 10 }}
            >
              <button
                onClick={() => { setMenuOpen(false); startEditing() }}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#c4c4d4', padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font-sans)', borderRadius: 5, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#2a2a3d'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >Rename</button>
              <button
                onClick={() => { setMenuOpen(false); onDelete?.(pathId, title) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#f87171', padding: '8px 12px', fontSize: 13, fontFamily: 'var(--font-sans)', borderRadius: 5, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >Delete</button>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => {
                if (e.key === 'Enter')  { e.preventDefault(); commitEdit() }
                if (e.key === 'Escape') { e.preventDefault(); cancelEdit() }
              }}
              maxLength={200}
              style={{ width: '100%', fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', background: '#0f0f1a', border: '1px solid #7C6AF7', borderRadius: 6, padding: '4px 8px', marginBottom: 5, outline: 'none', boxShadow: '0 0 0 2px rgba(124,106,247,0.18)' }}
            />
          ) : (
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Badge color={tagColor}>{tag}</Badge>
            {isComplete && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                <Icon name="check" size={10} color="#34d399" /> Completed
              </span>
            )}
          </div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: isComplete ? '#34d399' : '#fff', fontFamily: 'var(--font-display)', lineHeight: 1, marginRight: pathId ? 36 : 0, marginLeft: 12 }}>{progress}%</div>
      </div>
      <ProgressBar value={progress} color={color} height={6} animated />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7a7a94' }}>
            <Icon name="book" size={12} color="#7a7a94" />
            {isComplete ? 'All weeks done' : `${lessonsLeft} ${lessonsLeft === 1 ? 'week' : 'weeks'} left`}
          </div>
          {!isComplete && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7a7a94' }}>
              <Icon name="clock" size={12} color="#7a7a94" />
              {timeLeft}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            const storedPathId = localStorage.getItem('learn_pathId')
            const week = (pathId && pathId === storedPathId)
              ? parseInt(localStorage.getItem('learn_week') || '1', 10)
              : 1
            if (pathId) {
              localStorage.setItem('learn_pathId', pathId)
              localStorage.setItem('learn_week', String(week))
            }
            navigate('/learn', pathId ? { state: { pathId, week } } : undefined)
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: isComplete ? 'transparent' : '#7C6AF7', color: isComplete ? '#c4c4d4' : '#fff', border: isComplete ? '1px solid #2a2a3d' : 'none', borderRadius: 8, padding: '8px 16px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms ease' }}
          onMouseEnter={e => { if (isComplete) { e.currentTarget.style.borderColor = '#4a4a68'; e.currentTarget.style.color = '#fff' } else { e.currentTarget.style.background = '#9080f9' } }}
          onMouseLeave={e => { if (isComplete) { e.currentTarget.style.borderColor = '#2a2a3d'; e.currentTarget.style.color = '#c4c4d4' } else { e.currentTarget.style.background = '#7C6AF7' } }}
        >
          {isComplete ? 'Review' : 'Continue'} <Icon name="arrow_right" size={13} color={isComplete ? '#c4c4d4' : '#fff'} />
        </button>
      </div>
    </div>
  );
}

function PathCardSkeleton() {
  return (
    <div style={{ background: '#131320', border: '1px solid #2a2a3d', borderRadius: 12, padding: 20 }}>
      <div style={{ height: 3, borderRadius: '8px 8px 0 0', background: '#2a2a3d', margin: '-20px -20px 16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ width: 160, height: 16, borderRadius: 6, background: '#1e1e2e', marginBottom: 8 }} />
          <div style={{ width: 70, height: 20, borderRadius: 4, background: '#1e1e2e' }} />
        </div>
        <div style={{ width: 48, height: 32, borderRadius: 6, background: '#1e1e2e' }} />
      </div>
      <div style={{ height: 6, borderRadius: 6, background: '#1e1e2e' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
        <div style={{ width: 120, height: 14, borderRadius: 4, background: '#1e1e2e' }} />
        <div style={{ width: 90, height: 34, borderRadius: 8, background: '#1e1e2e' }} />
      </div>
    </div>
  );
}

function ActivityItem({ icon, iconColor, iconBg, title, sub, time, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 8px', margin: '0 -8px', borderRadius: 8,
        cursor: onClick ? 'pointer' : 'default',
        background: onClick && hovered ? 'rgba(124,106,247,0.06)' : 'transparent',
        transition: 'background 150ms ease',
      }}
    >
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

function deriveMeta(topic = '') {
  const t = topic.toLowerCase()
  if (/react|vue|angular|svelte|css|html|tailwind|frontend/.test(t))
    return { tag: 'Frontend', tagColor: 'purple', color: '#7C6AF7' }
  if (/node|express|django|flask|fastapi|spring|backend|api|server|database|sql|mongodb/.test(t))
    return { tag: 'Backend', tagColor: 'blue', color: '#60a5fa' }
  if (/typescript|javascript|python|golang|rust|kotlin|swift|java|language/.test(t))
    return { tag: 'Language', tagColor: 'green', color: '#34d399' }
  if (/machine\s*learning|ml\b|ai\b|data\s*science|deep\s*learning/.test(t))
    return { tag: 'AI/ML', tagColor: 'gold', color: '#f7c66a' }
  return { tag: 'General', tagColor: 'gray', color: '#7a7a94' }
}

function timeAgo(iso) {
  if (!iso) return ''
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 60_000)        return 'just now'
  if (ms < 3_600_000)     return `${Math.floor(ms / 60_000)}m ago`
  if (ms < 86_400_000)    return `${Math.floor(ms / 3_600_000)}h ago`
  if (ms < 7 * 86_400_000) return `${Math.floor(ms / 86_400_000)}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Derive real activity feed from the user's actual paths.
// Each path contributes:
//   - one "Created" event at path.createdAt
//   - one "Completed Week N" event for each completed node (path.updatedAt as a best-effort timestamp)
// then sort by time desc and take the 5 most recent.
function buildActivityFeed(paths) {
  const events = []
  for (const p of paths) {
    events.push({
      pathId: p._id,
      ts:     p.createdAt,
      icon:   'sparkles',
      iconColor: '#7C6AF7',
      iconBg:    'rgba(124,106,247,0.1)',
      title:     `Created path: ${p.topic}`,
      sub:       `${p.weeks} weeks · ${p.progress}% complete`,
    })
    const done = (p.nodes || []).filter(n => n.status === 'complete')
    if (done.length > 0) {
      events.push({
        pathId: p._id,
        ts:     p.updatedAt || p.createdAt,
        icon:   'check_circle',
        iconColor: '#34d399',
        iconBg:    'rgba(52,211,153,0.1)',
        title:     `Completed Week ${done[done.length - 1].week}: ${p.topic}`,
        sub:       `${done.length} of ${p.weeks} weeks done`,
      })
    }
  }
  return events
    .filter(e => e.ts)
    .sort((a, b) => new Date(b.ts) - new Date(a.ts))
    .slice(0, 5)
    .map(e => ({ ...e, time: timeAgo(e.ts) }))
}

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [navActive, setNavActive] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [realPaths, setRealPaths] = useState([]);
  const [realWeakConcepts, setRealWeakConcepts] = useState([]);
  const [loadingPaths, setLoadingPaths] = useState(true);
  const [loadingWeak, setLoadingWeak] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('learn_pathId')
    localStorage.removeItem('learn_week')
    navigate('/login')
  }

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
  const firstName = storedUser.name?.split(' ')[0] || 'there'
  const initials = storedUser.name
    ? storedUser.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoadingPaths(false); setLoadingWeak(false); return }

    fetch('/api/roadmap/my-paths', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setRealPaths(data.paths || []))
      .catch(() => {})
      .finally(() => setLoadingPaths(false))

    fetch('/api/roadmap/weak-concepts', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setRealWeakConcepts(data.concepts || []))
      .catch(() => {})
      .finally(() => setLoadingWeak(false))
  }, [])

  // The `.fade-up` class starts at opacity:0 and only reveals when `.visible`
  // is added (LandingPage uses IntersectionObserver for this; Dashboard never
  // wired it up, which is why every fade-up section — including path cards —
  // rendered completely invisible). Reveal them after the layout has settled.
  useEffect(() => {
    if (loadingPaths) return
    const t = setTimeout(() => {
      document.querySelectorAll('.fade-up:not(.visible)').forEach(el => el.classList.add('visible'))
    }, 30)
    return () => clearTimeout(t)
  }, [loadingPaths, realPaths.length])

  const totalWeeksCompleted = realPaths.reduce(
    (sum, p) => sum + Math.round((p.progress / 100) * p.weeks), 0
  )

  async function handleDeletePath(pathId, title) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`/api/roadmap/${pathId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to delete path')
      }
      setRealPaths(prev => prev.filter(p => p._id !== pathId))
      if (localStorage.getItem('learn_pathId') === pathId) {
        localStorage.removeItem('learn_pathId')
        localStorage.removeItem('learn_week')
      }
      toast.success(`Deleted "${title}"`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function handleSubmitRename(pathId, nextTitle) {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`/api/roadmap/${pathId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ topic: nextTitle }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to rename path')
      }
      const data = await res.json()
      setRealPaths(prev => prev.map(p => p._id === pathId ? { ...p, topic: data.path.topic } : p))
      toast.success('Path renamed')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const pathCards = realPaths.map((p, i) => {
    const { tag, tagColor, color } = deriveMeta(p.topic)
    const completedWeeks = Math.round((p.progress / 100) * p.weeks)
    const lessonsLeft = Math.max(0, p.weeks - completedWeeks)
    const timeLeft = lessonsLeft <= 1 ? '~1h left' : `~${Math.round(lessonsLeft * 1.5)}h left`
    const isComplete = p.progress >= 100
    return { pathId: p._id, title: p.topic, tag, tagColor, color, progress: p.progress, lessonsLeft, timeLeft, isComplete, delay: i * 60, onDelete: handleDeletePath, onSubmitRename: handleSubmitRename }
  })

  const weakPoints = realWeakConcepts.slice(0, 6).map(c => ({ label: c.concept, path: c.topic }))
  const recentActivity = buildActivityFeed(realPaths)

  function openPath(pathId, week = 1) {
    if (!pathId) return
    localStorage.setItem('learn_pathId', pathId)
    localStorage.setItem('learn_week', String(week))
    navigate('/learn', { state: { pathId, week } })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0a0f' }}>
      {/* Desktop sidebar */}
      <div className="desktop-sidebar-wrapper" style={{ height: '100%' }}>
        <DesktopSidebar active={navActive} onNav={item => { setNavActive(item.id); if (item.to) navigate(item.to) }} onLogout={handleLogout} userName={storedUser.name} initials={initials} avatarUrl={storedUser.avatarUrl} />
      </div>

      {/* Mobile drawer */}
      <MobileSidebar active={navActive} onNav={item => { setNavActive(item.id); if (item.to) navigate(item.to) }} open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout} userName={storedUser.name} initials={initials} avatarUrl={storedUser.avatarUrl} />

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

          <div style={{ flex: 1 }}/>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ProfileMenu
              initials={initials}
              email={storedUser.email}
              name={storedUser.name}
              avatarUrl={storedUser.avatarUrl}
              onLogout={handleLogout}
              onViewProfile={() => navigate('/profile')}
            />
          </div>
        </header>

        {/* Scrollable content */}
        <main className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* Welcome row */}
          <div className="fade-up" style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: '#7a7a94', fontWeight: 500, marginBottom: 4 }}>{dateStr}</div>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, fontFamily: 'var(--font-display)' }}>
                  Welcome back, <span style={{ color: '#7C6AF7' }}>{firstName}</span>
                </h1>
                <p style={{ fontSize: 14, color: '#7a7a94', marginTop: 5 }}>
                  {realPaths.length > 0
                    ? `You have ${realPaths.length} active ${realPaths.length === 1 ? 'path' : 'paths'}. Keep going!`
                    : 'Start your first learning path to track your progress.'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(247,198,106,0.08)', border: '1px solid rgba(247,198,106,0.2)', borderRadius: 10, padding: '10px 16px' }}>
                <Icon name="flame" size={18} color="#f7c66a" sw={1.5} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#f7c66a', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{totalWeeksCompleted || 0}</div>
                  <div style={{ fontSize: 11, color: '#7a7a94', fontWeight: 500 }}>weeks done</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
            <StatCard icon="book"      iconColor="#7C6AF7" iconBg="rgba(124,106,247,0.12)" label="Active paths"     value={String(realPaths.length)}              delay={0} />
            <StatCard icon="bar_chart" iconColor="#60a5fa" iconBg="rgba(96,165,250,0.10)"  label="Weeks completed"  value={String(totalWeeksCompleted)}            delay={60} />
            <StatCard icon="target"    iconColor="#34d399" iconBg="rgba(52,211,153,0.10)"  label="Weak concepts"    value={String(realWeakConcepts.length)}         delay={120} />
            <StatCard icon="flame"     iconColor="#f7c66a" iconBg="rgba(247,198,106,0.10)" label="Paths finished"   value={String(realPaths.filter(p => p.progress === 100).length)} delay={180} />
          </div>

          {/* Middle grid */}
          <div className="middle-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 24 }}>

            {/* Active paths */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>Active paths</h2>
                <button
                  onClick={() => navigate('/roadmap')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#7C6AF7', cursor: 'pointer', fontWeight: 500, background: 'none', border: 'none', fontFamily: 'var(--font-sans)', padding: 0 }}
                >
                  <Icon name="plus" size={14} color="#7C6AF7" /> New path
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loadingPaths ? (
                  <>
                    <PathCardSkeleton />
                    <PathCardSkeleton />
                  </>
                ) : pathCards.length === 0 ? (
                  <div style={{ background: '#131320', border: '1px dashed #2a2a3d', borderRadius: 12, padding: '40px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🗺️</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>No paths yet</div>
                    <div style={{ fontSize: 13, color: '#7a7a94', marginBottom: 20 }}>Generate your first AI-powered learning roadmap to get started.</div>
                    <button
                      onClick={() => navigate('/roadmap')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7C6AF7', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    >
                      <Icon name="sparkles" size={14} color="#fff" /> Start learning
                    </button>
                  </div>
                ) : (
                  pathCards.map((p, i) => <PathCard key={p.pathId || i} {...p} />)
                )}
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
                {recentActivity.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#7a7a94', padding: '14px 0' }}>
                    No activity yet — create a path to get started.
                  </div>
                ) : (
                  <div>
                    {recentActivity.map((a, i) => (
                      <div key={i} style={{ borderBottom: i < recentActivity.length - 1 ? '1px solid #1e1e2e' : 'none' }}>
                        <ActivityItem {...a} onClick={() => openPath(a.pathId)} />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Weak points */}
              <section style={{ background: '#131320', border: '1px solid #2a2a3d', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Icon name="alert_circle" size={15} color="#f87171" />
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>Weak points to review</h2>
                </div>
                {loadingWeak ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {[80, 110, 90, 70].map(w => (
                      <div key={w} style={{ width: w, height: 32, borderRadius: 6, background: '#1e1e2e' }} />
                    ))}
                  </div>
                ) : weakPoints.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ fontSize: 13, color: '#34d399', fontWeight: 600, marginBottom: 4 }}>All clear!</div>
                    <div style={{ fontSize: 12, color: '#7a7a94' }}>Complete some quizzes to track your weak spots.</div>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 12, color: '#7a7a94', marginBottom: 14, lineHeight: 1.5 }}>
                      These concepts tripped you up on recent quizzes. Worth revisiting.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {weakPoints.map((w, i) => (
                        <div
                          key={i}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, fontSize: 12, fontWeight: 500, padding: '5px 10px' }}
                        >
                          <Icon name="zap" size={11} color="#f87171" />
                          <div>
                            <div style={{ fontWeight: 600 }}>{w.label}</div>
                            <div style={{ fontSize: 10, color: 'rgba(248,113,113,0.6)', fontWeight: 400 }}>{w.path}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>

            </div>
          </div>

          {/* Path progress overview — clickable, jumps to each path's learning page */}
          {realPaths.length > 0 && (
            <section className="fade-up" style={{ background: '#131320', border: '1px solid #2a2a3d', borderRadius: 12, padding: '22px 24px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', marginBottom: 3 }}>Path progress</h2>
                  <p style={{ fontSize: 13, color: '#7a7a94' }}>Where you are across every path</p>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[
                    [String(realPaths.length), realPaths.length === 1 ? 'path' : 'paths'],
                    [String(totalWeeksCompleted), 'weeks done'],
                    [String(realWeakConcepts.length), 'to review'],
                  ].map(([v, l]) => (
                    <div key={l} style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{v}</div>
                      <div style={{ fontSize: 11, color: '#7a7a94', marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {realPaths.map(p => {
                  const { color } = deriveMeta(p.topic)
                  const completedWeeks = Math.round((p.progress / 100) * p.weeks)
                  return (
                    <button
                      key={p._id}
                      onClick={() => openPath(p._id, Math.min(p.weeks, completedWeeks + 1))}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'transparent', border: '1px solid transparent', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left', transition: 'all 150ms ease' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,106,247,0.05)'; e.currentTarget.style.borderColor = '#2a2a3d' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.topic}</div>
                          <div style={{ fontSize: 12, color: '#7a7a94', fontWeight: 500, flexShrink: 0 }}>
                            Week {completedWeeks} of {p.weeks} · {p.progress}%
                          </div>
                        </div>
                        <ProgressBar value={p.progress} color={color} height={5} />
                      </div>
                      <Icon name="arrow_right" size={14} color="#7a7a94" />
                    </button>
                  )
                })}
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}
