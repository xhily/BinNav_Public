# 🚀 BinNav - 精选网站导航

一个现代化的网站导航页面，发现优质网站，提升工作效率。支持可视化管理后台、智能图标获取、拖拽排序和自动部署更新。

## 🚀 快速部署

### 一键部署（推荐）

#### EdgeOne Pages（国内推荐）
[![使用 EdgeOne Pages 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?repository-url=https%3A%2F%2Fgithub.com%2Fsindricn%2FBinNav&project-name=BinNav&build-command=npm%20run%20build&install-command=npm%20install&output-directory=dist&env=VITE_ADMIN_PASSWORD,VITE_GITHUB_TOKEN,VITE_GITHUB_REPO,RESEND_API_KEY,ADMIN_EMAIL,RESEND_DOMAIN&env-description=管理后台密码、GitHub令牌、仓库名称、邮件服务配置&env-link=https%3A%2F%2Fgithub.com%2Fsindricn%2FBinNav%23%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F%E9%85%8D%E7%BD%AE)

#### Vercel（国外推荐）
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsindricn%2FBinNav&project-name=BinNav&env=VITE_ADMIN_PASSWORD,VITE_GITHUB_TOKEN,VITE_GITHUB_REPO,RESEND_API_KEY,ADMIN_EMAIL,RESEND_DOMAIN&envDescription=管理后台密码、GitHub令牌、仓库名称、邮件服务配置&envLink=https%3A%2F%2Fgithub.com%2Fsindricn%2FBinNav%23%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F%E9%85%8D%E7%BD%AE)

#### Cloudflare Pages
[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sindricn/BinNav)


### 手动部署
```bash
# 1. 克隆项目
git clone https://github.com/sindricn/BinNav.git
cd BinNav

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build

# 4. 部署 dist 目录到任何静态托管服务
```

## ✨ 核心特性

### 🎨 **现代化设计**
- 响应式布局，完美适配桌面端和移动端
- 毛玻璃效果和流畅动画
- 支持分类图标和网站图标自动获取
- 优雅的卡片式布局

### �️ **强大的管理后台**
- 📝 **网站管理** - 添加、编辑、删除网站，支持拖拽排序
- � **分类管理** - 创建多级分类，自定义图标和排序
- 🎯 **智能图标** - 自动获取网站图标，支持多种回退方案
- � **待审核管理** - 用户提交的网站统一审核
- ⚙️ **系统设置** - 站点信息、Logo、备案信息配置

### 🔄 **自动化部署**
- 一键保存到GitHub，触发自动部署
- EdgeOne Functions API，响应速度快80%
- 支持配置文件本地备份下载
- 无需手动操作，保存即生效

### 🔍 **智能搜索**
- 站内搜索，快速定位网站
- 支持按分类筛选浏览
- 响应式侧边栏导航

## 🚀 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/sindricn/BinNav.git
cd BinNav

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

访问地址：
- 🏠 **首页**: http://localhost:5173
- ⚙️ **管理后台**: http://localhost:5173/admin（默认密码：admin）

## 📸 项目预览

### 首页展示
![首页](https://via.placeholder.com/800x400/f8fafc/64748b?text=BinNav+首页展示)

### 管理后台
![管理后台](https://via.placeholder.com/800x400/f8fafc/64748b?text=管理后台界面)

## ⚙️ 环境变量配置

部署时可配置以下环境变量：

| 变量名 | 描述 | 必需 | 默认值 |
|--------|------|------|--------|
| `VITE_ADMIN_PASSWORD` | 管理后台登录密码 | 否 | `admin` |
| `VITE_GITHUB_TOKEN` | GitHub Personal Access Token | 否 | - |
| `VITE_GITHUB_REPO` | GitHub仓库名（格式：用户名/仓库名） | 否 | - |
| `RESEND_API_KEY` | Resend API Key，用于邮件服务 | 否 | - |
| `ADMIN_EMAIL` | 管理员邮箱，接收新站点提交通知 | 否 | - |
| `RESEND_DOMAIN` | Resend发送域名（仅域名部分） | 否 | - |

**GitHub Token 创建步骤**：
1. 访问 [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 选择 `repo` 权限
4. 复制生成的 token

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

**🌟 如果这个项目对你有帮助，请给个 Star ⭐**