@echo off
echo Building and starting MindMeld containers in detached mode...
docker-compose up --build -d
if %errorlevel% equ 0 (
    echo.
    echo Containers are running in background.
    docker-compose ps
) else (
    echo.
    echo Failed to start containers. Check docker-compose logs for details.
)
pause