import { useEffect, useState } from 'react';

export default function DeadlineCountdown({ deadline }) {
  const [daysLeft, setDaysLeft] = useState(null);
  useEffect(() => { if (!deadline) return undefined; const update = () => setDaysLeft(Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000)); update(); const timer = setInterval(update, 3_600_000); return () => clearInterval(timer); }, [deadline]);
  if (daysLeft == null) return null;
  const label = new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return <div className={`deadline ${daysLeft < 0 ? 'is-overdue' : ''}`}><strong>{daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d`}</strong><span>to {label} deadline</span></div>;
}
