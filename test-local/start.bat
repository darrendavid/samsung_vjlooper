@echo off
echo ================================================
echo Video Looper - Local Test Server (Windows)
echo ================================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Create videos directory if it doesn't exist
if not exist "videos\" (
    echo Creating videos directory...
    mkdir videos
    echo.
    echo Please add some video files to: %CD%\videos
    echo.
)

REM Start the server
echo Starting server...
echo.
node local-server.js

pause
