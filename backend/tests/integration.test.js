const test = require('node:test');
const assert = require('node:assert/strict');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../app');
const Team = require('../models/Team');
const Member = require('../models/Member');
const Task = require('../models/Task');
const Plan = require('../models/Plan');
const Meeting = require('../models/Meeting');
const Session = require('../models/Session');
const { hashToken } = require('../utils/auth');

let mongo;
let teams;
let alice;
let bob;
const originalMailerUser = process.env.GMAIL_USER;
const originalMailerPassword = process.env.GMAIL_APP_PASSWORD;
let server;
let baseUrl;

test.before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  teams = await Team.create([
    { key: 'core-technical', displayName: 'Core Technical' },
    { key: 'design-cad', displayName: 'Design & CAD' },
  ]);
  [alice, bob] = await Member.create([
    { name: 'Alice Test', email: 'alice@example.com', team: teams[0]._id },
    { name: 'Bob Test', email: 'bob@example.com', team: teams[1]._id },
  ]);
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (originalMailerUser === undefined) delete process.env.GMAIL_USER;
  else process.env.GMAIL_USER = originalMailerUser;
  if (originalMailerPassword === undefined) delete process.env.GMAIL_APP_PASSWORD;
  else process.env.GMAIL_APP_PASSWORD = originalMailerPassword;
  await mongoose.disconnect();
  await mongo.stop();
  await new Promise((resolve) => server.close(resolve));
});

test.beforeEach(async () => {
  await Promise.all([Task.deleteMany({}), Plan.deleteMany({}), Meeting.deleteMany({}), Session.deleteMany({})]);
  // Never let integration tests send real messages, even if a developer has
  // mail settings in their shell environment.
  process.env.GMAIL_USER = '';
  process.env.GMAIL_APP_PASSWORD = '';
});

async function request(path, options = {}) {
  const headers = { ...(options.body ? { 'content-type': 'application/json' } : {}), ...(options.headers || {}) };
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  return response;
}

function cookieFrom(response) {
  const value = response.headers.get('set-cookie') || '';
  return value.split(';', 1)[0];
}

async function login(name) {
  const response = await request('/api/auth/login', {
    method: 'POST', body: JSON.stringify({ name }),
  });
  assert.equal(response.status, 200);
  return cookieFrom(response);
}

function json(value) {
  return JSON.stringify(value);
}

test('sessions authenticate, expire, and revoke without exposing identity authority', async () => {
  const cookie = await login(alice.name);
  assert.match(cookie, /^nidar_session=/);
  const me = await request('/api/auth/me', { headers: { cookie } });
  assert.equal(me.status, 200);
  assert.equal((await me.json()).member.name, alice.name);

  const invalid = await request('/api/auth/me', { headers: { cookie: 'nidar_session=not-a-real-token' } });
  assert.equal(invalid.status, 401);
  const expiredToken = 'expired-test-token';
  await Session.create({ tokenHash: hashToken(expiredToken), member: alice._id, expiresAt: new Date(Date.now() - 1000) });
  const expired = await request('/api/auth/me', { headers: { cookie: `nidar_session=${expiredToken}` } });
  assert.equal(expired.status, 401);

  const logout = await request('/api/auth/logout', { method: 'POST', headers: { cookie } });
  assert.equal(logout.status, 204);
  const afterLogout = await request('/api/auth/me', { headers: { cookie } });
  assert.equal(afterLogout.status, 401);
});

test('protected routes reject missing sessions and mutations derive actor from session', async () => {
  const missing = await request('/api/tasks');
  assert.equal(missing.status, 401);
  const aliceCookie = await login(alice.name);

  const forgedCrossTeam = await request('/api/tasks', {
    method: 'POST', headers: { cookie: aliceCookie },
    body: json({ title: 'forged', team: teams[1]._id, createdBy: bob._id, assignee: bob._id }),
  });
  assert.equal(forgedCrossTeam.status, 403);

  const ownTask = await request('/api/tasks', {
    method: 'POST', headers: { cookie: aliceCookie },
    body: json({ title: 'owned by session', team: teams[0]._id, createdBy: bob._id }),
  });
  assert.equal(ownTask.status, 201);
  const ownTaskBody = await ownTask.json();
  assert.equal(String(ownTaskBody.createdBy._id), String(alice._id));

  const bobCookie = await login(bob.name);
  const crossUpdate = await request(`/api/tasks/${ownTaskBody._id}`, {
    method: 'PATCH', headers: { cookie: bobCookie }, body: json({ status: 'done' }),
  });
  assert.equal(crossUpdate.status, 403);
  const crossDelete = await request(`/api/tasks/${ownTaskBody._id}`, { method: 'DELETE', headers: { cookie: bobCookie } });
  assert.equal(crossDelete.status, 403);
});

test('plans validate links and protect team ownership', async () => {
  const cookie = await login(alice.name);
  const unsafe = await request('/api/plans', {
    method: 'POST', headers: { cookie },
    body: json({ team: teams[0]._id, title: 'unsafe', forDate: '2026-09-10', fileUrl: 'javascript:alert(1)' }),
  });
  assert.equal(unsafe.status, 400);
  assert.equal(await Plan.countDocuments(), 0);
  const forbidden = await request('/api/plans', {
    method: 'POST', headers: { cookie },
    body: json({ team: teams[1]._id, title: 'wrong team', forDate: '2026-09-10' }),
  });
  assert.equal(forbidden.status, 403);
});

test('meeting is persisted before SMTP delivery and retry cannot create another meeting', async () => {
  const cookie = await login(alice.name);
  const response = await request('/api/meetings', {
    method: 'POST', headers: { cookie },
    body: json({
      title: 'SMTP outage test', agenda: 'Reliability', scheduledAt: '2099-01-01T10:00:00.000Z',
      meetLink: 'https://meet.example.test/room', inviteeIds: [bob._id], organizerId: bob._id,
    }),
  });
  assert.equal(response.status, 201);
  const meeting = await response.json();
  assert.equal(meeting.emailStatus, 'failed');
  assert.equal(await Meeting.countDocuments(), 1);
  const attempts = meeting.emailAttempts;

  const retry = await request(`/api/meetings/${meeting._id}/notifications/retry`, { method: 'POST', headers: { cookie } });
  assert.equal(retry.status, 200);
  const retried = await retry.json();
  assert.equal(retried.emailStatus, 'failed');
  assert.equal(await Meeting.countDocuments(), 1);
  assert.equal(retried.emailAttempts, attempts + 1);

  const persisted = await Meeting.findById(meeting._id);
  persisted.emailStatus = 'sent';
  await persisted.save();
  const idempotent = await request(`/api/meetings/${meeting._id}/notifications/retry`, { method: 'POST', headers: { cookie } });
  assert.equal(idempotent.status, 200);
  assert.equal((await idempotent.json()).emailAttempts, attempts + 1);
});

test('meeting input and notification retry authorization are safe', async () => {
  const cookie = await login(alice.name);
  const invalidDate = await request('/api/meetings', {
    method: 'POST', headers: { cookie }, body: json({ title: 'bad', scheduledAt: 'yesterday', inviteeIds: [bob._id] }),
  });
  assert.equal(invalidDate.status, 400);
  const meeting = await Meeting.create({ title: 'existing', scheduledAt: new Date('2099-01-01'), invitees: [bob._id], organizer: bob._id });
  const retry = await request(`/api/meetings/${meeting._id}/notifications/retry`, { method: 'POST', headers: { cookie } });
  assert.equal(retry.status, 403);
});
