# NIDAR Dashboard Agent Guide

## Product and architecture

This repository is the NIDAR 2026–27 AirMouse mission board. Members use it to join one of four teams, track tasks and progress, post dated team plans, and schedule meetings with email invitations.

- `frontend/`: Next.js 14 Pages Router application in plain JavaScript. UI lives in `pages/` and `components/`; `lib/api.js` is the REST boundary and `lib/session.js` owns the device-local member session.
- `backend/`: Express 4 REST API backed by Mongoose/MongoDB. Routes are in `routes/`, schemas in `models/`, and pure logic in `utils/`.
- Identity is intentionally name-based and stored in localStorage. It is a convenience identity, not authentication or an authorization boundary. Do not add permissions that pretend otherwise, and do not redesign auth without an explicit product decision.
- Meeting delivery uses Gmail SMTP. Tests must never use live credentials or send real email.

## Safe local workflow

Use the checked-in npm lockfiles independently in `frontend/` and `backend/`. Never put real values in tracked environment examples.

```bash
# frontend
cd frontend
npm ci --ignore-scripts
npm run lint
npm run test
npm run build

# backend
cd backend
npm ci --ignore-scripts
npm test
```

The backend development server additionally requires a local `MONGODB_URI`; copy `backend/.env.example` to an ignored `.env` and use a disposable development database. The frontend uses `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:5000` in development.

Prefer focused Node tests for pure logic and route/contract tests that do not depend on production services. After changes, run the relevant package checks once, then inspect `git diff` and `git status --short`.

## Engineering conventions

- Preserve the small existing architecture; extract focused helpers when they remove real route or component duplication.
- Keep API changes additive and error responses predictable. Validate all request input at the route boundary, never expose internal errors, and permit only `http:`/`https:` external links.
- Keep frontend server-state access inside `frontend/lib/api.js`. Surface loading, empty, success, error, disabled, and retry states for important asynchronous work.
- Use semantic HTML, visible keyboard focus, meaningful labels, roughly 44 px touch targets, and reduced-motion support. Verify narrow phone, tablet, and desktop layouts.
- Write a failing regression test before fixing behavioral bugs when the existing stack makes that practical. Do not weaken tests or silently depend on network services.
- Do not deploy, push, commit, rotate credentials, or run destructive database/Git commands unless the user explicitly asks.

## Multi-Agent Task Force

For large tasks, the root agent acts as Boss/orchestrator. It performs one shared reconnaissance pass, creates the repository map and dependency graph, assigns non-overlapping ownership, integrates approved work, and runs final verification.

Use parallel subagents only for genuinely independent workstreams. Give each worker:

- one clear objective;
- specific files or directories;
- relevant repository context and constraints;
- acceptance criteria and targeted checks.

Use isolated worktrees for concurrent writers. Never let two agents edit the same file, and keep shared/configuration changes sequential. Workers return changed files, rationale, exact tests and results, remaining failures, and risks—not full successful logs.

Use a read-only Supervisor for independent review of significant integrated changes. The Supervisor checks correctness, root-cause fixes, architecture, security, accessibility, contract consistency, regressions, and the verification evidence.

Avoid duplicate repository scans and repeated full suites. Specialists run targeted checks; the Boss runs comprehensive checks after integration. Use the lowest-cost capable worker when model selection is available, reserving strongest reasoning for architecture, difficult bugs, security-sensitive work, integration, and final review. Stop each workstream when its assignment is complete.
