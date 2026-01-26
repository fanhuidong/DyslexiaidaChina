# 数据库设置脚本
Write-Host "=== 数据库设置向导 ===" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 检查 MySQL 服务
Write-Host "步骤 1: 检查 MySQL 服务..." -ForegroundColor Yellow
$mysqlServices = Get-Service | Where-Object {$_.DisplayName -like "*mysql*" -or $_.Name -like "*mysql*"}

if ($mysqlServices) {
    Write-Host "找到 MySQL 服务:" -ForegroundColor Green
    $mysqlServices | Format-Table Name, Status, DisplayName -AutoSize
    
    $running = $mysqlServices | Where-Object {$_.Status -eq 'Running'}
    if ($running) {
        Write-Host "✓ MySQL 服务正在运行" -ForegroundColor Green
    } else {
        Write-Host "✗ MySQL 服务未运行" -ForegroundColor Red
        Write-Host ""
        Write-Host "请选择操作:" -ForegroundColor Yellow
        Write-Host "1. 尝试自动启动 MySQL 服务（需要管理员权限）" -ForegroundColor Cyan
        Write-Host "2. 手动启动 MySQL 服务" -ForegroundColor Cyan
        Write-Host ""
        $choice = Read-Host "请输入选项 (1/2)"
        
        if ($choice -eq "1") {
            try {
                $serviceName = $mysqlServices[0].Name
                Write-Host "正在启动服务: $serviceName" -ForegroundColor Yellow
                Start-Service -Name $serviceName -ErrorAction Stop
                Start-Sleep -Seconds 3
                Write-Host "✓ 服务已启动" -ForegroundColor Green
            } catch {
                Write-Host "✗ 启动失败: $_" -ForegroundColor Red
                Write-Host "请以管理员身份运行此脚本，或手动启动 MySQL 服务" -ForegroundColor Yellow
                Write-Host "手动启动方法: 按 Win+R，输入 services.msc，找到 MySQL 服务并启动" -ForegroundColor Yellow
                exit 1
            }
        } else {
            Write-Host "请手动启动 MySQL 服务后重新运行此脚本" -ForegroundColor Yellow
            exit 1
        }
    }
} else {
    Write-Host "✗ 未找到 MySQL 服务" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "1. MySQL 未安装" -ForegroundColor Yellow
    Write-Host "2. 服务名称不同" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请先安装 MySQL，然后重新运行此脚本" -ForegroundColor Yellow
    Write-Host "安装指南: 查看 MYSQL_INSTALL_GUIDE.md" -ForegroundColor Yellow
    exit 1
}

# 步骤 2: 测试端口连接
Write-Host ""
Write-Host "步骤 2: 测试端口连接..." -ForegroundColor Yellow
$portTest = Test-NetConnection -ComputerName localhost -Port 3306 -WarningAction SilentlyContinue
if ($portTest.TcpTestSucceeded) {
    Write-Host "✓ 端口 3306 可访问" -ForegroundColor Green
} else {
    Write-Host "✗ 端口 3306 不可访问" -ForegroundColor Red
    Write-Host "MySQL 服务可能未正确启动，请检查服务状态" -ForegroundColor Yellow
    exit 1
}

# 步骤 3: 检查 .env.local 文件
Write-Host ""
Write-Host "步骤 3: 检查环境配置文件..." -ForegroundColor Yellow
$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "✓ 找到 $envFile 文件" -ForegroundColor Green
    $hasDatabaseUrl = Get-Content $envFile | Select-String "DATABASE_URL"
    if ($hasDatabaseUrl) {
        Write-Host "✓ DATABASE_URL 已配置" -ForegroundColor Green
    } else {
        Write-Host "✗ DATABASE_URL 未配置" -ForegroundColor Red
        Write-Host "请在 $envFile 文件中添加 DATABASE_URL" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ 未找到 $envFile 文件" -ForegroundColor Red
    Write-Host ""
    Write-Host "正在创建 $envFile 文件..." -ForegroundColor Yellow
    
    # 获取数据库配置
    Write-Host ""
    Write-Host "请输入数据库配置信息:" -ForegroundColor Cyan
    $dbUser = Read-Host "数据库用户名 (默认: root)"
    if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "root" }
    
    $dbPassword = Read-Host "数据库密码" -AsSecureString
    $dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))
    
    $dbName = Read-Host "数据库名 (默认: ida_cn)"
    if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "ida_cn" }
    
    $dbHost = Read-Host "数据库主机 (默认: localhost)"
    if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }
    
    $dbPort = Read-Host "数据库端口 (默认: 3306)"
    if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "3306" }
    
    # 构建 DATABASE_URL
    if ([string]::IsNullOrWhiteSpace($dbPasswordPlain)) {
        $databaseUrl = "mysql://$dbUser@$dbHost`:$dbPort/$dbName"
    } else {
        $databaseUrl = "mysql://$dbUser`:$dbPasswordPlain@$dbHost`:$dbPort/$dbName"
    }
    
    # 生成 AUTH_SECRET
    Write-Host ""
    Write-Host "正在生成 AUTH_SECRET..." -ForegroundColor Yellow
    $authSecret = node -e "console.log(require('crypto').randomBytes(32).toString('base64'))" 2>$null
    if (-not $authSecret) {
        $authSecret = "change-this-secret-key-in-production"
        Write-Host "⚠ 无法自动生成 AUTH_SECRET，请手动生成" -ForegroundColor Yellow
    }
    
    # 创建 .env.local 文件
    $envContent = @"
# 数据库连接配置
DATABASE_URL=$databaseUrl

# NextAuth 配置
AUTH_SECRET=$authSecret
AUTH_URL=http://localhost:3000
"@
    
    $envContent | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "✓ 已创建 $envFile 文件" -ForegroundColor Green
}

# 步骤 4: 检查数据库是否存在
Write-Host ""
Write-Host "步骤 4: 检查数据库..." -ForegroundColor Yellow
$envContent = Get-Content $envFile -Raw
if ($envContent -match 'DATABASE_URL=mysql://[^/]+/([^`r`n]+)') {
    $dbNameFromEnv = $matches[1].Trim()
    Write-Host "从配置中读取数据库名: $dbNameFromEnv" -ForegroundColor Cyan
    Write-Host "提示: 如果数据库不存在，Prisma 迁移会自动创建" -ForegroundColor Yellow
}

# 步骤 5: 运行 Prisma 迁移
Write-Host ""
Write-Host "步骤 5: 运行数据库迁移..." -ForegroundColor Yellow
Write-Host "这将创建所有必要的数据库表" -ForegroundColor Cyan
Write-Host ""
$runMigration = Read-Host "是否现在运行迁移? (Y/N)"
if ($runMigration -eq "Y" -or $runMigration -eq "y") {
    Write-Host ""
    Write-Host "正在运行迁移..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ 数据库迁移完成！" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ 迁移失败，请检查错误信息" -ForegroundColor Red
    }
} else {
    Write-Host "跳过迁移，稍后可以运行: npx prisma migrate dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== 设置完成 ===" -ForegroundColor Green
Write-Host ""
Write-Host "下一步:" -ForegroundColor Cyan
Write-Host "1. 确保 .env.local 文件中的配置正确" -ForegroundColor Yellow
Write-Host "2. 如果还未运行迁移，执行: npx prisma migrate dev" -ForegroundColor Yellow
Write-Host "3. 启动开发服务器: npm run dev" -ForegroundColor Yellow
