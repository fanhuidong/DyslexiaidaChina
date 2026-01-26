# 修复 Prisma Client 生成问题的 PowerShell 脚本

Write-Host "🔧 修复 Prisma Client 生成问题..." -ForegroundColor Cyan
Write-Host ""

# 1. 检查是否有 Node 进程在运行
Write-Host "1. 检查 Node 进程..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   发现 $($nodeProcesses.Count) 个 Node 进程正在运行" -ForegroundColor Yellow
    Write-Host "   请手动停止开发服务器（在运行服务器的终端按 Ctrl+C）" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "   是否继续？(y/n)"
    if ($continue -ne "y") {
        Write-Host "   已取消" -ForegroundColor Red
        exit
    }
} else {
    Write-Host "   ✅ 没有发现 Node 进程" -ForegroundColor Green
}

# 2. 等待几秒确保文件释放
Write-Host ""
Write-Host "2. 等待文件释放..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 3. 尝试删除锁定的文件（如果存在）
Write-Host ""
Write-Host "3. 清理临时文件..." -ForegroundColor Yellow
$prismaClientPath = "node_modules\.prisma\client"
if (Test-Path $prismaClientPath) {
    $tempFiles = Get-ChildItem -Path $prismaClientPath -Filter "*.tmp*" -ErrorAction SilentlyContinue
    if ($tempFiles) {
        Write-Host "   发现临时文件，尝试删除..." -ForegroundColor Yellow
        foreach ($file in $tempFiles) {
            try {
                Remove-Item -Path $file.FullName -Force -ErrorAction SilentlyContinue
                Write-Host "   ✅ 已删除: $($file.Name)" -ForegroundColor Green
            } catch {
                Write-Host "   ⚠️  无法删除: $($file.Name)" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "   ✅ 没有临时文件" -ForegroundColor Green
    }
}

# 4. 重新生成 Prisma Client
Write-Host ""
Write-Host "4. 重新生成 Prisma Client..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host ""
    Write-Host "✅ Prisma Client 生成成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "下一步：重启开发服务器" -ForegroundColor Cyan
    Write-Host "   npm run dev" -ForegroundColor White
} catch {
    Write-Host ""
    Write-Host "❌ 生成失败: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "如果仍然失败，请尝试：" -ForegroundColor Yellow
    Write-Host "   1. 完全关闭所有终端窗口" -ForegroundColor White
    Write-Host "   2. 重新打开终端" -ForegroundColor White
    Write-Host "   3. 运行: npx prisma generate" -ForegroundColor White
    Write-Host "   4. 或者直接重启开发服务器（Next.js 会自动加载新的 Prisma Client）" -ForegroundColor White
}
