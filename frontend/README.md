# Frontend (Next.js)

## Overview
The frontend is a Next.js 14 app (App Router) written in TypeScript. It provides the user interface for Telemed, including authentication, chat, doctor listings, records, and dashboards.

## Prerequisites
- Node.js `>=16` (recommended `>=18`)
- A package manager: `pnpm` (recommended), `npm`, or `yarn`

## Setup
1. Copy environment file:
   - `cp env.example .env.local`
2. Edit `.env.local`:
   - `NEXT_PUBLIC_API_URL` should point to your backend (e.g., `http://localhost:5000`).
   - Optionally set `NEXT_PUBLIC_API_URLS` for dev tunnels or multiple backends.

## Install
- Using npm: `npm install`

## Run (Development)
- Patient UI: `npm run dev:patient` → `http://localhost:3000`
- Doctor UI: `npm run dev:doctor` → `http://localhost:3001`
- Generic dev: `npm run dev` (defaults to patient)



## Scripts
- `dev`: run the development server (patient)
- `build`: compile production build
- `start`: run the production server
- `dev:patient`: start patient app on port 3000
- `dev:doctor`: start doctor app on port 3001

## Troubleshooting
- If the app cannot reach the backend, verify `CORS_ORIGIN` on the backend includes the frontend URL.
- If using dev tunnels, include the tunnel URL in both frontend `.env.local` and backend `CORS_ORIGIN`.
 - “Join Consultation” is available only when the appointment is accepted and within 10 minutes before the scheduled time.
 - Doctor’s “Start Consultation” is similarly time‑gated.
