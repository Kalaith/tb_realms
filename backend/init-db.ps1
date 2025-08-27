# Initialize the database
Write-Host "Mytherra Database Initialization" -ForegroundColor Green
Write-Host "============================"

# Ensure we're in the correct directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if PHP is available
try {
    $phpVersion = php -v
    Write-Host "PHP Version detected: " -NoNewline
    Write-Host $phpVersion[0] -ForegroundColor Cyan
} catch {
    Write-Host "Error: PHP is not available in the system path" -ForegroundColor Red
    Write-Host "Please ensure PHP is installed and added to your system PATH"
    exit 1
}

Write-Host "`nInitializing database..." -ForegroundColor Yellow
php scripts/initializeDatabase.php

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDatabase initialization completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`nDatabase initialization failed!" -ForegroundColor Red
    exit 1
}
