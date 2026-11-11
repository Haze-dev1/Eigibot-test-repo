const BASE = '/api'

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    let detail = res.statusText
    try { detail = (await res.json()).detail || detail } catch {}
    throw new Error(detail)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // kanban
  listCards: () => req('/kanban/cards'),
  createCard: (data) => req('/kanban/cards', { method: 'POST', body: JSON.stringify(data) }),
  updateCard: (id, data) => req(`/kanban/cards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCard: (id) => req(`/kanban/cards/${id}`, { method: 'DELETE' }),
  // docs
  listPages: () => req('/docs/pages'),
  getPage: (id) => req(`/docs/pages/${id}`),
  createPage: (data) => req('/docs/pages', { method: 'POST', body: JSON.stringify(data) }),
  updatePage: (id, data) => req(`/docs/pages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePage: (id) => req(`/docs/pages/${id}`, { method: 'DELETE' }),
  // tasks
  listTasks: () => req('/tasks'),
  createTask: (data) => req('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => req(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id) => req(`/tasks/${id}`, { method: 'DELETE' }),
  promoteTask: (id) => req(`/tasks/${id}/promote`, { method: 'POST' }),
  // search
  search: (q) => req(`/search?q=${encodeURIComponent(q)}`),
}
