# NeuroKind Test Setup Script for Windows
# Run this script to set up the test database and run migrations

Write-Host "🧪 NeuroKind Test Setup" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.test exists
if (-Not (Test-Path ".env.test")) {
    Write-Host "❌ Error: .env.test file not found" -ForegroundColor Red
    Write-Host "Please create .env.test with your test database configuration" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Found .env.test configuration" -ForegroundColor Green

# Load DATABASE_URL from .env.test
$envContent = Get-Content ".env.test" | Where-Object { $_ -match "^DATABASE_URL=" }
if ($envContent) {
    $databaseUrl = $envContent -replace '^DATABASE_URL=["'']?|["'']?$', ''
    Write-Host "✓ Database URL loaded from .env.test" -ForegroundColor Green
    
    # Check if it contains "test"
    if ($databaseUrl -notmatch "test") {
        Write-Host "⚠️  Warning: DATABASE_URL does not contain 'test'" -ForegroundColor Yellow
        Write-Host "   Make sure you're using a test database!" -ForegroundColor Yellow
        $confirmation = Read-Host "Continue anyway? (y/n)"
        if ($confirmation -ne "y") {
            Write-Host "Setup cancelled" -ForegroundColor Yellow
            exit 0
        }
    }
} else {
    Write-Host "❌ Error: DATABASE_URL not found in .env.test" -ForegroundColor Red
    exit 1
}

# Set environment variable
$env:DATABASE_URL = $databaseUrl

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run migrations" -ForegroundColor Red
    Write-Host "   Make sure PostgreSQL is running and the database exists" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Migrations completed" -ForegroundColor Green

Write-Host ""
Write-Host "🌱 Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Prisma client generated" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Test setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run tests with:" -ForegroundColor Cyan
Write-Host "  npm run test              # Run all tests" -ForegroundColor White
Write-Host "  npm run test:watch        # Run tests in watch mode" -ForegroundColor White
Write-Host "  npm run test:integration  # Run only integration tests" -ForegroundColor White
Write-Host "  npm run test:ui           # Run with visual UI" -ForegroundColor White
Write-Host ""
