# Task Check-in App - Vercel Deploy Script
# Run: Right click -> Run with PowerShell

Write-Host "Task Check-in App Deploy Script" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host ""

# Check directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Please run in task-reminder-app directory" -ForegroundColor Red
    pause
    exit
}

# Step 1: Check Git
Write-Host "Step 1: Checking Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    Write-Host "OK: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Git not installed" -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/download/win"
    pause
    exit
}

# Step 2: Check Node.js
Write-Host ""
Write-Host "Step 2: Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    Write-Host "OK: Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js not installed" -ForegroundColor Red
    Write-Host "Please install from https://nodejs.org/"
    pause
    exit
}

# Step 3: Check .env
Write-Host ""
Write-Host "Step 3: Checking environment variables..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found" -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from template" -ForegroundColor Green
        Write-Host "Please edit .env with your Supabase config, then run again" -ForegroundColor Yellow
        notepad .env
        pause
        exit
    }
}

$envContent = Get-Content ".env" -Raw
if ($envContent -match "your-project.supabase.co" -or $envContent -match "your-anon-key") {
    Write-Host "Error: Please edit .env with correct Supabase config" -ForegroundColor Red
    Write-Host "Need: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
    notepad .env
    pause
    exit
}
Write-Host "OK: Environment variables configured" -ForegroundColor Green

# Step 4: Install dependencies
Write-Host ""
Write-Host "Step 4: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: npm install failed" -ForegroundColor Red
    pause
    exit
}
Write-Host "OK: Dependencies installed" -ForegroundColor Green

# Step 5: Build project
Write-Host ""
Write-Host "Step 5: Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Build failed" -ForegroundColor Red
    pause
    exit
}
Write-Host "OK: Build completed" -ForegroundColor Green

# Step 6: Init Git
Write-Host ""
Write-Host "Step 6: Initializing Git..." -ForegroundColor Yellow

if (-not (Test-Path ".git")) {
    git init
    Write-Host "OK: Git initialized" -ForegroundColor Green
} else {
    Write-Host "OK: Git already exists" -ForegroundColor Green
}

# Configure Git if needed
$gitEmail = git config user.email 2>$null
if (-not $gitEmail) {
    $email = Read-Host "Enter your email for Git"
    $name = Read-Host "Enter your name for Git"
    git config user.email "$email"
    git config user.name "$name"
}

# Step 7: GitHub repo
Write-Host ""
Write-Host "Step 7: Configuring GitHub repository..." -ForegroundColor Yellow

$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "OK: Connected to $remoteUrl" -ForegroundColor Green
    $change = Read-Host "Change repository? (y/n, default: n)"
    if ($change -eq "y") {
        git remote remove origin
        $remoteUrl = $null
    }
}

if (-not $remoteUrl) {
    Write-Host ""
    Write-Host "Please create a GitHub repository:" -ForegroundColor Cyan
    Write-Host "1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "2. Enter repository name: task-checkin-app" -ForegroundColor White
    Write-Host "3. Click Create repository" -ForegroundColor White
    Write-Host ""
    $repoUrl = Read-Host "Paste the repository URL (format: https://github.com/username/repo.git)"
    
    if (-not $repoUrl) {
        Write-Host "Error: No repository URL provided" -ForegroundColor Red
        pause
        exit
    }
    
    git remote add origin $repoUrl
    Write-Host "OK: Repository connected" -ForegroundColor Green
}

# Step 8: Commit and push
Write-Host ""
Write-Host "Step 8: Committing and pushing code..." -ForegroundColor Yellow

$hasChanges = git status --porcelain
if ($hasChanges) {
    git add .
    $msg = Read-Host "Enter commit message (or press Enter for default)"
    if (-not $msg) { $msg = "Update task check-in app" }
    git commit -m "$msg"
    Write-Host "OK: Code committed" -ForegroundColor Green
} else {
    Write-Host "OK: No changes to commit" -ForegroundColor Green
}

$branch = git branch --show-current
try {
    git push -u origin $branch
    Write-Host "OK: Code pushed to GitHub" -ForegroundColor Green
} catch {
    Write-Host "Error: Push failed, check GitHub permissions" -ForegroundColor Red
    pause
    exit
}

# Step 9: Deploy to Vercel
Write-Host ""
Write-Host "===============================" -ForegroundColor Green
Write-Host "Code pushed successfully!" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Deploy to Vercel" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to https://vercel.com/new" -ForegroundColor White
Write-Host "2. Click 'Import Git Repository'" -ForegroundColor White
Write-Host "3. Select your task-checkin-app repository" -ForegroundColor White
Write-Host "4. Framework Preset: Select Vite" -ForegroundColor White
Write-Host "5. Add Environment Variables:" -ForegroundColor White
Write-Host "   Name: VITE_SUPABASE_URL" -ForegroundColor Yellow
Write-Host "   Value: Your Supabase URL" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Name: VITE_SUPABASE_ANON_KEY" -ForegroundColor Yellow
Write-Host "   Value: Your Supabase Anon Key" -ForegroundColor Yellow
Write-Host ""
Write-Host "6. Click Deploy" -ForegroundColor White
Write-Host ""
Write-Host "Wait 2-3 minutes for deployment to complete!" -ForegroundColor Green
Write-Host ""

$open = Read-Host "Open Vercel now? (y/n, default: y)"
if ($open -ne "n") {
    Start-Process "https://vercel.com/new"
}

Write-Host ""
Write-Host "Tip: For future updates, just run:" -ForegroundColor Cyan
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m 'your message'" -ForegroundColor White
Write-Host "   git push" -ForegroundColor White
Write-Host "   Vercel will auto-deploy!" -ForegroundColor Green
Write-Host ""
pause
