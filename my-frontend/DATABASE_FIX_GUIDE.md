# 数据库连接问题修复指南

## 🔍 问题诊断

当前错误：**数据库连接失败**

可能的原因：
1. MySQL 服务未运行
2. `.env.local` 文件不存在或配置错误
3. 数据库不存在

---

## 🚀 快速修复步骤

### 步骤 1: 启动 MySQL 服务

#### 方法 A: 使用 PowerShell（推荐）

1. **以管理员身份打开 PowerShell**
   - 按 `Win + X`
   - 选择 "Windows PowerShell (管理员)" 或 "终端 (管理员)"

2. **查找 MySQL 服务**
   ```powershell
   Get-Service | Where-Object {$_.DisplayName -like "*mysql*"}
   ```

3. **启动 MySQL 服务**
   ```powershell
   # 如果服务名是 MySQL80
   Start-Service -Name MySQL80
   
   # 或者如果是 MySQL
   Start-Service -Name MySQL
   ```

4. **验证服务已启动**
   ```powershell
   Get-Service -Name "*mysql*"
   ```
   确认 `Status` 显示为 `Running`

#### 方法 B: 使用服务管理器

1. 按 `Win + R`
2. 输入 `services.msc` 并按回车
3. 找到 MySQL 服务（可能是 "MySQL80" 或 "MySQL"）
4. 右键点击 → "启动"

#### 方法 C: 使用命令行

```powershell
net start MySQL80
```

---

### 步骤 2: 创建 `.env.local` 文件

在 `my-frontend` 目录下创建 `.env.local` 文件：

```env
# 数据库连接配置
# 格式: mysql://用户名:密码@主机:端口/数据库名
DATABASE_URL=mysql://root:your_password@localhost:3306/ida_cn

# NextAuth 配置
# 生成密钥: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
AUTH_SECRET=your-secret-key-here
AUTH_URL=http://localhost:3000
```

**重要提示：**
- 将 `your_password` 替换为你的 MySQL root 密码
- 如果 MySQL 没有密码，使用：`mysql://root@localhost:3306/ida_cn`
- 将 `your-secret-key-here` 替换为生成的密钥

**生成 AUTH_SECRET：**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

### 步骤 3: 创建数据库（如果不存在）

连接到 MySQL：

```powershell
mysql -u root -p
```

然后执行：

```sql
CREATE DATABASE IF NOT EXISTS ida_cn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

---

### 步骤 4: 运行数据库迁移

```powershell
cd my-frontend
npx prisma migrate dev --name init
```

这会：
- 创建所有数据库表（User, VerificationCode, Comment, Notification）
- 生成 Prisma Client
- 创建迁移记录

---

### 步骤 5: 验证连接

```powershell
npx prisma migrate status
```

如果显示 "Database schema is up to date"，说明连接成功！

---

## 🔧 使用自动设置脚本

我已经创建了自动设置脚本，可以帮你完成以上所有步骤：

```powershell
cd D:\IDA_CN\my-frontend
powershell -ExecutionPolicy Bypass -File .\setup-database.ps1
```

**注意：** 如果提示无法执行脚本，运行上面的命令（添加 `-ExecutionPolicy Bypass`）

---

## ❓ 常见问题

### Q1: 找不到 MySQL 服务

**解决方法：**
1. 检查 MySQL 是否已安装
   - 打开 "控制面板" → "程序和功能"
   - 查找 "MySQL Server"
2. 如果未安装，需要先安装 MySQL
   - 查看 `MYSQL_INSTALL_GUIDE.md` 获取安装指南

### Q2: 服务无法启动

**可能原因：**
- 权限不足（需要管理员权限）
- 端口被占用
- 配置文件错误

**解决方法：**
1. 确保以管理员身份运行 PowerShell
2. 检查端口是否被占用：
   ```powershell
   netstat -ano | findstr :3306
   ```
3. 查看 MySQL 错误日志

### Q3: 连接被拒绝

**检查清单：**
- [ ] MySQL 服务是否正在运行
- [ ] 端口是否正确（默认 3306）
- [ ] 用户名和密码是否正确
- [ ] 防火墙是否阻止连接

### Q4: 数据库不存在

**解决方法：**
运行步骤 3 创建数据库，或让 Prisma 自动创建（某些配置下）

---

## ✅ 验证清单

完成以下检查后，数据库应该可以正常使用：

- [ ] MySQL 服务已安装
- [ ] MySQL 服务状态为 "Running"
- [ ] 端口 3306 可以访问
- [ ] `.env.local` 文件已创建
- [ ] `DATABASE_URL` 配置正确
- [ ] 数据库已创建
- [ ] 数据库迁移已运行

---

## 📞 需要帮助？

如果问题仍然存在：

1. **查看详细错误信息**
   - 查看服务器控制台的完整错误堆栈
   - 检查 Prisma 日志

2. **检查 MySQL 日志**
   - 通常在 `C:\ProgramData\MySQL\MySQL Server X.X\Data\`

3. **测试 MySQL 连接**
   ```powershell
   mysql -u root -p -h localhost
   ```

4. **查看相关文档**
   - `DATABASE_SETUP.md` - 数据库配置指南
   - `MYSQL_QUICK_START.md` - MySQL 快速开始
   - `CHECK_MYSQL_SERVICE.md` - MySQL 服务检查

---

## 🎯 下一步

数据库连接成功后，你可以：

1. **测试登录功能**
   - 访问 `/register` 注册新用户
   - 访问 `/login` 测试登录

2. **开始开发留言板功能**
   - 数据库已就绪，可以开始实现留言板
