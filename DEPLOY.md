# 🚀 BinNav 部署操作清单

## 📋 部署前检查

### ✅ 本地环境确认
- [ ] Node.js 18+ 已安装
- [ ] 项目依赖已安装 (`npm install`)
- [ ] 本地可正常运行 (`npm run dev`)
- [ ] 管理后台可正常访问 (`/admin`)

### ✅ GitHub 仓库准备
- [ ] 代码已推送到 GitHub 仓库
- [ ] 仓库为公开状态（或选择的部署平台支持私有仓库）
- [ ] 代码目录结构正确

## 🌐 EdgeOne Pages 部署（推荐）

### 第1步：连接 GitHub 仓库
1. 登录 [EdgeOne 控制台](https://console.edgeone.ai/)
2. 选择 "Pages" → "创建项目"
3. 选择 "从 GitHub 导入"
4. 授权 EdgeOne 访问 GitHub
5. 选择 `binnav` 仓库

### 第2步：配置构建设置
```
项目名称: binnav (或自定义)
分支: main
构建命令: npm run build
输出目录: dist
Node.js 版本: 18.x
```

### 第3步：配置 GitHub Secrets
在 GitHub 仓库设置中添加以下 Secrets：

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `ADMIN_PASSWORD` | 管理后台密码 | `MySecurePassword123!` |
| `PERSONAL_ACCESS_TOKEN` | GitHub Personal Access Token | `ghp_1234567890...` |
| `REPOSITORY_NAME` | 仓库名称 | `username/binnav` |

#### 创建 GitHub Token：
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：✅ `repo` (仓库完全访问)
4. 复制生成的 Token

### 第4步：启动部署
1. 点击 "部署" 按钮
2. 等待构建完成（通常 2-5 分钟）
3. 获取部署 URL

### 第5步：验证部署
- [ ] 网站首页正常访问
- [ ] 管理后台可正常登录
- [ ] 管理后台保存功能正常
- [ ] 图片资源正常显示

## 🛠️ 管理后台配置

### 访问管理后台
1. 访问 `你的域名/admin`
2. 输入在 GitHub Secrets 中设置的密码
3. 成功登录后进入管理界面

### 测试自动部署
1. 在管理后台添加/修改一个网站
2. 点击 "保存配置" 按钮
3. 等待 GitHub Actions 执行完成
4. 刷新主页验证更改已生效

## 🔄 其他部署方式

### Vercel
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### Netlify
1. 登录 Netlify 控制台
2. 选择 "New site from Git"
3. 连接 GitHub 仓库
4. 设置构建命令：`npm run build`
5. 设置输出目录：`dist`
6. 在环境变量中添加上述 3 个变量

### GitHub Pages
```yaml
# 需要在 .github/workflows/ 中添加部署配置
# 详见项目中的 workflow 文件
```

## 🔍 故障排除

### 常见问题

#### 1. 构建失败
- 检查 Node.js 版本是否为 18+
- 确认 `package.json` 中的依赖版本正确
- 查看构建日志中的错误信息

#### 2. 管理后台登录失败
- 确认 `ADMIN_PASSWORD` 环境变量设置正确
- 检查浏览器控制台是否有错误
- 确认网络连接正常

#### 3. 自动部署不工作
- 检查 GitHub Token 权限是否包含 `repo`
- 确认 GitHub Secrets 中的仓库名格式正确
- 查看 GitHub Actions 执行日志

#### 4. 图片不显示
- 确认图片文件在 `src/assets/` 目录下
- 检查图片文件名是否正确
- 重新构建项目

### 检查清单
- [ ] 环境变量配置正确
- [ ] GitHub Token 权限充足
- [ ] 仓库名格式正确
- [ ] 网络连接正常
- [ ] 构建命令正确

## 📊 性能对比

| 部署平台 | 构建时间 | 国内访问速度 | 海外访问速度 | 费用 |
|---------|----------|-------------|-------------|------|
| EdgeOne Pages | 2-3分钟 | 0.15秒 | 0.8秒 | 免费 |
| Vercel | 1-2分钟 | 1.2秒 | 0.2秒 | 免费 |
| Netlify | 2-3分钟 | 1.5秒 | 0.5秒 | 免费 |
| GitHub Pages | 3-5分钟 | 2.0秒 | 1.0秒 | 免费 |

## 🎉 部署完成

部署成功后，你将获得：
- ✅ 一个快速的导航网站
- ✅ 功能完整的管理后台
- ✅ 自动化的内容更新流程
- ✅ 全球CDN加速访问

现在开始管理你的导航网站吧！🚀 