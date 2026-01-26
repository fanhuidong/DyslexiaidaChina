# MySQL 快速配置指南

## 🚀 快速开始

### 1. 确保 MySQL 已安装并运行

```bash
# 检查 MySQL 服务状态
# Windows
net start mysql

# Linux/Mac
sudo systemctl status mysql
```

### 2. 创建数据库

登录 MySQL：
```bash
mysql -u root -p
```

执行以下 SQL：
```sql
CREATE DATABASE strapi_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'strapi_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON strapi_production.* TO 'strapi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. 配置环境变量

在 `my-backend` 目录下创建或编辑 `.env` 文件：

```env
# 数据库配置 - 切换到 MySQL
DATABASE_CLIENT=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=strapi_production
DATABASE_USERNAME=strapi_user
DATABASE_PASSWORD=your_secure_password
DATABASE_SSL=false

# 连接池配置
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### 4. 启动 Strapi

```bash
cd my-backend
npm run develop
```

Strapi 会自动：
- ✅ 连接到 MySQL 数据库
- ✅ 创建所有必要的表结构
- ✅ 初始化默认数据

### 5. 验证连接

查看启动日志，应该看到：
```
[INFO] Database connection has been established successfully.
```

## 📝 注意事项

1. **开发环境**：可以继续使用 SQLite，只需在 `.env` 中设置 `DATABASE_CLIENT=sqlite`
2. **生产环境**：务必使用 MySQL，并启用 SSL 连接
3. **备份**：定期备份数据库，使用 `mysqldump` 命令

## 🔧 切换回 SQLite（开发）

只需在 `.env` 中修改：
```env
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
```

## 📚 详细文档

查看 [MYSQL_MIGRATION.md](./MYSQL_MIGRATION.md) 获取完整的迁移指南。
