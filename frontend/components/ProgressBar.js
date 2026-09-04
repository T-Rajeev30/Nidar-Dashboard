export default function ProgressBar({ progress }) {
  const { percent = 0, done = 0, total = 0 } = progress || {};
  return <div className="progress-wrap"><progress value={percent} max="100" aria-label={`${done} of ${total} tasks complete`} /><span>{done}/{total} · {percent}%</span></div>;
}
