# 数据库配置指南

## 步骤 1: 确保 MySQL 服务器运行

请确保 MySQL 服务已启动。可以通过以下方式检查：

### Windows
```powershell
# 检查 MySQL 服务状态
Get-Service -Name MySQL*

# 如果未运行，启动 MySQL 服务
Start-Service -Name MySQL80  # 根据实际服务名调整
```

### 或者使用 MySQL Workbench / 命令行
```bash
mysql -u root -p
```

## 步骤 2: 创建数据库（如果不存在）

连接到 MySQL 后，创建数据库：

```sql
CREATE DATABASE IF NOT EXISTS ida_cn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 步骤 3: 配置 .env 文件

编辑 `my-frontend/.env` 文件，修改 `DATABASE_URL`：

```env
DATABASE_URL=mysql://用户名:密码@主机:端口/数据库名
```

### 示例配置：

**本地开发（默认 root 用户）：**
```env
DATABASE_URL=mysql://root:your_password@localhost:3306/ida_cn
```

**如果 MySQL 没有密码：**
```env
DATABASE_URL=mysql://root@localhost:3306/ida_cn
```

**远程数据库：**
```env
DATABASE_URL=mysql://username:password@192.168.1.100:3306/ida_cn
```

## 步骤 4: 运行数据库迁移

配置好 `DATABASE_URL` 后，运行：

```bash
cd my-frontend
npx prisma migrate dev --name init
```

这会：
- 创建所有数据库表（User, VerificationCode, Comment, Notification）
- 生成 Prisma Client
- 创建迁移记录

## 常见问题

### 1. 连接被拒绝
- 检查 MySQL 服务是否运行
- 检查端口是否正确（默认 3306）
- 检查防火墙设置

### 2. 认证失败
- 检查用户名和密码是否正确
- 确认用户有权限访问数据库

### 3. 数据库不存在
- 先创建数据库（见步骤 2）
- 或者让 Prisma 自动创建（某些配置下）

## 验证连接

运行以下命令测试连接：

```bash
npx prisma db pull
```

如果成功，说明连接正常。
