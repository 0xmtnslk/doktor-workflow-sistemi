# Doktor Workflow Sistemi

## Overview
A Turkish-language workflow management system for doctor onboarding processes. The application consists of a React frontend and an Express.js backend with PostgreSQL database.

## Project Architecture

### Frontend (React + Vite)
- Location: `frontend/`
- Port: 5000
- Tech Stack: React 19, TypeScript, Vite, Axios, Socket.io-client
- Entry: `frontend/src/main.tsx`

### Backend (Express + TypeScript)
- Location: `backend/`
- Port: 3001
- Tech Stack: Express 5, TypeScript, PostgreSQL (pg), Socket.io
- Entry: `backend/src/index.ts`

### Database
- PostgreSQL (Replit built-in)
- Schema: `backend/schema.sql`
- Tables: units, users, contracts, tasks

## Running the Application
- Frontend runs on port 5000 (Vite dev server)
- Backend runs on port 3001 (Express)
- API requests from frontend are proxied through Vite to the backend

## Key Files
- `backend/src/db.ts` - Database connection pool
- `backend/src/routes.ts` - API routes
- `backend/src/index.ts` - Server entry point
- `frontend/src/api.ts` - API client configuration
- `frontend/vite.config.ts` - Vite configuration with proxy settings
