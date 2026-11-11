import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

const PAGES = [
  { kind: 'page', id: '/board', title: 'Board' },
  { kind: 'page', id: '/docs', title: 'Docs' },
  { kind: 'page', id: '/tasks', title: 'Tasks' },
  { kind: 'page', id: '/focus', title: 'Focus' },
  { kind: 'page', id: '/', title: 'Home' },
]

const ROUTE_FOR = { doc: '/docs', card: '/board', task: '/tasks' }

export default function CommandPalette({ onClose }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [sel, setSel] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    setSel(0)
    if (!q.trim()) { setResults([]); return }
    const t = setTimeout(() => {
      api.search(q).then(setResults).catch(() => setResults([]))
    }, 150)
    return () => clearTimeout(t)
  }, [q])

  const items = useMemo(() => {
    const ql = q.trim().toLowerCase()
    const pages = PAGES.filter((p) => !ql || p.title.toLowerCase().includes(ql))
    return [...pages, ...results]
  }, [q, results])

  function open(item) {
    if (item.kind === 'page') navigate(item.id)
    else if (item.kind === 'doc') navigate(`/docs/${item.id}`)
    else navigate(ROUTE_FOR[item.kind])
    onClose()
  }

  function onKey(e) {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(s + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter' && items[sel]) onSelect(items[sel])
  }
  function onSelect(item) { onSelectItem(item) }
  function onSelectItem(item) { open(item) }

  return (
    <div className="palette-overlay" onMouseDown={onClose}>
      <div className="palette" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Jump to a page, doc, card or task…"
        />
        <div className="palette-list">
          {items.length === 0 && <div className="palette-empty">No matches.</div>}
          {items.map((item, i) => (
            <button
              key={`${item.kind}:${item.id}`}
              className={`palette-item ${i === sel ? 'sel' : ''}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => open(item)}
            >
              <span className="kind">{item.kind}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
