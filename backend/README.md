# Backend (Node.js/Express)

## Overview
The backend is an Express API that powers Telemed features: authentication, chat (Gemini integration), appointments, prescriptions, notifications, and real-time communication.

## Prerequisites
- Node.js `>=16` (recommended `>=18`)
- MongoDB instance (local or remote)

## Environment Setup
1. Copy example env:
   - `cp env.example .env`
2. Configure `.env`:
   - `PORT`: default `5000`
   - `NODE_ENV`: `development` or `production`
   - `JWT_SECRET`: a long random secret
   - `GEMINI_API_KEY`: your Google Gemini key
   - `MONGO_URI`: e.g., `mongodb://127.0.0.1:27017`
   - `MONGO_DB`: e.g., `telemed`
   - `CORS_ORIGIN`: comma-separated frontend origins (include `http://localhost:3000` and any dev tunnels)
   - `DISABLE_RATE_LIMIT`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS` as needed

## Install
- `npm install`

## Run
- Development: `npm run dev` (nodemon)
- Production: `npm start`

## API Notes
- Update `CORS_ORIGIN` whenever the frontend URL changes (local, dev tunnel, or production).
- MongoDB connection uses `MONGO_URI` and `MONGO_DB`; ensure the DB is reachable.

## Troubleshooting
- If requests from the frontend are blocked, confirm CORS settings match the frontend origin.
- For 5xx errors, check logs and ensure environment variables are set correctly.
