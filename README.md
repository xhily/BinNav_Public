# 🚀 BinNav - 精选网站导航

[![Deploy Status](https://img.shields.io/badge/deployment-EdgeOne%20Pages-00d4aa)](https://edgeone.ai/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646cff)](https://vitejs.dev/)

一个现代化的网站导航页面，发现优质网站，提升工作效率。支持可视化管理后台、智能图标获取、拖拽排序和自动部署更新。

## 🚀 一键部署

### EdgeOne Pages（推荐）
[![使用 EdgeOne Pages 部署](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?repository-url=https%3A%2F%2Fgithub.com%2Fsindricn%2FBinNav&project-name=BinNav&build-command=npm%20run%20build&install-command=npm%20install&output-directory=dist&env=VITE_ADMIN_PASSWORD,VITE_GITHUB_TOKEN,VITE_GITHUB_REPO,RESEND_API_KEY,ADMIN_EMAIL,RESEND_DOMAIN&env-description=管理后台密码、GitHub令牌、仓库名称、邮件服务配置&env-link=https%3A%2F%2Fgithub.com%2Fsindricn%2FBinNav%23%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F%E9%85%8D%E7%BD%AE)

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsindricn%2FBinNav&project-name=BinNav&env=VITE_ADMIN_PASSWORD,VITE_GITHUB_TOKEN,VITE_GITHUB_REPO,RESEND_API_KEY,ADMIN_EMAIL,RESEND_DOMAIN&envDescription=管理后台密码、GitHub令牌、仓库名称、邮件服务配置&envLink=https%3A%2F%2Fgithub.com%2Fsindricn%2FBinNav%23%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F%E9%85%8D%E7%BD%AE)

### Cloudflare Pages
[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sindricn/BinNav)

### 其他平台
- **Netlify**: 拖拽 `dist` 目录到 Netlify 控制台
- **任何静态托管**: 上传 `dist` 目录内容

> 💡 **提示**: 点击上方按钮后，系统会自动：
> - Fork 项目到你的 GitHub 账户
> - 配置构建和部署设置
> - 设置环境变量（可选）
> - 完成首次部署
>
> 📖 **详细部署指南**: 查看 [DEPLOY.md](DEPLOY.md) 获取完整的部署说明

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

## 🚀 快速开始

### 1️⃣ 克隆项目
```bash
git clone https://github.com/sindricn/BinNav.git
cd BinNav
```

### 2️⃣ 安装依赖
```bash
npm install
```

### 3️⃣ 本地开发
```bash
npm run dev
```

访问地址：
- 🏠 **首页**: http://localhost:5173
- ⚙️ **管理后台**: http://localhost:5173/admin（默认密码：admin）

### 4️⃣ 配置环境变量（生产环境）
```bash
# 复制环境变量模板
cp env.example .env

# 编辑 .env 文件，设置以下变量：
VITE_ADMIN_PASSWORD=你的管理密码
VITE_GITHUB_TOKEN=你的GitHub令牌
VITE_GITHUB_REPO=用户名/仓库名
```

## 📸 项目截图

### 首页展示
![首页](https://via.placeholder.com/800x400/f8fafc/64748b?text=BinNav+首页展示)

### 管理后台
![管理后台](https://via.placeholder.com/800x400/f8fafc/64748b?text=管理后台界面)

## 🌐 生产部署

### 🎯 一键部署（推荐）

使用上方的一键部署按钮，几分钟内即可完成部署：

1. **EdgeOne Pages**：
   - 点击 EdgeOne 部署按钮
   - 授权 GitHub 访问
   - 配置环境变量（可选）
   - 自动构建和部署

2. **Vercel**：
   - 点击 Vercel 部署按钮
   - 连接 GitHub 账户
   - 设置环境变量
   - 一键部署完成

3. **Cloudflare Pages**：
   - 点击 Cloudflare Pages 部署按钮
   - 授权 GitHub 访问
   - 自动检测构建配置
   - 配置环境变量（可选）
   - 享受全球 CDN 加速

### ⚙️ 环境变量配置

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

### 🔧 手动部署

#### EdgeOne Pages
1. 登录 [EdgeOne控制台](https://edgeone.ai/)
2. 创建新项目 → 选择"从GitHub导入"
3. 选择 `sindricn/BinNav` 仓库
4. 配置构建设置（已自动检测）
5. 设置环境变量（可选）
6. 点击部署

#### Vercel
```bash
npm i -g vercel
vercel --prod
```

#### Cloudflare Pages
```bash
# 使用 Wrangler CLI
npm install -g wrangler
wrangler login
wrangler pages project create binnav
wrangler pages deploy dist --project-name=binnav
```

#### Netlify
```bash
npm run build
# 将 dist 目录拖拽到 Netlify 控制台
```

#### 其他平台
```bash
npm run build
# 上传 dist 目录到任何静态托管服务
```

## 🛠️ 功能详解

### 管理后台功能

#### 📝 **网站管理**
- ➕ **添加网站** - 支持URL自动解析标题和描述
- 🎯 **智能图标** - 自动获取网站图标，支持多种API回退
- 📁 **分类分配** - 支持一级和二级分类
- 🏷️ **标签管理** - 灵活的标签系统
- 🔄 **拖拽排序** - 可视化调整网站显示顺序
- ✏️ **批量编辑** - 高效的网站信息管理

#### 📋 **分类管理**
- 🆕 **创建分类** - 支持主分类和子分类
- 🎨 **图标定制** - 丰富的内置图标库
- 📊 **拖拽排序** - 自由调整分类显示顺序
- 🏷️ **特殊标记** - 支持专栏等特殊分类
- 📈 **统计信息** - 显示每个分类下的网站数量

#### 📋 **待审核管理**
- 📝 **用户提交** - 前台用户可提交网站申请
- ✅ **审核流程** - 管理员审核、批准或拒绝
- 🔄 **状态管理** - 待审核、已批准、已拒绝状态
- 📊 **批量操作** - 支持批量审核处理

#### ⚙️ **系统设置**
- 🏠 **站点信息** - 网站名称、标题、描述配置
- 🖼️ **Logo管理** - 支持Logo上传和更换
- 📄 **备案信息** - ICP备案和公安备案配置
- 🔐 **安全设置** - 管理员密码修改

#### 💾 **一键保存**
- � **自动部署** - 保存后自动推送到GitHub并部署
- 📦 **备份下载** - 同时生成配置文件备份
- ⚡ **快速响应** - EdgeOne Functions API，响应时间<0.5秒

### 配置文件结构

主要配置文件：`src/websiteData.js`

```javascript
// 网站数据
export const websiteData = [
  {
    id: 1,
    name: "GitHub",
    description: "全球最大代码托管平台",
    url: "https://github.com",
    icon: "https://github.com/favicon.ico",
    category: "dev_tools",
    tags: ["开源", "Git", "协作"]
  }
]

// 分类定义
export const categories = [
  {
    id: "dev_tools",
    name: "开发工具",
    icon: "/assets/innovation_icon.png",
    special: false,
    subcategories: [
      {
        id: "code_host",
        name: "代码托管",
        icon: "/assets/tools_icon.png"
      }
    ]
  },
  {
    id: "author",
    name: "作者专栏",
    icon: "/assets/tech_blogger_avatar.png",
    special: true,
    subcategories: []
  }
]
```

## 🔧 技术栈

### 前端技术
- **React 18.2.0** - 现代化的用户界面库
- **Vite 5.4.19** - 快速的构建工具
- **TailwindCSS 3.3.6** - 实用优先的CSS框架
- **React Router DOM 7.6.2** - 客户端路由
- **Lucide React** - 美观的图标库
- **DnD Kit** - 拖拽功能实现

### 后端服务
- **EdgeOne Functions** - 无服务器API
- **GitHub API** - 配置文件管理
- **多种图标API** - 智能图标获取

### 开发工具
- **ESLint** - 代码质量检查
- **PostCSS** - CSS处理
- **Autoprefixer** - CSS兼容性

## 🎨 自定义配置

### 主题定制
编辑 `tailwind.config.js` 自定义颜色和样式：

```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      }
    }
  }
}
```

### 站点配置
在管理后台的"系统设置"中可配置：
- 站点名称和描述
- Logo图片
- ICP备案信息
- 公安备案信息

## 📁 项目结构

```
BinNav/
├── src/
│   ├── components/              # React组件
│   │   ├── ui/                 # 基础UI组件
│   │   ├── admin/              # 管理后台组件
│   │   │   ├── WebsiteManager.jsx      # 网站管理
│   │   │   ├── CategoryManager.jsx     # 分类管理
│   │   │   ├── PendingWebsiteManager.jsx # 待审核管理
│   │   │   ├── IconManager.jsx         # 图标管理
│   │   │   └── LogoUploader.jsx        # Logo上传
│   │   ├── WebsiteCard.jsx     # 网站卡片组件
│   │   └── SubmitWebsiteForm.jsx # 网站提交表单
│   ├── pages/                  # 页面组件
│   │   ├── HomePage.jsx        # 首页
│   │   └── Admin.jsx           # 管理后台
│   ├── hooks/                  # 自定义Hooks
│   │   ├── useAdminConfig.js   # 管理后台配置
│   │   └── useSiteConfig.js    # 站点配置
│   ├── utils/                  # 工具函数
│   │   └── configGenerator.js  # 配置文件生成
│   ├── assets/                 # 静态资源
│   ├── App.css                 # 全局样式
│   ├── main.jsx                # 应用入口
│   └── websiteData.js          # 网站数据配置
├── functions/                  # EdgeOne Functions
│   └── api/                   # API端点
│       ├── health.js          # 健康检查
│       ├── get-config.js      # 获取配置
│       ├── update-config.js   # 更新配置
│       ├── submit-website.js  # 提交网站
│       ├── process-website-submission.js # 处理网站提交
│       └── list-icons.js      # 图标列表
├── public/                     # 公共资源
│   ├── assets/                # 图标资源
│   └── pending-websites.json  # 待审核网站数据
├── dist/                      # 构建输出
├── package.json               # 项目配置
├── vite.config.js            # Vite配置
├── tailwind.config.js        # TailwindCSS配置
└── README.md                 # 项目说明
```

## 🔒 安全说明

- ✅ **EdgeOne Functions**: 敏感信息完全存储在EdgeOne环境变量中
- ✅ **服务端隔离**: GitHub Token仅在EdgeOne Functions中处理
- ✅ **前端安全**: 前端页面无法直接访问GitHub API
- ✅ **权限最小化**: GitHub Token仅需`repo`权限
- ✅ **边缘安全**: 全球分布式执行，降低单点风险
- ⚠️ **管理后台**: 生产环境建议设置强密码

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙋‍♂️ 常见问题

<details>
<summary><strong>Q: 如何开始使用？</strong></summary>

**A:** 三步即可开始：
1. `git clone https://github.com/sindricn/BinNav.git`
2. `npm install && npm run dev`
3. 访问 http://localhost:5173/admin 进入管理后台（默认密码：admin）
</details>

<details>
<summary><strong>Q: 管理后台保存失败怎么办？</strong></summary>

**A:** 检查以下几点：
1. GitHub Token是否正确设置（需要`repo`权限）
2. 仓库名格式是否为`用户名/仓库名`
3. 网络连接是否正常
4. EdgeOne Functions环境变量是否配置正确

失败时会自动下载配置文件，可手动替换`src/websiteData.js`
</details>

<details>
<summary><strong>Q: 网站图标显示不正常怎么办？</strong></summary>

**A:** 项目支持多种图标获取方式：
1. **自动获取** - 系统会自动尝试多个图标API
2. **手动上传** - 在管理后台可以手动上传图标
3. **默认回退** - 获取失败时会使用默认图标
4. **多重保障** - Google、DuckDuckGo等多个API确保成功率
</details>

<details>
<summary><strong>Q: 如何添加新的分类？</strong></summary>

**A:** 在管理后台操作：
1. 进入"分类管理"标签页
2. 点击"添加分类"按钮
3. 填写分类名称，选择图标
4. 支持创建子分类和特殊分类（如专栏）
5. 可拖拽调整分类显示顺序
</details>

<details>
<summary><strong>Q: 支持哪些部署平台？</strong></summary>

**A:** 项目支持多平台部署：
- **EdgeOne Pages** ⭐ - 最佳国内访问体验，自动部署
- **Vercel** - 海外访问优秀，GitHub集成方便
- **Netlify** - 简单易用，拖拽部署
- **GitHub Pages** - 完全免费，需要额外配置
- **其他平台** - 支持任何静态网站托管服务
</details>

<details>
<summary><strong>Q: 如何备案信息配置？</strong></summary>

**A:** 在管理后台"系统设置"中：
1. 填写ICP备案号（自动链接到工信部网站）
2. 填写公安备案号和链接
3. 留空则不显示在页脚
4. 支持灵活的显示控制
</details>

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=sindricn/BinNav&type=Date)](https://star-history.com/#sindricn/BinNav&Date)

## 🤝 贡献者

感谢所有为这个项目做出贡献的开发者！

<a href="https://github.com/sindricn/BinNav/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sindricn/BinNav" />
</a>

---

<div align="center">

**🌟 如果这个项目对你有帮助，请给个 Star！**

**📧 联系作者：[Sindri](https://i.bincore.cn)**

[🐛 报告问题](https://github.com/sindricn/BinNav/issues) · [💡 功能建议](https://github.com/sindricn/BinNav/discussions) · [📖 详细文档](https://github.com/sindricn/BinNav/wiki)

**© 2025 [Sindri](https://i.bincore.cn) · [MIT License](LICENSE)**

</div>