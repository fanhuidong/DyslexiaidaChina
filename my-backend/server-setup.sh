#!/bin/bash
# 服务器初始化脚本
# 在 Ubuntu 服务器上运行

set -e

echo "🚀 开始服务器初始化..."

# 更新系统
echo "📦 更新系统..."
sudo apt update
sudo apt upgrade -y

# 安装基础工具
echo "📦 安装基础工具..."
sudo apt install -y curl wget git build-essential

# 安装 Node.js
echo "📦 安装 Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证 Node.js
echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"

# 安装 MySQL
echo "📦 安装 MySQL..."
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# 安装 PM2
echo "📦 安装 PM2..."
sudo npm install -g pm2

# 安装 Nginx
echo "📦 安装 Nginx..."
sudo apt install -y nginx

# 配置防火墙
echo "🔥 配置防火墙..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo ""
echo "✅ 服务器初始化完成！"
echo ""
echo "下一步："
echo "  1. 配置 MySQL 数据库"
echo "  2. 克隆项目代码"
echo "  3. 配置环境变量"
echo "  4. 启动服务"
