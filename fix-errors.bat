@echo off
echo ========================================
echo MJ CHAUFFAGE - Console Errors Fix Script
echo ========================================
echo.

echo Step 1: Validating Backend Environment...
cd backend
call npx ts-node scripts/validate-env.ts
if errorlevel 1 (
    echo.
    echo ERROR: Environment validation failed!
    echo Please check your backend/.env file
    pause
    exit /b 1
)

echo.
echo Step 2: Installing Backend Dependencies...
call npm install

echo.
echo Step 3: Generating Prisma Client...
call npx prisma generate

echo.
echo Step 4: Running Database Migrations...
call npx prisma migrate dev --name fix_console_errors

echo.
echo Step 5: Creating Admin User...
call npx ts-node prisma/seed-admin.ts

echo.
echo Step 6: Installing Frontend Dependencies...
cd ..\frontend
call npm install

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Admin Credentials:
echo   Email: admin@mjchauffage.com
echo   Password: Admin@123
echo.
echo IMPORTANT: Change this password after first login!
echo.
echo To start the servers:
echo   1. Backend:  cd backend  && npm run dev
echo   2. Frontend: cd frontend && npm run dev
echo.
echo Then open: http://localhost:3005/login
echo.
pause
