@echo off
echo ========================================
echo Django Secret Key Generator
echo ========================================
echo.
python -c "from django.core.management.utils import get_random_secret_key; print('Generated Secret Key:'); print(get_random_secret_key())"
echo.
echo ========================================
echo Copy this key for Railway deployment!
echo ========================================
pause
