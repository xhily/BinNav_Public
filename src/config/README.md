# 配置系统说明

## 概述

本项目已将配置逻辑从页面显示逻辑中分离，避免配置问题影响页面正常显示。

## 文件结构

```
src/config/
├── env.js          # 环境变量管理
├── README.md       # 本说明文件
└── ...
```

## 环境变量配置

### 1. 本地开发

创建 `.env` 文件（从 `env.example` 复制）：

```bash
cp env.example .env
```

编辑 `.env` 文件，设置以下变量：

```bash
VITE_ADMIN_PASSWORD=your_secure_password
VITE_GITHUB_TOKEN=ghp_your_github_token
VITE_GITHUB_REPO=username/repository-name
```

### 2. 生产环境

在 GitHub 仓库的 **Settings → Secrets and Variables → Actions** 中配置：

| Secret 名称 | 说明 | 示例 |
|------------|------|------|
| `ADMIN_PASSWORD` | 管理后台密码 | `MySecurePassword123!` |
| `PERSONAL_ACCESS_TOKEN` | GitHub API Token | `ghp_1234567890...` |
| `REPOSITORY_NAME` | 仓库名称 | `username/binnav` |

## 配置系统使用

### 1. 获取环境配置

```javascript
import { getEnvConfig } from '../config/env.js'

const envConfig = getEnvConfig()
console.log(envConfig.ADMIN_PASSWORD)
console.log(envConfig.GITHUB_TOKEN)
console.log(envConfig.GITHUB_REPO)
```

### 2. 检查配置状态

```javascript
const configStatus = envConfig.getConfigStatus()
console.log(configStatus.password.message) // ✅ 已自定义 或 ❌ 使用默认密码
console.log(configStatus.token.message)    // ✅ 已配置 或 ❌ 未配置
console.log(configStatus.repo.message)     // ✅ 已配置 或 ❌ 未配置
```

### 3. 验证配置完整性

```javascript
const validation = envConfig.isConfigValid()
console.log(validation.isFullyConfigured) // true/false
console.log(validation.hasPassword)       // true/false
console.log(validation.hasToken)          // true/false
console.log(validation.hasRepo)           // true/false
```

### 4. GitHub API 配置

```javascript
import { getGitHubApiConfig } from '../config/env.js'

const apiConfig = getGitHubApiConfig()
// 自动包含认证头和正确的URL
fetch(apiConfig.dispatchUrl, {
  method: 'POST',
  headers: apiConfig.headers,
  body: JSON.stringify(data)
})
```

## 调试工具

### ConfigDebugger 组件

在开发环境下，页面右下角会显示一个配置调试器按钮：

- 🔧 点击齿轮图标打开调试面板
- 📊 查看环境变量、API 配置、验证状态
- ⚠️ 仅在开发环境下显示，生产环境自动隐藏

### 使用方法

```javascript
import ConfigDebugger from '../components/ConfigDebugger.jsx'

function MyComponent() {
  return (
    <div>
      {/* 你的组件内容 */}
      
      {/* 添加配置调试器 */}
      <ConfigDebugger />
    </div>
  )
}
```

## EdgeOne Pages 部署

### 核心优势

- ✅ **无需 EdgeOne API 密钥**
- ✅ **环境变量自动传递**
- ✅ **Vite 自动处理 VITE_ 前缀**
- ✅ **构建和部署完全自动化**

### 部署流程

1. **连接 GitHub 仓库**
   - EdgeOne Pages 控制台 → 导入项目
   - 选择 GitHub 仓库并授权

2. **配置构建设置**
   ```
   构建命令: npm run build
   输出目录: dist
   Node 版本: 18.x
   ```

3. **配置环境变量**
   - 在 GitHub Secrets 中添加上述 3 个变量
   - EdgeOne Pages 自动读取并传递给构建过程

4. **自动部署**
   - 代码推送 → GitHub Actions → EdgeOne Pages 重新部署
   - 管理后台保存 → GitHub Actions → EdgeOne Pages 重新部署

## 环境变量传递流程

```
GitHub Secrets
    ↓
GitHub Actions (构建时)
    ↓
Vite 构建过程 (VITE_ 前缀)
    ↓
浏览器运行时 (import.meta.env)
    ↓
配置系统 (getEnvConfig)
```

## 故障排除

### 1. 配置未生效

- 检查环境变量名称是否正确（区分大小写）
- 确认 `VITE_` 前缀是否添加
- 重新构建项目

### 2. GitHub API 调用失败

- 验证 GitHub Token 权限（需要 `repo` 权限）
- 检查仓库名格式（`username/repository`）
- 查看网络连接是否正常

### 3. 管理后台密码错误

- 确认环境变量设置正确
- 检查是否使用默认密码 `admin123`
- 清除浏览器本地存储

## 最佳实践

1. **安全性**
   - 生产环境密码足够复杂
   - GitHub Token 权限最小化
   - 定期更新访问令牌

2. **开发效率**
   - 使用配置调试器快速诊断问题
   - 本地开发使用 `.env` 文件
   - 配置变更后及时测试

3. **部署稳定性**
   - 配置变更前先本地测试
   - 使用 GitHub Actions 验证构建
   - 保持环境变量同步更新 