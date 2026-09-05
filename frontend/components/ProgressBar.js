export default function ProgressBar({ progress }) {
  const { percent = 0, done = 0, total = 0 } = progress || {};
  return <div className="progress-wrap"><div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent} aria-label={`${done} of ${total} tasks complete`}><span className="progress-fill" style={{ transform: `scaleX(${Math.max(0, Math.min(100, percent)) / 100})` }} /></div><span>{done}/{total} · {percent}%</span></div>;
}
