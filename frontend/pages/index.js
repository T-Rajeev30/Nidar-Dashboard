import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { api, ApiError } from '../lib/api';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      await api.login(email.trim(), password);
      await router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.status === 0) {
        setError('The board is unavailable right now. Check your connection and try again.');
      } else {
        setError('Email or password is incorrect. If you were invited, use the link in your invitation.');
      }
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
        <form className="stack-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" autoCapitalize="none" autoFocus required />
          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-pressed={showPassword} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
          </div>
          <button className="button button-primary" disabled={loading || !email.trim() || !password}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="form-message" role="alert" aria-live="polite">{error}</p>
        <p className="form-hint invite-help">Have an invitation? <Link href="/claim-invite">Claim your invite</Link></p>
      </section>
    </main>
  );
}
