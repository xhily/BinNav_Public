# 🚀 BinNav 部署指南

本文档详细介绍了如何在各种平台上部署 BinNav 项目。

## 🎯 一键部署

### EdgeOne Pages（推荐）

[![使用 EdgeOne Pages 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?repository-url=https%3A%2F%2Fgithub.com%2Fsindricn%2FBinNav&project-name=BinNav&build-command=npm%20run%20build&install-command=npm%20install&output-directory=dist&env=VITE_ADMIN_PASSWORD,VITE_GITHUB_TOKEN,VITE_GITHUB_REPO,RESEND_API_KEY,ADMIN_EMAIL,RESEND_DOMAIN&env-description=管理后台密码、GitHub令牌、仓库名称、邮件服务配置&env-link=https%3A%2F%2Fgithub.com%2Fsindricn%2FBinNav%23%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F%E9%85%8D%E7%BD%AE)

**优势**：
- 🚀 国内访问速度快
- 🔄 自动部署和更新
- 💰 免费额度充足
- 🛡️ 内置安全防护

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsindricn%2FBinNav&project-name=BinNav&env=VITE_ADMIN_PASSWORD,VITE_GITHUB_TOKEN,VITE_GITHUB_REPO,RESEND_API_KEY,ADMIN_EMAIL,RESEND_DOMAIN&envDescription=管理后台密码、GitHub令牌、仓库名称、邮件服务配置&envLink=https%3A%2F%2Fgithub.com%2Fsindricn%2FBinNav%23%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F%E9%85%8D%E7%BD%AE)

**优势**：
- 🌍 全球 CDN 分发
- 🔧 完善的开发工具
- 📊 详细的分析数据
- 🤝 GitHub 深度集成

### Cloudflare Pages

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sindricn/BinNav)

**优势**：
- ⚡ 全球边缘网络，超快访问速度
- 🛡️ 内置 DDoS 防护和安全功能
- 💰 慷慨的免费额度
- 🔧 强大的 Workers 和 Functions 支持

## ⚙️ 环境变量配置

### 必需配置

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `VITE_ADMIN_PASSWORD` | 管理后台登录密码 | `your_secure_password` |

### 可选配置（启用自动更新和邮件功能）

| 变量名 | 描述 | 示例值 |
|--------|------|--------|
| `VITE_GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` |
| `VITE_GITHUB_REPO` | GitHub 仓库名称 | `username/repository` |
| `RESEND_API_KEY` | Resend API Key（邮件服务） | `re_xxxxxxxxxxxx` |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@yourdomain.com` |
| `RESEND_DOMAIN` | Resend发送域名 | `yourdomain.com` |

### GitHub Token 创建步骤

1. **访问 GitHub Settings**
   - 登录 GitHub
   - 进入 [Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)

2. **创建新 Token**
   - 点击 "Generate new token (classic)"
   - 填写 Token 描述：`BinNav Auto Update`
   - 选择过期时间（建议选择较长时间）

3. **设置权限**
   - 勾选 `repo` 权限（包含所有子权限）
   - 如果是私有仓库，确保包含 `repo:status` 和 `repo_deployment`

4. **保存 Token**
   - 点击 "Generate token"
   - **立即复制并保存 Token**（只显示一次）

## 🔧 手动部署

### EdgeOne Pages

1. **准备工作**
   ```bash
   git clone https://github.com/sindricn/BinNav.git
   cd BinNav
   npm install
   npm run build
   ```

2. **创建项目**
   - 访问 [EdgeOne 控制台](https://edgeone.ai/)
   - 点击 "创建项目"
   - 选择 "从 Git 导入"

3. **配置项目**
   ```
   项目名称: BinNav
   Git 仓库: https://github.com/sindricn/BinNav
   分支: main
   构建命令: npm run build
   安装命令: npm install
   输出目录: dist
   Node 版本: 18.x
   ```

4. **设置环境变量**
   - 在项目设置中添加环境变量
   - 参考上方环境变量配置表

5. **部署**
   - 点击 "立即部署"
   - 等待构建完成

### Vercel

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   git clone https://github.com/sindricn/BinNav.git
   cd BinNav
   vercel --prod
   ```

4. **配置环境变量**
   ```bash
   vercel env add VITE_ADMIN_PASSWORD
   vercel env add VITE_GITHUB_TOKEN
   vercel env add VITE_GITHUB_REPO
   ```

### Cloudflare Pages

1. **准备工作**
   ```bash
   git clone https://github.com/sindricn/BinNav.git
   cd BinNav
   npm install
   npm run build
   ```

2. **方式一：通过 Dashboard**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 选择 "Workers & Pages" > "Create application"
   - 选择 "Pages" > "Connect to Git"
   - 选择 GitHub 仓库 `sindricn/BinNav`
   - 配置构建设置：
     ```
     Framework preset: None
     Build command: npm run build
     Build output directory: dist
     Root directory: /
     ```

3. **方式二：使用 Wrangler CLI**
   ```bash
   # 安装 Wrangler
   npm install -g wrangler

   # 登录 Cloudflare
   wrangler login

   # 创建 Pages 项目
   wrangler pages project create binnav

   # 部署项目
   wrangler pages deploy dist --project-name=binnav
   ```

4. **配置环境变量**
   - 在 Cloudflare Dashboard 中进入项目
   - 选择 "Settings" > "Environment variables"
   - 添加所需的环境变量

### Netlify

1. **构建项目**
   ```bash
   git clone https://github.com/sindricn/BinNav.git
   cd BinNav
   npm install
   npm run build
   ```

2. **部署方式一：拖拽部署**
   - 访问 [Netlify](https://netlify.com/)
   - 将 `dist` 目录拖拽到部署区域

3. **部署方式二：Git 集成**
   - 连接 GitHub 仓库
   - 配置构建设置：
     ```
     Build command: npm run build
     Publish directory: dist
     ```



## 🔍 部署验证

部署完成后，访问你的网站：

1. **首页测试**
   - 检查网站是否正常加载
   - 测试搜索功能
   - 验证网站卡片点击

2. **管理后台测试**
   - 访问 `/admin` 路径
   - 使用配置的密码登录
   - 测试网站管理功能

3. **自动更新测试**（如果配置了 GitHub Token）
   - 在管理后台添加一个测试网站
   - 点击保存配置
   - 检查 GitHub 仓库是否自动更新

## 🚨 常见问题

### 构建失败

**问题**：`npm run build` 失败
**解决**：
1. 检查 Node.js 版本（推荐 18.x）
2. 清除缓存：`npm cache clean --force`
3. 重新安装：`rm -rf node_modules && npm install`

### 环境变量不生效

**问题**：管理后台无法登录
**解决**：
1. 确认环境变量名称正确
2. 检查变量值是否包含特殊字符
3. 重新部署项目

### GitHub Token 权限不足

**问题**：自动更新失败
**解决**：
1. 确认 Token 包含 `repo` 权限
2. 检查仓库名称格式：`username/repository`
3. 验证 Token 是否过期

## 📞 获取帮助

如果遇到部署问题：

1. 查看 [GitHub Issues](https://github.com/sindricn/BinNav/issues)
2. 提交新的 Issue 描述问题
3. 联系作者：[Sindri](https://i.bincore.cn)

---

**祝你部署顺利！** 🎉
