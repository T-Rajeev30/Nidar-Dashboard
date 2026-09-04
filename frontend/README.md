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

There are no passwords. Type your name:
- If a member with that name already exists, you're signed in.
- If not, you're asked to pick a team (Core Technical / Design & CAD / Social) and join.

Your identity is stored in `localStorage` on this device only.

## Deploying to Vercel

1. Push this `frontend/` folder to a GitHub repo (can be the same repo as the backend, different root directory)
2. vercel.com → New Project → import the repo → set root directory to `frontend`
3. Add environment variable `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g. `https://nidar-backend.onrender.com`)
4. Deploy

Once deployed, go back to your Render backend's `CORS_ORIGIN` env var and set it to this Vercel URL, then redeploy the backend.

## Structure

- `pages/index.js` — sign-in / join-a-team screen
- `pages/dashboard.js` — the ops board (3 team columns, tasks, progress)
- `components/` — one file per UI piece (Header, TeamColumn, TaskItem, AddTaskForm, ProgressBar)
- `lib/api.js` — the only place that talks to the backend
- `lib/session.js` — localStorage helpers for the signed-in member
