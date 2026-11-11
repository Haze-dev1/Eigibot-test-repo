import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { fmt, useFocus } from '../state/focus.jsx'
import CommandPalette from './CommandPalette.jsx'

const NAV = [
  { to: '/board', label: 'Board', glyph: '▦' },
  { to: '/docs', label: 'Docs', glyph: '¶' },
  { to: '/tasks', label: 'Tasks', glyph: '✓' },
  { to: '/focus', label: 'Focus', glyph: '◷' },
]

const TITLES = { '/board': 'Board', '/docs': 'Docs', '/tasks': 'Tasks', '/focus': 'Focus' }

function FocusChip() {
  const { mode, secondsLeft, running } = useFocus()
  const navigate = useNavigate()
  return (
    <button className={`focus-chip ${running ? 'running' : ''}`} onClick={() => navigate('/focus')}>
      <span className="dot" />
      <span>{fmt(secondsLeft)}</span>
      <span style={{ opacity: 0.6 }}>{mode}</span>
    </button>
  )
}

function MiniTasks() {
  const [open, setOpen] = useState(false)
  const [tasks, setTasks] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    api.listTasks().then(setTasks).catch(() => {})
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  async function toggle(t) {
    await api.updateTask(t.id, { done: !t.done })
    setTasks(await api.listTasks())
  }

  const active = tasks.filter((t) => !t.done).length
  return (
    <div className="mini-tasks" ref={ref}>
      <button className="btn small" onClick={() => setOpen(!open)}>
        Tasks{active > 0 ? ` · ${active}` : ''}
      </button>
      {open && (
        <div className="mini-tasks-pop">
          <h4>Today</h4>
          {tasks.length === 0 && <div style={{ color: 'var(--ink-faint)', fontSize: 13 }}>No tasks yet.</div>}
          {tasks.slice(0, 6).map((t) => (
            <div key={t.id} className={`mini-task ${t.done ? 'done' : ''}`}>
              <input type="checkbox" checked={t.done} onChange={() => toggle(t)} />
              <span>{t.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const location = useLocation()
  const title = TITLES[location.pathname] || 'Docs'

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="shell">
      <aside className="shell-side">
        <NavLink to="/" className="brand">Suite<em>.</em></NavLink>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="glyph">{n.glyph}</span> {n.label}
          </NavLink>
        ))}
        <div className="spacer" />
        <button className="palette-hint" onClick={() => setPaletteOpen(true)}>
          <span>Search…</span> <kbd>⌘K</kbd>
        </button>
      </aside>
      <div className="shell-main">
        <header className="shell-head">
          <h1>{title}</h1>
          <FocusChip />
          <MiniTasks />
        </header>
        <main className="shell-body">
          <Outlet />
        </main>
      </div>
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  )
}
