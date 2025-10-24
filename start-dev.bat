@echo off
setlocal enabledelayedexpansion

echo ╔═══════════════════════════════════════════════════╗
echo ║       MJ CHAUFFAGE Development Environment       ║
echo ╚═══════════════════════════════════════════════════╝
echo.

:: Check for required tools
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is required but not installed. Aborting.
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is required but not installed. Aborting.
    exit /b 1
)

echo 🔧 Setting up Backend...
cd backend

:: Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found in backend/. Creating from template...
    if exist .env.example (
        copy .env.example .env >nul
        echo ✅ Created .env from .env.example
    ) else (
        echo ❌ No .env.example found. Please create backend/.env manually
        exit /b 1
    )
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
)

:: Kill existing process on port 3001
echo ⚠️  Killing any process on port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /f /pid %%a 2>nul

:: Start backend server
echo 🚀 Starting simplified development server (no database)...
npx tsx watch src/server-dev.ts
cd ..

:: Setup Frontend
echo 🎨 Setting up Frontend...
cd frontend

:: Check if .env.local exists
if not exist .env.local (
    echo ⚠️  .env.local file not found in frontend/. Creating...
    echo NEXT_PUBLIC_API_URL=http://localhost:3001> .env.local
    echo NEXT_PUBLIC_SITE_URL=http://localhost:3000>> .env.local
    echo ✅ Created .env.local
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

:: Kill existing process on port 3000
echo ⚠️  Killing any process on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul

:: Start frontend server
echo 🚀 Starting frontend server...
npm run dev
cd ..

pause
