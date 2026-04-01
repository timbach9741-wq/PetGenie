@echo off
chcp 65001 >nul
title Pet Genie - Auto Build and Deploy
color 0A

echo.
echo ======================================
echo   Pet Genie - Auto Build and Deploy
echo ======================================
echo.

cd /d "%~dp0"

:: --- JAVA_HOME ---
if "%JAVA_HOME%"=="" (
    if exist "C:\Program Files\Android\Android Studio\jbr" (
        set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    ) else (
        echo [ERROR] JAVA_HOME not found.
        pause
        exit /b 1
    )
)
echo   JAVA_HOME: %JAVA_HOME%
echo.

:: --- STEP 1: versionCode/versionName auto-increment ---
echo [1/6] versionCode auto-increment...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0increment-version.ps1" -GradleFile "%~dp0android\app\build.gradle"
echo   [OK] build.gradle updated
echo.

:: Read new version values
for /f "tokens=2 delims==" %%a in ('powershell -NoProfile -Command "(Get-Content 'android\app\build.gradle' -Raw) -match 'versionCode\s+(\d+)' | Out-Null; $Matches[1]"') do set "NEW_CODE=%%a"
for /f "delims=" %%a in ('powershell -NoProfile -Command "$c=Get-Content ''android\app\build.gradle'' -Raw; if($c -match ''versionCode\s+(\d+)''){$Matches[1]}"') do set "NEW_CODE=%%a"
for /f "delims=" %%a in ('powershell -NoProfile -Command "$c=Get-Content ''android\app\build.gradle'' -Raw; if($c -match ''versionName\s+\x22(\d+\.\d+\.\d+)\x22''){$Matches[1]}"') do set "NEW_NAME=%%a"

echo   Current: v%NEW_NAME% (code: %NEW_CODE%)
echo.

:: --- STEP 2: Vite build ---
echo [2/6] Vite production build...
call npx vite build
if %ERRORLEVEL% neq 0 (
    echo [FAIL] Vite build failed
    pause
    exit /b 1
)
echo   [OK] dist/ build complete
echo.

:: --- STEP 3: Capacitor sync ---
echo [3/6] Capacitor Android sync...
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo [FAIL] Capacitor sync failed
    pause
    exit /b 1
)
echo   [OK] Web to Android sync complete
echo.

:: --- STEP 4: Gradle AAB build ---
echo [4/6] Building signed AAB...
cd android
call .\gradlew.bat bundleRelease
if %ERRORLEVEL% neq 0 (
    echo [FAIL] Gradle build failed
    cd ..
    pause
    exit /b 1
)
cd ..
echo   [OK] AAB build complete
echo.

:: --- STEP 5: Copy AAB to Desktop ---
echo [5/6] Copying AAB to Desktop...
set "AAB_SRC=android\app\build\outputs\bundle\release\app-release.aab"

for /f "delims=" %%d in ('powershell -NoProfile -Command "Get-Date -Format ''yyyyMMdd_HHmmss''"') do set "TIMESTAMP=%%d"
set "DEST_FILE=PetGenie_v%NEW_NAME%_%TIMESTAMP%.aab"
set "DEST_PATH=%USERPROFILE%\Desktop\%DEST_FILE%"

if exist "%AAB_SRC%" (
    copy /y "%AAB_SRC%" "%DEST_PATH%" >nul
    echo   File: %DEST_FILE%
    echo   Path: %DEST_PATH%
    echo   [OK] Copied to Desktop
) else (
    echo   [FAIL] AAB not found
    pause
    exit /b 1
)
echo.

:: --- STEP 6: Open Google Play Console ---
echo [6/6] Opening Google Play Console...
start "" "https://play.google.com/console"
echo   Browser opened. Upload the AAB file.
echo.

:: --- DONE ---
echo ======================================
echo   BUILD COMPLETE!
echo   Version: v%NEW_NAME% (code: %NEW_CODE%)
echo ======================================
echo.
echo   Press any key to close...
pause >nul
