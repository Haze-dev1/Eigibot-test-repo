import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CommandPalette from '../components/CommandPalette.jsx'

const FEATURES = [
  { to: '/board', glyph: '▦', title: 'Board', text: 'A Linear-style kanban that stays out of your way. Drag, drop, done.' },
  { to: '/docs', glyph: '¶', title: 'Docs', text: 'Notion-style pages that link to your cards and tasks with [[mentions]].' },
  { to: '/tasks', glyph: '✓', title: 'Tasks', text: 'A quick-capture list with priorities. Promote anything to the board.' },
  { to: '/focus', glyph: '◷', title: 'Focus', text: 'A pomodoro timer that follows you across the whole suite.' },
]

export default function Landing() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const refs = useRef([])

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

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add('in')),
      { threshold: 0.15 }
    )
    refs.current.forEach((el) => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="landing">
      <div className="landing-art">
        <div className="grid-lines" />
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </div>
      <nav className="landing-nav">
        <span className="brand">Suite<em>.</em></span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="palette-hint" onClick={() => setPaletteOpen(true)}>
            <span>Search…</span> <kbd>⌘K</kbd>
          </button>
          <Link className="btn" to="/board">Open app</Link>
        </div>
      </nav>
      <header className="landing-hero">
        <div className="kicker reveal" ref={(el) => (refs.current[0] = el)}>Personal productivity instrument</div>
        <h1 className="reveal" ref={(el) => (refs.current[1] = el)}>
          Your work,<br />in <em>one quiet room</em>.
        </h1>
        <p className="reveal" ref={(el) => (refs.current[2] = el)}>
          Board, docs, tasks and focus — wired together, running entirely on your machine.
          No accounts. No cloud. No noise.
        </p>
        <div className="landing-cta reveal" ref={(el) => (refs.current[3] = el)}>
          <Link className="btn primary big" to="/board">Open the suite</Link>
          <Link className="btn big" to="/focus">Start a focus session</Link>
        </div>
      </header>
      <section className="landing-cards">
        {FEATURES.map((f, i) => (
          <Link key={f.to} to={f.to} className="feature-card reveal"
            ref={(el) => (refs.current[4 + i] = el)}
            style={{ transitionDelay: `${i * 80}ms` }}>
            <span className="glyph">{f.glyph}</span>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </Link>
        ))}
      </section>
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
    </div>
  )
}
