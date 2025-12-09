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
- pnpm: `pnpm dev`
- npm: `npm run dev`
- Default dev server: `http://localhost:3000`



## Scripts
- `dev`: run the development server
- `build`: compile production build
- `start`: run the production server

## Troubleshooting
- If the app cannot reach the backend, verify `CORS_ORIGIN` on the backend includes the frontend URL.
- If using dev tunnels, include the tunnel URL in both frontend `.env.local` and backend `CORS_ORIGIN`.