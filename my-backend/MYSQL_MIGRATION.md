# MySQL 数据库迁移指南

本指南将帮助您将 Strapi 项目从 SQLite 迁移到 MySQL。

## 📋 前置要求

1. **MySQL 服务器**
   - MySQL 5.7+ 或 MariaDB 10.3+
   - 已安装并运行

2. **创建数据库**
   ```sql
   CREATE DATABASE strapi_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **创建数据库用户**（推荐）
   ```sql
   CREATE USER 'strapi_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON strapi_production.* TO 'strapi_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

## 🔧 配置步骤

### 1. 安装 MySQL 驱动

已安装 `mysql2` 包，如果未安装，运行：
```bash
cd my-backend
npm install mysql2
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env`：
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置 MySQL 连接：

```env
# 切换到 MySQL
DATABASE_CLIENT=mysql

# MySQL 连接配置
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=strapi_production
DATABASE_USERNAME=strapi_user
DATABASE_PASSWORD=your_secure_password

# SSL 配置（生产环境建议启用）
DATABASE_SSL=false

# 连接池配置
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

### 3. 数据迁移

#### 方法一：使用 Strapi 自动迁移（推荐）

Strapi 会在首次启动时自动创建表结构。如果数据库为空：

```bash
cd my-backend
npm run develop
```

Strapi 会自动：
- 创建所有必要的表
- 设置默认管理员账户

#### 方法二：导出/导入数据

如果已有 SQLite 数据需要迁移：

1. **导出 SQLite 数据**
   ```bash
   # 使用 Strapi 的导出功能（在 Strapi 后台）
   # 或使用 SQLite 导出工具
   ```

2. **导入到 MySQL**
   - 使用 Strapi 的导入功能
   - 或手动转换 SQL 语句

### 4. 验证连接

启动 Strapi 并检查日志：
```bash
npm run develop
```

如果看到类似以下信息，说明连接成功：
```
[INFO] Database connection has been established successfully.
```

## 🚀 生产环境配置

### 1. 安全配置

**启用 SSL 连接**（如果 MySQL 服务器支持）：
```env
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true
```

**使用环境变量**（不要将密码硬编码）：
```env
DATABASE_PASSWORD=${MYSQL_PASSWORD}
```

### 2. 性能优化

**连接池配置**：
```env
# 根据服务器负载调整
DATABASE_POOL_MIN=5      # 最小连接数
DATABASE_POOL_MAX=20     # 最大连接数
```

**MySQL 配置优化**（在 MySQL 服务器配置文件中）：
```ini
[mysqld]
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
```

### 3. 备份策略

**定期备份数据库**：
```bash
# 使用 mysqldump
mysqldump -u strapi_user -p strapi_production > backup_$(date +%Y%m%d).sql
```

**自动备份脚本**（示例）：
```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DB_NAME="strapi_production"
DB_USER="strapi_user"
DATE=$(date +%Y%m%d_%H%M%S)

mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
```

## 🔍 故障排查

### 连接失败

1. **检查 MySQL 服务是否运行**
   ```bash
   # Windows
   net start mysql
   
   # Linux/Mac
   sudo systemctl status mysql
   ```

2. **检查防火墙设置**
   - 确保端口 3306 开放

3. **检查用户权限**
   ```sql
   SHOW GRANTS FOR 'strapi_user'@'localhost';
   ```

### 字符编码问题

确保数据库使用 UTF8MB4：
```sql
ALTER DATABASE strapi_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 性能问题

1. **检查慢查询日志**
   ```sql
   SHOW VARIABLES LIKE 'slow_query%';
   ```

2. **优化索引**
   - Strapi 会自动创建索引
   - 可根据查询模式添加额外索引

## 📊 监控建议

1. **监控连接数**
   ```sql
   SHOW STATUS LIKE 'Threads_connected';
   ```

2. **监控查询性能**
   - 使用 MySQL Workbench
   - 或使用监控工具（如 PM2）

3. **定期检查数据库大小**
   ```sql
   SELECT 
     table_schema AS 'Database',
     ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
   FROM information_schema.TABLES
   WHERE table_schema = 'strapi_production'
   GROUP BY table_schema;
   ```

## ✅ 迁移检查清单

- [ ] MySQL 服务器已安装并运行
- [ ] 数据库已创建（UTF8MB4 编码）
- [ ] 数据库用户已创建并授权
- [ ] `mysql2` 包已安装
- [ ] `.env` 文件已配置 MySQL 连接信息
- [ ] Strapi 成功连接到 MySQL
- [ ] 数据已迁移（如适用）
- [ ] 备份策略已设置
- [ ] SSL 连接已配置（生产环境）
- [ ] 性能监控已设置

## 📚 相关资源

- [Strapi 数据库配置文档](https://docs.strapi.io/dev-docs/configurations/database)
- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [mysql2 包文档](https://github.com/sidorares/node-mysql2)

## 🆘 需要帮助？

如果遇到问题，请检查：
1. Strapi 日志文件
2. MySQL 错误日志
3. 网络连接状态
4. 防火墙设置
