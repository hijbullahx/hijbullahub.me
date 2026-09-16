#!/bin/bash
set -e

# Activate virtual environment if present
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
fi

echo "--> Applying database migrations..."
python manage.py migrate

echo "--> Collecting static files..."
python manage.py collectstatic --noinput

echo "--> Restarting Gunicorn daemon..."
systemctl restart gunicorn

echo "--> Restarting Nginx web server..."
systemctl restart nginx

echo "=== Deployment finished successfully! ==="
