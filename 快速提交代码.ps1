# 快速提交代码到 GitHub（用于后续更新）
# 修改代码后，右键运行此脚本

Write-Host "🚀 快速提交代码..." -ForegroundColor Green

# 检查 Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ 未找到 Git 仓库，请先运行 部署到Vercel.ps1" -ForegroundColor Red
    pause
    exit
}

# 显示当前更改
Write-Host ""
Write-Host "当前更改:" -ForegroundColor Yellow
git status --short

Write-Host ""
$confirm = Read-Host "确认提交以上更改? (y/n)"
if ($confirm -ne "y") {
    Write-Host "已取消" -ForegroundColor Yellow
    pause
    exit
}

# 提交并推送
git add .
$msg = Read-Host "输入修改说明（直接回车使用默认）"
if (-not $msg) { $msg = "更新代码" }
git commit -m "$msg"
git push

Write-Host ""
Write-Host "✅ 提交成功！Vercel 将自动重新部署..." -ForegroundColor Green
Write-Host "   约 1-2 分钟后刷新网站即可看到更新" -ForegroundColor Yellow
pause
