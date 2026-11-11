import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

const COLUMNS = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'Todo' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
]

function CardModal({ card, docs, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [docId, setDocId] = useState(card.doc_id || '')

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <h3>Edit card</h3>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        <label>Linked doc</label>
        <select value={docId} onChange={(e) => setDocId(e.target.value)}>
          <option value="">None</option>
          {docs.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
        </select>
        <div className="row">
          <button className="btn danger small" onClick={() => onDelete(card)}>Delete</button>
          <button className="btn small" onClick={onClose}>Cancel</button>
          <button className="btn primary small" disabled={!title.trim()}
            onClick={() => onSave(card, { title: title.trim(), description, doc_id: docId || null })}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Board() {
  const [cards, setCards] = useState([])
  const [docs, setDocs] = useState([])
  const [addingTo, setAddingTo] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState(null)
  const dragId = useRef(null)
  const navigate = useNavigate()

  async function reload() {
    try {
      const [c, d] = await Promise.all([api.listCards(), api.listPages()])
      setCards(c); setDocs(d); setError(null)
    } catch {
      setError('API offline — check that the backend is running on :8000')
    }
  }
  useEffect(() => { reload() }, [])

  async function addCard(column) {
    if (!newTitle.trim()) return
    await api.createCard({ title: newTitle.trim(), column })
    setNewTitle(''); setAddingTo(null)
    reload()
  }

  function onDragStart(e, id) {
    dragId.current = id
    e.currentTarget.classList.add('dragging')
    e.dataTransfer.effectAllowed = 'move'
  }
  function onDragEnd(e) { e.currentTarget.classList.remove('dragging') }
  function onDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over') }
  function onDragLeave(e) { e.currentTarget.classList.remove('drag-over') }

  async function onDrop(e, column) {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    const id = dragId.current
    if (!id) return
    const colCards = cards.filter((c) => c.column === column && c.id !== id)
    const order = colCards.length ? colCards[colCards.length - 1].order + 1 : 1.0
    // optimistic
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, column, order } : c)))
    await api.updateCard(id, { column, order })
    reload()
  }

  async function saveCard(card, updates) {
    await api.updateCard(card.id, updates)
    setEditing(null)
    reload()
  }
  async function deleteCard(card) {
    await api.deleteCard(card.id)
    setEditing(null)
    reload()
  }

  const docTitle = (id) => docs.find((d) => d.id === id)?.title

  return (
    <div>
      {error && <div className="error-banner">{error}</div>}
      <div className="board">
        {COLUMNS.map((col) => {
          const colCards = cards.filter((c) => c.column === col.id)
          return (
            <section key={col.id} className="column"
              onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={(e) => onDrop(e, col.id)}>
              <header className="column-head">
                <span>{col.label}</span>
                <span className="n">{colCards.length}</span>
              </header>
              {colCards.map((card) => (
                <article key={card.id} className="card" draggable
                  onDragStart={(e) => onDragStart(e, card.id)}
                  onDragEnd={onDragEnd}
                  onClick={() => setEditing(card)}>
                  <h4>{card.title}</h4>
                  {card.description && <p>{card.description}</p>}
                  <div className="chips">
                    {card.doc_id && docTitle(card.doc_id) && (
                      <button className="chip" onClick={(e) => { e.stopPropagation(); navigate(`/docs/${card.doc_id}`) }}>
                        ¶ {docTitle(card.doc_id)}
                      </button>
                    )}
                    {(card.task_ids || []).length > 0 && <span className="chip">✓ {card.task_ids.length}</span>}
                  </div>
                </article>
              ))}
              {addingTo === col.id ? (
                <div className="add-card-form">
                  <input autoFocus value={newTitle} placeholder="Card title…"
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addCard(col.id)
                      if (e.key === 'Escape') { setAddingTo(null); setNewTitle('') }
                    }} />
                  <button className="btn primary small" onClick={() => addCard(col.id)}>Add</button>
                </div>
              ) : (
                <button className="add-card" onClick={() => setAddingTo(col.id)}>+ Add card</button>
              )}
            </section>
          )
        })}
      </div>
      {editing && (
        <CardModal card={editing} docs={docs}
          onClose={() => setEditing(null)} onSave={saveCard} onDelete={deleteCard} />
      )}
    </div>
  )
}
