// Single responsibility: form to upload a plan/progress entry for a chosen
// team — text content, an optional file link, a phase tag, and a date.
import { useState } from 'react';
import { toast } from 'sonner';
import { localDateInputValue } from '../lib/dashboard-utils.mjs';

const PHASES = [
  { value: 'simulation', label: 'Simulation' },
  { value: 'hardware-integration', label: 'Hardware Integration' },
  { value: 'testing', label: 'Testing' },
  { value: 'final', label: 'Final' },
];

export default function PlanUpload({ teams, defaultTeamId, onUpload }) {
  const [teamId, setTeamId] = useState(defaultTeamId || (teams[0]?._id ?? ''));
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [phase, setPhase] = useState('simulation');
  const [forDate, setForDate] = useState(localDateInputValue());
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!teamId || !title.trim() || !forDate) {
      toast.error('Team, title, and date are required.');
      return;
    }

    setSubmitting(true);
    try {
      const saved = await onUpload({
        team: teamId,
        title: title.trim(),
        content: content.trim(),
        fileUrl: fileUrl.trim(),
        phase,
        forDate,
      });
      if (!saved) {
        return;
      }
      setTitle('');
      setContent('');
      setFileUrl('');
    } catch (err) {
      toast.error(err.message || 'Unable to post this plan.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.row}>
        <select style={styles.input} aria-label="Team" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>{t.displayName}</option>
          ))}
        </select>
        <select style={styles.input} aria-label="Project phase" value={phase} onChange={(e) => setPhase(e.target.value)}>
          {PHASES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <input
          style={styles.input}
          aria-label="Plan date"
          type="date"
          value={forDate}
          onChange={(e) => setForDate(e.target.value)}
        />
      </div>

      <input
        style={styles.input}
        aria-label="Plan title"
        placeholder="Plan title (e.g. 'Week 1 sim progress')"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        style={styles.textarea}
        aria-label="Plan details"
        placeholder="What's the plan / what got done — write it out here"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />

      <input
        style={styles.input}
        aria-label="Attached file link"
        placeholder="Optional file link (Drive, Notion, GitHub, etc.)"
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
      />

      <button style={styles.submitBtn} disabled={submitting}>
        {submitting ? 'Uploading…' : 'Upload plan'}
      </button>
    </form>
  );
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  input: {
    flex: 1,
    minWidth: 120,
    background: 'var(--panel-raised)',
    border: '1px solid var(--line)',
    borderRadius: 4,
    padding: '9px 10px',
    color: 'var(--text)',
    fontSize: 13,
  },
  textarea: {
    background: 'var(--panel-raised)',
    border: '1px solid var(--line)',
    borderRadius: 4,
    padding: '9px 10px',
    color: 'var(--text)',
    fontSize: 13,
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  submitBtn: {
    alignSelf: 'flex-start',
    background: 'var(--accent)',
    color: '#171006',
    border: 'none',
    borderRadius: 4,
    padding: '10px 16px',
    fontWeight: 600,
    fontSize: 13,
  },
};
