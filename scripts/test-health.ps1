# Test health endpoint
Write-Host "Testing NeuroKind Health Endpoint..." -ForegroundColor Cyan
Write-Host "URL: http://localhost:3000/api/health" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/health' -Method Get
    
    # Display key information
    Write-Host "✓ Status:      " -NoNewline -ForegroundColor Green
    Write-Host $response.status -ForegroundColor White
    
    Write-Host "✓ Timestamp:   " -NoNewline -ForegroundColor Green
    Write-Host $response.timestamp -ForegroundColor White
    
    Write-Host "✓ Environment: " -NoNewline -ForegroundColor Green
    Write-Host $response.environment -ForegroundColor White
    
    Write-Host "✓ Uptime:      " -NoNewline -ForegroundColor Green
    Write-Host "$([math]::Round($response.uptime, 2)) seconds" -ForegroundColor White
    
    if ($response.database) {
        Write-Host "✓ Database:    " -NoNewline -ForegroundColor Green
        Write-Host $response.database -ForegroundColor White
    }
    
    if ($response.redis) {
        Write-Host "✓ Redis:       " -NoNewline -ForegroundColor Green
        Write-Host $response.redis -ForegroundColor White
    }
    
    
    # Full JSON response
    Write-Host ""
    Write-Host "Full Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
    
    Write-Host ""
    Write-Host "✓ Health check PASSED" -ForegroundColor Green
    exit 0
    
} catch {
    Write-Host "✗ Health check FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Is the dev server running? Try: npm run dev" -ForegroundColor Yellow
    exit 1
}
