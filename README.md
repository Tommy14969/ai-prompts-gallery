# AI 图片提示词库

基于 React + TypeScript + Vite 构建的 AI 图片提示词管理系统，使用 GitHub Issues 作为数据存储。

## 特性

- 🔐 **安全认证**：只有仓库协作者才能上传内容
- 📝 **提示词管理**：创建、查看、删除 AI 图片提示词
- 🖼️ **图片预览**：支持上传和预览提示词生成的图片
- 🔍 **搜索筛选**：按模型、分类、关键词搜索提示词
- 📋 **一键复制**：快速复制提示词内容
- 💾 **GitHub 存储**：数据存储在 GitHub Issues 中，无需数据库
- 🎨 **精美 UI**：基于 Tailwind CSS 的现代化界面

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **数据存储**: GitHub API (Issues)

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建

```bash
npm run build
```

### 预览构建

```bash
npm run preview
```

## 使用说明

### 1. 配置仓库

首次使用时，点击右上角"设置"按钮：
- 输入 GitHub 用户名
- 输入仓库名称（如 `ai-prompts-gallery`）
- 保存设置

### 2. 添加协作者

在 GitHub 仓库设置中添加协作者：
1. 进入仓库的 Settings
2. 点击左侧的 Collaborators
3. 添加协作者的 GitHub 用户名

### 3. 管理员登录

点击"管理员登录"按钮：
- 输入 GitHub Personal Access Token
- 系统会验证是否为仓库协作者
- 验证通过后可以上传内容

### 4. 创建提示词

登录后，点击"新建提示词"：
- 填写标题、选择 AI 模型和分类
- 可选上传预览图
- 输入标签（逗号分隔）
- 填写完整的提示词内容
- 保存后自动上传到 GitHub Issues

### 5. 管理提示词

- **查看**：浏览所有提示词，支持搜索和筛选
- **复制**：点击"复制"按钮快速复制提示词
- **删除**：点击删除按钮关闭对应的 GitHub Issue

## GitHub Token 创建

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 设置名称，如 "AI Prompts Gallery"
4. 选择权限：
   - ✅ repo (Full control of private repositories)
5. 点击 "Generate token"
6. 复制生成的 token（只显示一次！）

## 项目结构

```
ai-prompts-gallery/
├── src/
│   ├── components/      # React 组件
│   ├── contexts/        # React Context
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # 工具库
│   ├── store/           # Zustand 状态管理
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── App.tsx          # 主应用组件
│   ├── main.tsx         # 应用入口
│   └── index.css        # 全局样式
├── public/              # 静态资源
├── index.html           # HTML 模板
├── tailwind.config.js   # Tailwind 配置
├── tsconfig.json        # TypeScript 配置
└── vite.config.ts       # Vite 配置
```

## 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择源为 `Vite`
4. 访问 `https://username.github.io/repository-name/`

## 安全说明

- Token 存储在浏览器 localStorage 中
- 只有仓库协作者才能上传
- 仓库必须是公开的（或 Token 有访问权限）

## 故障排除

### 无法登录
- 检查 Token 是否有 `repo` 权限
- 检查是否是仓库的协作者

### 无法加载内容
- 检查仓库设置中的用户名和仓库名
- 确认仓库是公开的

### 图片上传失败
- 检查 Token 是否有 `repo` 权限
- 检查图片文件大小（限制 25MB）

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT
