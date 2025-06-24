# 🚀 BinNav - EdgeOne Pages 部署指南

## 📋 EdgeOne Pages 介绍

EdgeOne Pages 是腾讯云推出的现代化Web开发和部署平台，类似于 Vercel、Netlify 等服务：

- ✅ **直接连接GitHub仓库** - 无需配置API密钥
- ✅ **自动构建部署** - 代码推送后自动触发部署
- ✅ **全球CDN加速** - 腾讯云2500+边缘节点
- ✅ **免费使用** - 公测期间功能无限制
- ✅ **国内优化** - 访问速度优于海外同类服务

## 🔧 部署步骤

### 第1步：登录EdgeOne控制台

1. **访问控制台**：
   ```
   https://console.cloud.tencent.com/edgeone
   ```

2. **登录腾讯云账户**（如无账户可快速注册）

3. **搜索并进入EdgeOne Pages**

### 第2步：开通Pages服务

1. **首次使用需要开通服务**
2. **点击"立即开通"**
3. **选择"从Git仓库导入"**

### 第3步：连接GitHub仓库

1. **选择GitHub平台**：
   - 点击"GitHub"按钮
   - 授权EdgeOne访问您的GitHub账户

2. **授权步骤**：
   ```
   GitHub授权页面 → Authorize EO Pages → 选择仓库权限 → Install
   ```

3. **选择仓库**：
   - 可以授权所有仓库或指定仓库
   - 选择您的BinNav项目仓库

### 第4步：配置构建设置

1. **选择要部署的仓库**：选择您的BinNav项目

2. **配置构建命令**：
   ```bash
   # 构建命令
   npm run build
   
   # 输出目录
   dist
   
   # 安装命令（通常自动检测）
   npm install
   ```

3. **选择加速区域**：
   - **中国大陆**：需要域名备案，国内访问最快
   - **全球**：无需备案，全球访问优化

### 第5步：开始部署

1. **检查配置**：确认构建命令和输出目录正确
2. **点击"开始部署"**
3. **等待构建完成**（通常1-2分钟）

### 第6步：验证部署

1. **查看部署状态**：
   ```
   EdgeOne Pages控制台 → 项目列表 → 查看部署状态
   ```

2. **获取访问地址**：
   - 部署成功后会显示预览链接
   - 格式：`https://项目名.pages.dev` 或自定义域名

3. **测试功能**：
   - 访问主站
   - 测试管理后台：`网站地址/admin`

## 🔄 自动部署工作流

### 代码更新流程
```
1. 本地修改代码 → git push
2. GitHub仓库更新
3. EdgeOne Pages自动检测变更
4. 自动触发构建和部署
5. 网站自动更新
```

### 管理后台更新流程
```
1. 访问 网站地址/admin
2. 登录管理后台
3. 修改网站配置
4. 点击"保存并发布"
5. GitHub Actions更新配置文件
6. EdgeOne Pages自动重新部署
```

## 🌐 自定义域名

### 添加自定义域名

1. **在EdgeOne Pages控制台**：
   ```
   项目设置 → 域名管理 → 添加自定义域名
   ```

2. **配置DNS**：
   ```
   # 在您的域名注册商处添加CNAME记录
   www.yourdomain.com → your-project.pages.dev
   ```

3. **SSL证书**：
   - EdgeOne会自动提供免费SSL证书
   - 支持强制HTTPS跳转

### 域名备案（中国大陆）

如果选择中国大陆加速区域：
- 域名必须完成ICP备案
- 备案流程：[腾讯云备案服务](https://cloud.tencent.com/product/ba)

## 📊 性能优势

### 速度对比测试

基于我们的测试结果：

| 平台 | 平均响应时间 | 国内节点 |
|------|-------------|----------|
| **EdgeOne Pages** | **0.15秒** | **2500+** |
| Cloudflare Pages | 1.13秒 | 较少 |
| Vercel | 0.8-1.2秒 | 无 |
| Netlify | 0.6-1.0秒 | 无 |

### CDN节点分布
- **全球**：70+国家，3200+节点
- **中国**：2500+边缘节点
- **覆盖**：省、市、运营商全覆盖

## 🛠️ 项目配置

### 必需的GitHub Secrets

EdgeOne Pages部署**不需要**配置以下密钥：
- ❌ `EDGEONE_TOKEN`
- ❌ `EDGEONE_ZONE_ID`  
- ❌ `EDGEONE_SITE_ID`

只需要配置管理后台相关的Secrets：
- ✅ `ADMIN_PASSWORD` - 管理后台密码
- ✅ `PERSONAL_ACCESS_TOKEN` - GitHub API Token
- ✅ `REPOSITORY_NAME` - 仓库信息

### 项目结构优化

确保项目根目录包含：
```
binnav/
├── package.json          # 构建脚本
├── vite.config.js        # Vite配置
├── src/                  # 源代码
├── dist/                 # 构建输出（自动生成）
└── .github/workflows/    # GitHub Actions
```

## 🔧 故障排除

### 常见问题1：构建失败

**可能原因**：
- 构建命令错误
- 依赖安装失败
- 环境变量缺失

**解决方案**：
```bash
# 检查package.json中的scripts
"scripts": {
  "build": "vite build",
  "dev": "vite"
}

# 确保依赖正确安装
npm install
npm run build  # 本地测试构建
```

### 常见问题2：部署成功但网站404

**可能原因**：
- 输出目录配置错误
- 路由配置问题

**解决方案**：
```bash
# 检查vite.config.js中的base配置
export default defineConfig({
  base: '/',  // EdgeOne Pages使用根路径
  build: {
    outDir: 'dist'  # 确保输出目录正确
  }
})
```

### 常见问题3：管理后台无法保存

**可能原因**：
- GitHub Actions权限不足
- GitHub Token过期

**解决方案**：
1. 重新生成GitHub Token
2. 检查Token权限包含`repo`
3. 更新GitHub Secrets

### 常见问题4：自动部署不触发

**可能原因**：
- GitHub仓库权限不足
- 分支配置错误

**解决方案**：
1. 检查EdgeOne Pages的仓库授权
2. 确认监听的分支为`main`
3. 重新连接GitHub仓库

## 📈 监控和分析

### 部署状态查看

1. **EdgeOne Pages控制台**：
   ```
   项目列表 → 点击项目名 → 部署历史
   ```

2. **GitHub Actions**：
   ```
   GitHub仓库 → Actions → 查看工作流运行状态
   ```

### 访问统计

EdgeOne控制台提供：
- 访问量统计
- 流量分析
- 响应时间监控
- 错误率统计

## 💰 费用说明

### 免费额度（公测期间）

目前EdgeOne Pages处于免费公测阶段：
- ✅ **无构建次数限制**
- ✅ **无流量限制**
- ✅ **无存储限制**
- ✅ **全功能使用**

### 未来商业化

当正式商业化时，可能会有：
- 构建次数限制
- 流量配额
- 存储空间限制
- 高级功能付费

## 🚀 高级功能

### 边缘函数（即将上线）

EdgeOne Pages即将支持边缘函数：
- 在CDN节点执行服务端逻辑
- 超低延迟API响应
- JavaScript/TypeScript支持
- 数据库连接

### 环境管理

支持多环境部署：
- **生产环境**：主分支自动部署
- **预览环境**：Pull Request预览
- **开发环境**：特定分支部署

## ✅ 部署检查清单

部署前请确认：
- [ ] ✅ 腾讯云账户已注册
- [ ] ✅ EdgeOne Pages服务已开通
- [ ] ✅ GitHub仓库已授权
- [ ] ✅ 构建命令配置正确
- [ ] ✅ 输出目录设置为`dist`
- [ ] ✅ GitHub Secrets已配置（3个）
- [ ] ✅ 本地构建测试通过
- [ ] ✅ 管理后台功能测试通过

---

## 🎉 完成！

现在您的BinNav导航网站已成功部署到EdgeOne Pages！

- **优势**：国内访问速度快，全球CDN加速
- **访问**：通过EdgeOne提供的域名或自定义域名
- **管理**：`网站地址/admin` 进入管理后台
- **支持**：GitHub仓库Issues或腾讯云技术支持

---

*EdgeOne Pages - 为中国开发者优化的现代化部署平台* 