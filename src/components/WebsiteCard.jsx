import React from 'react'
import { Card, CardContent } from './ui/card'
import logoImg from '../assets/logo.png'

const WebsiteCard = ({ website }) => {
  // 缓存优先的图标获取逻辑
  const getIconUrl = () => {
    // 1. 优先使用网站数据中的图标
    if (website.icon) {
      return website.icon
    }

    // 2. 使用缓存的图标（最优方案）
    try {
      const hostname = new URL(website.url).hostname

      // 优先使用缓存的图标
      return `/api/cache-icon?domain=${hostname}`
    } catch (error) {
      return logoImg
    }
  }

  // 备用图标服务列表（如果代理服务失败）
  const getFallbackIconUrls = (hostname) => {
    return [
      // 1. 网站自己的favicon
      `https://${hostname}/favicon.ico`,
      // 2. 常见的favicon路径
      `https://${hostname}/favicon.png`,
      // 3. 使用公共CDN（国内可访问）
      `https://api.iowen.cn/favicon/${hostname}.png`,
      // 4. 另一个备用服务
      `https://favicon.yandex.net/favicon/${hostname}`,
      // 5. 默认logo
      logoImg
    ]
  }

  const handleIconError = (e) => {
    const img = e.target
    const currentSrc = img.src

    try {
      const hostname = new URL(website.url).hostname
      const fallbackUrls = getFallbackIconUrls(hostname)

      // 找到当前失败的URL在fallback列表中的位置
      const currentIndex = fallbackUrls.findIndex(url => url === currentSrc)
      const nextIndex = currentIndex + 1

      // 如果还有下一个备用URL，尝试加载
      if (nextIndex < fallbackUrls.length) {
        img.src = fallbackUrls[nextIndex]
      } else {
        // 所有备用URL都失败了，使用默认logo
        img.src = logoImg
        img.onerror = null // 防止无限循环
      }
    } catch (error) {
      // 如果解析URL失败，直接使用默认logo
      img.src = logoImg
      img.onerror = null
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