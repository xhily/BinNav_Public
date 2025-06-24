# 🚀 BinNav - 简洁导航网站

[![Deploy Status](https://img.shields.io/badge/deployment-EdgeOne%20Pages-00d4aa)](https://edgeone.ai/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

一个现代化的网站导航页面，支持可视化管理后台，自动部署更新。

## ✨ 特性

- 🎨 **现代UI设计** - 响应式布局，支持深浅色主题
- 🔍 **智能搜索** - 支持多搜索引擎切换和站内搜索
- 📱 **移动友好** - 完美适配各种设备
- ⚡ **高性能** - Vite构建，快速加载
- 🛠️ **可视化管理** - 拖拽排序，实时预览
- 🔄 **自动部署** - 保存即部署，无需手动操作

## 🚀 快速开始

### 1️⃣ 克隆项目
```bash
git clone https://github.com/your-username/binnav.git
cd binnav
```

### 2️⃣ 安装依赖
```bash
npm install
```

### 3️⃣ 配置环境变量
```bash
# 复制环境变量模板
cp env.example .env

# 编辑 .env 文件，设置以下3个变量：
# VITE_ADMIN_PASSWORD=你的管理密码
# VITE_GITHUB_TOKEN=你的GitHub令牌  
# VITE_GITHUB_REPO=用户名/仓库名
#
# 对应的GitHub Secrets：
# ADMIN_PASSWORD, PERSONAL_ACCESS_TOKEN, REPOSITORY_NAME
```

### 4️⃣ 本地开发
```bash
npm run dev
```

访问：
- 🏠 **首页**: http://localhost:5173
- ⚙️ **管理后台**: http://localhost:5173/admin

## 🌐 生产部署

### 方式一：EdgeOne Pages（推荐）

EdgeOne Pages提供最佳的国内访问性能：

1. **连接GitHub**
   - 登录 [EdgeOne控制台](https://console.edgeone.ai/)  
   - 创建新项目 → 选择"从GitHub导入"
   - 授权并选择你的仓库

2. **配置构建**
   ```
   构建命令: npm run build
   输出目录: dist
   Node版本: 18.x
   ```

3. **设置Secrets**
   - 在GitHub仓库 → Settings → Secrets → Actions
   - 添加3个环境变量：
     - `ADMIN_PASSWORD`: 管理后台密码
     - `PERSONAL_ACCESS_TOKEN`: [创建GitHub Token](https://github.com/settings/tokens)
     - `REPOSITORY_NAME`: 格式为"用户名/仓库名"

4. **自动部署**
   - 代码推送后自动构建部署
   - 管理后台保存配置也会触发部署
   - 访问速度：国内 ~0.15秒

### 方式二：其他平台

#### Vercel
```bash
npm i -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
# 将 dist 目录拖拽到 Netlify 控制台
```

## 🛠️ 使用指南

### 管理后台功能

1. **网站管理**
   - ➕ 添加/编辑网站信息
   - 🎯 设置图标、标题、描述
   - 📁 分配分类和标签
   - 🔗 配置跳转链接

2. **分类管理**
   - 📋 创建主分类和子分类
   - 🎨 自定义分类图标和颜色
   - 📊 拖拽调整显示顺序

3. **一键保存**
   - 💾 自动保存到GitHub
   - 🚀 触发自动部署
   - 📦 同时下载备份文件

### 配置文件结构

主要配置文件：`src/websiteData.js`

```javascript
// 网站数据
export const websiteData = [
  {
    id: 1,
    title: "GitHub",
    description: "全球最大代码托管平台",
    url: "https://github.com",
    icon: "/assets/github-icon.png",
    category: "开发工具",
    subcategory: "代码托管",
    tags: ["开源", "Git", "协作"]
  }
]

// 分类定义
export const categories = [
  {
    id: "dev_tools",
    name: "开发工具", 
    icon: "⚡",
    color: "blue",
    subcategories: [
      { id: "code_host", name: "代码托管" },
      { id: "ide", name: "开发环境" }
    ]
  }
]
```

## 🔧 自定义配置

### 主题定制
编辑 `tailwind.config.js` 自定义颜色和样式：

```javascript
module.exports = {
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

### 搜索引擎
在 `src/websiteData.js` 中修改搜索引擎配置：

```javascript
export const searchEngines = [
  { id: "bing", name: "必应", url: "https://www.bing.com/search?q=", color: "bg-blue-600" },
  { id: "baidu", name: "百度", url: "https://www.baidu.com/s?wd=", color: "bg-red-600" }
]
```

## 📁 项目结构

```
binnav/
├── src/
│   ├── components/          # React组件
│   │   ├── ui/             # 基础UI组件
│   │   └── WebsiteCard.jsx # 网站卡片组件
│   ├── pages/              # 页面组件
│   │   ├── HomePage.jsx    # 首页
│   │   └── Admin.jsx       # 管理后台
│   ├── assets/             # 静态资源
│   └── websiteData.js      # 网站数据配置
├── .github/workflows/      # GitHub Actions
├── dist/                   # 构建输出
└── public/                 # 公共资源
```

## 🔒 安全说明

- ✅ **环境变量隔离**: 本地开发使用`.env`，生产使用GitHub Secrets
- ✅ **Token安全**: GitHub Token仅在服务端执行，前端无法访问
- ✅ **权限最小化**: GitHub Token仅需`repo`权限
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
<summary><strong>Q: 管理后台保存失败怎么办？</strong></summary>

**A:** 检查以下几点：
1. GitHub Token是否正确设置
2. Token是否有`repo`权限
3. 仓库名格式是否为`用户名/仓库名`
4. 网络连接是否正常

失败时会自动下载配置文件，可手动替换`src/websiteData.js`
</details>

<details>
<summary><strong>Q: 图片显示不出来怎么办？</strong></summary>

**A:** 请确保：
1. 图片文件放在`src/assets/`目录下
2. 在代码中正确导入图片：`import logoImg from '../assets/logo.png'`
3. 重新构建项目：`npm run build`
</details>

<details>
<summary><strong>Q: 如何更换部署平台？</strong></summary>

**A:** 项目支持多平台部署：
- **EdgeOne Pages**: 最佳国内访问体验
- **Vercel**: 海外访问优秀，GitHub集成方便  
- **Netlify**: 简单易用，拖拽部署
- **GitHub Pages**: 完全免费，但需要额外配置
</details>

---

<div align="center">

**🌟 如果这个项目对你有帮助，请给个 Star！**

[🐛 报告问题](https://github.com/your-username/binnav/issues) · [💡 功能建议](https://github.com/your-username/binnav/discussions) · [📖 详细文档](https://github.com/your-username/binnav/wiki)

</div> 