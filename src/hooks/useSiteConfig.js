import { useState, useEffect } from 'react'
import { siteConfig as initialSiteConfig } from '../websiteData.js'

// 默认站点配置
const defaultSiteConfig = {
  siteName: 'BinNav',
  siteTitle: 'BinNav - 精选网站导航',
  siteLogo: '/assets/logo.png',
  siteDescription: '发现优质网站，提升工作效率。汇聚设计、开发、工具等各类精选网站资源。',
  // 备案信息配置
  icpRecord: '', // ICP备案号，如：京ICP备12345678号
  publicSecurityRecord: '', // 公安备案号，如：京公网安备11010802012345号
  publicSecurityRecordUrl: '' // 公安备案链接
}

// 从localStorage和API加载保存的配置
const loadSavedConfig = async () => {
  try {
    // 首先尝试从localStorage加载
    const saved = localStorage.getItem('siteConfig')
    let localConfig = saved ? JSON.parse(saved) : {}

    // 尝试从API获取最新配置
    try {
      const response = await fetch('/api/get-config')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.content) {
          // 解析配置文件中的站点配置
          const configMatch = result.content.match(/\/\/ 站点配置[\s\S]*?export const siteConfig = ({[\s\S]*?});/)
          if (configMatch) {
            const apiConfig = JSON.parse(configMatch[1])
            // API配置优先，但保留localStorage中的其他配置
            localConfig = { ...localConfig, ...apiConfig }
          }
        }
      }
    } catch (apiError) {
      console.warn('从API加载配置失败，使用本地配置:', apiError)
    }

    return { ...defaultSiteConfig, ...localConfig }
  } catch (error) {
    console.warn('加载站点配置失败，使用默认配置:', error)
    return defaultSiteConfig
  }
}

// 全局站点配置管理 - 优先使用websiteData.js中的配置
let globalSiteConfig = { ...defaultSiteConfig, ...initialSiteConfig }
const subscribers = new Set()

// 异步初始化配置，合并localStorage中的配置
loadSavedConfig().then(config => {
  globalSiteConfig = { ...globalSiteConfig, ...config }
  notifySubscribers()
})

const notifySubscribers = () => {
  subscribers.forEach(callback => callback(globalSiteConfig))
}

export const updateSiteConfig = (newConfig) => {
  globalSiteConfig = { ...globalSiteConfig, ...newConfig }
  
  // 保存到localStorage
  try {
    localStorage.setItem('siteConfig', JSON.stringify(globalSiteConfig))
  } catch (error) {
    console.warn('保存站点配置失败:', error)
  }
  
  // 更新页面标题
  if (newConfig.siteTitle) {
    document.title = newConfig.siteTitle
  }
  // 更新meta描述
  if (newConfig.siteDescription) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', newConfig.siteDescription)
    }
  }
  // 更新favicon
  if (newConfig.siteLogo) {
    const favicon = document.querySelector('link[rel="icon"]')
    if (favicon) {
      // 添加时间戳防止缓存
      const logoUrl = newConfig.siteLogo.includes('?')
        ? `${newConfig.siteLogo}&t=${Date.now()}`
        : `${newConfig.siteLogo}?t=${Date.now()}`

      console.log('🔄 更新favicon:', {
        oldHref: favicon.getAttribute('href'),
        newHref: logoUrl,
        siteLogo: newConfig.siteLogo
      })

      favicon.setAttribute('href', logoUrl)
    }
  }
  notifySubscribers()
}

export const useSiteConfig = () => {
  const [siteConfig, setSiteConfig] = useState(globalSiteConfig)

  useEffect(() => {
    const updateConfig = (newConfig) => {
      setSiteConfig(newConfig)
    }
    
    subscribers.add(updateConfig)
    
    return () => {
      subscribers.delete(updateConfig)
    }
  }, [])

  return {
    siteConfig,
    updateSiteConfig
  }
} 