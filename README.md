# HijbullahHub.me — AI Engineer Portfolio Platform

Production-ready, CMS-driven portfolio platform for **Hijbullah – Autonomous Systems Engineer in Progress**.

## Stack

- Backend: Django, DRF, SimpleJWT, PostgreSQL/SQLite, Gunicorn
- Frontend: React (Vite), Tailwind CSS, Framer Motion, Axios, React Router, Recharts

## Repository Structure

- `backend/` Django CMS and REST API
- `frontend/` React client consuming backend APIs
- `docs/` additional technical notes
- `Deployment_Guide.md` deployment checklist for Render + Vercel

## Backend Quick Start

1. Create virtual environment and activate it.
2. Install dependencies:
   - `pip install -r backend/requirements.txt`
3. Configure environment:
   - `copy backend/.env.example backend/.env`
4. Run migrations:
   - `python backend/manage.py makemigrations`
   - `python backend/manage.py migrate`
5. Create admin account:
   - `python backend/manage.py createsuperuser`
6. Start backend:
   - `python backend/manage.py runserver`

## Frontend Quick Start

1. Install dependencies:
   - `cd frontend && npm install`
2. Configure environment:
   - `copy .env.example .env`
3. Run development server:
   - `npm run dev`

## Core CMS Apps

- `core`, `hero`, `about`, `skills`, `projects`, `research`, `blog`, `experience`, `achievements`, `ai_lab`, `contact`, `site_settings`, `users`

All portfolio content is API-driven and editable through Django admin.
