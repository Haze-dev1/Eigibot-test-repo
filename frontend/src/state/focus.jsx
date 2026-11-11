import { createContext, useContext, useEffect, useRef, useState } from 'react'

const DEFAULTS = { work: 25, short: 5, long: 15 }

function loadDurations() {
  try {
    const saved = JSON.parse(localStorage.getItem('pomodoro.durations'))
    if (saved && saved.work > 0 && saved.short > 0 && saved.long > 0) return saved
  } catch {}
  return DEFAULTS
}

const FocusContext = createContext(null)

export function FocusProvider({ children }) {
  const [durations, setDurations] = useState(loadDurations)
  const [mode, setMode] = useState('work') // work | short | long
  const [secondsLeft, setSecondsLeft] = useState(durations.work * 60)
  const [running, setRunning] = useState(false)
  const [cycles, setCycles] = useState(0)
  const timerRef = useRef(null)

  const total = durations[mode] * 60

  useEffect(() => {
    localStorage.setItem('pomodoro.durations', JSON.stringify(durations))
  }, [durations])

  useEffect(() => {
    if (!running) return
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running])

  // advance phase when the countdown completes
  useEffect(() => {
    if (secondsLeft !== 0 || !running) return
    setRunning(false)
    const done = mode === 'work' ? cycles + 1 : cycles
    if (mode === 'work') setCycles(done)
    const next = mode === 'work' ? (done % 4 === 0 ? 'long' : 'short') : 'work'
    setMode(next)
    setSecondsLeft((next === 'work' ? durations.work : next === 'short' ? durations.short : durations.long) * 60)
  }, [secondsLeft, running])

  function start() { setRunning(true) }
  function pause() { setRunning(false) }
  function reset() {
    setRunning(false)
    setSecondsLeft(durations[mode] * 60)
  }
  function skip() {
    setRunning(false)
    const next = mode === 'work' ? 'short' : 'work'
    setMode(next)
    setSecondsLeft((next === 'work' ? durations.work : durations[next]) * 60)
  }
  function changeDurations(d) {
    setDurations(d)
    setRunning(false)
    setSecondsLeft(d[mode] * 60)
  }

  const value = { mode, secondsLeft, running, cycles, total, durations, start, pause, reset, skip, changeDurations }
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
}

export function useFocus() {
  return useContext(FocusContext)
}

export function fmt(s) {
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}
