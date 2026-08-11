@echo off
echo Starting Fundsroom ERP-CRM Backend and Frontend servers...

start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Servers launched!
echo - Backend API: http://localhost:5000
echo - Frontend Application: http://localhost:5173
echo.
