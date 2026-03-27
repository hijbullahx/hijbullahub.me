# HijbullahHub.me - AI Engineer Portfolio Platform

Production-ready, CMS-driven portfolio platform for Md. Taher Bin Omar Hijbullah.

This repository contains:
- A Django + DRF backend CMS/API
- A React + Vite frontend portfolio site
- A protected admin dashboard for content management
- Deployment configuration for Railway (backend) and Vercel (frontend)

## Tech Stack

Backend:
- Django 5
- Django REST Framework
- JWT auth via djangorestframework-simplejwt
- PostgreSQL (production) / SQLite (local fallback)
- Gunicorn + WhiteNoise
- Cloudinary media storage (optional, env-driven)

Frontend:
- React 18 + Vite
- React Router
- Tailwind CSS
- Framer Motion
- Axios
- Recharts

## Project Structure

```text
portfolio/
|- backend/                 # Django project + apps + admin CMS
|  |- apps/                 # Domain modules (hero, projects, research, etc.)
|  |- config/               # settings.py, urls.py, api_router.py
|  |- manage.py
|  |- requirements.txt
|  |- Procfile
|  `- railway.json
|- frontend/                # React app + dashboard
|  |- src/
|  |  |- pages/             # Public pages
|  |  |- dashboard/         # Protected admin dashboard pages/components
|  |  |- api/client.js      # Axios API client + token refresh logic
|  |  `- contexts/          # Auth/Theme/Sound providers
|  |- package.json
|  `- vercel.json
|- docs/
|  `- architecture.md
|- deploy.sh
`- README.md
```

## Architecture Overview

Backend architecture:
- Domain-based Django apps under `backend/apps/`
- DRF `ModelViewSet` resources registered in `backend/config/api_router.py`
- Global auth/permissions from DRF + per-viewset custom permissions
- Analytics endpoints in `apps/core/views.py`

Frontend architecture:
- Route-based app in `frontend/src/App.jsx`
- Public routes: `/`, `/projects`, `/ai-ml`, `/research`, `/contact`
- Dashboard routes under `/dashboard/*` guarded by `ProtectedRoute`
- Auth state and JWT token lifecycle managed by `AuthContext`

Data flow:
- Content is managed in Django admin and consumed through REST API endpoints
- Frontend tracks page visits via `/api/analytics/visit/`
- Dashboard reads analytics summary via `/api/analytics/summary/` (admin-only)

## Backend Modules (Active API Apps)

Active routers are defined for:
- `hero`
- `about`
- `skills`
- `tags`
- `projects`
- `project-images`
- `project-acquisitions`
- `research`
- `research-contributions`
- `education`
- `experience`
- `achievements`
- `ai-lab`
- `contact`
- `contact-profiles`
- `feedback`
- `hire-requests`
- `site-settings`
- `profiles`

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

### 1. Backend Setup

From repository root:

```bash
python -m venv venv
```

Activate venv:

```bash
# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Windows (cmd)
venv\Scripts\activate.bat

# macOS/Linux
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Create backend env file:

```bash
# Windows
copy backend\.env.example backend\.env

# macOS/Linux
cp backend/.env.example backend/.env
```

Run database migrations:

```bash
python backend/manage.py makemigrations
python backend/manage.py migrate
```

Create admin user:

```bash
python backend/manage.py createsuperuser
```

Start backend:

```bash
python backend/manage.py runserver
```

Backend URLs:
- API root: `http://127.0.0.1:8000/api/`
- Admin: `http://127.0.0.1:8000/admin/`
- Health: `http://127.0.0.1:8000/health/`

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create frontend env file:

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

Start frontend:

```bash
npm run dev
```

Default frontend URL:
- `http://127.0.0.1:5173/` (or Vite-assigned port)

## Environment Variables

### Backend (.env)

From `backend/.env.example`:

```env
DJANGO_SECRET_KEY=replace-this
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOW_ALL_ORIGINS=True
PAGE_SIZE=10
JWT_ACCESS_MINUTES=30
JWT_REFRESH_DAYS=7
```

Production template is available in `backend/.env.production.example`.

Optional media storage:
- Set `CLOUDINARY_URL` to enable Cloudinary media backend.
- If unset, local filesystem media storage is used.

### Frontend (.env)

From `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Production sample in `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://api.hijbullah.me/api
```

## Authentication and Dashboard

- Login endpoint: `/api/token/`
- Refresh endpoint: `/api/token/refresh/`
- Access token and refresh token are stored in localStorage by frontend auth context
- Axios interceptor in `frontend/src/api/client.js` handles automatic refresh on 401
- Protected dashboard routes are under `/dashboard/*`

## Deployment

Backend deployment files:
- `backend/Procfile`
- `backend/railway.json`
- `backend/runtime.txt`

Frontend deployment files:
- `frontend/vercel.json`

Guides:
- `DEPLOY_QUICKSTART.md`
- `DEPLOYMENT_HIJBULLAH.ME.md`
- `Deployment_Guide.md`

Helper script:
- `deploy.sh`

## Useful Commands

Backend:

```bash
python backend/manage.py showmigrations
python backend/manage.py collectstatic --noinput
python backend/manage.py shell
python backend/manage.py createsuperuser
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run preview
```

## Security Notes for Production

Before going live, verify:
- `DEBUG=False`
- `DJANGO_SECRET_KEY` is strong and private
- `ALLOWED_HOSTS` is restricted to real domains
- `CORS_ALLOW_ALL_ORIGINS=False` and `CORS_ALLOWED_ORIGINS` is explicit
- Database is PostgreSQL with managed backups
- Admin credentials are strong and 2FA is enabled where available

## Troubleshooting

Common issues:

1. Frontend cannot reach API:
- Check `VITE_API_BASE_URL` and backend server status
- Confirm CORS settings in backend env

2. Dashboard login loops or 401 errors:
- Clear browser storage (`adminToken`, `refreshToken`)
- Re-login and verify backend token endpoints

3. Missing media files:
- Confirm `CLOUDINARY_URL` (if using Cloudinary)
- Or verify local media volume persistence on host

4. Migration errors:
- Run `python backend/manage.py showmigrations`
- Ensure `DATABASE_URL` points to correct DB

## Documentation

- Architecture notes: `docs/architecture.md`
- Dashboard notes: `frontend/DASHBOARD_README.md`
- Backend admin notes: `backend/ADMIN_UPGRADE.md`

## License

Private project. All rights reserved unless otherwise specified.
