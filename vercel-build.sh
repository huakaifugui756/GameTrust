#!/bin/bash

# Vercel 构建脚本
echo "开始构建 GameTrust 项目..."

# 设置环境变量
export NODE_OPTIONS="--max-old-space-size=4096"

# 安装依赖
echo "安装依赖..."
npm ci

# 构建项目
echo "构建项目..."
npm run build

echo "构建完成!"