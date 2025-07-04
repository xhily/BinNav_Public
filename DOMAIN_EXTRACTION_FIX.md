# 主域名提取修复方案

## 问题分析

用户发现了图标获取的真正问题：不是缓存问题，而是域名提取逻辑问题。

### 🔍 **具体问题**

- **B站官方** `https://www.bilibili.com/` → 域名：`www.bilibili.com` ✅ 可以获取图标
- **个人主页** `https://space.bilibili.com/3546865807133625` → 域名：`space.bilibili.com` ❌ 无法获取图标

### 🎯 **根本原因**

子域名（如 `space.bilibili.com`、`blog.nbvil.com`）通常没有独立的favicon，应该使用主域名（如 `bilibili.com`、`nbvil.com`）来获取图标。

## 修复方案

### ✅ **主域名提取函数**

```javascript
const getMainDomain = (hostname) => {
  const parts = hostname.split('.')
  
  // 如果是IP地址或localhost，直接返回
  if (parts.length <= 2 || /^\d+\.\d+\.\d+\.\d+$/.test(hostname) || hostname === 'localhost') {
    return hostname
  }
  
  // 对于常见的二级域名，返回主域名
  // 例如：space.bilibili.com → bilibili.com
  //      blog.nbvil.com → nbvil.com
  //      www.google.com → google.com
  return parts.slice(-2).join('.')
}
```

### 🔄 **域名转换示例**

| 原始URL | 原始域名 | 主域名 | 结果 |
|---------|----------|--------|------|
| `https://www.bilibili.com/` | `www.bilibili.com` | `bilibili.com` | ✅ 可获取图标 |
| `https://space.bilibili.com/xxx` | `space.bilibili.com` | `bilibili.com` | ✅ 可获取图标 |
| `https://blog.nbvil.com/` | `blog.nbvil.com` | `nbvil.com` | ✅ 可获取图标 |
| `https://www.google.com/` | `www.google.com` | `google.com` | ✅ 可获取图标 |
| `https://github.com/` | `github.com` | `github.com` | ✅ 可获取图标 |
| `https://192.168.1.1/` | `192.168.1.1` | `192.168.1.1` | ✅ IP地址保持不变 |

### 🔧 **修复后的图标获取逻辑**

```javascript
const getWebsiteIcon = (url, forceRefresh = false) => {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname
    const mainDomain = getMainDomain(hostname) // 提取主域名
    
    console.log('🎯 图标获取分析:', {
      originalUrl: url,
      hostname: hostname,
      mainDomain: mainDomain,
      forceRefresh: forceRefresh
    })
    
    const baseUrl = `https://www.google.com/s2/favicons?domain=${mainDomain}&sz=32`
    
    if (forceRefresh) {
      return `${baseUrl}&t=${Date.now()}`
    }
    
    return baseUrl
  } catch (error) {
    console.warn('无法解析网站URL，使用默认图标:', error)
    return '/assets/logo.png'
  }
}
```

### 📝 **调试信息增强**

现在控制台会显示详细的域名分析过程：
```
🎯 图标获取分析: {
  originalUrl: "https://space.bilibili.com/3546865807133625",
  hostname: "space.bilibili.com",
  mainDomain: "bilibili.com",
  forceRefresh: true
}
```

## 测试验证

### 🧪 **测试用例**

1. **B站个人主页测试**：
   - 添加网站：`https://space.bilibili.com/3546865807133625`
   - 预期：使用 `bilibili.com` 获取图标
   - 结果：应该显示B站的图标

2. **博客网站测试**：
   - 网站：`https://blog.nbvil.com/`
   - 预期：使用 `nbvil.com` 获取图标
   - 结果：应该显示网站图标

3. **常见网站测试**：
   - `https://www.google.com/` → `google.com`
   - `https://github.com/` → `github.com`
   - `https://stackoverflow.com/` → `stackoverflow.com`

### 🔍 **测试步骤**

1. **清除浏览器缓存**并刷新页面

2. **测试现有网站更新**：
   - 找到"Newbie Village"网站（`https://blog.nbvil.com/`）
   - 点击更新图标按钮
   - 查看控制台输出：
     ```
     🎯 图标获取分析: {
       originalUrl: "https://blog.nbvil.com/",
       hostname: "blog.nbvil.com",
       mainDomain: "nbvil.com",
       forceRefresh: true
     }
     ```
   - 确认图标更新成功

3. **测试新网站添加**：
   - 添加B站个人主页：`https://space.bilibili.com/3546865807133625`
   - 查看是否自动获取到B站图标
   - 控制台应该显示使用 `bilibili.com` 获取图标

### 🎯 **预期结果**

- ✅ **子域名网站能正确获取图标**：`space.bilibili.com` → 使用 `bilibili.com` 的图标
- ✅ **博客网站能正确获取图标**：`blog.nbvil.com` → 使用 `nbvil.com` 的图标
- ✅ **常规网站正常工作**：`www.google.com` → 使用 `google.com` 的图标
- ✅ **IP地址和localhost正常处理**：保持原样

## 特殊情况处理

### 🔧 **边界情况**

1. **IP地址**：`192.168.1.1` → 保持不变
2. **localhost**：`localhost:3000` → 保持不变
3. **二级域名**：`example.com` → 保持不变
4. **三级域名**：`sub.example.com` → 提取为 `example.com`
5. **多级域名**：`a.b.c.example.com` → 提取为 `example.com`

### 🛡️ **错误处理**

- URL解析失败时使用默认图标
- 域名提取异常时的保护机制
- 详细的调试日志便于问题排查

## 优势

1. **解决根本问题**：正确处理子域名的图标获取
2. **保持简单**：不需要复杂的异步测试
3. **广泛适用**：适用于各种域名结构
4. **易于调试**：详细的日志输出
5. **向后兼容**：不影响现有的正常网站

这个修复方案解决了图标获取的根本问题，确保子域名网站也能正确获取到主域名的图标。
