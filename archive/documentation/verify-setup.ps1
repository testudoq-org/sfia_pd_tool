# Must be run as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Please run this script as Administrator!"
    exit
}

Write-Host "`n=== Checking CodeceptJS and Playwright Installation ===`n" -ForegroundColor Cyan

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "node_modules directory not found. Please run 'npm install' first." -ForegroundColor Red
    exit
}

# Check CodeceptJS installation
$codeceptPath = "node_modules\codeceptjs"
if (Test-Path $codeceptPath) {
    $codeceptVersion = (Get-Content "node_modules\codeceptjs\package.json" -Raw | ConvertFrom-Json).version
    Write-Host "✓ CodeceptJS found (version $codeceptVersion)" -ForegroundColor Green
} else {
    Write-Host "✗ CodeceptJS not found in node_modules" -ForegroundColor Red
}

# Check Playwright installation
$playwrightPath = "node_modules\playwright"
if (Test-Path $playwrightPath) {
    $playwrightVersion = (Get-Content "node_modules\playwright\package.json" -Raw | ConvertFrom-Json).version
    Write-Host "✓ Playwright found (version $playwrightVersion)" -ForegroundColor Green
} else {
    Write-Host "✗ Playwright not found in node_modules" -ForegroundColor Red
}

Write-Host "`n=== Checking Playwright Browser Installation ===`n" -ForegroundColor Cyan

# Windows-specific Playwright browser paths
$playwrightBrowserPath = "$env:USERPROFILE\AppData\Local\ms-playwright"
$chromiumPath = "$playwrightBrowserPath\chromium-*\chrome-win\chrome.exe"

# Check if Playwright browsers directory exists
if (Test-Path $playwrightBrowserPath) {
    Write-Host "✓ Playwright browsers directory found" -ForegroundColor Green
    
    # Check for Chromium executable
    $chromiumExe = Get-Item $chromiumPath -ErrorAction SilentlyContinue
    if ($chromiumExe) {
        Write-Host "✓ Chromium executable found at:" -ForegroundColor Green
        Write-Host "  $($chromiumExe.FullName)"
    } else {
        Write-Host "✗ Chromium executable not found" -ForegroundColor Red
        Write-Host "`nInstalling Playwright browsers..."
        npx playwright install
        
        # Verify installation was successful
        $chromiumExe = Get-Item $chromiumPath -ErrorAction SilentlyContinue
        if ($chromiumExe) {
            Write-Host "`n✓ Browser installation successful" -ForegroundColor Green
        } else {
            Write-Host "`n✗ Browser installation failed" -ForegroundColor Red
        }
    }
} else {
    Write-Host "✗ Playwright browsers directory not found at:" -ForegroundColor Red
    Write-Host "  $playwrightBrowserPath"
    Write-Host "`nInstalling Playwright browsers..."
    npx playwright install
    
    # Verify installation was successful
    if (Test-Path $playwrightBrowserPath) {
        Write-Host "`n✓ Browser installation successful" -ForegroundColor Green
    } else {
        Write-Host "`n✗ Browser installation failed" -ForegroundColor Red
    }
}

Write-Host "`n=== Verifying Playwright Installation ===`n" -ForegroundColor Cyan

# Run Playwright version check
Write-Host "Playwright version:"
npx playwright --version

Write-Host "`nTo run tests, use:"
Write-Host "npm run codeceptjs" -ForegroundColor Yellow
