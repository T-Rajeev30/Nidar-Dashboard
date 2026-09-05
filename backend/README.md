# NIDAR AirMouse — Backend

Express + MongoDB API for the mission dashboard. Deploys to Render.

The backend targets Node.js 20 or newer (the current Nodemailer release
requires it).

Authentication is invitation-only. Members claim a one-time invitation and
set a password; login then issues a random, expiring server-side session in an
HttpOnly `nidar_session` cookie. Protected routes derive the member and team
from that session; request-body member/team fields are not credentials. Set
the exact frontend URL in `CORS_ORIGIN`. If frontend and API are on different
sites, use `SESSION_SAME_SITE=none` and HTTPS. Mutating requests also require
an allowed `Origin`, providing the CSRF defense for this deployment model.

## Local setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your MongoDB Atlas connection string
npm run dev
```

Server runs on http://localhost:5000. Health check: `GET /api/health`.

## MongoDB Atlas (free tier)

1. Create a free cluster at https://www.mongodb.com/atlas
2. Create a database user (username + password)
3. Network Access → permit the outbound IP/CIDR ranges shown in the Render
   service's Connect → Outbound page. A temporary `0.0.0.0/0` rule may help
   initial setup, but remove it afterward; it is not a production default.
4. Create a dedicated application database user with only the database
   permissions this service needs. Do not use a personal Atlas administrator.
5. Copy the connection string into `MONGODB_URI` in `.env`

## Gmail App Password (for meeting emails)

1. Turn on 2-Step Verification on the Gmail account you want to send from: https://myaccount.google.com/security
2. Go to https://myaccount.google.com/apppasswords
3. Create an app password (name it e.g. "AirMouse Dashboard") — Google gives you a 16-character code
4. Put your Gmail address in `GMAIL_USER` and that 16-character code (no spaces) in `GMAIL_APP_PASSWORD` in `.env`

## Deploying to Render

1. Push this `backend/` folder to a GitHub repo
2. Render dashboard → New → Web Service → connect the repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGODB_URI` — your Atlas connection string
   - `NODE_ENV=production` — enables production cookie/security behavior
   - `CORS_ORIGIN` — your Vercel frontend URL (e.g. `https://your-app.vercel.app`), comma-separate if you need more than one
   - `FRONTEND_URL` — optional canonical frontend URL used in copied invitation links
   - `TRUST_PROXY=1` — only when Render's trusted proxy setup is in use
   - `SESSION_SAME_SITE=none` — required with HTTPS for separately hosted Vercel/API sites
   - `GMAIL_USER` — the Gmail address sending meeting invites
   - `GMAIL_APP_PASSWORD` — its app password (see above)
7. Deploy. Render gives you a URL like `https://nidar-backend.onrender.com` — this is your `NEXT_PUBLIC_API_URL` for the frontend.

## API summary

| Method | Route              | Purpose                                   |
|--------|---------------------|--------------------------------------------|
| POST   | /api/auth/login     | Establish a session for an active member   |
| GET    | /api/auth/invite/:token | Preview an invitation                  |
| POST   | /api/auth/claim-invite | Claim an invitation and set a password  |
| GET    | /api/auth/me        | Return the authenticated member            |
| POST   | /api/auth/logout    | Revoke the current session                 |
| GET/POST/PATCH | /api/admin/*   | Administrator member and invitation management |
| GET    | /api/teams          | Teams + members + progress stats           |
| GET    | /api/members        | List members (optional ?team=id)           |
| GET    | /api/tasks          | List tasks (optional ?team=id&status=)     |
| POST   | /api/tasks          | Create a task                              |
| PATCH  | /api/tasks/:id      | Update a task (status, assignee, etc.)     |
| DELETE | /api/tasks/:id      | Delete a task                              |
| GET    | /api/mission        | Mission deadline (Dec 15, 2026)            |
| GET    | /api/meetings       | List all scheduled meetings                |
| POST   | /api/meetings       | Persist a meeting and attempt notification |
| POST   | /api/meetings/:id/notifications/retry | Retry a failed notification |
| GET    | /api/plans          | List plan/progress updates                 |
| GET    | /api/plans/phases   | List valid project phases                  |
| POST   | /api/plans          | Create a plan/progress update              |
| DELETE | /api/plans/:id      | Delete a plan/progress update              |

## Tests

```bash
npm test
```

Includes pure utility coverage, database-free health/validation checks, and
MongoDB-memory integration coverage for invitation accounts, sessions,
authorization, mutations, and failed/retried meeting notifications.
Integration tests never use live credentials or a developer database.

The API validates request data, IDs, dates, and external links at its boundary. Error responses contain a safe user-facing `error` message and a machine-readable `code`; internal 500 errors never expose implementation details.

## Runtime security controls

Helmet supplies security headers (including the API CSP), JSON bodies are capped
at 100 KB, and API traffic is rate-limited to a small-team ceiling. Login,
invitation preview/claim, and administrator routes have tighter limits and
return the same JSON `RATE_LIMITED` error contract. On Render, set
`TRUST_PROXY=1` only when the service is behind Render's trusted proxy so those
limits use the real client address; never enable broad proxy trust for arbitrary
deployments.

## First administrator and migration

There is no public signup. After seeding teams, run `npm run create-admin`
with a disposable or production `MONGODB_URI`; it prompts for name, email,
team, and a masked password and safely upgrades an existing account by email.
Administrators create one-time invitation links from the member-management
API. Existing name-only members are retained but cannot log in because they
have no password and are not active; an administrator should issue each one a
reset/invitation, which lets the member set a password and activates the
account. Invitation tokens are hashed at rest and expire after seven days.
