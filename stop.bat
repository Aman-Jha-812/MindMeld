@echo off
echo Stopping and removing MindMeld containers...
docker-compose down
if %errorlevel% equ 0 (
    echo.
    echo All containers stopped and removed successfully.
) else (
    echo.
    echo Failed to stop containers. Make sure docker-compose.yml exists.
)
pause