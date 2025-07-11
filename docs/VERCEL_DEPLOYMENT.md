# Vercel 部署指南

## 🚀 快速部署

### 1. 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsindricn%2FBinNav_Public&project-name=BinNav_Public)

### 2. 手动部署

```bash
# 1. 克隆项目
git clone https://github.com/sindricn/BinNav_Public.git
cd BinNav_Public

# 2. 安装 Vercel CLI
npm install -g vercel

# 3. 登录 Vercel
vercel login

# 4. 部署项目
vercel --prod
```

## ⚙️ 环境变量配置

部署完成后，需要在 Vercel Dashboard 中手动配置以下环境变量：

### 必需的环境变量

| 变量名 | 描述 | 示例值 | 必需 |
|--------|------|--------|------|
| `ADMIN_PASSWORD` | 管理后台登录密码 | `your_secure_password` | 否* |
| `GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` | 否* |
| `GITHUB_REPO` | GitHub仓库名 | `username/BinNav` | 否* |
| `RESEND_API_KEY` | Resend邮件服务API密钥 | `re_xxxxxxxxxxxx` | 否* |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@yourdomain.com` | 否* |
| `RESEND_DOMAIN` | 邮件发送域名 | `yourdomain.com` | 否* |

> *标记为"否"的变量不是必需的，但会影响对应功能的使用

### 配置步骤

1. **访问 Vercel Dashboard**
   - 登录 [Vercel Dashboard](https://vercel.com/dashboard)
   - 找到你的 BinNav 项目

2. **进入项目设置**
   - 点击项目名称进入项目详情
   - 点击 "Settings" 标签

3. **配置环境变量**
   - 在左侧菜单中点击 "Environment Variables"
   - 点击 "Add New" 按钮
   - 输入变量名和值
   - 选择环境：Production, Preview, Development（建议全选）
   - 点击 "Save" 保存

4. **重新部署**
   - 配置完环境变量后，需要重新部署项目
   - 在 "Deployments" 标签中，点击最新部署右侧的三个点
   - 选择 "Redeploy" 重新部署

## 🔧 功能说明

### 基础功能（无需配置）
- ✅ 网站导航展示
- ✅ 分类浏览
- ✅ 搜索功能
- ✅ 管理后台访问（默认密码：admin）

### 高级功能（需要配置对应环境变量）

#### 自动保存到GitHub
**需要配置**: `GITHUB_TOKEN` + `GITHUB_REPO`
- 管理后台修改配置后自动保存到GitHub
- 触发自动重新部署

#### 邮件通知功能
**需要配置**: `RESEND_API_KEY` + `ADMIN_EMAIL` + `RESEND_DOMAIN`
- 用户提交网站时发送邮件通知
- 审核结果邮件通知

#### 自定义管理密码
**需要配置**: `ADMIN_PASSWORD`
- 修改管理后台默认密码

## 🔑 获取API密钥

### GitHub Token
1. 访问 [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 选择 `repo` 权限
4. 复制生成的 token

### Resend API Key
1. 访问 [Resend Dashboard](https://resend.com/api-keys)
2. 创建新的API密钥
3. 复制API密钥

## 🚨 常见问题

### Q: 部署时出现Function Runtime错误？
**A:** 这是vercel.json中runtime配置问题，尝试以下解决方案：

**方案1**: 使用Edge Runtime格式（推荐）
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "functions": {
    "functions/api/*.js": {
      "runtime": "edge",
      "maxDuration": 10,
      "memory": 128
    }
  },
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "cleanUrls": true
}
```

**方案2**: 使用简化配置
删除当前的vercel.json，重命名vercel-simple.json为vercel.json：
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "cleanUrls": true
}
```

**方案3**: 完全删除vercel.json
让Vercel自动检测项目配置

### Q: 部署后无法访问管理后台？
**A:** 检查以下几点：
- 访问地址是否正确：`https://your-domain.vercel.app/admin`
- 默认密码是 `admin`
- 如果设置了 `ADMIN_PASSWORD`，使用自定义密码

### Q: 无法保存配置到GitHub？
**A:** 确保已正确配置：
- `GITHUB_TOKEN` - 有效的GitHub访问令牌
- `GITHUB_REPO` - 正确的仓库名格式（用户名/仓库名）
- GitHub Token 有 `repo` 权限

### Q: 邮件通知不工作？
**A:** 确保已配置所有邮件相关变量：
- `RESEND_API_KEY` - 有效的Resend API密钥
- `ADMIN_EMAIL` - 管理员邮箱地址
- `RESEND_DOMAIN` - 邮件发送域名

### Q: 如何更新环境变量？
**A:** 
1. 在Vercel Dashboard中修改环境变量
2. 重新部署项目使变量生效

## 📝 注意事项

- 环境变量修改后需要重新部署才能生效
- 建议在生产环境中修改默认管理密码
- GitHub Token 只需要 `repo` 权限，不要给予过多权限
- 邮件域名需要在Resend中验证后才能使用

---

**💡 提示**: 如果遇到部署问题，可以查看 Vercel 的部署日志获取详细错误信息。
