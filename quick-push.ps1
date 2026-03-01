# Quick push script for updates
Write-Host "Quick Push Script" -ForegroundColor Green

if (-not (Test-Path ".git")) {
    Write-Host "Error: Git repository not found" -ForegroundColor Red
    pause
    exit
}

Write-Host "Current changes:" -ForegroundColor Yellow
git status --short

Write-Host ""
$confirm = Read-Host "Commit these changes? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Cancelled" -ForegroundColor Yellow
    pause
    exit
}

git add .
$msg = Read-Host "Enter commit message (or press Enter for default)"
if (-not $msg) { $msg = "Update code" }
git commit -m "$msg"
git push

Write-Host ""
Write-Host "OK: Pushed! Vercel will auto-deploy..." -ForegroundColor Green
Write-Host "Refresh your site in 1-2 minutes" -ForegroundColor Yellow
pause
