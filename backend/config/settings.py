import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "unsafe-dev-key-change-me")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

ALLOWED_HOSTS = [host.strip() for host in os.getenv("ALLOWED_HOSTS", "*").split(",") if host.strip()]

INSTALLED_APPS = [
    "jazzmin",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "cloudinary_storage",
    "django.contrib.staticfiles",
    "cloudinary",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "apps.core",
    "apps.hero",
    "apps.about",
    "apps.skills",
    "apps.projects",
    "apps.education",
    "apps.research",
    "apps.experience",
    "apps.achievements",
    "apps.ai_lab",
    "apps.contact",
    "apps.hire",
    "apps.site_settings",
    "apps.users",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    # "django.middleware.clickjacking.XFrameOptionsMiddleware",  # Allow iframes for PDF viewing
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": dj_database_url.config(default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}", conn_max_age=600)
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Cloudinary configuration for media file storage
import cloudinary

CLOUDINARY_STORAGE = {
    'CLOUDINARY_URL': os.getenv('CLOUDINARY_URL', ''),
}

cloudinary.config(
    cloudinary_url=os.getenv('CLOUDINARY_URL', ''),
)

# Storage backends - Use Cloudinary for media files
STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.StaticFilesStorage",
    },
}

# Backwards compatibility for django-cloudinary-storage
STATICFILES_STORAGE = "whitenoise.storage.StaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": int(os.getenv("PAGE_SIZE", "10")),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", "30"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", "7"))),
}

# CORS Settings
CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL_ORIGINS", "True").lower() == "true"

# For production, use specific origins
if not CORS_ALLOW_ALL_ORIGINS:
    CORS_ALLOWED_ORIGINS = [
        origin.strip() 
        for origin in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",") 
        if origin.strip()
    ]

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# ===========================
# JAZZMIN ADMIN THEME CONFIG
# ===========================

JAZZMIN_SETTINGS = {
    # Site branding
    "site_title": "HijbullahHub CMS",
    "site_header": "AI Engineer Control Panel",
    "site_brand": "HijbullahHub",
    "site_logo": None,
    "site_icon": None,
    
    # Welcome text
    "welcome_sign": "Welcome to HijbullahHub CMS - Page-Based Content Management",
    "copyright": "HijbullahHub 2026",
    
    # Search model
    "search_model": ["auth.User", "projects.Project", "ai_lab.AILab", "research.Research"],
    
    # User menu
    "user_avatar": None,
    
    # Top menu - Page-based navigation
    "topmenu_links": [
        {"name": "Dashboard",  "url": "admin:index", "permissions": ["auth.view_user"], "icon": "fas fa-home"},
        {"name": "View Live Site", "url": "http://localhost:5174", "new_window": True, "icon": "fas fa-external-link-alt"},
    ],
    
    # User menu on the right side
    "usermenu_links": [
        {"name": "Admin Profile", "url": "admin:auth_user_change", "icon": "fas fa-user"},
        {"name": "Site Settings", "url": "admin:site_settings_sitesetting_changelist", "icon": "fas fa-cog"},
    ],
    
    # Custom side menu - Organized by PAGES (matching frontend navbar)
    "custom_links": {
        "📄 PAGE MANAGEMENT": [
            {
                "name": "🏠 Home Page Content",
                "url": "#",
                "children": [
                    {"name": "Hero Section", "url": "admin:hero_hero_changelist", "icon": "fas fa-star"},
                    {"name": "About Section", "url": "admin:about_about_changelist", "icon": "fas fa-user-circle"},
                    {"name": "Skills", "url": "admin:skills_skill_changelist", "icon": "fas fa-code"},
                    {"name": "Experience", "url": "admin:experience_experience_changelist", "icon": "fas fa-briefcase"},
                    {"name": "Achievements", "url": "admin:achievements_achievement_changelist", "icon": "fas fa-trophy"},
                    {"name": "AI Lab Metrics", "url": "admin:ai_lab_ailab_changelist", "icon": "fas fa-robot"},
                ]
            },
            {
                "name": "📁 Projects Page",
                "url": "admin:projects_project_changelist",
                "icon": "fas fa-project-diagram",
                "children": [
                    {"name": "All Projects", "url": "admin:projects_project_changelist", "icon": "fas fa-folder"},
                    {"name": "Project Images", "url": "admin:projects_projectimage_changelist", "icon": "fas fa-images"},
                    {"name": "Tech Tags", "url": "admin:projects_tag_changelist", "icon": "fas fa-tags"},
                ]
            },
            {
                "name": "🔬 Research Page",
                "url": "admin:research_research_changelist",
                "icon": "fas fa-flask",
            },
            {
                "name": "📧 Contact Page",
                "url": "admin:contact_contact_changelist",
                "icon": "fas fa-envelope",
            },
        ],
    },
    
    # Side menu ordering
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    
    # Side menu app and model ordering (legacy support)
    "order_with_respect_to": [
        "auth",
        "site_settings",
        "hero",
        "about",
        "skills",
        "experience",
        "achievements",
        "ai_lab",
        "projects",
        "research",
        "contact",
    ],
    
    # Custom icons for apps/models
    "icons": {
        "auth": "fas fa-shield-alt",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "site_settings": "fas fa-cogs",
        "site_settings.SiteSetting": "fas fa-cog",
        "hero": "fas fa-home",
        "hero.Hero": "fas fa-star",
        "about": "fas fa-user-circle",
        "about.About": "fas fa-address-card",
        "skills": "fas fa-code",
        "skills.Skill": "fas fa-laptop-code",
        "experience": "fas fa-briefcase",
        "experience.Experience": "fas fa-building",
        "achievements": "fas fa-trophy",
        "achievements.Achievement": "fas fa-medal",
        "ai_lab": "fas fa-brain",
        "ai_lab.AILab": "fas fa-robot",
        "projects": "fas fa-folder-open",
        "projects.Project": "fas fa-project-diagram",
        "projects.Tag": "fas fa-tags",
        "projects.ProjectImage": "fas fa-images",
        "research": "fas fa-microscope",
        "research.Research": "fas fa-flask",
        "contact": "fas fa-inbox",
        "contact.Contact": "fas fa-envelope",
    },
    
    # Icons for side menu default icons
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
    
    # UI Tweaks
    "related_modal_active": False,
    "custom_css": None,
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,
    
    # Change view button
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "vertical_tabs",
    },
}

# UI Tweaks
JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-dark",
    "accent": "accent-primary",
    "navbar": "navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": False,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": False,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "darkly",
    "dark_mode_theme": "darkly",
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
}
