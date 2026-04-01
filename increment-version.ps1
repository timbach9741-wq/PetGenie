# increment-version.ps1 - build.gradle의 versionCode/versionName 자동 증가
param(
    [string]$GradleFile = "android\app\build.gradle"
)

$content = Get-Content $GradleFile -Raw

# versionCode 증가
if ($content -match 'versionCode\s+(\d+)') {
    $oldCode = [int]$Matches[1]
    $newCode = $oldCode + 1
    $content = $content -replace "versionCode\s+$oldCode", "versionCode $newCode"
}

# versionName 증가 (patch version +1)
if ($content -match 'versionName\s+"(\d+)\.(\d+)\.(\d+)"') {
    $major = $Matches[1]
    $minor = $Matches[2]
    $patch = [int]$Matches[3] + 1
    $oldName = "$($Matches[1]).$($Matches[2]).$($Matches[3])"
    $newName = "$major.$minor.$patch"
    $content = $content -replace "versionName\s+""$([regex]::Escape($oldName))""", "versionName ""$newName"""
}

Set-Content -Path $GradleFile -Value $content -NoNewline

# 결과 출력 (deploy.bat에서 읽음)
Write-Host "CODE_OLD=$oldCode"
Write-Host "CODE_NEW=$newCode"
Write-Host "NAME_OLD=$oldName"
Write-Host "NAME_NEW=$newName"
