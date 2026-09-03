# Real Estate Marketplace

Monorepo holding both halves of the application.

```
.
├── frontend/   Next.js app (React 19, Tailwind, MapLibre/Mapbox, Zustand)
└── backend/    Express API (Drizzle ORM + PostgreSQL, JWT auth)
```

Each app keeps its own `package.json` and dependencies — install and run them
separately.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in real values
npm run dev                  # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `lint`.

## Backend

```bash
cd backend
npm install
cp .env.sample .env          # fill in real values
npm run db:migrate           # apply Drizzle migrations
npm run dev                  # nodemon, port from PORT
```

Scripts: `dev`, `start`, `db:generate`, `db:migrate`, `db:seed`.

## Environment

`.env` files are **not** committed. `backend/.env.sample` lists the variables
the API needs. The frontend expects `NEXT_PUBLIC_API_URL`,
`NEXT_PUBLIC_MAPBOX_API_KEY` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in
`frontend/.env.local`.

## Deployment

The frontend's root directory is `frontend/`, not the repository root — set that
in the hosting provider's project settings.

## History

This repository previously contained only the frontend. The backend was merged
in from `BNsrujan/Real_Estate_Marketplace_Backend` with its full commit history
rewritten under `backend/`, so `git log -- backend/` shows every backend commit.
