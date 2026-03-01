# 任务打卡系统 - Vercel 部署脚本 (Windows PowerShell)
# 右键点击此文件 → 使用 PowerShell 运行

Write-Host "🚀 任务打卡系统 Vercel 部署脚本" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# 检查是否在正确目录
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 错误：请在 task-reminder-app 目录下运行此脚本" -ForegroundColor Red
    Write-Host "   当前目录: $(Get-Location)"
    pause
    exit
}

# 步骤 1: 检查 Git
Write-Host "📋 步骤 1: 检查 Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    Write-Host "✅ $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git 未安装，请先安装 Git: https://git-scm.com/download/win" -ForegroundColor Red
    pause
    exit
}

# 步骤 2: 检查 Node.js
Write-Host ""
Write-Host "📋 步骤 2: 检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js 未安装，请先安装: https://nodejs.org/" -ForegroundColor Red
    pause
    exit
}

# 步骤 3: 检查 .env 配置
Write-Host ""
Write-Host "📋 步骤 3: 检查环境变量..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    Write-Host "⚠️  未找到 .env 文件" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "   已从 .env.example 创建 .env 文件" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  请编辑 .env 文件，填入你的 Supabase 配置后重新运行此脚本" -ForegroundColor Yellow
        notepad .env
        pause
        exit
    }
}

$envContent = Get-Content ".env" -Raw
if ($envContent -match "your-project.supabase.co" -or $envContent -match "your-anon-key") {
    Write-Host "❌ 请先编辑 .env 文件，填入正确的 Supabase 配置" -ForegroundColor Red
    Write-Host "   需要配置: VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY" -ForegroundColor Yellow
    notepad .env
    pause
    exit
}
Write-Host "✅ 环境变量检查通过" -ForegroundColor Green

# 步骤 4: 初始化 Git 仓库
Write-Host ""
Write-Host "📋 步骤 4: 初始化 Git 仓库..." -ForegroundColor Yellow

if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Git 仓库初始化完成" -ForegroundColor Green
} else {
    Write-Host "✅ Git 仓库已存在" -ForegroundColor Green
}

# 步骤 5: 询问 GitHub 仓库地址
Write-Host ""
Write-Host "📋 步骤 5: 配置 GitHub 仓库..." -ForegroundColor Yellow

$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "✅ 已关联远程仓库: $remoteUrl" -ForegroundColor Green
    $changeRepo = Read-Host "   是否更换仓库? (y/n，默认 n)"
    if ($changeRepo -eq "y" -or $changeRepo -eq "Y") {
        git remote remove origin
        $remoteUrl = $null
    }
}

if (-not $remoteUrl) {
    Write-Host ""
    Write-Host "请在 GitHub 创建新仓库：" -ForegroundColor Cyan
    Write-Host "   1. 访问 https://github.com/new" -ForegroundColor White
    Write-Host "   2. 填写 Repository name: task-checkin-app" -ForegroundColor White
    Write-Host "   3. 选择 Public（或 Private）" -ForegroundColor White
    Write-Host "   4. 点击 Create repository" -ForegroundColor White
    Write-Host ""
    $repoUrl = Read-Host "创建完成后，粘贴仓库地址（格式: https://github.com/用户名/仓库名.git）"
    
    if (-not $repoUrl) {
        Write-Host "❌ 未提供仓库地址" -ForegroundColor Red
        pause
        exit
    }
    
    git remote add origin $repoUrl
    Write-Host "✅ 已关联远程仓库" -ForegroundColor Green
}

# 步骤 6: 提交代码
Write-Host ""
Write-Host "📋 步骤 6: 提交代码..." -ForegroundColor Yellow

$hasChanges = git status --porcelain
if ($hasChanges) {
    git add .
    $commitMsg = Read-Host "输入提交信息（直接回车使用默认: '更新任务打卡系统'）"
    if (-not $commitMsg) { $commitMsg = "更新任务打卡系统" }
    git commit -m "$commitMsg"
    Write-Host "✅ 代码已提交" -ForegroundColor Green
} else {
    Write-Host "✅ 没有待提交的更改" -ForegroundColor Green
}

# 步骤 7: 推送到 GitHub
Write-Host ""
Write-Host "📋 步骤 7: 推送到 GitHub..." -ForegroundColor Yellow

$branch = git branch --show-current
try {
    git push -u origin $branch
    Write-Host "✅ 代码已推送到 GitHub" -ForegroundColor Green
} catch {
    Write-Host "❌ 推送失败，请检查 GitHub 仓库权限" -ForegroundColor Red
    pause
    exit
}

# 步骤 8: Vercel 部署指引
Write-Host ""
Write-Host "🎉 代码推送成功！" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "下一步：部署到 Vercel" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 访问 https://vercel.com/new" -ForegroundColor White
Write-Host "2. 点击 Import Git Repository" -ForegroundColor White
Write-Host "3. 选择你的 task-checkin-app 仓库" -ForegroundColor White
Write-Host "4. Framework Preset 选择 Vite" -ForegroundColor White
Write-Host "5. 点击 Environment Variables，添加：" -ForegroundColor White
Write-Host "   - Name: VITE_SUPABASE_URL" -ForegroundColor Yellow
Write-Host "   - Value: 你的 Supabase URL" -ForegroundColor Yellow
Write-Host ""
Write-Host "   - Name: VITE_SUPABASE_ANON_KEY" -ForegroundColor Yellow
Write-Host "   - Value: 你的 Supabase Anon Key" -ForegroundColor Yellow
Write-Host ""
Write-Host "6. 点击 Deploy" -ForegroundColor White
Write-Host ""
Write-Host "⏰ 等待约 2-3 分钟，部署完成后会显示访问链接！" -ForegroundColor Green
Write-Host ""

$openBrowser = Read-Host "是否现在打开 Vercel? (y/n，默认 y)"
if ($openBrowser -ne "n") {
    Start-Process "https://vercel.com/new"
}

Write-Host ""
Write-Host "💡 提示：以后代码更新只需执行:" -ForegroundColor Cyan
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m '你的修改说明'" -ForegroundColor White
Write-Host "   git push" -ForegroundColor White
Write-Host "   Vercel 会自动重新部署！" -ForegroundColor Green
Write-Host ""
pause
