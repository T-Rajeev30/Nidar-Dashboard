// Single responsibility: one fetch wrapper the whole app calls through,
// so the API base URL and error handling live in exactly one place.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new ApiError('Cannot reach the mission board. Check your connection and try again.', 0, 'NETWORK_ERROR');
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || `Request failed (${res.status})`, res.status, data.code);
  }
  return data;
}

export const api = {
  login: (name) => request('/auth/login', { method: 'POST', body: JSON.stringify({ name }) }),
  join: (name, email, teamKey, role) =>
    request('/auth/join', { method: 'POST', body: JSON.stringify({ name, email, teamKey, role }) }),
  getTeams: () => request('/teams'),
  getTasks: (teamId) => request(`/tasks${teamId ? `?team=${teamId}` : ''}`),
  createTask: (payload) => request('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  seedModules: () => request('/tasks/seed-modules', { method: 'POST' }),
  updateTask: (id, payload) =>
    request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  getMission: () => request('/mission'),
  getMembers: () => request('/members'),
  updateMember: (id, payload) =>
    request(`/members/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  getTasksForMember: (memberId) => request(`/tasks?assignee=${memberId}`),
  getMeetings: () => request('/meetings'),
  createMeeting: (payload) => request('/meetings', { method: 'POST', body: JSON.stringify(payload) }),
  getPlans: () => request('/plans'),
  getPlanPhases: () => request('/plans/phases'),
  createPlan: (payload) => request('/plans', { method: 'POST', body: JSON.stringify(payload) }),
  deletePlan: (id) => request(`/plans/${id}`, { method: 'DELETE' }),
};
