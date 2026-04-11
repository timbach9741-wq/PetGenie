#Requires -Version 5.1
param([switch]$SkipOpen)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$AndroidDir = Join-Path $ProjectRoot "android"
$GradleFile = Join-Path $AndroidDir "app\build.gradle"
$AabOutput = Join-Path $AndroidDir "app\build\outputs\bundle\release\app-release.aab"
$DesktopPath = [System.Environment]::GetFolderPath("Desktop")

# --- JAVA_HOME ---
$jbrPath = "C:\Program Files\Android\Android Studio\jbr"
if (Test-Path $jbrPath) {
    $env:JAVA_HOME = $jbrPath
} else {
    $jdkPaths = Get-ChildItem "C:\Program Files\Java" -Filter "jdk-*" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($jdkPaths) {
        $env:JAVA_HOME = $jdkPaths.FullName
    } else {
        Write-Host "[ERROR] JAVA_HOME not found." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  Pet Genie - Auto Build and Deploy"    -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host "  JAVA_HOME: $env:JAVA_HOME" -ForegroundColor DarkGray
Write-Host ""

$totalStart = Get-Date
$newCode = 0
$newName = "0.0.0"

# --- STEP 1: Read current version from build.gradle ---
Write-Host "[1/6] Reading version from build.gradle..." -ForegroundColor Cyan

$content = Get-Content $GradleFile -Raw

if ($content -match 'versionCode\s+(\d+)') {
    $newCode = [int]$Matches[1]
    Write-Host "  versionCode: $newCode" -ForegroundColor Yellow
}

if ($content -match 'versionName\s+"(\d+\.\d+\.\d+)"') {
    $newName = $Matches[1]
    Write-Host "  versionName: $newName" -ForegroundColor Yellow
}

Write-Host "  [OK] Version confirmed" -ForegroundColor Green

# --- STEP 2: Vite build ---
Write-Host ""
Write-Host "[2/6] Vite production build..." -ForegroundColor Cyan

Push-Location $ProjectRoot
try {
    $viteBuild = Start-Process -FilePath "npx.cmd" -ArgumentList "vite","build" -NoNewWindow -Wait -PassThru
    if ($viteBuild.ExitCode -ne 0) { throw "Vite build failed" }
    Write-Host "  [OK] dist/ build complete" -ForegroundColor Green
} finally {
    Pop-Location
}

# --- STEP 3: Capacitor sync ---
Write-Host ""
Write-Host "[3/6] Capacitor Android sync..." -ForegroundColor Cyan

Push-Location $ProjectRoot
try {
    $capSync = Start-Process -FilePath "npx.cmd" -ArgumentList "cap","sync","android" -NoNewWindow -Wait -PassThru
    if ($capSync.ExitCode -ne 0) { throw "Capacitor sync failed" }
    Write-Host "  [OK] Web -> Android sync complete" -ForegroundColor Green
} finally {
    Pop-Location
}

# --- STEP 4: Gradle AAB build ---
Write-Host ""
Write-Host "[4/6] Building signed AAB... (this takes a while)" -ForegroundColor Cyan

Push-Location $AndroidDir
try {
    $gradleBuild = Start-Process -FilePath ".\gradlew.bat" -ArgumentList "bundleRelease" -NoNewWindow -Wait -PassThru
    if ($gradleBuild.ExitCode -ne 0) { throw "Gradle build failed" }
    Write-Host "  [OK] AAB build complete" -ForegroundColor Green
} finally {
    Pop-Location
}

# --- STEP 5: Copy AAB to Desktop ---
Write-Host ""
Write-Host "[5/6] Copying AAB to Desktop..." -ForegroundColor Cyan

if (Test-Path $AabOutput) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $destFile = "PetGenie_v${newName}_${timestamp}.aab"
    $destPath = Join-Path $DesktopPath $destFile
    Copy-Item -Path $AabOutput -Destination $destPath -Force
    $fileSize = [math]::Round((Get-Item $destPath).Length / 1MB, 2)
    Write-Host "  File: $destFile" -ForegroundColor Yellow
    Write-Host "  Size: ${fileSize}MB" -ForegroundColor Yellow
    Write-Host "  Path: $destPath" -ForegroundColor Yellow
    Write-Host "  [OK] Copied to Desktop" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] AAB not found: $AabOutput" -ForegroundColor Red
    exit 1
}

# --- STEP 6: Open Google Play Console ---
Write-Host ""
Write-Host "[6/6] Opening Google Play Console..." -ForegroundColor Cyan

if (-not $SkipOpen) {
    Start-Process "https://play.google.com/console"
    Write-Host "  Browser opened. Upload $destFile" -ForegroundColor Yellow
} else {
    Write-Host "  Skipped (-SkipOpen)" -ForegroundColor DarkGray
}

# --- DONE ---
$elapsed = [math]::Round(((Get-Date) - $totalStart).TotalSeconds, 1)

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  BUILD COMPLETE!" -ForegroundColor Green
Write-Host "  Time: ${elapsed}s" -ForegroundColor Green
Write-Host "  Version: v${newName} (code: ${newCode})" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
