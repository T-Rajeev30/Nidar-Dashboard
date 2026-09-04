import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';
import { saveMember } from '../lib/session';

const TEAM_OPTIONS = [
  { key: 'core-technical', displayName: 'Core Technical' },
  { key: 'design-cad', displayName: 'Design & CAD' },
  { key: 'social', displayName: 'Social' },
  { key: 'documentation', displayName: 'Documentation' },
];

export default function SignIn() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [stage, setStage] = useState('name'); // 'name' | 'pick-team'
  const [teamKey, setTeamKey] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleContinue(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setLoading(true);
    try {
      const { member } = await api.login(name.trim());
      saveMember(member);
      router.push('/dashboard');
    } catch (err) {
      // No existing member — offer to join a team instead.
      setStage('pick-team');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!teamKey) {
      setError('Pick a team to join.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required so you can be invited to meetings.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { member } = await api.join(name.trim(), email.trim(), teamKey, role.trim());
      saveMember(member);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.panel}>
        <div style={styles.eyebrowRow}>
          <span style={styles.dot} />
          <span style={styles.eyebrow}>GPS-DENIED · GRID 00,00</span>
        </div>
        <h1 style={styles.title}>AirMouse Ops Board</h1>
        <p style={styles.sub}>NIDAR 2026-27 · Track 1 mission dashboard</p>

        {stage === 'name' && (
          <form onSubmit={handleContinue} style={styles.form}>
            <label style={styles.label} htmlFor="name">Your name</label>
            <input
              id="name"
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rajeev"
              autoFocus
            />
            <button style={styles.button} disabled={loading || !name.trim()}>
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        )}

        {stage === 'pick-team' && (
          <form onSubmit={handleJoin} style={styles.form}>
            <p style={styles.hint}>
              No one named <strong>{name}</strong> yet — pick your team to join the board.
            </p>
            <label style={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <label style={styles.label} htmlFor="team">Team</label>
            <select
              id="team"
              style={styles.input}
              value={teamKey}
              onChange={(e) => setTeamKey(e.target.value)}
            >
              <option value="">Select a team</option>
              {TEAM_OPTIONS.map((t) => (
                <option key={t.key} value={t.key}>{t.displayName}</option>
              ))}
            </select>

            <label style={styles.label} htmlFor="role">Role (optional)</label>
            <input
              id="role"
              style={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. LinkedIn, Frame lead, SLAM"
            />

            <button style={styles.button} disabled={loading}>
              {loading ? 'Joining...' : `Join ${TEAM_OPTIONS.find((t) => t.key === teamKey)?.displayName || 'team'}`}
            </button>
            <button
              type="button"
              style={styles.linkButton}
              onClick={() => { setStage('name'); setError(''); }}
            >
              ← use a different name
            </button>
          </form>
        )}

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  panel: {
    width: '100%',
    maxWidth: 380,
    background: 'var(--panel)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '32px 28px',
  },
  eyebrowRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' },
  eyebrow: { fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, color: 'var(--signal)' },
  title: { fontSize: 26, margin: '0 0 4px', fontWeight: 700 },
  sub: { color: 'var(--text-muted)', fontSize: 14, margin: '0 0 24px' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontSize: 12, color: 'var(--text-muted)', marginTop: 6 },
  input: {
    background: 'var(--panel-raised)',
    border: '1px solid var(--line)',
    borderRadius: 4,
    padding: '10px 12px',
    color: 'var(--text)',
    fontSize: 14,
  },
  button: {
    marginTop: 14,
    background: 'var(--accent)',
    color: '#171006',
    border: 'none',
    borderRadius: 4,
    padding: '11px 14px',
    fontWeight: 600,
    fontSize: 14,
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 13,
    padding: 4,
    textAlign: 'left',
  },
  hint: { fontSize: 13, color: 'var(--text-muted)', margin: 0 },
  error: { color: 'var(--status-blocked)', fontSize: 13, marginTop: 14 },
};
