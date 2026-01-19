@echo off
echo Cleaning port 3000...

REM Kill any process using port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /F /PID %%a 2>nul
)

echo Port 3000 cleared!
echo Starting Next.js dev server...
echo.

cd /d "%~dp0"
call npm run dev
