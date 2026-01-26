# MySQL 服务检查 - 快速指南

## 📋 检查步骤（按顺序执行）

### 步骤 1: 运行检查脚本（最简单）

我已经为你创建了检查脚本，直接运行：

```powershell
cd D:\IDA_CN\my-frontend
.\check-mysql.ps1
```

如果提示无法执行脚本，运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\check-mysql.ps1
```

---

### 步骤 2: 手动检查（如果脚本无法运行）

#### 2.1 打开 PowerShell（管理员权限）
1. 按 `Win + X`
2. 选择 **"Windows PowerShell (管理员)"** 或 **"终端 (管理员)"**

#### 2.2 检查 MySQL 服务
复制粘贴以下命令：

```powershell
Get-Service -Name "*mysql*"
```

**查看结果：**
- ✅ **有输出且 Status = Running**：MySQL 正在运行，可以继续下一步
- ❌ **有输出但 Status = Stopped**：MySQL 已安装但未运行，需要启动
- ❌ **没有输出**：MySQL 可能未安装

#### 2.3 如果服务未运行，启动服务

```powershell
# 尝试启动 MySQL80（最常见的服务名）
Start-Service -Name MySQL80

# 如果上面失败，尝试 MySQL
Start-Service -Name MySQL

# 如果还是失败，先查找服务名
Get-Service | Where-Object {$_.DisplayName -like "*mysql*"}
# 然后使用找到的服务名启动
```

#### 2.4 验证服务是否启动成功

再次运行：

```powershell
Get-Service -Name "*mysql*"
```

确认 `Status` 显示为 `Running`。

---

### 步骤 3: 测试端口连接

```powershell
Test-NetConnection -ComputerName localhost -Port 3306
```

**查看结果：**
- ✅ **TcpTestSucceeded : True**：端口可访问，MySQL 正常运行
- ❌ **TcpTestSucceeded : False**：端口不可访问，MySQL 可能未运行或配置有问题

---

## 🔧 常见问题

### 问题 1: 找不到 MySQL 服务

**可能原因：**
- MySQL 未安装
- 服务名称不同

**解决方法：**
1. 检查是否安装了 MySQL
   - 打开 "控制面板" → "程序和功能"
   - 查找 "MySQL Server" 或 "MySQL"
2. 如果未安装，需要先安装 MySQL
3. 如果已安装但找不到服务，运行：
   ```powershell
   Get-Service | Where-Object {$_.DisplayName -like "*mysql*" -or $_.Name -like "*mysql*"}
   ```

### 问题 2: 服务无法启动

**可能原因：**
- 权限不足
- 端口被占用
- 配置文件错误

**解决方法：**
1. **确保以管理员身份运行 PowerShell**
2. 检查端口是否被占用：
   ```powershell
   netstat -ano | findstr :3306
   ```
3. 查看 MySQL 错误日志（通常在 `C:\ProgramData\MySQL\MySQL Server X.X\Data\`）

### 问题 3: 提示 "无法启动服务"

**解决方法：**
1. 打开 "服务" 管理器：
   - 按 `Win + R`
   - 输入 `services.msc` 并按回车
2. 找到 MySQL 服务
3. 右键点击 → "属性"
4. 检查 "登录" 选项卡，确保服务账户有足够权限
5. 尝试手动启动

---

## ✅ 检查清单

完成以下检查后，MySQL 应该可以正常使用：

- [ ] MySQL 服务已安装
- [ ] MySQL 服务状态为 "Running"
- [ ] 端口 3306 可以访问
- [ ] 可以连接到 MySQL（可选测试）

---

## 🎯 下一步

如果 MySQL 服务正在运行，请继续：

1. **配置数据库连接**
   - 编辑 `my-frontend/.env` 文件
   - 修改 `DATABASE_URL` 为你的实际配置

2. **创建数据库**（如果不存在）
   ```sql
   CREATE DATABASE IF NOT EXISTS ida_cn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **运行数据库迁移**
   ```powershell
   cd my-frontend
   npx prisma migrate dev --name init
   ```

---

## 📞 需要帮助？

如果遇到问题：
1. 查看详细文档：`CHECK_MYSQL_SERVICE.md`
2. 检查 MySQL 安装目录的日志文件
3. 确认 MySQL 安装是否正确
