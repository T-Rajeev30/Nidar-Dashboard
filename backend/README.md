# NIDAR AirMouse — Backend

Express + MongoDB API for the mission dashboard. Deploys to Render.

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
3. Network Access → allow access from anywhere (0.0.0.0/0) so Render can connect
4. Copy the connection string into `MONGODB_URI` in `.env`

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
   - `CORS_ORIGIN` — your Vercel frontend URL (e.g. `https://your-app.vercel.app`), comma-separate if you need more than one
   - `GMAIL_USER` — the Gmail address sending meeting invites
   - `GMAIL_APP_PASSWORD` — its app password (see above)
7. Deploy. Render gives you a URL like `https://nidar-backend.onrender.com` — this is your `NEXT_PUBLIC_API_URL` for the frontend.

## API summary

| Method | Route              | Purpose                                   |
|--------|---------------------|--------------------------------------------|
| POST   | /api/auth/login     | Sign in by name                            |
| POST   | /api/auth/join      | Create a member on a team                  |
| GET    | /api/teams          | Teams + members + progress stats           |
| GET    | /api/members        | List members (optional ?team=id)           |
| GET    | /api/tasks          | List tasks (optional ?team=id&status=)     |
| POST   | /api/tasks          | Create a task                              |
| PATCH  | /api/tasks/:id      | Update a task (status, assignee, etc.)     |
| DELETE | /api/tasks/:id      | Delete a task                              |
| GET    | /api/mission        | Mission deadline (Dec 15, 2026)            |
| GET    | /api/meetings       | List all scheduled meetings                |
| POST   | /api/meetings       | Schedule a meeting + email every invitee   |
| GET    | /api/plans          | List plan/progress updates                 |
| GET    | /api/plans/phases   | List valid project phases                  |
| POST   | /api/plans          | Create a plan/progress update              |
| DELETE | /api/plans/:id      | Delete a plan/progress update              |

## Tests

```bash
npm test
```

Includes pure utility coverage plus database-free health, route-not-found, validation, and meeting-email safety checks.

The API validates request data, IDs, dates, and external links at its boundary. Error responses contain a safe user-facing `error` message and a machine-readable `code`; internal 500 errors never expose implementation details.

## Trust model

The current product uses name-based member access and does not implement passwords, sessions, or server-side authorization. Treat it as a trusted internal board only; do not expose it as a public or multi-tenant service without a separate authentication/authorization design.
