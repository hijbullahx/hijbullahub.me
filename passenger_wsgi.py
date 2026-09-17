import os
import sys

# Determine the project directory and backend directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(CURRENT_DIR, "backend")

# If running directly inside backend or from project root
if os.path.exists(os.path.join(CURRENT_DIR, "manage.py")):
    if CURRENT_DIR not in sys.path:
        sys.path.insert(0, CURRENT_DIR)
elif os.path.exists(os.path.join(BACKEND_DIR, "manage.py")):
    if BACKEND_DIR not in sys.path:
        sys.path.insert(0, BACKEND_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
