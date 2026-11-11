import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'

const MENTION_RE = /\[\[(doc|card|task):([a-f0-9]{24}):([^\]]+)\]\]/g

function Preview({ content }) {
  const navigate = useNavigate()
  const parts = []
  let last = 0
  for (const m of content.matchAll(MENTION_RE)) {
    if (m.index > last) parts.push(content.slice(last, m.index))
    const [, kind, id, title] = m
    const to = kind === 'doc' ? `/docs/${id}` : kind === 'card' ? '/board' : '/tasks'
    parts.push(
      <a key={m.index} onClick={() => navigate(to)}>{title}</a>
    )
    last = m.index + m[0].length
  }
  if (last < content.length) parts.push(content.slice(last))
  return <div className="doc-preview">{parts.length ? parts : 'Nothing to preview yet.'}</div>
}

export default function Docs() {
  const { pageId } = useParams()
  const navigate = useNavigate()
  const [pages, setPages] = useState([])
  const [current, setCurrent] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [savedAt, setSavedAt] = useState(null)
  const [mention, setMention] = useState(null) // {query, results}
  const [error, setError] = useState(null)
  const saveTimer = useRef(null)
  const textareaRef = useRef(null)

  async function reloadPages() {
    try { setPages(await api.listPages()); setError(null) }
    catch { setError('API offline — check that the backend is running on :8000') }
  }
  useEffect(() => { reloadPages() }, [])

  useEffect(() => {
    if (!pageId) { setCurrent(null); return }
    api.getPage(pageId).then((p) => {
      setCurrent(p); setTitle(p.title); setContent(p.content)
    }).catch(() => navigate('/docs'))
  }, [pageId])

  async function newPage() {
    const p = await api.createPage({ title: 'Untitled' })
    await reloadPages()
    navigate(`/docs/${p.id}`)
  }

  function scheduleSave(id, fields) {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await api.updatePage(id, fields)
      setSavedAt(new Date())
      reloadPages()
    }, 1000)
  }

  function onTitleChange(v) {
    setTitle(v)
    if (current && v.trim()) scheduleSave(current.id, { title: v.trim() })
  }

  async function onContentChange(v) {
    setContent(v)
    if (current) scheduleSave(current.id, { content: v })
    // [[ mention detection
    const ta = textareaRef.current
    const upto = v.slice(0, ta.selectionStart)
    const m = upto.match(/\[\[([^\]]*)$/)
    if (m) {
      const results = m[1] ? await api.search(m[1]) : []
      setMention({ query: m[1], results })
    } else {
      setMention(null)
    }
  }

  function insertMention(item) {
    const ta = textareaRef.current
    const upto = content.slice(0, ta.selectionStart)
    const rest = content.slice(ta.selectionStart)
    const replaced = upto.replace(/\[\[([^\]]*)$/, `[[${item.kind}:${item.id}:${item.title}]] `)
    const next = replaced + rest
    setContent(next)
    setMention(null)
    if (current) scheduleSave(current.id, { content: next })
    ta.focus()
  }

  async function removePage() {
    if (!current) return
    await api.deletePage(current.id)
    setCurrent(null)
    await reloadPages()
    navigate('/docs')
  }

  return (
    <div>
      {error && <div className="error-banner">{error}</div>}
      <div className="docs-layout">
        <aside className="docs-list">
          <button className="btn primary small" style={{ marginBottom: 12, width: '100%' }} onClick={newPage}>
            + New page
          </button>
          {pages.map((p) => (
            <button key={p.id}
              className={`doc-item ${current?.id === p.id ? 'active' : ''}`}
              onClick={() => navigate(`/docs/${p.id}`)}>
              <div className="t">{p.title}</div>
              <div className="d">{new Date(p.updated_at).toLocaleDateString()}</div>
            </button>
          ))}
          {pages.length === 0 && <div style={{ color: 'var(--ink-faint)', fontSize: 13 }}>No pages yet.</div>}
        </aside>
        <section>
          {!current ? (
            <div style={{ color: 'var(--ink-faint)', paddingTop: 40 }}>
              Select a page, or create a new one. Type <kbd>[[</kbd> while writing to link a doc, card or task.
            </div>
          ) : (
            <div className="doc-editor">
              <div className="doc-meta">
                <span>{savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : 'Autosaves as you type'}</span>
                <span style={{ flex: 1 }} />
                <button className="btn danger small" onClick={removePage}>Delete page</button>
              </div>
              <input className="title-input" value={title} onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Untitled" />
              <div style={{ position: 'relative' }}>
                <textarea ref={textareaRef} value={content}
                  onChange={(e) => onContentChange(e.target.value)}
                  placeholder="Start writing… [[ to mention a doc, card or task" />
                {mention && mention.results.length > 0 && (
                  <div className="mention-pop">
                    {mention.results.slice(0, 6).map((r) => (
                      <button key={`${r.kind}:${r.id}`} onMouseDown={(e) => { e.preventDefault(); insertMention(r) }}>
                        <span className="mono" style={{ color: 'var(--accent)', fontSize: 10, marginRight: 8 }}>{r.kind}</span>
                        {r.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Preview content={content} />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
