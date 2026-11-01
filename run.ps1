# EduTrack Pro - Unified Student Management System Launcher
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "         EduTrack Pro - Unified Student Management System" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend and backend are fully integrated into a single application." -ForegroundColor Green
Write-Host "Application URL: http://localhost:8080" -ForegroundColor Yellow
Write-Host ""

$backendDir = Join-Path $PSScriptRoot "backend"
Set-Location $backendDir

& .\mvnw.cmd spring-boot:run
