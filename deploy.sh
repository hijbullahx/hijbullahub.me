#!/bin/bash
set -e

PROJECT_ROOT="/home/helpline/portfolio"
BACKEND_DIR="${PROJECT_ROOT}/backend"
VENV_PATH="/home/helpline/virtualenv/portfolio/3.11/bin/activate"

echo "=== [1/6] Navigating to repository root ==="
cd "${PROJECT_ROOT}"

echo "=== [2/6] Pulling latest code from GitHub ==="
git pull origin main

echo "=== [3/6] Activating Python Virtual Environment ==="
if [ -f "${VENV_PATH}" ]; then
    source "${VENV_PATH}"
else
    source ~/virtualenv/portfolio/*/bin/activate
fi

echo "=== [4/6] Applying database migrations ==="
cd "${BACKEND_DIR}"
python manage.py migrate --noinput

echo "=== [5/6] Collecting static assets ==="
python manage.py collectstatic --noinput

echo "=== [6/6] Restarting Python application daemon ==="
mkdir -p "${PROJECT_ROOT}/tmp"
touch "${PROJECT_ROOT}/tmp/restart.txt"

if command -v cloudlinux-selector &> /dev/null; then
    cloudlinux-selector restart --json --interpreter python --user helpline --app-root portfolio
fi

echo "=========================================="
echo "✓ Full deployment completed successfully!"
echo "=========================================="
