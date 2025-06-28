# EdgeOne Functions 说明

## 概述

本目录包含EdgeOne Functions的代码，用于处理BinNav导航网站的后端API操作。

## 文件结构

```
functions/
└── api/
    ├── health.js       # 健康检查 - GET /api/health
    ├── verify-password.js # 密码验证 - POST /api/verify-password
    ├── get-config.js   # 获取配置 - GET /api/get-config
    ├── update-config.js # 更新配置 - POST /api/update-config
    ├── submit-website.js # 提交网站 - POST /api/submit-website
    ├── process-website-submission.js # 处理网站审核 - POST /api/process-website-submission
    ├── upload-icon.js  # 上传图标 - POST /api/upload-icon
    ├── delete-icon.js  # 删除图标 - POST /api/delete-icon
    ├── debug-test.js   # 调试测试 - GET /api/debug-test
    └── test-submit.js  # 测试提交 - POST /api/test-submit
```

## API端点

### 1. 健康检查
- **端点**: `GET /api/health`
- **用途**: 检查Functions服务状态和环境变量配置
- **响应**: 返回服务状态和配置信息

### 2. 密码验证
- **端点**: `POST /api/verify-password`
- **用途**: 验证管理后台登录密码
- **请求体**: 
  ```json
  {
    "password": "用户输入的密码"
  }
  ```
- **响应**: 返回验证结果

### 3. 获取配置
- **端点**: `GET /api/get-config`  
- **用途**: 获取当前GitHub仓库中的websiteData.js文件内容
- **响应**: 返回文件内容和SHA值

### 4. 更新配置
- **端点**: `POST /api/update-config`
- **用途**: 更新GitHub仓库中的websiteData.js文件
- **请求体**: 
  ```json
  {
    "config": "文件内容",
    "sha": "当前文件SHA值"
  }
  ```

### 5. 提交网站
- **端点**: `POST /api/submit-website`
- **用途**: 用户提交新网站，保存到待审核列表
- **请求体**: 
  ```json
  {
    "name": "网站名称",
    "url": "网站链接",
    "description": "网站描述",
    "category": "分类",
    "tags": "标签",
    "contactEmail": "联系邮箱",
    "submitterName": "提交者姓名"
  }
  ```

### 6. 处理网站审核
- **端点**: `POST /api/process-website-submission`
- **用途**: 管理员审核网站提交（通过或拒绝）
- **请求体**: 
  ```json
  {
    "websiteId": "网站ID",
    "action": "approve|reject",
    "rejectReason": "拒绝原因（可选）"
  }
  ```

### 7. 上传图标
- **端点**: `POST /api/upload-icon`
- **用途**: 上传网站图标文件
- **请求体**: FormData with file

### 8. 删除图标
- **端点**: `POST /api/delete-icon`
- **用途**: 删除指定的图标文件
- **请求体**: 
  ```json
  {
    "filename": "图标文件名"
  }
  ```

## 环境变量

在EdgeOne项目设置中需要配置以下环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_1234567890...` |
| `GITHUB_REPO` | GitHub仓库名称 | `username/binnav` |
| `ADMIN_PASSWORD` | 管理后台密码 | `MySecurePassword123!` |

## 安全特性

- ✅ **服务端隔离**: 敏感信息完全在服务端处理
- ✅ **CORS支持**: 所有API都配置了适当的CORS头
- ✅ **错误处理**: 完善的错误处理和日志记录
- ✅ **权限最小化**: GitHub Token只需要`repo`权限

## 部署说明

1. **自动部署**: 代码推送到GitHub后，EdgeOne Pages会自动检测并部署Functions
2. **路由映射**: Functions会自动映射到对应的URL路径
3. **全球分布**: Functions在EdgeOne的全球节点上运行，提供低延迟访问

## 调试和监控

### 本地开发
```bash
# 安装EdgeOne CLI
npm install -g @edgeone/cli

# 本地开发
edgeone dev
```

### 查看日志
在EdgeOne控制台可以查看Functions的执行日志和性能监控信息。

## 最佳实践

1. **错误处理**: 始终包含适当的错误处理逻辑
2. **日志记录**: 使用`console.log`记录关键操作
3. **响应格式**: 保持一致的JSON响应格式
4. **CORS配置**: 确保所有端点都配置了正确的CORS头
5. **安全验证**: 在需要时添加适当的身份验证逻辑

## 与传统方案对比

| 特性 | GitHub Actions | EdgeOne Functions |
|------|----------------|-------------------|
| 响应时间 | 5-15秒 | 0.1-1秒 |
| 架构复杂度 | 高（需要工作流） | 低（直接API调用） |
| 安全性 | 中等 | 高（服务端隔离） |
| 维护成本 | 高 | 低 |
| 全球性能 | 一般 | 优秀（边缘计算） | 