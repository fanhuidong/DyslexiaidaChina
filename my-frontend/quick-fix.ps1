# Quick fix for Prisma Client - Simple version

Write-Host "Clearing cache and regenerating Prisma Client..." -ForegroundColor Cyan
Write-Host ""

# Stop Node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clear cache
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue }
if (Test-Path "node_modules\.prisma") { Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 2

# Regenerate
Write-Host "Running: npx prisma generate" -ForegroundColor Yellow
npx prisma generate

Write-Host ""
Write-Host "Done! Now run: npm run dev" -ForegroundColor Green
