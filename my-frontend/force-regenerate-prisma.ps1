# Force regenerate Prisma Client

Write-Host "Force regenerating Prisma Client..." -ForegroundColor Cyan
Write-Host ""

# 1. Check and stop Node processes
Write-Host "1. Checking and stopping Node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Found $($nodeProcesses.Count) Node process(es)" -ForegroundColor Yellow
    foreach ($proc in $nodeProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            Write-Host "   Stopped process: $($proc.Id)" -ForegroundColor Green
        } catch {
            Write-Host "   Could not stop process: $($proc.Id)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "   No Node processes found" -ForegroundColor Green
}

# 2. Remove Prisma Client cache
Write-Host ""
Write-Host "2. Clearing Prisma Client cache..." -ForegroundColor Yellow
$pathsToRemove = @(
    "node_modules\.prisma",
    ".next"
)

foreach ($path in $pathsToRemove) {
    if (Test-Path $path) {
        try {
            Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "   Deleted: $path" -ForegroundColor Green
        } catch {
            Write-Host "   Could not delete: $path (may be in use)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   Not found: $path" -ForegroundColor Gray
    }
}

# 3. Wait for files to be released
Write-Host ""
Write-Host "3. Waiting for files to be released..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 4. Regenerate Prisma Client
Write-Host ""
Write-Host "4. Regenerating Prisma Client..." -ForegroundColor Yellow
try {
    npx prisma generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Prisma Client generated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next step:" -ForegroundColor Cyan
        Write-Host "   Run: npm run dev" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "Generation failed, exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "Generation failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run manually: npx prisma generate" -ForegroundColor Yellow
}
