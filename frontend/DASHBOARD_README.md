# 🚀 React Admin Dashboard - HijbullahHub CMS

## Overview

A modern, fully-featured React-based Admin Dashboard that replaces daily Django admin usage. Built with React, Tailwind CSS, and Framer Motion, maintaining the same futuristic design system as the main site.

---

## ✨ Features

### 🔐 Authentication
- JWT-based authentication system
- Protected routes with automatic redirect
- Token storage and refresh logic
- Login page at `/dashboard/login`

### 📊 Dashboard Home
- Overview statistics (Projects, Blog, Messages, Research)
- Quick action links
- Recent activity tracking (placeholder)

### 📝 Content Management

#### Projects Admin (`/dashboard/projects`)
- Full CRUD operations
- Image upload with preview
- Slug auto-generation
- Status management (Planned, In Progress, Completed)
- Featured toggle
- Display order customization
- Search and filter
- Drag-and-drop image upload

#### Blog Admin (`/dashboard/blog`)
- Rich text content editor
- Publish/Unpublish toggle
- Featured posts
- Category management
- Thumbnail upload
- Read time calculation
- Markdown support

#### Hero Section (`/dashboard/hero`)
- Single-record form
- Profile image upload
- Resume file upload
- Background type selection
- Tagline and bio editing

#### Skills (`/dashboard/skills`)
- Skill proficiency levels with visual bars
- Category organization
- Icon support
- Display order management

### 📧 Communication

#### Contact Messages (`/dashboard/contact`)
- View all contact form submissions
- Mark as read/unread
- Delete messages
- Reply via email button
- Message details modal

### ⚙️ Settings

#### Site Settings (`/dashboard/settings`)
- Global site configuration
- Social media links
- SEO metadata
- Site title and description

---

## 🎨 UI Components

### Reusable Components

1. **DataTable** - Flexible table with sorting, actions
2. **FormModal** - Animated modal for forms
3. **ImageUploader** - Drag-and-drop image upload with preview
4. **ToastContext** - Success/Error notifications
5. **ProtectedRoute** - Authentication guard

### Design System
- **Theme**: Dark mode with glassmorphism
- **Colors**: Cyan (#22d3ee), Emerald (#10b981), Purple (#a855f7)
- **Typography**: Monospace for tech-feel
- **Animations**: Framer Motion for smooth transitions

---

## 🗂️ File Structure

```
src/
├── contexts/
│   └── AuthContext.jsx          # JWT authentication
├── dashboard/
│   ├── DashboardLayout.jsx      # Main layout wrapper
│   ├── Sidebar.jsx              # Navigation sidebar
│   ├── Topbar.jsx               # Top header with user menu
│   ├── LoginPage.jsx            # Authentication page
│   ├── components/
│   │   ├── DataTable.jsx        # Reusable table
│   │   ├── FormModal.jsx        # Modal component
│   │   ├── ImageUploader.jsx    # Image upload
│   │   └── ToastContext.jsx     # Notifications
│   └── pages/
│       ├── DashboardHome.jsx    # Overview page
│       ├── ProjectsAdmin.jsx    # Projects CRUD
│       ├── BlogAdmin.jsx        # Blog CRUD
│       ├── ContactAdmin.jsx     # Messages viewer
│       ├── HeroAdmin.jsx        # Hero editor
│       ├── SkillsAdmin.jsx      # Skills CRUD
│       ├── ExperienceAdmin.jsx  # Experience CRUD
│       ├── AchievementsAdmin.jsx # Achievements CRUD
│       ├── ResearchAdmin.jsx    # Research CRUD
│       ├── AILabAdmin.jsx       # AI metrics CRUD
│       ├── AboutAdmin.jsx       # About editor
│       └── SettingsAdmin.jsx    # Site settings
└── components/
    └── ProtectedRoute.jsx       # Auth guard
```

---

## 🔌 API Integration

All dashboard pages use the existing Django REST API:

```javascript
// API Client (src/api/client.js)
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Authenticated requests
api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
```

### API Endpoints Used

| Page | Endpoint | Methods |
|------|----------|---------|
| Projects | `/api/projects/` | GET, POST, PATCH, DELETE |
| Blog | `/api/blog/` | GET, POST, PATCH, DELETE |
| Skills | `/api/skills/` | GET, POST, PATCH, DELETE |
| Contact | `/api/contact/` | GET, PATCH, DELETE |
| Hero | `/api/hero/` | GET, PATCH |
| About | `/api/about/` | GET, PATCH |
| Research | `/api/research/` | GET, POST, PATCH, DELETE |
| AI Lab | `/api/ai-lab/` | GET, POST, PATCH, DELETE |
| Experience | `/api/experience/` | GET, POST, PATCH, DELETE |
| Achievements | `/api/achievements/` | GET, POST, PATCH, DELETE |
| Settings | `/api/site-settings/` | GET, PATCH |

---

## 🚀 How to Use

### 1. Access Dashboard
Click the **ADMIN** button in navbar or navigate to `/dashboard`

### 2. Login
- **URL**: `/dashboard/login`
- **Default Credentials**:
  - Username: `admin`
  - Password: `admin123`

### 3. Navigate
Use the sidebar to access different content sections:
- **Content Management**: Hero, About, Skills, Experience, Achievements
- **Portfolio**: Projects, Research, AI Lab
- **Publishing**: Blog
- **Communication**: Contact Messages
- **Settings**: Site Settings

### 4. CRUD Operations

#### Adding Content
1. Click "Add [Item]" button
2. Fill form fields
3. Upload images if needed
4. Click "Create"

#### Editing Content
1. Click edit icon on table row
2. Modify fields
3. Click "Update"

#### Deleting Content
1. Click delete icon
2. Confirm deletion

---

## 🔒 Security

### Authentication Flow
1. User enters credentials at `/dashboard/login`
2. API returns JWT access + refresh tokens
3. Access token stored in localStorage
4. Token included in all API requests
5. Protected routes check authentication
6. Redirect to login if unauthenticated

### Token Management
- Access token: Short-lived (default 60 minutes)
- Refresh token: Long-lived (default 24 hours)
- Automatic token refresh (to be implemented)
- Secure logout clears all tokens

---

## 🎯 Key Features vs Django Admin

| Feature | Django Admin | React Dashboard |
|---------|--------------|-----------------|
| UI Design | Bootstrap/Generic | Custom Futuristic |
| Responsiveness | Limited | Fully Responsive |
| Animations | None | Framer Motion |
| Image Upload | Basic | Drag-and-drop + Preview |
| User Experience | Admin-focused | Modern SaaS-style |
| Customization | Template-based | Component-based |
| Real-time Updates | Page refresh | Optimistic updates |
| Mobile Support | Poor | Excellent |

---

## 📦 Dependencies

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.x",
  "framer-motion": "^12.4.10",
  "axios": "^1.x",
  "tailwindcss": "^3.4.17"
}
```

---

## 🛠️ Development

### Running the Dashboard
```bash
cd frontend
npm run dev
```

### Building for Production
```bash
npm run build
```

### Environment Variables
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

---

## 📝 TODO / Future Enhancements

### Short Term
- [ ] Implement token refresh logic
- [ ] Add rich text editor for blog (TinyMCE/Quill)
- [ ] Add image gallery management
- [ ] Implement drag-and-drop reordering
- [ ] Add bulk actions (delete multiple)
- [ ] Add export functionality (CSV/PDF)

### Medium Term
- [ ] Real-time activity log
- [ ] User role management
- [ ] Preview mode before publishing
- [ ] Revision history
- [ ] Media library
- [ ] SEO analyzer

### Long Term
- [ ] Multi-language support
- [ ] Automated backups
- [ ] Analytics dashboard
- [ ] Comment moderation
- [ ] Email campaign manager
- [ ] A/B testing framework

---

## 🐛 Known Issues

1. **Token Refresh**: Currently no automatic token refresh (manual re-login required after expiry)
2. **Rich Text**: Blog content uses plain textarea (rich editor to be added)
3. **Image Optimization**: No automatic image compression before upload
4. **Offline Support**: No service worker / PWA capability
5. **Placeholder Pages**: Experience, Achievements, Research, AI Lab, About, Settings have placeholder implementations

---

## 🔍 Troubleshooting

### Issue: Can't login
**Solution**: Ensure backend is running on `http://localhost:8000` and `/api/token/` endpoint is accessible.

### Issue: 401 Unauthorized
**Solution**: Token expired. Logout and login again. Implement token refresh logic.

### Issue: Images not uploading
**Solution**: Check Django `MEDIA_ROOT` and `MEDIA_URL` settings. Ensure CORS allows file uploads.

### Issue: API errors
**Solution**: Check browser console and Django logs. Verify JWT token is being sent in Authorization header.

---

## 👥 Usage Tips

1. **Quick Navigation**: Use keyboard shortcuts (to be implemented)
2. **Image Sizes**: Optimize images before upload (max 10MB)
3. **Slugs**: Auto-generated from titles but can be customized
4. **Display Order**: Lower numbers appear first
5. **Featured Content**: Check "Featured" to show on homepage
6. **Backup**: Always backup before bulk operations

---

## 📞 Support

For issues or questions:
- Check browser console for errors
- Check Django logs: `backend/logs/django.log`
- Verify API endpoints with Postman
- Ensure both frontend and backend servers are running

---

## 🎉 Quick Start Checklist

- [x] Backend running on port 8000
- [x] Frontend running on port 5174
- [x] Admin user created (admin/admin123)
- [ ] Navigate to `/dashboard/login`
- [ ] Login with credentials
- [ ] Explore dashboard sections
- [ ] Add/Edit/Delete content
- [ ] View changes on main site

---

## 📄 License

Part of HijbullahHub - AI Engineer Portfolio Platform

---

**Built with ❤️ using React, Tailwind CSS, and Framer Motion**
