// 配置文件 - BinNav 项目配置
// 此文件用于在不同部署环境中管理配置

// 获取环境变量的函数，支持多种来源
const getEnvVar = (key, defaultValue = '') => {
  // 1. 尝试从 Vite 环境变量获取
  if (import.meta.env && import.meta.env[key]) {
    return import.meta.env[key]
  }
  
  // 2. 尝试从构建时注入的变量获取
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key]
  }
  
  // 3. 返回默认值
  return defaultValue
}

// 项目配置
export const CONFIG = {
  // 管理后台密码
  ADMIN_PASSWORD: getEnvVar('VITE_ADMIN_PASSWORD', 'admin123'),
  
  // GitHub 配置
  GITHUB_TOKEN: getEnvVar('VITE_GITHUB_TOKEN', ''),
  GITHUB_REPO: getEnvVar('VITE_GITHUB_REPO', ''),
  
  // 站点配置
  SITE_NAME: getEnvVar('VITE_SITE_NAME', 'BinNav'),
  SITE_DESCRIPTION: getEnvVar('VITE_SITE_DESCRIPTION', '精选网站导航'),
  
  // 调试模式
  DEBUG: getEnvVar('VITE_DEBUG', 'false') === 'true'
}

// 调试信息输出
if (CONFIG.DEBUG || import.meta.env.DEV) {
  console.log('🔧 配置调试信息:')
  console.log('ADMIN_PASSWORD:', CONFIG.ADMIN_PASSWORD === 'admin123' ? '❌ 使用默认密码' : '✅ 使用自定义密码')
  console.log('GITHUB_TOKEN:', CONFIG.GITHUB_TOKEN ? '✅ 已配置' : '❌ 未配置')
  console.log('GITHUB_REPO:', CONFIG.GITHUB_REPO ? '✅ 已配置' : '❌ 未配置')
  console.log('构建环境:', import.meta.env.MODE)
}

export default CONFIG 