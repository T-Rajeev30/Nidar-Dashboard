# NIDAR AirMouse — Mission Dashboard

Tracks the four sub-teams working the NIDAR 2026-27 AirMouse challenge:
**Core Technical** (2), **Design & CAD** (frame/CAD), **Social** (5 — LinkedIn/Twitter/Instagram),
and **Documentation** (daily logs of what's being done). Mission deadline: **Dec 15, 2026**,
shown as a live countdown in the header.

Also includes a meeting scheduler: pick a title/time/agenda, check off attendees from any
team, and every attendee gets an emailed invite immediately (Gmail SMTP).

- `backend/` — Express + MongoDB API → deploy to **Render**
- `frontend/` — Next.js dashboard (plain JS) → deploy to **Vercel**

## Quick start (local)

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # add your MongoDB Atlas URI
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev                 # http://localhost:3000
```

Open http://localhost:3000, type your name, pick your team, and start adding tasks.

## Deployment order

1. **MongoDB Atlas** — free cluster, get the connection string (see `backend/README.md`)
2. **Render** — deploy `backend/`, set `MONGODB_URI` and `CORS_ORIGIN`
3. **Vercel** — deploy `frontend/`, set `NEXT_PUBLIC_API_URL` to your Render URL
4. Go back to Render and update `CORS_ORIGIN` to your final Vercel URL, redeploy

Full details are in `backend/README.md` and `frontend/README.md`.

## Linking tasks to the 15 sub-problem breakdown

When adding a task, the optional "SP#" field (1–15) tags it against the sub-problem
numbering from the mission-brief breakdown (airframe, SLAM, survivor detection, GCS, etc.)
so progress can be traced back to the original problem statement.
