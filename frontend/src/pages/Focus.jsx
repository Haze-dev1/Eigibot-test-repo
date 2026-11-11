import { fmt, useFocus } from '../state/focus.jsx'

const R = 130
const CIRC = 2 * Math.PI * R

export default function Focus() {
  const { mode, secondsLeft, running, cycles, total, durations, start, pause, reset, skip, changeDurations } = useFocus()
  const progress = total > 0 ? secondsLeft / total : 0

  function setDur(key, v) {
    const n = Math.max(1, Math.min(180, Number(v) || 1))
    changeDurations({ ...durations, [key]: n })
  }

  return (
    <div className="focus-wrap">
      <div className="focus-ring">
        <svg width="300" height="300">
          <circle className="track" cx="150" cy="150" r={R} fill="none" strokeWidth="3" />
          <circle className="bar" cx="150" cy="150" r={R} fill="none" strokeWidth="3"
            strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - progress)} />
        </svg>
        <div className="focus-time">
          <span className="t">{fmt(secondsLeft)}</span>
          <span className="m">{mode === 'work' ? 'focus' : mode === 'short' ? 'short break' : 'long break'}</span>
        </div>
      </div>
      <div className="focus-cycles">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`pip ${i < cycles % 4 || (cycles > 0 && cycles % 4 === 0) ? 'full' : ''}`} />
        ))}
      </div>
      <div className="focus-controls">
        {running
          ? <button className="btn big" onClick={pause}>Pause</button>
          : <button className="btn primary big" onClick={start}>Start</button>}
        <button className="btn big" onClick={reset}>Reset</button>
        <button className="btn big" onClick={skip}>Skip →</button>
      </div>
      <div className="focus-settings">
        {[['work', 'work min'], ['short', 'short break'], ['long', 'long break']].map(([key, label]) => (
          <label key={key}>
            {label}
            <input type="number" min="1" max="180" value={durations[key]}
              onChange={(e) => setDur(key, e.target.value)} />
          </label>
        ))}
      </div>
    </div>
  )
}
