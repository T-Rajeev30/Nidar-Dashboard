// Single responsibility: persist the signed-in member in localStorage.
// This is name-based "login" only — no passwords, no tokens.
const KEY = 'nidar_member';

export function saveMember(member) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(member));
}

export function getMember() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearMember() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}
