import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── Icon library (subset of the lucide-style set used across the app) ── */
const ICONS = {
  grid:         <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  book:         <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
  user:         <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  settings:     <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  sparkles:     <><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/></>,
  alert_circle: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  menu:         <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  x:            <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
}

export const Icon = ({ name, size = 16, color = 'currentColor', sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    {ICONS[name] || null}
  </svg>
)

export const Avatar = ({ initials = 'U', size = 32, src = '' }) => {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: '#1a1a2e' }}
      />
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#7C6AF7,#5a4fd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color: '#fff', flexShrink: 0, letterSpacing: '-0.01em' }}>
      {initials}
    </div>
  )
}

export function initialsFor(name, email) {
  if (name?.trim()) {
    return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase()
  }
  return (email?.[0] || 'U').toUpperCase()
}

/* ── Sidebar nav ── */
const NAV_MAIN = [
  { id: 'dashboard',     icon: 'grid',          label: 'Dashboard',     to: '/dashboard' },
  { id: 'new-path',      icon: 'sparkles',      label: 'New path',      to: '/roadmap' },
  { id: 'my-paths',      icon: 'book',          label: 'My paths',      to: '/my-paths' },
  { id: 'weak-concepts', icon: 'alert_circle',  label: 'Weak concepts', to: '/weak-concepts' },
]
const NAV_BOTTOM = [
  { id: 'profile', icon: 'user',     label: 'Profile', to: '/profile' },
  { id: 'logout',  icon: 'settings', label: 'Log out' },
]

function ProfileMenu({ initials, email, name, avatarUrl, onLogout, onViewProfile }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [open])

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
          <MenuButton icon="user" color="#c4c4d4" onClick={() => { setOpen(false); onViewProfile() }}>View profile</MenuButton>
          <MenuButton icon="settings" color="#f87171" onClick={() => { setOpen(false); onLogout() }}>Log out</MenuButton>
        </div>
      )}
    </div>
  )
}

function MenuButton({ icon, color, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'transparent', border: 'none', padding: '8px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, color, fontFamily: 'var(--font-sans)', cursor: 'pointer', textAlign: 'left' }}
      onMouseEnter={e => e.currentTarget.style.background = color === '#f87171' ? 'rgba(248,113,113,0.08)' : 'rgba(124,106,247,0.08)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <Icon name={icon} size={14} color={color} />
      {children}
    </button>
  )
}

function NavItem({ item, active, onClick }) {
  const isActive = active === item.id
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 7,
        fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 150ms ease',
        color: isActive ? '#fff' : '#7a7a94',
        background: isActive ? 'rgba(124,106,247,0.12)' : 'transparent',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(124,106,247,0.06)' }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      <Icon name={item.icon} size={15} color={isActive ? '#7C6AF7' : 'currentColor'} />
      {item.label}
    </div>
  )
}

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
        <SectionLabel>Learn</SectionLabel>
        {NAV_MAIN.map(item => (
          <NavItem key={item.id} item={item} active={active} onClick={() => { onNav(item); onClose?.() }} />
        ))}
        <div style={{ height: 1, background: '#1e1e2e', margin: '10px 0' }} />
        <SectionLabel>Account</SectionLabel>
        {NAV_BOTTOM.map(item => (
          <NavItem
            key={item.id}
            item={item}
            active={active}
            onClick={() => {
              if (item.id === 'logout') onLogout()
              else if (item.to) { onNav(item); onClose?.() }
            }}
          />
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
  )
}

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#3a3a52', padding: '0 10px', marginBottom: 4, textTransform: 'uppercase' }}>{children}</div>
)

function DesktopSidebar(props) {
  return (
    <aside style={{ width: 220, background: '#0f0f1a', borderRight: '1px solid #1e1e2e', display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0, padding: '20px 12px' }}>
      <SidebarContent {...props} />
    </aside>
  )
}

function MobileSidebar({ open, ...props }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }} onClick={props.onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 240, background: '#0f0f1a', borderRight: '1px solid #1e1e2e', padding: '20px 12px', display: 'flex', flexDirection: 'column' }}>
        <SidebarContent {...props} />
      </div>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} />
    </div>
  )
}

/* ── AppShell — the layout wrapper that every dashboard-like page uses ── */
export default function AppShell({ active, children }) {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = initialsFor(storedUser.name, storedUser.email)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('learn_pathId')
    localStorage.removeItem('learn_week')
    navigate('/login')
  }

  const navHandler = (item) => {
    if (item.to) navigate(item.to)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0a0f' }}>
      <div className="desktop-sidebar-wrapper" style={{ height: '100%' }}>
        <DesktopSidebar active={active} onNav={navHandler} onLogout={handleLogout} userName={storedUser.name} initials={initials} avatarUrl={storedUser.avatarUrl} />
      </div>

      <MobileSidebar active={active} onNav={navHandler} open={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={handleLogout} userName={storedUser.name} initials={initials} avatarUrl={storedUser.avatarUrl} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
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

          <div style={{ flex: 1 }} />

          <ProfileMenu
            initials={initials}
            email={storedUser.email}
            name={storedUser.name}
            avatarUrl={storedUser.avatarUrl}
            onLogout={handleLogout}
            onViewProfile={() => navigate('/profile')}
          />
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: '24px clamp(16px, 4vw, 36px) 40px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
