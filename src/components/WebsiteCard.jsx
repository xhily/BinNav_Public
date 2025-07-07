import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import logoImg from '../assets/logo.png'

const WebsiteCard = ({ website }) => {
  const [iconSrc, setIconSrc] = useState('')
  const [hasError, setHasError] = useState(false)

  // 多重fallback图标源
  const getIconSources = () => {
    const sources = []

    // 1. 优先使用网站数据中的图标
    if (website.icon) {
      sources.push(website.icon)
    }

    try {
      const hostname = new URL(website.url).hostname
      const domain = new URL(website.url).origin

      // 2. Google favicon服务
      sources.push(`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`)

      // 3. DuckDuckGo图标服务（移动端更稳定）
      sources.push(`https://icons.duckduckgo.com/ip3/${hostname}.ico`)

      // 4. 网站自己的favicon
      sources.push(`${domain}/favicon.ico`)

    } catch (error) {
      console.warn('解析URL失败:', website.url)
    }

    // 5. 默认logo
    sources.push(logoImg)

    return sources
  }

  // 初始化图标
  useEffect(() => {
    const sources = getIconSources()
    setIconSrc(sources[0] || logoImg)
  }, [website])

  const handleIconError = (e) => {
    if (!hasError) {
      setHasError(true)
      const sources = getIconSources()
      const currentIndex = sources.indexOf(iconSrc)
      const nextSource = sources[currentIndex + 1]

      if (nextSource) {
        setIconSrc(nextSource)
      } else {
        e.target.src = logoImg
      }
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
              src={iconSrc}
              alt={website.name}
              className="w-8 h-8 rounded-md shadow-sm bg-gray-100 p-0.5"
              onError={handleIconError}
              style={{
                display: 'block',
                width: '32px',
                height: '32px',
                objectFit: 'contain'
              }}
              loading="lazy"
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