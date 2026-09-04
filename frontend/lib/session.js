// Authentication is owned by the server session cookie. Keep this module only
// as a migration shim for older clients that stored a member object locally.
// A local value must never be used to authorize or enter the dashboard.
const KEY = 'nidar_member';

export function getMember() {
  clearMember();
  return null;
}

export function clearMember() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}
