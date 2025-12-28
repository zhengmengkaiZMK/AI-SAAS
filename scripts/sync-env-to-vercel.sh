#!/bin/bash

# 同步环境变量到 Vercel
# 使用方法: chmod +x scripts/sync-env-to-vercel.sh && ./scripts/sync-env-to-vercel.sh

echo "🚀 开始同步环境变量到 Vercel..."

# 检查是否安装了 vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ 未检测到 Vercel CLI，请先安装: npm i -g vercel"
    exit 1
fi

# 读取 .env.local 文件
ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ 未找到 $ENV_FILE 文件"
    exit 1
fi

echo "📖 读取 $ENV_FILE..."

# 需要同步的关键环境变量
REQUIRED_VARS=(
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
    "DATABASE_URL"
    "DIRECT_URL"
    "PAYPAL_MODE"
    "PAYPAL_CLIENT_ID"
    "PAYPAL_CLIENT_SECRET"
    "NEXT_PUBLIC_PAYPAL_CLIENT_ID"
    "SERPER_API_KEY"
    "SERPER_API_URL"
    "SERPER_TIMEOUT"
    "NODE_ENV"
    "NEXT_PUBLIC_APP_URL"
)

echo "⚙️  准备同步以下变量:"
for var in "${REQUIRED_VARS[@]}"; do
    echo "  - $var"
done

echo ""
read -p "是否继续？(y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 已取消"
    exit 1
fi

# 读取并设置环境变量
while IFS='=' read -r key value; do
    # 跳过注释和空行
    [[ $key =~ ^#.*$ ]] && continue
    [[ -z $key ]] && continue
    
    # 移除引号和空格
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
    
    # 检查是否在需要同步的列表中
    if [[ " ${REQUIRED_VARS[@]} " =~ " ${key} " ]]; then
        echo "📤 设置 $key..."
        echo "$value" | vercel env add "$key" production --force
    fi
done < "$ENV_FILE"

echo ""
echo "✅ 环境变量同步完成！"
echo "⚠️  请注意："
echo "   1. NEXTAUTH_URL 需要改为你的 Vercel 域名"
echo "   2. NEXT_PUBLIC_APP_URL 也需要改为你的 Vercel 域名"
echo "   3. NODE_ENV 应该设置为 'production'"
echo ""
echo "🔄 接下来请："
echo "   1. 在 Vercel Dashboard 中检查环境变量"
echo "   2. 手动修改 URL 相关的变量"
echo "   3. 重新部署项目"
