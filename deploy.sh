#!/bin/bash

echo "🚀 Quick Deploy to hijbullah.me"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
fi

echo "📋 Pre-deployment Checklist:"
echo ""
echo "1. ✅ Created railway.json, Procfile, runtime.txt"
echo "2. ✅ Created vercel.json"
echo "3. ✅ Created .env.production files"
echo ""

echo "🔐 Generate Django Secret Key (copy this):"
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
echo ""

echo "📝 Next Steps:"
echo ""
echo "BACKEND (Railway):"
echo "1. Go to https://railway.app and sign in with GitHub"
echo "2. Click 'New Project' → 'Deploy from GitHub repo'"
echo "3. Select this repository"
echo "4. Add PostgreSQL: Click '+' → 'Database' → 'PostgreSQL'"
echo "5. Go to backend service → Variables, add:"
echo "   - DJANGO_SECRET_KEY (use generated key above)"
echo "   - DEBUG=False"
echo "   - ALLOWED_HOSTS=hijbullah.me,www.hijbullah.me,api.hijbullah.me,*.railway.app"
echo "   - CORS_ALLOWED_ORIGINS=https://hijbullah.me,https://www.hijbullah.me"
echo "   - DATABASE_URL=\${{Postgres.DATABASE_URL}}"
echo "6. Click 'Settings' → 'Generate Domain' or add 'api.hijbullah.me'"
echo "7. Note your backend URL"
echo ""

echo "FRONTEND (Vercel):"
echo "1. Go to https://vercel.com and sign in with GitHub"
echo "2. Click 'Add New' → 'Project'"
echo "3. Import this repository"
echo "4. Settings:"
echo "   - Framework: Vite"
echo "   - Root Directory: frontend"
echo "   - Build Command: npm run build"
echo "   - Output Directory: dist"
echo "5. Environment Variable:"
echo "   - VITE_API_BASE_URL=https://api.hijbullah.me/api"
echo "6. Deploy"
echo "7. Add custom domain: hijbullah.me"
echo ""

echo "DNS (Namecheap):"
echo "1. Login to Namecheap → Domain List → hijbullah.me → Manage"
echo "2. Go to 'Advanced DNS'"
echo "3. Add records:"
echo "   A       @       76.76.19.19              (Vercel)"
echo "   CNAME   www     cname.vercel-dns.com     (Vercel)"
echo "   CNAME   api     your-app.railway.app     (Railway)"
echo ""

echo "CREATE SUPERUSER (after Railway deployment):"
echo "1. In Railway → backend service → click 'Shell'"
echo "2. Run: python manage.py createsuperuser"
echo "   Or use: railway run python manage.py shell -c \"from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('hijbullah', 'hijbullah119445@gmail.com', 'hijbullahpf')\""
echo ""

echo "✅ All deployment files are ready!"
echo "📦 Commit and push to GitHub to start deployment"
echo ""

read -p "Push to GitHub now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    git add .
    git commit -m "Add deployment configuration for hijbullah.me"
    git push origin main
    echo "✅ Pushed to GitHub! Now follow the steps above to deploy."
else
    echo "ℹ️  Remember to push to GitHub when ready:"
    echo "   git add ."
    echo "   git commit -m 'Add deployment configuration'"
    echo "   git push origin main"
fi
