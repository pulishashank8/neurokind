# Kill any process using port 3000
Write-Host "Checking for processes on port 3000..." -ForegroundColor Yellow

$connections = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue

if ($connections) {
    $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($pid in $processIds) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "Killing process: $($process.ProcessName) (PID: $pid)" -ForegroundColor Red
            Stop-Process -Id $pid -Force
        }
    }
    
    Write-Host "Port 3000 cleared!" -ForegroundColor Green
    Start-Sleep -Seconds 1
} else {
    Write-Host "Port 3000 is already free." -ForegroundColor Green
}

# Start dev server
Write-Host ""
Write-Host "Starting Next.js development server..." -ForegroundColor Cyan
npm run dev
