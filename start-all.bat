@echo off
echo ========================================
echo Starting MedSpeak Application
echo ========================================
echo.

echo [1/3] Installing CORS dependency...
cd "Swasya AI backend"
call npm install cors
echo.

echo [2/3] Starting Backend Server...
start "MedSpeak Backend" cmd /k "npm start"
timeout /t 3 /nobreak >nul
echo.

echo [3/3] Starting Frontend Server...
cd ..
cd "Swasya AI frontend"
start "MedSpeak Frontend" cmd /k "npm run dev"
echo.

echo ========================================
echo Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ========================================
pause