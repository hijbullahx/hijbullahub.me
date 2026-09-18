import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from corsheaders.defaults import default_headers
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY") or os.getenv("DJANGO_SECRET_KEY", "unsafe-dev-key-change-me")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Host configuration
_raw_hosts = os.getenv("ALLOWED_HOSTS", "*")
ALLOWED_HOSTS = [host.strip() for host in _raw_hosts.split(",") if host.strip()]
if DEBUG:
    for _local in ["127.0.0.1", "localhost", "testserver"]:
        if _local not in ALLOWED_HOSTS:
            ALLOWED_HOSTS.append(_local)

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
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "apps.core.context_processors.global_site_context",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# PyMySQL driver setup for MySQL in cPanel / shared hosting environments
DB_ENGINE = os.getenv("DB_ENGINE", "mysql" if "mysql" in os.getenv("DATABASE_ENGINE", "") else "postgresql").strip().lower()
if "mysql" in DB_ENGINE:
    try:
        import pymysql
        pymysql.install_as_MySQLdb()
    except ImportError:
        pass

# Database Configuration: Reads MySQL/PostgreSQL parameters from environment variables
DB_NAME = os.getenv("DATABASE_NAME", "").strip()
DB_USER = os.getenv("DATABASE_USER", "").strip()
DB_PASSWORD = os.getenv("DATABASE_PASSWORD", "").strip()
DB_HOST = os.getenv("DATABASE_HOST", "localhost").strip()
DB_PORT = os.getenv("DATABASE_PORT", "").strip()
USE_SQLITE = os.getenv("USE_SQLITE", "False").lower() == "true"

if DB_NAME and not USE_SQLITE:
    if "mysql" in DB_ENGINE:
        engine = "django.db.backends.mysql"
        port = DB_PORT or "3306"
    else:
        engine = "django.db.backends.postgresql"
        port = DB_PORT or "5432"

    DATABASES = {
        "default": {
            "ENGINE": engine,
            "NAME": DB_NAME,
            "USER": DB_USER,
            "PASSWORD": DB_PASSWORD,
            "HOST": DB_HOST,
            "PORT": port,
            "CONN_MAX_AGE": 60,
        }
    }
elif os.getenv("DATABASE_URL"):
    DATABASES = {
        "default": dj_database_url.config(
            default=os.getenv("DATABASE_URL"),
            conn_max_age=60,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
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
STATICFILES_DIRS = [BASE_DIR / "static"]

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Cloudinary configuration for media file storage
import cloudinary

CLOUDINARY_URL = os.getenv('CLOUDINARY_URL', '').strip()
USE_CLOUDINARY = bool(CLOUDINARY_URL and "dummy" not in CLOUDINARY_URL and not CLOUDINARY_URL.startswith("cloudinary://dummy"))

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME', 'dummy'),
    'API_KEY': os.getenv('CLOUDINARY_API_KEY', '123456789012345'),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET', 'dummy_secret'),
}

if USE_CLOUDINARY:
    CLOUDINARY_STORAGE['CLOUDINARY_URL'] = CLOUDINARY_URL
    cloudinary.config(cloudinary_url=CLOUDINARY_URL)
    STORAGES = {
        "default": {
            "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.StaticFilesStorage",
        },
    }
else:
    # Use reliable local file storage for development
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.StaticFilesStorage",
        },
    }



# Ensure STATICFILES_DIRS is not empty so collectstatic creates the dir
STATICFILES_DIRS = [
    BASE_DIR / "static",
]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": int(os.getenv("PAGE_SIZE", "100")),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", "30"))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", "7"))),
}

# API response cache (in-memory, process-local)
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
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

# Allow browser preflight for clients that include cache-control header.
CORS_ALLOW_HEADERS = (*default_headers, "cache-control")

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# CSRF Trusted Origins for live domain forms and dashboard
_raw_csrf = os.getenv("CSRF_TRUSTED_ORIGINS", "")
if _raw_csrf:
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in _raw_csrf.split(",") if origin.strip()]
else:
    CSRF_TRUSTED_ORIGINS = [
        "https://hijbullah.me",
        "https://www.hijbullah.me",
        "http://hijbullah.me",
        "http://www.hijbullah.me",
    ]

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
        {"name": "View Live Site", "url": "/", "new_window": True, "icon": "fas fa-external-link-alt"},
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

LOGIN_URL = "/dashboard/login/"
LOGIN_REDIRECT_URL = "/dashboard/"
LOGOUT_REDIRECT_URL = "/dashboard/login/"

# Communications & Notifications (SMTP Configuration)
EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = os.getenv("EMAIL_HOST", "mail.hijbullah.me")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 465))
EMAIL_USE_SSL = os.getenv("EMAIL_USE_SSL", "True").lower() == "true"
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "False").lower() == "true"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "info@hijbullah.me")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")

DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "info@hijbullah.me")
SERVER_EMAIL = os.getenv("SERVER_EMAIL", "info@hijbullah.me")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "info@hijbullah.me")
ADMINS = [("Md. Taher Bin Omar Hijbullah", ADMIN_EMAIL)]
MANAGERS = ADMINS

