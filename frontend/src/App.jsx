import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import Landing from './pages/Landing.jsx'
import Board from './pages/Board.jsx'
import Docs from './pages/Docs.jsx'
import Tasks from './pages/Tasks.jsx'
import Focus from './pages/Focus.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AppShell />}>
        <Route path="/board" element={<Board />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/:pageId" element={<Docs />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="*" element={<Navigate to="/board" replace />} />
      </Route>
    </Routes>
  )
}
