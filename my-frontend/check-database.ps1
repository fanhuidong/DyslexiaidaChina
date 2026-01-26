# 数据库连接检查脚本
Write-Host "正在检查数据库连接..." -ForegroundColor Cyan

# 检查 .env 文件是否存在
if (Test-Path ".env") {
    Write-Host "✓ .env 文件存在" -ForegroundColor Green
} else {
    Write-Host "✗ .env 文件不存在，请创建 .env 文件并配置 DATABASE_URL" -ForegroundColor Red
    exit 1
}

# 检查 DATABASE_URL 是否配置
$envContent = Get-Content ".env" -Raw
if ($envContent -match "DATABASE_URL") {
    Write-Host "✓ DATABASE_URL 已配置" -ForegroundColor Green
} else {
    Write-Host "✗ DATABASE_URL 未配置，请在 .env 文件中添加 DATABASE_URL" -ForegroundColor Red
    exit 1
}

# 检查 Prisma Client 是否已生成
Write-Host "`n检查 Prisma Client..." -ForegroundColor Cyan
try {
    npx prisma --version | Out-Null
    Write-Host "✓ Prisma 已安装" -ForegroundColor Green
} catch {
    Write-Host "✗ Prisma 未安装，请运行: npm install" -ForegroundColor Red
    exit 1
}

# 检查数据库连接
Write-Host "`n检查数据库连接..." -ForegroundColor Cyan
try {
    $status = npx prisma migrate status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 数据库连接成功" -ForegroundColor Green
        Write-Host $status
    } else {
        Write-Host "✗ 数据库连接失败" -ForegroundColor Red
        Write-Host $status
        Write-Host "`n请检查:" -ForegroundColor Yellow
        Write-Host "1. MySQL 服务是否正在运行" -ForegroundColor Yellow
        Write-Host "2. DATABASE_URL 配置是否正确" -ForegroundColor Yellow
        Write-Host "3. 数据库服务器是否可访问" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ 无法检查数据库连接" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# 检查数据库表
Write-Host "`n检查数据库表..." -ForegroundColor Cyan
try {
    npx prisma db pull --force 2>&1 | Out-Null
    Write-Host "✓ 数据库表检查完成" -ForegroundColor Green
} catch {
    Write-Host "⚠ 无法检查数据库表，可能需要运行迁移" -ForegroundColor Yellow
    Write-Host "建议运行: npx prisma migrate dev" -ForegroundColor Yellow
}

Write-Host "`n检查完成！" -ForegroundColor Green
