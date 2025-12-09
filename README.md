# Telemed AI Platform

## Overview
Telemed is a full-stack platform that enables AI-assisted telemedicine: patient chat, doctor interactions, appointments, records, and prescription management. The stack includes a Next.js frontend, a Node/Express backend (with Gemini integration), and a Python component with a skin disease model.

## Repository Structure
- `frontend/` — Next.js 14 app (UI, pages, components)
- `backend/` — Node.js/Express API (auth, chat, appointments, prescriptions, notifications)
- `app.py` — Python app entry point for model integration
- `skin_disease_model.h5` — Trained model file (Git LFS recommended if >100MB)

See the project’s final report (`final-report.pdf`) for requirements, architecture, and workflow details.

## Quick Start
### Backend
1. `cd backend`
2. `cp env.example .env`
3. Edit `.env` (set `GEMINI_API_KEY`, `MONGO_URI`, `CORS_ORIGIN`, etc.)
4. `npm install`
5. Dev: `npm run dev` (nodemon) — API on `http://localhost:5000`
6. Prod: `npm start`

### Frontend
1. `cd frontend`
2. `cp env.example .env.local`
3. Edit `.env.local` (`NEXT_PUBLIC_API_URL=http://localhost:5000`)
4. Install: `pnpm install` or `npm install`
5. Dev: `pnpm dev` or `npm run dev` — UI on `http://localhost:3000`
6. Prod: `pnpm build && pnpm start` or `npm run build && npm start`

## Python Environment (app.py)
If your local libraries don’t match required versions, create a virtual environment and install dependencies:

1. Create venv (Windows):
   - `python -m venv venv`
   - `venv\Scripts\activate`
2. Install/upgrade packages as needed (based on `app.py` imports):
   - `pip install --upgrade pip`
   - Example (adjust to your needs):
     - `pip install tensorflow keras flask numpy pillow`

## Deployment Notes
- Ensure backend `CORS_ORIGIN` lists your frontend URLs (localhost and tunnels).
- Configure environment variables for both apps in production.
- Secure secrets (`JWT_SECRET`, API keys) and database access.


