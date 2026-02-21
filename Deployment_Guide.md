# Deployment Guide

## Backend (Render)

1. Create a new Web Service from repository root, set root directory to `backend`.
2. Set Build Command:
   - `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
3. Set Start Command:
   - `gunicorn config.wsgi:application`
4. Add environment variables:
   - `DJANGO_SECRET_KEY`
   - `DEBUG=False`
   - `ALLOWED_HOSTS=<your-render-domain>`
   - `DATABASE_URL=<render-postgres-url>`
   - `CORS_ALLOW_ALL_ORIGINS=False`
5. Provision PostgreSQL on Render and connect via `DATABASE_URL`.
6. Configure media persistence via object storage or mounted disk.

## Frontend (Vercel)

1. Import repository and set root directory to `frontend`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-backend-domain>/api`
5. Deploy.

## Post-Deployment Checks

- Verify `/admin` login and content CRUD
- Verify `/api/*` endpoints
- Confirm frontend pages fetch live backend data
- Confirm JWT token endpoints are reachable
- Confirm media file URLs load correctly
