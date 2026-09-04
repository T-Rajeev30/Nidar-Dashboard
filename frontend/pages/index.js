import { useState } from 'react';
import { useRouter } from 'next/router';
import { api, ApiError } from '../lib/api';
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
  const [stage, setStage] = useState('name');
  const [teamKey, setTeamKey] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleContinue(event) {
    event.preventDefault();
    if (!name.trim()) return;
    setError('');
    setLoading(true);
    try {
      const { member } = await api.login(name.trim());
      saveMember(member);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setStage('pick-team');
      else setError(err.message || 'Unable to check your member access. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(event) {
    event.preventDefault();
    if (!teamKey) return setError('Choose a team to continue.');
    setError('');
    setLoading(true);
    try {
      const { member } = await api.join(name.trim(), email.trim(), teamKey, role.trim());
      saveMember(member);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to join the board. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="signin-shell">
      <section className="signin-panel" aria-labelledby="signin-title">
        <p className="eyebrow"><span aria-hidden="true" />GPS-DENIED · GRID 00,00</p>
        <h1 id="signin-title">AirMouse Ops Board</h1>
        <p className="lede">NIDAR 2026–27 · Track 1 mission dashboard</p>
        {stage === 'name' ? (
          <form className="stack-form" onSubmit={handleContinue}>
            <label htmlFor="name">Your name</label>
            <input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Rajeev" autoComplete="name" autoFocus required />
            <button className="button button-primary" disabled={loading || !name.trim()}>{loading ? 'Checking member access…' : 'Continue'}</button>
          </form>
        ) : (
          <form className="stack-form" onSubmit={handleJoin}>
            <p className="form-hint">No member named <strong>{name}</strong> yet. Add your details to join the board.</p>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required />
            <label htmlFor="team">Team</label>
            <select id="team" value={teamKey} onChange={(event) => setTeamKey(event.target.value)} required>
              <option value="">Choose your team</option>
              {TEAM_OPTIONS.map((team) => <option key={team.key} value={team.key}>{team.displayName}</option>)}
            </select>
            <label htmlFor="role">Role <span className="muted">(optional)</span></label>
            <input id="role" value={role} onChange={(event) => setRole(event.target.value)} placeholder="e.g. Frame lead or SLAM" autoComplete="organization-title" />
            <button className="button button-primary" disabled={loading}>{loading ? 'Joining…' : 'Join board'}</button>
            <button className="button button-quiet" type="button" onClick={() => { setStage('name'); setError(''); }}>Use a different name</button>
          </form>
        )}
        <p className="form-message" role="status" aria-live="polite">{error}</p>
      </section>
    </main>
  );
}
