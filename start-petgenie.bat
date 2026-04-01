@echo off
title Pet Genie - AI Pet Health Care
color 0A

echo.
echo  ╔════════════════════════════════════════╗
echo  ║     🐾 Pet Genie - Starting...        ║
echo  ╚════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules" (
    echo  [INFO] Installing dependencies...
    call npm install
    echo.
)

:: Build the app first if dist doesn't exist
if not exist "dist" (
    echo  [INFO] Building app for the first time...
    call npx vite build
    echo.
)

echo  [INFO] Starting Pet Genie...
echo  [INFO] Browser will open automatically.
echo  [INFO] Close this window to stop the server.
echo.

:: Start vite preview and open browser
start "" "http://localhost:4173"
call npx vite preview --port 4173
