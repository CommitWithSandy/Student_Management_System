@echo off
@REM Maven wrapper proxy invoking installed Maven
where mvn.cmd >nul 2>nul
if %ERRORLEVEL% equ 0 (
    mvn.cmd %*
) else if exist "C:\apache-maven-3.9.12\bin\mvn.cmd" (
    "C:\apache-maven-3.9.12\bin\mvn.cmd" %*
) else (
    mvn %*
)
