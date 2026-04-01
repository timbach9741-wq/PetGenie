$WshShell = New-Object -ComObject WScript.Shell

$DesktopPath = [System.Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Pet Genie.lnk"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "C:\Users\Tim\Desktop\Pet App\pet scen 1\start-petgenie.bat"
$Shortcut.WorkingDirectory = "C:\Users\Tim\Desktop\Pet App\pet scen 1"
$Shortcut.Description = "Pet Genie - AI Pet Health Care"
$Shortcut.IconLocation = "C:\Users\Tim\Desktop\Pet App\pet scen 1\public\favicon.ico,0"
$Shortcut.Save()

Write-Host "Desktop shortcut created successfully at: $ShortcutPath"
