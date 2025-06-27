# EdgeOne Functions 环境变量配置

## 必需的环境变量

### GitHub 配置
- `GITHUB_TOKEN`: GitHub Personal Access Token，用于操作仓库文件
- `GITHUB_REPO`: GitHub仓库名称，格式为 `owner/repo`

### 邮件发送配置
- `RESEND_API_KEY`: Resend API密钥，用于发送邮件通知
- `ADMIN_EMAIL`: 管理员邮箱地址，接收新站点提交通知

## 可选的环境变量

### 邮件发送配置
- `EMAIL_FROM`: 自定义发送邮箱地址
  - 如果配置了此变量，邮件将从指定地址发送（需要在Resend中验证域名）
  - 如果未配置，将使用Resend默认地址 `onboarding@resend.dev`

## 配置示例

```bash
# 必需配置
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=username/binnav
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=admin@example.com

# 可选配置（如果你有自己的域名）
EMAIL_FROM=BinNav <noreply@yourdomain.com>
```

## 注意事项

1. **GitHub Token权限**: 确保GitHub Token有仓库的读写权限
2. **Resend域名验证**: 如果使用自定义EMAIL_FROM地址，需要在Resend中验证对应的域名
3. **邮件发送失败**: 邮件发送失败不会影响站点提交和审核功能，只是不会收到邮件通知
4. **环境变量安全**: 请勿在代码中硬编码敏感信息，始终使用环境变量 