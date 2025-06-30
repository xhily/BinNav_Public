import { useState, useEffect } from 'react'

// 默认站点配置
const defaultSiteConfig = {
  siteName: 'BinNav',
  siteTitle: 'BinNav - 精选网站导航',
  siteLogo: '/logo.png',
  siteDescription: '发现优质网站，提升工作效率。汇聚设计、开发、工具等各类精选网站资源。'
}

// 从localStorage加载保存的配置
const loadSavedConfig = () => {
  try {
    const saved = localStorage.getItem('siteConfig')
    return saved ? { ...defaultSiteConfig, ...JSON.parse(saved) } : defaultSiteConfig
  } catch (error) {
    console.warn('加载站点配置失败，使用默认配置:', error)
    return defaultSiteConfig
  }
}

// 全局站点配置管理
let globalSiteConfig = loadSavedConfig()
const subscribers = new Set()

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
    if (favicon && newConfig.siteLogo !== '/logo.png') {
      favicon.setAttribute('href', newConfig.siteLogo)
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