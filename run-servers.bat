@echo off
echo Starting SwapSphere Backend and Chat Server...
echo.

REM Start SwapSphere backend on port 8080
echo [1/2] Starting SwapSphere Backend (port 8080)...
start "SwapSphere Backend" cmd /k "cd SwapSphere && mvnw.cmd spring-boot:run"

REM Wait a bit before starting the second server
timeout /t 3 /nobreak >nul

REM Start Chat server on port 8081
echo [2/2] Starting Chat Server (port 8081)...
REM Check if Maven is available, otherwise use mvnw if it exists
if exist "Chat-App-Spring-Boot\mvnw.cmd" (
    start "Chat Server" cmd /k "cd Chat-App-Spring-Boot && mvnw.cmd spring-boot:run"
) else (
    start "Chat Server" cmd /k "cd Chat-App-Spring-Boot && mvn spring-boot:run"
)

echo.
echo Both servers are starting in separate windows.
echo - SwapSphere Backend: http://localhost:8080
echo - Chat Server: http://localhost:8081
echo.
echo Press any key to exit this window (servers will continue running)...
pause >nul

