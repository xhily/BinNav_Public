// 环境配置文件 - 统一管理环境变量
// 这个文件专门用于配置逻辑，与页面显示逻辑分离

/**
 * 获取环境变量配置
 * 本地开发时从 .env 文件读取，生产环境从 GitHub Secrets 读取
 */
export const getEnvConfig = () => {
  // 管理后台密码配置
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
  
  // GitHub API 配置
  const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || ''
  const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || ''
  
  return {
    ADMIN_PASSWORD,
    GITHUB_TOKEN,
    GITHUB_REPO,
    
    // 配置状态检查
    isConfigValid: () => {
      return {
        hasPassword: ADMIN_PASSWORD !== 'admin123',
        hasToken: Boolean(GITHUB_TOKEN),
        hasRepo: Boolean(GITHUB_REPO),
        isFullyConfigured: Boolean(GITHUB_TOKEN && GITHUB_REPO)
      }
    },
    
    // 配置信息显示
    getConfigStatus: () => {
      const status = getEnvConfig().isConfigValid()
      return {
        password: {
          status: status.hasPassword ? 'configured' : 'default',
          message: status.hasPassword ? '✅ 已自定义' : '❌ 使用默认密码'
        },
        token: {
          status: status.hasToken ? 'configured' : 'missing',
          message: status.hasToken ? '✅ 已配置' : '❌ 未配置'
        },
        repo: {
          status: status.hasRepo ? 'configured' : 'missing', 
          message: status.hasRepo ? '✅ 已配置' : '❌ 未配置'
        }
      }
    }
  }
}

/**
 * GitHub API 调用配置（仅用于状态检查，实际API调用由EdgeOne Functions处理）
 * EdgeOne Functions会从环境变量中获取GITHUB_TOKEN和GITHUB_REPO
 */
export const getGitHubApiConfig = () => {
  const config = getEnvConfig()
  
  return {
    // 这些配置主要用于前端状态检查，实际API调用由EdgeOne Functions处理
    hasToken: Boolean(config.GITHUB_TOKEN),
    hasRepo: Boolean(config.GITHUB_REPO),
    repoName: config.GITHUB_REPO,
    // EdgeOne Functions API端点
    endpoints: {
      getConfig: '/api/get-config',
      updateConfig: '/api/update-config'
    }
  }
}

/**
 * 开发环境检测
 */
export const isDevelopment = () => {
  return import.meta.env.DEV
}

/**
 * 生产环境检测  
 */
export const isProduction = () => {
  return import.meta.env.PROD
} 