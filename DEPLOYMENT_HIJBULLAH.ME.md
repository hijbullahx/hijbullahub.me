# Deployment Guide for hijbullah.me

This guide will help you deploy your portfolio to your domain hijbullah.me with full functionality and database.

## Quick Overview

- **Domain**: hijbullah.me (Namecheap)
- **Frontend**: React + Vite (Static Site)
- **Backend**: Django + PostgreSQL
- **Media Storage**: AWS S3 or Backend Server
- **Recommended Stack**: Railway/Render (Backend) + Vercel/Netlify (Frontend)

---

## Option 1: Railway + Vercel (Recommended)

### Step 1: Deploy Backend to Railway

#### 1.1 Prepare Backend

Create `railway.json` in backend folder:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn config.wsgi:application",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Create `Procfile` in backend folder:
```
web: python manage.py migrate && gunicorn config.wsgi:application
release: python manage.py collectstatic --noinput
```

Create `runtime.txt` in backend folder:
```
python-3.11.9
```

#### 1.2 Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your portfolio repository
4. Railway will detect Django automatically
5. Add PostgreSQL database:
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway will auto-link it to your backend

#### 1.3 Set Environment Variables on Railway

Go to your backend service → Variables → Add these:

```env
DJANGO_SECRET_KEY=generate-a-secure-random-key-here
DEBUG=False
ALLOWED_HOSTS=hijbullah.me,www.hijbullah.me,api.hijbullah.me,*.railway.app
DATABASE_URL=${{Postgres.DATABASE_URL}}
CORS_ALLOWED_ORIGINS=https://hijbullah.me,https://www.hijbullah.me
CORS_ALLOW_ALL_ORIGINS=False
PAGE_SIZE=10
JWT_ACCESS_MINUTES=30
JWT_REFRESH_DAYS=7
```

**Generate SECRET_KEY**: Run in terminal:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### 1.4 Get Railway Backend URL

After deployment completes:
- Click "Settings" → "Generate Domain"
- Note your URL: `your-app.railway.app`
- Or set custom domain: `api.hijbullah.me`

### Step 2: Deploy Frontend to Vercel

#### 2.1 Prepare Frontend

Create `vercel.json` in frontend folder:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

Update `.env.production`:
```env
VITE_API_BASE_URL=https://api.hijbullah.me/api
```

#### 2.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New" → "Project"
3. Import your portfolio repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://api.hijbullah.me/api`
6. Click "Deploy"

### Step 3: Configure Domain on Namecheap

#### 3.1 Main Domain (hijbullah.me) → Vercel Frontend

1. Log in to Namecheap
2. Go to Domain List → hijbullah.me → Manage
3. Go to "Advanced DNS" tab
4. Add these records:

**For Vercel:**
```
Type    Host    Value                    TTL
A       @       76.76.19.19             Automatic
CNAME   www     cname.vercel-dns.com    Automatic
```

#### 3.2 API Subdomain (api.hijbullah.me) → Railway Backend

In Railway:
1. Go to your backend service → Settings
2. Click "Generate Domain" or "Custom Domain"
3. Enter: `api.hijbullah.me`
4. Railway will show CNAME record to add

Back in Namecheap Advanced DNS:
```
Type    Host    Value                           TTL
CNAME   api     your-app.up.railway.app         Automatic
```

#### 3.3 Verify Domain in Vercel

1. In Vercel → Project Settings → Domains
2. Add domain: `hijbullah.me`
3. Add domain: `www.hijbullah.me`
4. Vercel will verify DNS automatically

**Wait 15-30 minutes for DNS propagation**

### Step 4: Create Superuser on Railway

1. In Railway → your backend service → "Deploy Logs"
2. Click "Shell" or use Railway CLI:

```bash
railway run python manage.py createsuperuser
```

Or create directly:
```bash
railway run python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('hijbullah', 'hijbullah119445@gmail.com', 'hijbullahpf')"
```

### Step 5: Upload Initial Data

1. Go to `https://hijbullah.me/dashboard/login`
2. Login with: **hijbullah** / **hijbullahpf**
3. Start adding your projects, blog posts, etc.

---

## Option 2: DigitalOcean Droplet (Full Control)

### Cost: $6/month (Basic Droplet)

#### Step 1: Create Droplet

1. Sign up at [digitalocean.com](https://digitalocean.com)
2. Create Droplet:
   - Ubuntu 22.04 LTS
   - Basic Plan ($6/month)
   - Choose datacenter near you

#### Step 2: Initial Server Setup

SSH into your droplet:
```bash
ssh root@your_droplet_ip
```

Update system:
```bash
apt update && apt upgrade -y
apt install python3-pip python3-venv postgresql postgresql-contrib nginx certbot python3-certbot-nginx git -y
```

#### Step 3: Setup PostgreSQL

```bash
sudo -u postgres psql
```

In PostgreSQL:
```sql
CREATE DATABASE portfolio_db;
CREATE USER portfolio_user WITH PASSWORD 'your_secure_password';
ALTER ROLE portfolio_user SET client_encoding TO 'utf8';
ALTER ROLE portfolio_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE portfolio_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;
\q
```

#### Step 4: Deploy Backend

```bash
cd /var/www
git clone https://github.com/yourusername/portfolio.git
cd portfolio/backend

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `.env`:
```bash
nano .env
```

Add:
```env
DJANGO_SECRET_KEY=your-generated-secret-key
DEBUG=False
ALLOWED_HOSTS=hijbullah.me,www.hijbullah.me,api.hijbullah.me
DATABASE_URL=postgresql://portfolio_user:your_secure_password@localhost/portfolio_db
CORS_ALLOWED_ORIGINS=https://hijbullah.me,https://www.hijbullah.me
CORS_ALLOW_ALL_ORIGINS=False
```

Run migrations:
```bash
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser
```

#### Step 5: Setup Gunicorn

Create systemd service:
```bash
nano /etc/systemd/system/portfolio.service
```

Add:
```ini
[Unit]
Description=Portfolio Django Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/portfolio/backend
Environment="PATH=/var/www/portfolio/backend/venv/bin"
ExecStart=/var/www/portfolio/backend/venv/bin/gunicorn --workers 3 --bind unix:/var/www/portfolio/backend/portfolio.sock config.wsgi:application

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
systemctl start portfolio
systemctl enable portfolio
```

#### Step 6: Setup Nginx

```bash
nano /etc/nginx/sites-available/hijbullah.me
```

Add:
```nginx
# Backend API
server {
    listen 80;
    server_name api.hijbullah.me;

    location / {
        proxy_pass http://unix:/var/www/portfolio/backend/portfolio.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /media/ {
        alias /var/www/portfolio/backend/media/;
    }

    location /static/ {
        alias /var/www/portfolio/backend/staticfiles/;
    }
}

# Frontend
server {
    listen 80;
    server_name hijbullah.me www.hijbullah.me;

    root /var/www/portfolio/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/hijbullah.me /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Step 7: Build Frontend

```bash
cd /var/www/portfolio/frontend
nano .env.production
```

Add:
```env
VITE_API_BASE_URL=https://api.hijbullah.me/api
```

Build:
```bash
npm install
npm run build
```

#### Step 8: SSL Certificates

```bash
certbot --nginx -d hijbullah.me -d www.hijbullah.me -d api.hijbullah.me
```

Follow prompts to get SSL certificates.

#### Step 9: Configure Namecheap DNS

In Namecheap Advanced DNS:
```
Type    Host    Value                   TTL
A       @       your_droplet_ip        Automatic
A       api     your_droplet_ip        Automatic
CNAME   www     hijbullah.me           Automatic
```

---

## Option 3: Render (Backend) + Netlify (Frontend)

### Very similar to Railway + Vercel

#### Backend on Render

1. Go to [render.com](https://render.com)
2. New Web Service → Connect GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn config.wsgi:application`
4. Add PostgreSQL database (free tier available)
5. Add environment variables (same as Railway)
6. Custom domain: `api.hijbullah.me`

#### Frontend on Netlify

1. Go to [netlify.com](https://netlify.com)
2. New site from Git → your repo
3. Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. Environment variables:
   - `VITE_API_BASE_URL` = `https://api.hijbullah.me/api`
5. Custom domain: `hijbullah.me`

---

## Media Files Storage (Important!)

### Option A: AWS S3 (Recommended for production)

1. Create AWS account
2. Create S3 bucket: `hijbullah-portfolio-media`
3. Install packages:
```bash
pip install boto3 django-storages
```

4. Update `backend/config/settings.py`:
```python
INSTALLED_APPS += ['storages']

# AWS S3 Settings
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME', 'hijbullah-portfolio-media')
AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
AWS_DEFAULT_ACL = 'public-read'

# Media files
MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
```

5. Add to environment variables:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_STORAGE_BUCKET_NAME=hijbullah-portfolio-media
```

### Option B: Use Backend Server Storage (Simple)

Already configured in your settings - media files saved to `backend/media/`

---

## Post-Deployment Checklist

- [ ] Backend accessible at `https://api.hijbullah.me`
- [ ] Frontend accessible at `https://hijbullah.me`
- [ ] SSL certificates working (https)
- [ ] Admin panel login working at `/dashboard/login`
- [ ] Can create/edit projects with image uploads
- [ ] API endpoints returning data
- [ ] Database migrations applied
- [ ] Static files serving correctly
- [ ] Media files uploading and displaying
- [ ] CORS configured correctly

---

## Troubleshooting

### Backend not starting
```bash
# Check logs on Railway/Render
railway logs

# Check for migration issues
railway run python manage.py showmigrations
railway run python manage.py migrate
```

### Frontend can't reach backend
- Check CORS settings in backend
- Verify `VITE_API_BASE_URL` is correct
- Check browser console for errors

### Images not uploading
- Check media file settings
- Verify storage permissions (S3 or server)
- Check file size limits in settings

### Database connection failed
- Verify DATABASE_URL format
- Check PostgreSQL service is running
- Verify user permissions

---

## Recommended Approach for You

**I recommend: Railway (Backend) + Vercel (Frontend)**

**Pros:**
- ✅ Easiest setup (< 30 minutes)
- ✅ Free tier available
- ✅ Auto-deployments on git push
- ✅ Built-in PostgreSQL
- ✅ SSL certificates automatic
- ✅ Good performance
- ✅ Easy scaling

**Total Cost:**
- Free tier: $0/month (with limitations)
- Hobby tier: ~$5-10/month (recommended)

**Next Steps:**
1. Follow "Option 1: Railway + Vercel" above
2. Start with Railway backend deployment
3. Then deploy frontend to Vercel
4. Configure DNS on Namecheap
5. Wait for DNS propagation
6. Test everything works
7. Add your content!

Need help with any specific step? Let me know!
