@echo off
setlocal
title EduTrack Pro - Student Management System

echo ======================================================================
echo          EduTrack Pro - Unified Student Management System
echo ======================================================================
echo.
echo Starting application with frontend and backend connected together...
echo No separate frontend server is required!
echo The unified application will be available at: http://localhost:8080
echo.

cd /d "%~dp0backend"

echo [INFO] Building and starting Spring Boot server (port 8080)...
call mvnw.cmd spring-boot:run

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Application encountered an error.
    pause
)

endlocal
