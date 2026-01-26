#!/bin/bash
# Vercel 部署前检查脚本

echo "🔍 检查部署前准备..."

# 检查环境变量文件
if [ ! -f ".env.local" ]; then
    echo "⚠️  警告: 未找到 .env.local 文件"
    echo "请在 Vercel 控制台配置以下环境变量："
    echo "  - DATABASE_URL"
    echo "  - AUTH_SECRET"
    echo "  - AUTH_URL"
    echo "  - NEXT_PUBLIC_FRONTEND_URL"
    echo "  - NEXT_PUBLIC_STRAPI_URL"
else
    echo "✅ 找到 .env.local 文件"
fi

# 检查 Prisma schema
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ 错误: 未找到 Prisma schema 文件"
    exit 1
else
    echo "✅ Prisma schema 文件存在"
fi

# 检查必要的文件
required_files=(
    "package.json"
    "next.config.ts"
    "src/app/api/message-board/route.ts"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 错误: 未找到 $file"
        exit 1
    else
        echo "✅ $file 存在"
    fi
done

echo ""
echo "✅ 检查完成！可以部署到 Vercel"
