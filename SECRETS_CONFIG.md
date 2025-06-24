# 🔐 GitHub Secrets 配置指南

## ⚠️ 重要：变量名规范修正

GitHub Secrets 不能以 `GITHUB_` 开头，我们已修正了所有变量名。

## 📋 **需要配置的 3 个 Secrets**

### **在 GitHub 仓库中设置：**

| Secret 名称 | 说明 | 示例值 | 对应环境变量 |
|------------|------|--------|------------|
| `ADMIN_PASSWORD` | 管理后台密码 | `MySecure123!` | `VITE_ADMIN_PASSWORD` |
| `PERSONAL_ACCESS_TOKEN` | GitHub API Token | `ghp_1234567890...` | `VITE_GITHUB_TOKEN` |
| `REPOSITORY_NAME` | 仓库完整名称 | `username/binnav` | `VITE_GITHUB_REPO` |

## 🚀 **详细配置步骤**

### **第1步：配置 GitHub Secrets**

1. **进入仓库设置**
   ```
   你的GitHub仓库 → Settings → Secrets and variables → Actions
   ```

2. **添加 Repository secrets**
   
   **逐个添加以下 3 个密钥：**
   
   #### A. ADMIN_PASSWORD
   ```
   - 点击 "New repository secret"
   - Name: ADMIN_PASSWORD
   - Secret: 你的管理后台密码（如：MySecurePassword123!）
   - 点击 "Add secret"
   ```
   
   #### B. PERSONAL_ACCESS_TOKEN
   ```
   - 点击 "New repository secret"  
   - Name: PERSONAL_ACCESS_TOKEN
   - Secret: 你的GitHub Token（如：ghp_xxxxxxxxxxxx）
   - 点击 "Add secret"
   ```
   
   #### C. REPOSITORY_NAME
   ```
   - 点击 "New repository secret"
   - Name: REPOSITORY_NAME  
   - Secret: 你的仓库名（如：zhang123/binnav）
   - 点击 "Add secret"
   ```

### **第2步：创建 GitHub Token**

1. **访问 Token 设置**
   ```
   GitHub 头像 → Settings → Developer settings → Personal access tokens
   ```

2. **选择 Token 类型**
   
   **推荐：使用 Classic Token**
   ```
   - 点击 "Tokens (classic)" → "Generate new token (classic)"
   - Token name: BinNav Admin Token
   - Expiration: 90 days（或更长）
   - Select scopes: ✅ repo（勾选完整的repo权限）
   - 点击 "Generate token"
   - ⚠️ 立即复制保存 Token！
   ```

### **第3步：本地开发配置**

1. **复制环境变量模板**
   ```bash
   cp env.example .env
   ```

2. **编辑 .env 文件**
   ```bash
   # 本地开发环境变量
   VITE_ADMIN_PASSWORD=MySecurePassword123!
   VITE_GITHUB_TOKEN=ghp_your_actual_token_here
   VITE_GITHUB_REPO=your-username/binnav
   ```

## ✅ **配置验证清单**

### **GitHub 端验证**
- [ ] 在 `Settings → Secrets and variables → Actions` 中看到 3 个 secrets
- [ ] Secret 名称完全正确（区分大小写）
- [ ] 没有以 `GITHUB_` 开头的 Secret 名称
- [ ] GitHub Token 权限包含 `repo`

### **本地端验证**
- [ ] `.env` 文件存在且配置正确
- [ ] 本地可以正常运行：`npm run dev`
- [ ] 管理后台可以登录：`http://localhost:5173/admin`

### **功能验证**
- [ ] 管理后台登录成功
- [ ] 添加/编辑网站信息正常
- [ ] 点击"保存配置"后无错误提示
- [ ] 查看 GitHub Actions 执行状态正常

## 🔍 **故障排除**

### **常见错误及解决方案**

#### **1. Secret names must not start with GITHUB_**
```
❌ 错误的命名：GITHUB_TOKEN_CUSTOM, GITHUB_REPO
✅ 正确的命名：PERSONAL_ACCESS_TOKEN, REPOSITORY_NAME
```

#### **2. 管理后台保存失败**
**检查项目：**
- GitHub Token 是否有效（未过期）
- Token 权限是否包含 `repo`
- 仓库名格式是否正确（`用户名/仓库名`）
- 网络连接是否正常

#### **3. GitHub Actions 不触发**
**检查项目：**
- Secret 名称是否完全匹配（区分大小写）
- 仓库是否为 Fork（Fork 仓库不能添加 Secrets）
- 是否有仓库管理员权限

#### **4. 环境变量未生效**
**检查项目：**
- `.env` 文件是否在项目根目录
- 环境变量名是否以 `VITE_` 开头
- 是否重新启动了开发服务器

## 🔄 **变量映射关系**

```
本地开发 (.env)          →  GitHub Secrets         →  GitHub Actions
VITE_ADMIN_PASSWORD     →  ADMIN_PASSWORD         →  环境变量注入
VITE_GITHUB_TOKEN       →  PERSONAL_ACCESS_TOKEN  →  环境变量注入  
VITE_GITHUB_REPO        →  REPOSITORY_NAME        →  环境变量注入
```

## 📞 **需要帮助？**

如果配置过程中遇到问题：

1. **检查变量名拼写**（区分大小写）
2. **验证 GitHub Token 权限**
3. **确认仓库名格式正确**  
4. **查看 GitHub Actions 执行日志**

配置完成后，你就可以享受完全自动化的内容管理和部署体验了！🚀 