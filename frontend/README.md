# NIDAR AirMouse — Dashboard (frontend)

Next.js app (plain JavaScript, pages router). Deploys to Vercel.

## Local setup

```bash
cd frontend
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

Visit http://localhost:3000.

## How sign-in works

Members sign in with the email address and password established through a one-time administrator invitation. New members use the **Claim your invite** link to review their assigned team and set a password. Invitation tokens are never stored in browser storage and expire after one use.

The API issues an opaque, expiring HttpOnly session cookie. `lib/api.js` sends it with `credentials: include`; the browser never stores a session token or treats a local identity as authority. Existing `nidar_member` localStorage values are removed as a migration courtesy.

Administrators can manage invitations, team/role/status changes, access resets, and session revocation at `/admin/members`. If SMTP is unavailable, the one-time claim link is shown once so it can be copied and delivered securely by an administrator.

## Checks

```bash
npm run lint
npm test
npm run build
```

## Deploying to Vercel

1. Push this `frontend/` folder to a GitHub repo (can be the same repo as the backend, different root directory)
2. vercel.com → New Project → import the repo → set root directory to `frontend`
3. Add environment variable `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g. `https://nidar-backend.onrender.com`). If you are a collaborator rather than the Vercel project owner, ask the owner to set this variable and redeploy.
4. Deploy

Once deployed, go back to your Render backend's `CORS_ORIGIN` env var and set it to this Vercel URL, then redeploy the backend.

## Structure

- `pages/index.js` — email/password sign-in screen
- `pages/claim-invite.js` — one-time invitation claim and password setup
- `pages/admin/members.js` — small-team administrator member management
- `pages/dashboard.js` — the ops board (four team columns, task filters, plans, and meetings)
- `components/` — one file per UI piece (Header, TeamColumn, TaskItem, AddTaskForm, ProgressBar)
- `lib/api.js` — the only place that talks to the backend
- `lib/session.js` — legacy localStorage migration shim; server sessions are authoritative
