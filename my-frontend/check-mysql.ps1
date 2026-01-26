# MySQL 服务检查脚本

Write-Host "=== MySQL 服务检查 ===" -ForegroundColor Cyan

# 检查服务
$services = Get-Service -Name "*mysql*" -ErrorAction SilentlyContinue
if ($services) {
    Write-Host ""
    Write-Host "找到 MySQL 服务:" -ForegroundColor Green
    $services | Format-Table Name, Status, DisplayName -AutoSize
    
    $running = $services | Where-Object {$_.Status -eq 'Running'}
    if ($running) {
        Write-Host "MySQL 服务正在运行" -ForegroundColor Green
    } else {
        Write-Host "MySQL 服务未运行" -ForegroundColor Red
        Write-Host ""
        Write-Host "尝试启动服务..." -ForegroundColor Yellow
        try {
            $services[0] | Start-Service
            Start-Sleep -Seconds 2
            Write-Host "服务已启动" -ForegroundColor Green
        } catch {
            Write-Host "启动失败: $_" -ForegroundColor Red
            Write-Host "请以管理员身份运行此脚本" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "未找到 MySQL 服务" -ForegroundColor Red
    Write-Host "请确认 MySQL 已安装" -ForegroundColor Yellow
}

# 测试端口
Write-Host ""
Write-Host "=== 测试端口连接 ===" -ForegroundColor Cyan
$portTest = Test-NetConnection -ComputerName localhost -Port 3306 -WarningAction SilentlyContinue
if ($portTest.TcpTestSucceeded) {
    Write-Host "端口 3306 可访问 - MySQL 服务可能正在运行" -ForegroundColor Green
} else {
    Write-Host "端口 3306 不可访问 - MySQL 服务可能未运行" -ForegroundColor Red
}

Write-Host ""
Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
