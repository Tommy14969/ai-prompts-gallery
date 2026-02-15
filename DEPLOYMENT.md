# 部署指南

## GitHub Pages 部署

### 方法一：使用 GitHub Actions 自动部署

1. 在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. 推送到 GitHub，GitHub Actions 会自动构建并部署

### 方法二：手动部署

```bash
# 构建项目
npm run build

# 安装 gh-pages（如果还没安装）
npm install -g gh-pages

# 部署到 GitHub Pages
gh-pages -d dist
```

## Vercel 部署

1. 导入项目到 Vercel
2. Vercel 会自动检测 Vite 项目
3. 点击 Deploy

## Netlify 部署

1. 导入项目到 Netlify
2. 设置以下配置：
   - Build command: `npm run build`
   - Publish directory: `dist`
3. 点击 Deploy

## 环境变量（可选）

在部署平台设置以下环境变量：

- `VITE_DEFAULT_GITHUB_USERNAME`: 默认 GitHub 用户名
- `VITE_DEFAULT_GITHUB_REPO`: 默认仓库名称
