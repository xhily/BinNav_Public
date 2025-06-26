# BinNav 新功能文档

## 概述

BinNav 导航网站现已完善了站点提交功能，并将友情链接集成为一级分类，统一管理所有站点资源。

## 架构特点

### 统一站点管理
- **友情链接作为分类**：友情链接现在是一个独立的一级分类，与其他站点统一管理
- **简化架构**：移除了独立的友情链接系统，所有内容都通过站点系统管理
- **直接文件读取**：后台数据直接从GitHub文件读取，无需复杂API

### 分类选择优化
- **支持一级分类**：提交表单现在可以选择一级分类（如友情链接）
- **层级显示**：二级分类在选择时会显示缩进，便于区分

## 主要功能

### 1. 站点提交功能

用户可以通过主页的"站点提交"功能推荐优质网站：

**前端组件**：
- `src/components/SubmitWebsiteForm.jsx` - 站点提交表单
- 支持选择一级分类和二级分类
- 自动URL补全（自动添加https://协议）
- 完整的表单验证和错误处理

**后端API**：
- `functions/api/submit-website.js` - 处理站点提交
- 验证数据格式和完整性
- 发送邮件通知管理员
- 通过GitHub API更新 `pending-websites.json`

### 2. 友情链接管理

**集成方式**：
- 友情链接现在是 `websiteData.js` 中的一个分类 (`friend_links`)
- 包含示例数据：Nbvil's Blog、GitHub、MDN Web Docs、Unsplash、Vue.js
- 与其他站点使用相同的数据结构和管理方式

**提交方式**：
- 用户通过站点提交表单选择"友情链接"分类
- 管理员在后台审核后添加到对应分类

### 3. 后台管理

**待审核站点管理**：
- `src/components/admin/PendingWebsiteManager.jsx`
- 直接从GitHub文件读取待审核数据
- 支持批准或拒绝站点申请
- 批准后自动更新到网站数据中

**站点管理**：
- 统一管理所有站点，包括友情链接
- 支持分类筛选和编辑
- 可以直接在后台添加友情链接

**移除的功能**：
- 独立的友情链接管理界面
- 友情链接专用API
- 分类功能（简化为统一管理）

### 4. 邮件通知系统

使用 Resend 服务发送邮件通知：
- 用户提交站点时通知管理员
- 管理员审核站点后通知提交者
- 支持HTML格式邮件模板

## API 接口

### 站点提交相关
- `POST /api/submit-website` - 提交网站申请（包括友情链接）
- `POST /api/process-website-submission` - 处理站点审核

### 管理功能
- `POST /api/verify-password` - 验证管理员密码

### 移除的API
- ~~`GET /api/get-pending-websites`~~ - 改为直接从GitHub文件读取
- ~~`GET /api/get-friend-links`~~ - 友情链接集成到站点数据中
- ~~`POST /api/submit-friend-link`~~ - 统一使用站点提交
- ~~`POST /api/update-friend-links`~~ - 使用站点管理功能

## 环境变量配置

```bash
# 管理员密码
ADMIN_PASSWORD=your_admin_password

# GitHub 配置（用于数据同步）
VITE_GITHUB_TOKEN=your_github_token
VITE_GITHUB_REPO=username/repo-name

# 邮件服务配置
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@example.com
```

## 数据文件

### pending-websites.json
待审核站点数据（包括友情链接提交）：
```json
[
  {
    "id": 1,
    "name": "网站名称",
    "url": "https://example.com",
    "description": "网站描述",
    "category": "friend_links",
    "tags": ["标签1", "标签2"],
    "submittedBy": {
      "name": "提交者姓名",
      "email": "提交者邮箱",
      "submittedAt": "2025-01-03T00:00:00Z"
    },
    "status": "pending"
  }
]
```

### src/websiteData.js
包含友情链接分类的站点数据：
```javascript
// 友情链接分类
{
  "id": "friend_links",
  "name": "友情链接",
  "icon": "/assets/network_icon.png",
  "color": "bg-pink-500",
  "subcategories": []
}

// 友情链接站点示例
{
  "id": 46,
  "name": "Nbvil's Blog",
  "description": "技术分享与编程心得",
  "url": "https://blog.nbvil.com",
  "category": "friend_links",
  "tags": ["个人博客", "技术分享", "编程"],
  "icon": "/assets/tech_blogger_avatar.png",
  "popularity": 85
}
```

## 功能特点

### 统一管理体验
- 所有站点（包括友情链接）使用相同的管理界面
- 统一的数据结构和验证规则
- 简化的用户提交流程

### 智能URL处理
- 前端表单自动补全https://协议
- 后端API验证和处理URL格式
- 用户输入 `blog.nbvil.com` 自动变成 `https://blog.nbvil.com`

### 架构简化
- 移除了复杂的友情链接独立系统
- 直接从GitHub文件读取数据，降低API复杂度
- 统一的分类管理系统

## 部署说明

1. 配置环境变量
2. 创建初始数据文件：
   - `pending-websites.json` (空数组 `[]`)
3. 部署 EdgeOne Functions
4. 配置邮件服务和GitHub集成

## 示例数据

websiteData.js 中的友情链接分类包含：
- Nbvil's Blog (blog.nbvil.com)
- GitHub
- MDN Web Docs
- Unsplash  
- Vue.js

## 技术特点

- **响应式设计**：支持移动端和桌面端
- **数据持久化**：通过GitHub API同步数据
- **邮件通知**：使用Resend服务
- **权限管理**：多层验证机制
- **用户友好**：统一的管理界面
- **架构简化**：移除冗余系统，提高维护性

## 迁移说明

### 从独立友情链接系统迁移
1. 将现有友情链接数据迁移到 `websiteData.js`
2. 设置分类为 `friend_links`
3. 移除独立的友情链接文件和API
4. 更新管理后台界面

### 数据结构变更
- 友情链接不再需要独立的数据文件
- 使用统一的站点数据结构
- 分类ID改为 `friend_links`

## 未来规划

- [ ] 站点质量评分系统
- [ ] 用户反馈收集
- [ ] 数据分析统计
- [ ] 批量导入功能
- [ ] 分类权重排序 