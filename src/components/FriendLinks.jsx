import { useState, useEffect } from 'react'
import { ExternalLink, Heart } from 'lucide-react'

function FriendLinks() {
  const [friendLinks, setFriendLinks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFriendLinks()
  }, [])

  const fetchFriendLinks = async () => {
    try {
      const response = await fetch('/api/get-friend-links')
      const result = await response.json()
      
      if (result.success && result.data) {
        setFriendLinks(result.data)
      }
    } catch (error) {
      console.error('获取友情链接失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <section className="mt-16">
        <div className="flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
          <span className="ml-2 text-gray-500">加载友情链接中...</span>
        </div>
      </section>
    )
  }

  if (!friendLinks || friendLinks.length === 0) {
    return null
  }

  return (
    <section className="mt-16 border-t border-gray-200 pt-12">
      <div className="flex items-center justify-center mb-8">
        <Heart className="w-6 h-6 mr-3 text-pink-500" />
        <h2 className="text-2xl font-bold text-gray-900">友情链接</h2>
        <Heart className="w-6 h-6 ml-3 text-pink-500" />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {friendLinks.map((link, index) => (
          <a
            key={link.id || index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/20 p-4 hover:shadow-md hover:scale-105 transition-all duration-200"
          >
            <div className="flex flex-col items-center text-center">
              {link.logo ? (
                <img 
                  src={link.logo} 
                  alt={link.name}
                  className="w-10 h-10 rounded-lg mb-2 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div 
                className={`w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-2 text-white font-bold text-sm ${link.logo ? 'hidden' : 'flex'}`}
              >
                {link.name?.charAt(0) || '?'}
              </div>
              
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {link.name}
              </h3>
              
              {link.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {link.description}
                </p>
              )}
            </div>
            
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </div>
          </a>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          💝 感谢以上网站与我们的友好合作
        </p>
      </div>
    </section>
  )
}

export default FriendLinks 