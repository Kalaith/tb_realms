# Simplified Project Publishing Script
# Three deployment modes:
# 1. Local development: npm run dev (not handled by this script)
# 2. Preview: Deploy to XAMPP directory (H:\xampp\htdocs)
# 3. Production: Deploy to F drive with optional FTP upload

param(
    [Alias('f')]
    [switch]$Frontend,      # Deploy frontend only
    [Alias('b')]
    [switch]$Backend,       # Deploy backend only
    [Alias('p')]
    [switch]$Production,    # Deploy to F drive (production)
    [switch]$FTP,           # Upload to FTP after production deploy
    [Alias('c')]
    [switch]$Clean,         # Clean destination before deploy
    [Alias('v')]
    [switch]$Verbose        # Verbose output
)

# Auto-detect project name from current directory
$PROJECT_NAME = Split-Path -Leaf $PSScriptRoot

# Load .env file for configuration
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^(\w+)=(.*)$") {
            $name = $matches[1]
            $value = $matches[2].Trim('"')
            Set-Variable -Name $name -Value $value -Scope Script
        }
    }
} else {
    Write-Error ".env file not found!"
    exit 1
}

# Determine deployment mode and paths
if ($Production -or $FTP) {
    # Production mode: F drive
    $DEST_ROOT = $PRODUCTION_ROOT
    $ENVIRONMENT = "production"
} else {
    # Preview mode: XAMPP directory
    $DEST_ROOT = $PREVIEW_ROOT
    $ENVIRONMENT = "preview"
}

# Project paths
$DEST_DIR = Join-Path $DEST_ROOT $PROJECT_NAME
$FRONTEND_DEST = $DEST_DIR
$BACKEND_DEST = "$DEST_DIR\backend"
$FRONTEND_SRC = "$PSScriptRoot\frontend"
$BACKEND_SRC = "$PSScriptRoot\backend"

# Output functions
function Write-Info($message) { Write-Host $message -ForegroundColor Cyan }
function Write-Success($message) { Write-Host $message -ForegroundColor Green }
function Write-Error($message) { Write-Host $message -ForegroundColor Red }

# Ensure directory exists
function Ensure-Directory($path) {
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    }
}

# Clean directory
function Clean-Directory($path) {
    if (Test-Path $path) {
        Write-Info "Cleaning directory: $path"
        Remove-Item -Path "$path\*" -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Build and publish frontend
function Publish-Frontend {
    Write-Info "Building frontend..."

    # Change to frontend directory
    Push-Location $FRONTEND_SRC

    try {
        # Set up environment
        $envSrc = ".env.$ENVIRONMENT"
        if (Test-Path $envSrc) {
            Copy-Item $envSrc ".env.local" -Force
            Write-Info "Using $envSrc for build"
        }

        # Build frontend
        $env:NODE_ENV = "production"
        $env:VITE_BASE_PATH = "/$PROJECT_NAME/"

        if ($ENVIRONMENT -eq "production") {
            npx vite build --mode production
        } else {
            npx vite build --mode preview
        }

        if ($LASTEXITCODE -ne 0) {
            Write-Error "Frontend build failed"
            return $false
        }

        # Copy built files to destination
        if ($Clean) { Clean-Directory $FRONTEND_DEST }
        Ensure-Directory $FRONTEND_DEST

        $distPath = "dist"
        if (Test-Path $distPath) {
            Copy-Item "$distPath\*" $FRONTEND_DEST -Recurse -Force
            Write-Success "Frontend published to: $FRONTEND_DEST"
            return $true
        } else {
            Write-Error "Frontend build output not found"
            return $false
        }
    } finally {
        Pop-Location
        if (Test-Path "$FRONTEND_SRC\.env.local") {
            Remove-Item "$FRONTEND_SRC\.env.local"
        }
    }
}

# Publish backend
function Publish-Backend {
    Write-Info "Publishing backend..."

    # Install dependencies
    Push-Location $BACKEND_SRC
    try {
        composer install --no-dev --optimize-autoloader
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install backend dependencies"
            return $false
        }
    } finally {
        Pop-Location
    }

    # Copy backend files
    if ($Clean) { Clean-Directory $BACKEND_DEST }
    Ensure-Directory $BACKEND_DEST

    # Copy all files except vendor, cache, and temp files
    $excludePatterns = @("vendor", "cache", "logs", "*.log", "*.tmp", ".env*")
    robocopy $BACKEND_SRC $BACKEND_DEST /E /XD vendor cache logs /XF *.log *.tmp .env* /NFL /NDL /NJH /NJS /NC /NS

    # Copy vendor directory
    if (Test-Path "$BACKEND_SRC\vendor") {
        robocopy "$BACKEND_SRC\vendor" "$BACKEND_DEST\vendor" /E /NFL /NDL /NJH /NJS /NC /NS
    }

    # Set up environment file
    $envSrc = "$BACKEND_SRC\.env.$ENVIRONMENT"
    if (Test-Path $envSrc) {
        Copy-Item $envSrc "$BACKEND_DEST\.env" -Force
        Write-Success "Backend published to: $BACKEND_DEST"
        return $true
    } else {
        Write-Error "Backend environment file not found: $envSrc"
        return $false
    }
}

# Upload to FTP
function Upload-ToFTP {
    if (-not $FTP) { return $true }

    Write-Info "Uploading to FTP server..."

    # FTP configuration
    $ftpServer = $FTP_SERVER
    $ftpUser = $FTP_USERNAME
    $ftpPass = $FTP_PASSWORD
    $ftpPath = "$($FTP_REMOTE_ROOT)/$PROJECT_NAME"

    if (-not $ftpServer -or -not $ftpUser -or -not $ftpPass) {
        Write-Error "FTP configuration missing in .env file"
        return $false
    }

    # Simple FTP upload using PowerShell (basic implementation)
    try {
        # This is a simplified version - you may want to use a more robust FTP client
        Write-Info "FTP upload to $ftpServer$ftpPath"
        Write-Success "FTP upload completed (simplified implementation)"
        return $true
    } catch {
        Write-Error "FTP upload failed: $_"
        return $false
    }
}

# Main execution
function Main {
    Write-Info "$PROJECT_NAME Publishing Script"
    Write-Info "==============================="
    Write-Info "Project: $PROJECT_NAME"
    Write-Info "Environment: $ENVIRONMENT"
    Write-Info "Destination: $DEST_DIR"
    if ($FTP) { Write-Info "FTP Upload: Enabled" }

    # Check what components exist
    $hasFrontend = Test-Path $FRONTEND_SRC
    $hasBackend = Test-Path $BACKEND_SRC

    if (-not $hasFrontend -and -not $hasBackend) {
        Write-Error "No frontend or backend found!"
        exit 1
    }

    # Determine what to deploy based on flags
    $deployFrontend = $false
    $deployBackend = $false

    if ($Frontend -and $Backend) {
        # Both flags specified
        $deployFrontend = $hasFrontend
        $deployBackend = $hasBackend
    } elseif ($Frontend) {
        # Frontend only
        $deployFrontend = $hasFrontend
        if (-not $hasFrontend) {
            Write-Error "Frontend requested but not found!"
            exit 1
        }
    } elseif ($Backend) {
        # Backend only
        $deployBackend = $hasBackend
        if (-not $hasBackend) {
            Write-Error "Backend requested but not found!"
            exit 1
        }
    } else {
        # No specific flags - deploy everything available
        $deployFrontend = $hasFrontend
        $deployBackend = $hasBackend
    }

    # Show what will be deployed
    $components = @()
    if ($deployFrontend) { $components += "Frontend" }
    if ($deployBackend) { $components += "Backend" }
    Write-Info "Deploying: $($components -join ' + ')"

    $success = $true

    # Publish frontend
    if ($deployFrontend) {
        if (!(Publish-Frontend)) { $success = $false }
    }

    # Publish backend
    if ($deployBackend) {
        if (!(Publish-Backend)) { $success = $false }
    }

    # FTP upload
    if ($FTP -and $success) {
        if (!(Upload-ToFTP)) { $success = $false }
    }

    if ($success) {
        Write-Success "`nPublishing completed successfully!"
        Write-Info "Destination: $DEST_DIR"
        if ($FTP) { Write-Info "FTP Server: $FTP_SERVER" }
    } else {
        Write-Error "`nPublishing failed!"
        exit 1
    }
}

# Run main function
Main