# MySQL 安装指南

## 📊 检查结果

根据系统检查，**MySQL 似乎未安装**。以下是安装步骤。

---

## 🚀 方法 1: 使用 MySQL Installer（推荐，Windows）

### 步骤 1: 下载 MySQL Installer

1. 访问 MySQL 官网：https://dev.mysql.com/downloads/installer/
2. 选择 **MySQL Installer for Windows**
3. 下载 **mysql-installer-community**（推荐，免费版本）
   - 选择较大的安装包（包含所有组件，约 400MB）

### 步骤 2: 运行安装程序

1. 双击下载的 `.msi` 文件
2. 选择安装类型：
   - **Developer Default**（推荐）：包含开发所需的所有工具
   - **Server only**：仅安装 MySQL 服务器
   - **Custom**：自定义安装

### 步骤 3: 配置 MySQL

安装过程中会要求配置：

1. **Type and Networking**（类型和网络）
   - 选择 **Standalone MySQL Server**
   - 端口保持默认 `3306`

2. **Authentication Method**（认证方法）
   - 选择 **Use Strong Password Encryption**（推荐）

3. **Accounts and Roles**（账户和角色）
   - 设置 **root 用户密码**（请记住这个密码！）
   - 可以添加其他用户（可选）

4. **Windows Service**（Windows 服务）
   - ✅ 勾选 **Configure MySQL Server as a Windows Service**
   - Service Name: `MySQL80`（默认）
   - ✅ 勾选 **Start the MySQL Server at System Startup**

5. **Apply Configuration**（应用配置）
   - 点击 **Execute** 完成配置

### 步骤 4: 验证安装

安装完成后，打开 PowerShell（管理员），运行：

```powershell
Get-Service -Name "*mysql*"
```

应该看到 MySQL 服务，状态为 `Running`。

---

## 🐳 方法 2: 使用 Docker（适合开发环境）

如果你熟悉 Docker，可以使用 Docker 运行 MySQL：

### 步骤 1: 安装 Docker Desktop

1. 下载：https://www.docker.com/products/docker-desktop
2. 安装并启动 Docker Desktop

### 步骤 2: 运行 MySQL 容器

```powershell
docker run --name mysql-ida-cn `
  -e MYSQL_ROOT_PASSWORD=your_password `
  -e MYSQL_DATABASE=ida_cn `
  -p 3306:3306 `
  -d mysql:8.0
```

### 步骤 3: 验证

```powershell
docker ps
```

应该看到 MySQL 容器正在运行。

**注意：** 使用 Docker 时，`DATABASE_URL` 仍然是 `mysql://root:your_password@localhost:3306/ida_cn`

---

## 📦 方法 3: 使用 XAMPP（最简单，适合初学者）

XAMPP 包含 MySQL、Apache、PHP 等，一键安装：

### 步骤 1: 下载 XAMPP

1. 访问：https://www.apachefriends.org/
2. 下载 Windows 版本
3. 运行安装程序

### 步骤 2: 启动 MySQL

1. 打开 XAMPP Control Panel
2. 点击 MySQL 旁边的 **Start** 按钮
3. MySQL 服务将启动

### 步骤 3: 配置

- 默认 root 用户：`root`
- 默认密码：**空**（无密码）
- 端口：`3306`

**注意：** 使用 XAMPP 时，`DATABASE_URL` 为：
```
DATABASE_URL=mysql://root@localhost:3306/ida_cn
```

---

## ✅ 安装后验证

### 1. 检查服务

```powershell
Get-Service -Name "*mysql*"
```

### 2. 测试连接

```powershell
Test-NetConnection -ComputerName localhost -Port 3306
```

应该显示 `TcpTestSucceeded : True`

### 3. 使用命令行工具（如果已添加到 PATH）

```powershell
mysql -u root -p
```

输入 root 密码，如果成功进入 MySQL 命令行，说明安装成功。

---

## 🔧 配置项目数据库连接

安装 MySQL 后，编辑 `my-frontend/.env` 文件：

```env
# 如果使用 MySQL Installer（设置了 root 密码）
DATABASE_URL=mysql://root:你的密码@localhost:3306/ida_cn

# 如果使用 XAMPP（无密码）
DATABASE_URL=mysql://root@localhost:3306/ida_cn
```

---

## 📝 创建数据库

连接到 MySQL 后，创建项目数据库：

```sql
CREATE DATABASE IF NOT EXISTS ida_cn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 使用命令行创建：

```powershell
# 如果 MySQL 在 PATH 中
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ida_cn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 或者先登录 MySQL
mysql -u root -p
# 然后执行：
CREATE DATABASE IF NOT EXISTS ida_cn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 🎯 推荐方案

- **开发环境**：推荐使用 **MySQL Installer** 或 **XAMPP**
- **生产环境**：使用 **MySQL Installer** 或云数据库服务

---

## ❓ 常见问题

### Q: 安装后服务无法启动？

**A:** 
1. 检查端口 3306 是否被占用
2. 查看 MySQL 错误日志
3. 以管理员身份运行服务

### Q: 忘记 root 密码？

**A:** 
1. 停止 MySQL 服务
2. 使用 `--skip-grant-tables` 启动 MySQL
3. 重置密码
4. 重启服务

### Q: 端口 3306 被占用？

**A:** 
1. 查找占用端口的进程：`netstat -ano | findstr :3306`
2. 停止占用端口的程序
3. 或修改 MySQL 端口配置

---

## 📚 下一步

安装并配置好 MySQL 后：

1. ✅ 验证 MySQL 服务正在运行
2. ✅ 配置 `.env` 文件中的 `DATABASE_URL`
3. ✅ 创建数据库 `ida_cn`
4. ✅ 运行数据库迁移：`npx prisma migrate dev --name init`
