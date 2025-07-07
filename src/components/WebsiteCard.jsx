import React from 'react'
import { Card, CardContent } from './ui/card'
import logoImg from '../assets/logo.png'

const WebsiteCard = ({ website }) => {
  // 优先使用缓存的图标，fallback到外网服务
  const getIconUrl = () => {
    // 1. 优先使用网站数据中的图标（静态文件路径或外网URL）
    if (website.icon) {
      return website.icon
    }

    // 2. 如果没有缓存，使用Google API作为fallback
    try {
      const hostname = new URL(website.url).hostname
      const getMainDomain = (hostname) => {
        const parts = hostname.split('.')
        if (parts.length > 2) {
          return parts.slice(-2).join('.')
        }
        return hostname
      }
      const mainDomain = getMainDomain(hostname)

      // 直接使用Google Favicon API
      return `https://www.google.com/s2/favicons?domain=${mainDomain}&sz=32`
    } catch (error) {
      return logoImg
    }
  }

  const handleIconError = (e) => {
    console.log('🚫 图标加载失败:', {
      websiteName: website.name,
      failedUrl: e.target.src,
      websiteUrl: website.url
    })

    try {
      const hostname = new URL(website.url).hostname
      const getMainDomain = (hostname) => {
        const parts = hostname.split('.')
        if (parts.length > 2) {
          return parts.slice(-2).join('.')
        }
        return hostname
      }
      const mainDomain = getMainDomain(hostname)

      // 智能fallback策略
      if (e.target.src.includes('/cached-icons/')) {
        // 静态文件失败，尝试Google API
        e.target.src = `https://www.google.com/s2/favicons?domain=${mainDomain}&sz=32`
        console.log('🔄 静态文件失败，尝试Google API:', e.target.src)
      } else if (e.target.src.includes('gstatic.com') || e.target.src.includes('favicons')) {
        // Google API失败，尝试DuckDuckGo
        e.target.src = `https://icons.duckduckgo.com/ip3/${mainDomain}.ico`
        console.log('🔄 Google API失败，尝试DuckDuckGo:', e.target.src)
      } else if (e.target.src.includes('duckduckgo.com')) {
        // DuckDuckGo失败，尝试网站自己的favicon
        const domain = new URL(website.url).origin
        e.target.src = `${domain}/favicon.ico`
        console.log('🔄 DuckDuckGo失败，尝试网站favicon:', e.target.src)
      } else {
        // 最终回退到默认图标
        e.target.src = logoImg
        e.target.onerror = null // 防止无限循环
        console.log('🔄 使用默认图标')
      }
    } catch (error) {
      // 如果URL解析失败，直接使用默认图标
      e.target.src = logoImg
      e.target.onerror = null
      console.log('🔄 URL解析失败，使用默认图标')
    }
  }

  return (
    <Card
      className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden h-24 hover:h-auto w-full"
      onClick={() => window.open(website.url, '_blank')}
    >
      <CardContent className="h-full p-4 flex items-center justify-start">
        <div className="flex items-center space-x-3 w-full">
          <div className="flex-shrink-0">
            <img
              src={getIconUrl()}
              alt={website.name}
              className="w-8 h-8 rounded-md shadow-sm bg-gray-100 p-0.5"
              onError={handleIconError}
              style={{
                display: 'block',
                width: '32px',
                height: '32px',
                objectFit: 'contain',
                flexShrink: 0
              }}
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {website.name}
              </h3>
              {website.category === 'author' && website.featured && (
                <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                  作者
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 truncate group-hover:whitespace-normal group-hover:line-clamp-none transition-all duration-300 leading-tight mb-1">
              {website.description}
            </p>
            <div className="flex gap-1 overflow-hidden">
              <div className="flex gap-1 group-hover:flex-wrap">
                {website.tags && website.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded whitespace-nowrap ${
                      index >= 2 ? 'hidden group-hover:inline-block' : ''
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default WebsiteCard 