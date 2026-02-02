# Doktor Workflow Sistemi

## Overview
A Turkish-language workflow management system for doctor onboarding processes. The application consists of a React frontend and an Express.js backend with PostgreSQL database.

## Recent Changes (Feb 2026)
- Added Contract Timeline feature for Mali GMY users to track processes they initiated
- Timeline shows all workflow steps with parallel process visualization (tree structure)
- Shows who completed each step and when, current status, and pending assignments
- Added Admin Panel for user management
- Modernized UI with new CSS theme (gradient backgrounds, cards, modern forms)
- Added user CRUD operations (create, read, update, delete)
- Added workflow role management
- Dynamic user loading in Login page

## Project Architecture

### Frontend (React + Vite)
- Location: `frontend/`
- Port: 5000
- Tech Stack: React 19, TypeScript, Vite, Axios, Socket.io-client
- Entry: `frontend/src/main.tsx`

### Pages
- `/` - Login page (user selection)
- `/dashboard` - Main dashboard with tasks and contract creation
- `/admin` - Admin panel for user/role management
- `/task/:id` - Task detail and completion form

### Backend (Express + TypeScript)
- Location: `backend/`
- Port: 3001
- Tech Stack: Express 5, TypeScript, PostgreSQL (pg), Socket.io
- Entry: `backend/src/index.ts`

### Database
- PostgreSQL (Replit built-in or Docker for production)
- Schema: `backend/schema.sql`
- Tables: units, users, contracts, tasks

### Workflow Roles
- ADMIN - System administrator
- MALI_GMY - Financial General Manager (starts contracts)
- MERKEZ_HAKEDIS - Central Payment Office
- INSAN_KAYNAKLARI - Human Resources
- RUHSATLANDIRMA - Licensing
- MALI_ISLER - Financial Affairs
- BILGI_SISTEMLERI - IT Systems
- MISAFIR_HIZMETLERI - Guest Services
- BIYOMEDIKAL - Biomedical
- ISG_EGITMENI - OHS Trainer
- KALITE_EGITMENI - Quality Trainer

## Running the Application
- Frontend runs on port 5000 (Vite dev server)
- Backend runs on port 3001 (Express)
- API requests from frontend are proxied through Vite to the backend

## Docker Deployment
The project is designed to be Docker-compatible for production deployment on Ubuntu servers. Use the original docker-compose.yml configuration with PostgreSQL.

## Key Files
- `backend/src/db.ts` - Database connection pool
- `backend/src/routes.ts` - API routes (users, units, contracts, tasks, timeline)
- `backend/src/workflowController.ts` - Workflow state machine logic
- `backend/src/index.ts` - Server entry point
- `frontend/src/api.ts` - API client configuration
- `frontend/src/components/ContractTimeline.tsx` - Contract timeline with parallel process visualization
- `frontend/src/pages/Admin.tsx` - Admin panel component
- `frontend/src/pages/Dashboard.tsx` - Main dashboard with contract tracking
- `frontend/src/index.css` - Global modern theme styles
- `frontend/vite.config.ts` - Vite configuration with proxy settings
