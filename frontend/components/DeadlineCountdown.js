// Single responsibility: show days remaining until the mission deadline.
import { useEffect, useState } from 'react';

export default function DeadlineCountdown({ deadline }) {
  const [daysLeft, setDaysLeft] = useState(null);

  useEffect(() => {
    if (!deadline) return;
    const target = new Date(deadline).getTime();
    const update = () => {
      const diffMs = target - Date.now();
      setDaysLeft(Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    };
    update();
    const id = setInterval(update, 60 * 60 * 1000); // refresh hourly
    return () => clearInterval(id);
  }, [deadline]);

  if (daysLeft === null) return null;

  const overdue = daysLeft < 0;

  return (
    <div style={styles.wrap}>
      <span style={{ ...styles.count, color: overdue ? 'var(--status-blocked)' : 'var(--accent)' }}>
        {overdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d`}
      </span>
      <span style={styles.label}>to Dec 15 deadline</span>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 },
  count: { fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600 },
  label: { fontSize: 11, color: 'var(--text-muted)' },
};
