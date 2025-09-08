@echo off
echo Setting up React Authentication App...
echo.

echo Installing React dependencies...
call npm install
echo.

echo Database setup instructions:
echo 1. Make sure MySQL is running
echo 2. Create database and run schema:
echo    mysql -u root -p ^< backend/database/schema.sql
echo 3. Update database credentials in backend/config/database.php if needed
echo.

echo Starting PHP backend server...
start "PHP Backend" cmd /k "cd backend && php -S localhost:8000"
echo.

echo Starting React development server...
start "React Frontend" cmd /k "npm start"
echo.

echo Setup complete!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000
echo.
pause





