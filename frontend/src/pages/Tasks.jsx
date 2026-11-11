import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

const FILTERS = ['all', 'active', 'done']

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function reload() {
    try { setTasks(await api.listTasks()); setError(null) }
    catch { setError('API offline — check that the backend is running on :8000') }
  }
  useEffect(() => { reload() }, [])

  async function add() {
    if (!title.trim()) return
    await api.createTask({ title: title.trim(), priority })
    setTitle('')
    reload()
  }
  async function toggle(t) { await api.updateTask(t.id, { done: !t.done }); reload() }
  async function remove(id) { await api.deleteTask(id); reload() }
  async function promote(id) {
    try { await api.promoteTask(id); reload() }
    catch (e) { alert(e.message) }
  }

  const visible = tasks.filter((t) =>
    filter === 'all' ? true : filter === 'active' ? !t.done : t.done)

  return (
    <div className="tasks-layout">
      {error && <div className="error-banner">{error}</div>}
      <div className="task-add">
        <input type="text" value={title} placeholder="Add a task…"
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()} />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
        <button className="btn primary" onClick={add}>Add</button>
      </div>
      <div className="task-filters">
        {FILTERS.map((f) => (
          <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      {visible.map((t) => (
        <div key={t.id} className={`task-row ${t.done ? 'done' : ''}`}>
          <button className="task-check" onClick={() => toggle(t)} aria-label="toggle">
            {t.done && '✓'}
          </button>
          <span className="task-title">{t.title}</span>
          <span className={`prio ${t.priority}`}>{t.priority}</span>
          <div className="task-actions">
            {t.card_id
              ? <button onClick={() => navigate('/board')}>on board →</button>
              : <button onClick={() => promote(t.id)}>→ Board</button>}
            <button className="del" onClick={() => remove(t.id)}>✕</button>
          </div>
        </div>
      ))}
      {visible.length === 0 && (
        <div style={{ color: 'var(--ink-faint)', padding: '24px 0' }}>Nothing here.</div>
      )}
    </div>
  )
}
