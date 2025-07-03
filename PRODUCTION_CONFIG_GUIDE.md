# 🔧 EdgeOne Functions 环境变量配置检查

## 生产环境配置问题解决方案

### 问题1: 管理密码验证失败
**错误信息**: "管理密码未配置，请在EdgeOne项目中配置ADMIN_PASSWORD环境变量"

**解决方案**:
1. 登录EdgeOne控制台
2. 进入项目设置 → 环境变量
3. 添加环境变量: `ADMIN_PASSWORD` = 你的管理密码
4. **注意**: 不是 `VITE_ADMIN_PASSWORD`

### 问题2: 站点提交失败 (500错误)
**错误信息**: "POST /api/submit-website 500 (Internal Error)"

**解决方案**:
检查EdgeOne Functions环境变量配置:
- `GITHUB_TOKEN` = GitHub Personal Access Token
- `GITHUB_REPO` = username/repository-name
- `RESEND_API_KEY` = Resend邮件服务密钥
- `ADMIN_EMAIL` = 管理员邮箱
- `RESEND_DOMAIN` = Resend发送域名

### 完整环境变量列表

| EdgeOne Functions变量 | 说明 | 示例 |
|---------------------|------|------|
| `ADMIN_PASSWORD` | 管理后台密码 | `MySecurePassword123!` |
| `GITHUB_TOKEN` | GitHub API Token | `ghp_1234567890...` |
| `GITHUB_REPO` | 仓库名称 | `username/binnav` |
| `RESEND_API_KEY` | 邮件服务密钥 | `re_1234567890...` |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@example.com` |
| `RESEND_DOMAIN` | Resend发送域名（仅域名部分） | `yourdomain.com` |

### 环境变量名称对比

| 功能 | 前端环境变量 | EdgeOne Functions变量 |
|------|-------------|---------------------|
| 管理密码 | `VITE_ADMIN_PASSWORD` | `ADMIN_PASSWORD` |
| GitHub Token | `VITE_GITHUB_TOKEN` | `GITHUB_TOKEN` |
| GitHub仓库 | `VITE_GITHUB_REPO` | `GITHUB_REPO` |

### 检查步骤
1. ✅ 确认所有6个环境变量都已配置
2. ✅ 变量名称完全匹配（区分大小写）
3. ✅ GitHub Token权限包含 `repo`
4. ✅ 仓库名格式为 `用户名/仓库名`
5. ✅ 重新部署Functions

### 测试API
可以访问以下端点检查配置:
- `GET /api/health` - 检查服务状态和配置
- `POST /api/verify-password` - 测试密码验证

### 常见错误示例

#### 错误1: 环境变量名称错误
```
❌ 错误配置: VITE_ADMIN_PASSWORD (EdgeOne Functions中)
✅ 正确配置: ADMIN_PASSWORD
```

#### 错误2: GitHub Token权限不足
```
❌ 错误: Token权限只有 public_repo
✅ 正确: Token权限包含 repo (完整仓库访问)
```

#### 错误3: 仓库名格式错误
```
❌ 错误: binnav 或 https://github.com/user/binnav
✅ 正确: username/binnav
```

### 修复步骤

1. **登录EdgeOne控制台**
   - 访问 https://console.edgeone.ai/
   - 选择你的BinNav项目

2. **配置环境变量**
   - 点击"项目设置" → "环境变量"
   - 添加或修改上述5个环境变量
   - 确保变量名称完全匹配

3. **重新部署**
   - 保存环境变量后
   - 手动触发重新部署
   - 或推送代码触发自动部署

4. **验证修复**
   - 访问 `/api/health` 检查配置状态
   - 尝试登录管理后台
   - 测试站点提交功能

### 联系支持
如果按照上述步骤仍无法解决问题，请提供以下信息：
- EdgeOne项目ID
- 具体错误信息截图
- 环境变量配置截图（隐藏敏感信息）

---
**更新时间**: 2025年1月  
**版本**: v1.0.0 