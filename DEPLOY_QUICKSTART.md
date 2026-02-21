# 🚀 Deploy to hijbullah.me - Quick Start

## ⚡ Fastest Way (30 minutes)

### 1. Generate Secret Key

Run this in your terminal:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Copy the output - you'll need it!

---

### 2. Deploy Backend to Railway (10 min)

1. **Sign up**: Go to [railway.app](https://railway.app) → Sign in with GitHub

2. **Create Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your portfolio repository
   - Railway auto-detects Django ✅

3. **Add Database**:
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - It auto-connects to your backend ✅

4. **Set Environment Variables**:
   - Go to your backend service
   - Click "Variables" tab
   - Add these (click "New Variable" for each):

```env
DJANGO_SECRET_KEY=<paste-your-generated-key-here>
DEBUG=False
ALLOWED_HOSTS=hijbullah.me,www.hijbullah.me,api.hijbullah.me,*.railway.app
DATABASE_URL=${{Postgres.DATABASE_URL}}
CORS_ALLOWED_ORIGINS=https://hijbullah.me,https://www.hijbullah.me
CORS_ALLOW_ALL_ORIGINS=False
```

5. **Get Backend URL**:
   - Click "Settings" → "Networking"
   - Click "Generate Domain"
   - Or add custom domain: `api.hijbullah.me`
   - **Save this URL!**

---

### 3. Deploy Frontend to Vercel (5 min)

1. **Sign up**: Go to [vercel.com](https://vercel.com) → Sign in with GitHub

2. **Import Project**:
   - Click "Add New" → "Project"
   - Select your portfolio repository
   - Click "Import"

3. **Configure Build**:
   - Framework Preset: **Vite** (auto-detected)
   - Root Directory: **frontend**
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `dist` (auto-filled)

4. **Add Environment Variable**:
   - Click "Environment Variables"
   - Add:
     - Name: `VITE_API_BASE_URL`
     - Value: `https://api.hijbullah.me/api`
   - Click "Add"

5. **Deploy**: Click "Deploy" button

---

### 4. Configure Domain on Namecheap (10 min)

1. **Login to Namecheap**:
   - Go to [namecheap.com](https://namecheap.com)
   - Domain List → hijbullah.me → Manage

2. **Go to Advanced DNS**

3. **Add DNS Records**:

| Type  | Host | Value                  | TTL       |
|-------|------|------------------------|-----------|
| A     | @    | 76.76.19.19           | Automatic |
| CNAME | www  | cname.vercel-dns.com  | Automatic |
| CNAME | api  | your-app.railway.app  | Automatic |

**Replace `your-app.railway.app` with your actual Railway domain!**

4. **Save Changes**

---

### 5. Add Custom Domains

#### In Vercel:
1. Go to your project → Settings → Domains
2. Add domain: `hijbullah.me` → Add
3. Add domain: `www.hijbullah.me` → Add
4. Vercel verifies automatically ✅

#### In Railway:
1. Go to backend service → Settings
2. Click "Custom Domain"
3. Enter: `api.hijbullah.me`
4. Click "Add"
5. Railway verifies automatically ✅

---

### 6. Create Admin User (5 min)

**Wait 5 minutes after Railway deployment completes**

Then, in Railway:
1. Go to your backend service
2. Click "Shell" (top right)
3. Run this command:

```bash
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('hijbullah', 'hijbullah119445@gmail.com', 'hijbullahpf')"
```

---

### 7. Test Everything ✅

Wait **15-30 minutes** for DNS to propagate, then test:

1. **Frontend**: https://hijbullah.me
   - Should load your portfolio ✅

2. **Backend API**: https://api.hijbullah.me/api/projects/
   - Should return JSON (empty array initially) ✅

3. **Admin Login**: https://hijbullah.me/dashboard/login
   - Username: `hijbullah`
   - Password: `hijbullahpf`
   - Should log you in ✅

4. **Add Content**:
   - Create a project with images
   - Should appear on homepage ✅

---

## 🎉 You're Live!

Your portfolio is now deployed at:
- **Website**: https://hijbullah.me
- **API**: https://api.hijbullah.me
- **Admin**: https://hijbullah.me/dashboard

---

## 📝 Common Issues

### DNS not working yet
- Wait 30-60 minutes for DNS propagation
- Use [dnschecker.org](https://dnschecker.org) to check status

### Backend 500 error
- Check Railway logs: Service → Deployments → View logs
- Verify all environment variables are set
- Check DATABASE_URL is connected

### Frontend can't reach backend  
- Verify `VITE_API_BASE_URL` is correct in Vercel
- Check CORS settings in Railway variables
- Check browser console for errors

### Images not uploading
- Check Railway logs
- Increase Railway disk size if needed

---

## 💰 Costs

### Free Tier (Testing):
- Railway: $5 free credit/month
- Vercel: Free
- **Total: FREE** for first month

### Paid (Production):
- Railway: ~$5/month (Hobby plan)
- Vercel: Free
- Namecheap: ~$12/year (already paid)
- **Total: ~$5/month**

---

## 🔄 Future Updates

Every time you push to GitHub:
1. Railway auto-deploys backend ✅
2. Vercel auto-deploys frontend ✅

No manual deployment needed!

---

## 📚 Full Documentation

For detailed guides and alternative deployment methods, see:
- [DEPLOYMENT_HIJBULLAH.ME.md](./DEPLOYMENT_HIJBULLAH.ME.md)

---

## 🆘 Need Help?

If you get stuck:
1. Check Railway logs
2. Check Vercel logs
3. Check browser console (F12)
4. Check DNS propagation status

Most issues resolve themselves after DNS propagates (30-60 minutes).

---

**Good luck! 🚀**
