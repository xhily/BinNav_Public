# BinNav 版本管理功能实现总结

## 功能说明

在后台管理页面的系统设置中添加了版本管理功能，用于检测项目是否有新版本可用。

## 实现逻辑

### 1. 当前版本获取
- 从项目的 `package.json` 文件中读取当前版本号
- 通过GitHub API获取仓库中的package.json内容

### 2. 最新版本获取
- 通过GitHub API获取仓库的最新Release版本
- 使用 `/repos/{owner}/{repo}/releases/latest` 端点

### 3. 版本比较
- 对比当前版本和最新Release版本
- 支持语义化版本号比较（如 1.0.0 vs 1.1.0）
- 自动去除版本号前的 'v' 前缀

### 4. 状态提示
- **🟢 当前已是最新版本**: 当前版本 >= 最新版本
- **🟠 发现新版本**: 当前版本 < 最新版本  
- **⚪ 暂无发布版本**: 仓库没有Release版本
- **❓ 检查版本信息中**: 正在加载或出错

## 文件结构

```
functions/api/get-version.js          # API端点（通过GitHub API获取版本）
src/hooks/useVersionInfo.js          # 版本信息管理Hook
src/components/admin/VersionManager.jsx  # 版本管理组件
src/pages/Admin.jsx                  # 集成到系统设置页面
```

## 环境变量要求

- `VITE_GITHUB_TOKEN` 或 `GITHUB_TOKEN`: GitHub Personal Access Token
- `VITE_GITHUB_REPO` 或 `GITHUB_REPO`: GitHub仓库名称（格式：用户名/仓库名）

## 功能特性

- ✅ 显示当前项目版本
- ✅ 获取最新Release版本
- ✅ 智能版本比较
- ✅ 状态指示器
- ✅ 手动检查更新
- ✅ 5分钟缓存机制
- ✅ 错误处理和重试
- ✅ 查看发布详情链接

## 使用方法

1. 配置GitHub环境变量
2. 进入后台管理 → 系统设置
3. 查看"版本信息"部分
4. 点击"检查更新"手动刷新

## 注意事项

- 需要GitHub Token具有读取仓库的权限
- 版本比较基于Release标签，需要项目有正式发布版本
- 缓存时间为5分钟，避免频繁API调用
- 支持预发布版本标识
