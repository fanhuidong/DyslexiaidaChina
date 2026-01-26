# 检查 MySQL 服务 - 详细步骤

## 🚀 快速检查（推荐）

我已经为你创建了一个检查脚本，运行以下命令：

```powershell
cd my-frontend
.\check-mysql.ps1
```

或者直接运行：

```powershell
powershell -ExecutionPolicy Bypass -File my-frontend\check-mysql.ps1
```

---

## 方法 1: 使用 PowerShell（手动检查）

### 步骤 1: 打开 PowerShell
- 按 `Win + X`，选择 "Windows PowerShell" 或 "终端"
- 或者在开始菜单搜索 "PowerShell"

### 步骤 2: 检查 MySQL 服务状态
在 PowerShell 中输入以下命令：

```powershell
Get-Service -Name "*mysql*"
```

**结果说明：**
- 如果看到服务列表，说明 MySQL 已安装
- `Status` 显示 `Running` = 服务正在运行 ✅
- `Status` 显示 `Stopped` = 服务已停止 ❌

### 步骤 3: 如果服务未运行，启动服务

找到 MySQL 服务的名称（通常是 `MySQL80` 或 `MySQL`），然后运行：

```powershell
# 启动 MySQL 服务（替换为你的实际服务名）
Start-Service -Name MySQL80

# 或者
Start-Service -Name MySQL
```

**如果提示权限不足：**
- 右键点击 PowerShell，选择 "以管理员身份运行"
- 然后重新执行启动命令

---

## 方法 2: 使用服务管理器（图形界面）

### 步骤 1: 打开服务管理器
1. 按 `Win + R` 打开运行对话框
2. 输入 `services.msc` 并按回车

### 步骤 2: 查找 MySQL 服务
1. 在服务列表中找到 MySQL 相关服务
   - 通常名称是：`MySQL80`、`MySQL`、`MySQL57` 等
   - 或者搜索 "mysql"

### 步骤 3: 检查服务状态
- **状态列显示 "正在运行"** = 服务正常 ✅
- **状态列显示 "已停止"** = 服务未运行 ❌

### 步骤 4: 如果服务未运行，启动服务
1. 右键点击 MySQL 服务
2. 选择 "启动"
3. 等待服务启动完成

---

## 方法 3: 使用命令行测试连接

### 步骤 1: 测试 MySQL 是否可访问
在 PowerShell 或命令提示符中运行：

```powershell
# 测试端口是否开放（默认 3306）
Test-NetConnection -ComputerName localhost -Port 3306
```

**结果说明：**
- `TcpTestSucceeded : True` = 端口可访问 ✅
- `TcpTestSucceeded : False` = 端口不可访问 ❌

### 步骤 2: 尝试连接 MySQL（如果已安装 MySQL 客户端）
```bash
mysql -u root -p
```

如果提示输入密码，说明 MySQL 服务正在运行。

---

## 方法 4: 检查 MySQL 进程

在 PowerShell 中运行：

```powershell
Get-Process -Name "*mysql*" -ErrorAction SilentlyContinue
```

如果看到进程列表，说明 MySQL 正在运行。

---

## 常见问题排查

### 问题 1: 找不到 MySQL 服务
**可能原因：**
- MySQL 未安装
- 服务名称不同

**解决方法：**
1. 检查是否安装了 MySQL
2. 运行 `Get-Service | Where-Object {$_.DisplayName -like "*mysql*"}` 查找所有 MySQL 相关服务

### 问题 2: 服务无法启动
**可能原因：**
- 端口被占用
- 配置文件错误
- 权限不足

**解决方法：**
1. 以管理员身份运行 PowerShell
2. 检查 MySQL 错误日志（通常在 `C:\ProgramData\MySQL\MySQL Server X.X\Data\`）
3. 检查端口 3306 是否被其他程序占用

### 问题 3: 服务启动后立即停止
**可能原因：**
- MySQL 配置文件有错误
- 数据目录权限问题

**解决方法：**
1. 查看 Windows 事件查看器中的错误信息
2. 检查 MySQL 配置文件 `my.ini` 或 `my.cnf`

---

## 快速检查脚本

将以下内容保存为 `check-mysql.ps1`，然后运行：

```powershell
Write-Host "=== MySQL 服务检查 ===" -ForegroundColor Cyan

# 检查服务
$services = Get-Service -Name "*mysql*" -ErrorAction SilentlyContinue
if ($services) {
    Write-Host "`n找到 MySQL 服务:" -ForegroundColor Green
    $services | Format-Table Name, Status, DisplayName -AutoSize
    
    $running = $services | Where-Object {$_.Status -eq 'Running'}
    if ($running) {
        Write-Host "✅ MySQL 服务正在运行" -ForegroundColor Green
    } else {
        Write-Host "❌ MySQL 服务未运行" -ForegroundColor Red
        Write-Host "`n尝试启动服务..." -ForegroundColor Yellow
        try {
            $services[0] | Start-Service
            Start-Sleep -Seconds 2
            Write-Host "✅ 服务已启动" -ForegroundColor Green
        } catch {
            Write-Host "❌ 启动失败: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ 未找到 MySQL 服务" -ForegroundColor Red
    Write-Host "请确认 MySQL 已安装" -ForegroundColor Yellow
}

# 测试端口
Write-Host "`n=== 测试端口连接 ===" -ForegroundColor Cyan
$portTest = Test-NetConnection -ComputerName localhost -Port 3306 -WarningAction SilentlyContinue
if ($portTest.TcpTestSucceeded) {
    Write-Host "✅ 端口 3306 可访问" -ForegroundColor Green
} else {
    Write-Host "❌ 端口 3306 不可访问" -ForegroundColor Red
}
```

---

## 下一步

如果 MySQL 服务正在运行，请继续：
1. 配置 `.env` 文件中的 `DATABASE_URL`
2. 运行 `npx prisma migrate dev --name init`
