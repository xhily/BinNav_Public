import React, { useState } from 'react'
import { Plus, Edit3, Trash2, GripVertical, ChevronUp, RefreshCw } from 'lucide-react'
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import WebsiteForm from './WebsiteForm'

/**
 * 可拖拽的网站项组件
 */
const SortableWebsiteItem = ({
  website,
  onEdit,
  onDelete,
  editingWebsite,
  websiteForm,
  setWebsiteForm,
  onSaveWebsite,
  onCancelEdit,
  getCategoryName,
  getCategoryIcon,
  config,
  onUpdateIcon
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: website.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="bg-white border border-gray-200 rounded-lg p-4 h-48 flex flex-col hover:shadow-md transition-all duration-200 hover:border-blue-300">
        <div className="flex items-start space-x-3 mb-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
          >
            <GripVertical size={16} />
          </div>
          <img
            src={website.icon || (() => {
              try {
                const hostname = new URL(website.url).hostname
                const mainDomain = getMainDomain(hostname)
                return `https://www.google.com/s2/favicons?domain=${mainDomain}&sz=32`
              } catch {
                return '/assets/logo.png'
              }
            })()}
            alt={website.name}
            className="w-10 h-10 rounded-lg flex-shrink-0 bg-gray-50 p-1"
            onError={(e) => {
              console.log('🚫 图标加载失败:', {
                websiteName: website.name,
                failedUrl: e.target.src,
                websiteUrl: website.url
              })

              // 如果存储的图标加载失败，尝试不同的回退方案
              if (e.target.src.includes('gstatic.com') || e.target.src.includes('favicons')) {
                // 如果Google API失败，尝试网站自己的favicon
                try {
                  const domain = new URL(website.url).origin
                  e.target.src = `${domain}/favicon.ico`
                  console.log('🔄 尝试网站自己的favicon:', e.target.src)
                } catch {
                  e.target.src = '/assets/logo.png'
                  console.log('🔄 使用默认图标')
                }
              } else {
                // 最终回退到默认图标
                e.target.src = '/assets/logo.png'
                console.log('🔄 使用默认图标')
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900 truncate text-sm">{website.name}</h4>
              <span className="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 bg-blue-100 text-blue-800">
                #{config.websiteData.findIndex(w => w.id === website.id) + 1}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate mb-2" title={website.description}>
              {website.description}
            </p>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex items-center text-xs text-gray-600 truncate" title={getCategoryName(website.category)}>
            <img
              src={getCategoryIcon(website.category)}
              alt=""
              className="w-4 h-4 mr-1.5 opacity-80 rounded-sm bg-gray-50 p-0.5"
              onError={(e) => { e.target.src = '/assets/tools_icon.png' }}
            />
            <span>{getCategoryName(website.category)}</span>
          </div>
        </div>
        
        <div className="mb-3 flex-1">
          <div className="flex flex-wrap gap-1">
            {website.tags?.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded truncate max-w-16" title={tag}>
                {tag}
              </span>
            ))}
            {website.tags?.length > 3 && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded" title={`还有${website.tags.length - 3}个标签`}>
                +{website.tags.length - 3}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mt-auto">
          <button
            onClick={() => onEdit(website)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors flex-1 justify-center ${
              editingWebsite === website.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            {editingWebsite === website.id ? <ChevronUp size={14} /> : <Edit3 size={14} />}
            <span>{editingWebsite === website.id ? '收起' : '编辑'}</span>
          </button>
          <button
            onClick={() => onUpdateIcon(website)}
            className="text-green-600 hover:text-green-800 p-1"
            title="更新图标缓存"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => onDelete(website.id)}
            className="text-red-600 hover:text-red-800 p-1"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 编辑表单 - 在对应网站卡片下方展开 */}
      {editingWebsite === website.id && (
        <div className="absolute top-full left-0 right-0 z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-3">编辑网站信息</h5>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">网站名称</label>
              <input
                type="text"
                value={websiteForm.name}
                onChange={(e) => setWebsiteForm({...websiteForm, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：GitHub"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">网站URL</label>
              <input
                type="url"
                value={websiteForm.url}
                onChange={(e) => setWebsiteForm({...websiteForm, url: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://github.com"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">网站描述</label>
              <textarea
                value={websiteForm.description}
                onChange={(e) => setWebsiteForm({...websiteForm, description: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="简要描述网站的功能和特点"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={websiteForm.category}
                  onChange={(e) => setWebsiteForm({...websiteForm, category: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {config.categories.map(category => (
                    <optgroup key={category.id} label={category.name}>
                      <option value={category.id}>{category.name}</option>
                      {category.subcategories && category.subcategories.map(subcategory => (
                        <option key={subcategory.id} value={subcategory.id}>
                          　└ {subcategory.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">标签 (用逗号分隔)</label>
              <input
                type="text"
                value={websiteForm.tags}
                onChange={(e) => setWebsiteForm({...websiteForm, tags: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="设计工具, 免费, 在线工具"
              />
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <button
              onClick={onSaveWebsite}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex-1"
            >
              保存
            </button>
            <button
              onClick={onCancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm flex-1"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 网站管理组件
 */
const WebsiteManager = ({
  config,
  onUpdateWebsiteData,
  showMessage,
  getCategoryName
}) => {
  // 获取分类图标
  const getCategoryIcon = (categoryId) => {
    // 先在一级分类中查找
    const topLevelCategory = config.categories.find(cat => cat.id === categoryId)
    if (topLevelCategory) {
      return topLevelCategory.icon
    }

    // 再在二级分类中查找
    for (const category of config.categories) {
      if (category.subcategories) {
        const subcategory = category.subcategories.find(sub => sub.id === categoryId)
        if (subcategory) {
          return subcategory.icon
        }
      }
    }

    // 默认图标
    return '/assets/tools_icon.png'
  }
  const [editingWebsite, setEditingWebsite] = useState(null)
  const [websiteForm, setWebsiteForm] = useState({
    name: '',
    description: '',
    url: '',
    category: config.categories.length > 0 ? config.categories[0].id : '',
    tags: ''
  })

  // 图标更新状态
  const [isUpdatingIcons, setIsUpdatingIcons] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // 重置表单
  const resetWebsiteForm = () => {
    // 获取第一个可用分类作为默认值
    const defaultCategory = config.categories.length > 0 ? config.categories[0].id : ''

    setWebsiteForm({
      name: '',
      description: '',
      url: '',
      category: defaultCategory,
      tags: ''
    })
  }

  // 处理添加网站
  const handleAddWebsite = () => {
    setEditingWebsite('new')
    resetWebsiteForm()
  }

  // 处理编辑网站
  const handleEditWebsite = (website) => {
    if (editingWebsite === website.id) {
      // 如果正在编辑这个网站，则取消编辑
      setEditingWebsite(null)
      resetWebsiteForm()
    } else {
      // 否则开始编辑这个网站
      setEditingWebsite(website.id)
      setWebsiteForm({
        name: website.name,
        description: website.description,
        url: website.url,
        category: website.category,
        tags: website.tags.join(', ')
      })
    }
  }

  // 提取主域名（去除子域名）
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

  // 检测是否为默认图标
  const isDefaultIcon = (img, url) => {
    const width = img.naturalWidth || img.width
    const height = img.naturalHeight || img.height

    console.log(`🔍 检查图标: ${url} - 尺寸: ${width}x${height}`)

    // 1. 检查是否是1x1像素的占位符
    if (width <= 1 || height <= 1) {
      console.log('❌ 检测到1x1像素占位符')
      return true
    }

    // 2. 检查是否是Google Favicon API的默认图标
    if (url.includes('google.com/s2/favicons')) {
      // Google的默认图标通常是16x16的灰色图标
      if (width === 16 && height === 16) {
        console.log('❌ 检测到Google默认图标 (16x16)')
        return true
      }
    }

    // 3. 检查是否是DuckDuckGo的默认图标
    if (url.includes('icons.duckduckgo.com')) {
      // DuckDuckGo可能返回默认的图标
      if (width === 16 && height === 16) {
        console.log('❌ 检测到DuckDuckGo默认图标 (16x16)')
        return true
      }
    }

    // 4. 检查文件大小（通过图片数据URL）
    // 如果能转换为canvas，可以检查图片内容
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0)

      // 获取图片数据
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data

      // 检查是否是单色图标（可能是默认图标）
      let uniqueColors = new Set()
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const a = data[i + 3]
        if (a > 0) { // 只检查不透明的像素
          uniqueColors.add(`${r},${g},${b}`)
        }
      }

      // 如果颜色太少（比如只有1-2种颜色），可能是默认图标
      if (uniqueColors.size <= 2) {
        console.log(`❌ 检测到单色图标，颜色数量: ${uniqueColors.size}`)
        return true
      }

    } catch (error) {
      // 如果无法分析图片内容，继续其他检查
      console.log('⚠️ 无法分析图片内容:', error)
    }

    console.log('✅ 图标看起来是真实的')
    return false
  }

  // 测试图标URL是否有效且不是默认图标
  const testIconUrl = (url) => {
    return new Promise((resolve) => {
      const img = new Image()

      img.onload = () => {
        // 检查是否为默认图标
        if (isDefaultIcon(img, url)) {
          console.log(`⚠️ 检测到默认图标: ${url} (${img.naturalWidth}x${img.naturalHeight})`)
          resolve(false)
        } else {
          console.log(`✅ 图标加载成功: ${url} (${img.naturalWidth}x${img.naturalHeight})`)
          resolve(true)
        }
      }

      img.onerror = (error) => {
        console.log(`❌ 图标加载失败: ${url}`, error)
        resolve(false)
      }

      // 不设置crossOrigin，避免CORS问题
      img.src = url

      // 3秒超时
      setTimeout(() => {
        console.log(`⏰ 图标加载超时: ${url}`)
        resolve(false)
      }, 3000)
    })
  }

  // 从HTML中解析图标链接
  const parseIconFromHTML = async (url) => {
    try {
      console.log('🔍 尝试从HTML解析图标:', url)

      // 尝试多个代理服务
      const proxyServices = [
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://cors-anywhere.herokuapp.com/${url}`,
        // 如果代理都失败，尝试直接访问（可能会有CORS问题，但值得一试）
        url
      ]

      for (const proxyUrl of proxyServices) {
        try {
          console.log(`🔄 尝试代理: ${proxyUrl}`)
          const response = await fetch(proxyUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })

          if (!response.ok) {
            console.log(`❌ 代理失败: ${proxyUrl}`)
            continue
          }

          const html = await response.text()

          // 创建临时DOM来解析HTML
          const parser = new DOMParser()
          const doc = parser.parseFromString(html, 'text/html')

          const iconUrls = []
          const origin = new URL(url).origin

          // 查找各种图标链接
          const iconSelectors = [
            'link[rel="icon"]',
            'link[rel="shortcut icon"]',
            'link[rel="apple-touch-icon"]',
            'link[rel="apple-touch-icon-precomposed"]',
            'link[rel="mask-icon"]'
          ]

          iconSelectors.forEach(selector => {
            const elements = doc.querySelectorAll(selector)
            elements.forEach(element => {
              let iconUrl = element.getAttribute('href')
              if (iconUrl) {
                // 处理相对路径
                if (iconUrl.startsWith('/')) {
                  iconUrl = origin + iconUrl
                } else if (!iconUrl.startsWith('http')) {
                  iconUrl = origin + '/' + iconUrl
                }
                iconUrls.push(iconUrl)
              }
            })
          })

          console.log('🎯 从HTML解析到的图标:', iconUrls)
          return iconUrls

        } catch (error) {
          console.log(`❌ 代理服务失败: ${proxyUrl}`, error)
          continue
        }
      }

      console.log('❌ 所有代理服务都失败')
      return []

    } catch (error) {
      console.log('❌ HTML解析失败:', error)
      return []
    }
  }

  // 获取网站图标 - 简化逻辑：先用默认API，失败后解析HTML
  const getWebsiteIcon = async (url, forceRefresh = false) => {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname
      const mainDomain = getMainDomain(hostname)

      console.log('🎯 图标获取分析:', {
        originalUrl: url,
        hostname: hostname,
        mainDomain: mainDomain,
        forceRefresh: forceRefresh
      })

      // 1. 使用favicon.im API服务
      const faviconAPIs = [
        // favicon.im API - 支持多种域名格式
        `https://favicon.im/${hostname}`,

        // 如果完整域名和主域名不同，也尝试主域名
        ...(hostname !== mainDomain ? [
          `https://favicon.im/${mainDomain}`,
        ] : []),

        // 备用服务
        `https://icons.duckduckgo.com/ip3/${mainDomain}.ico`,
        `https://${mainDomain}/favicon.ico`,

        // 如果主域名和完整域名不同，尝试完整域名的其他服务
        ...(hostname !== mainDomain ? [
          `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
          `https://${hostname}/favicon.ico`
        ] : [])
      ]

      console.log('🔍 测试Favicon API服务:', faviconAPIs)

      for (const apiUrl of faviconAPIs) {
        console.log(`🔍 测试API: ${apiUrl}`)
        const isValid = await testIconUrl(apiUrl)
        if (isValid) {
          console.log(`✅ API成功: ${apiUrl}`)
          return apiUrl
        } else {
          console.log(`❌ API失败: ${apiUrl}`)
        }
      }

      console.log('❌ 所有Favicon API都失败，尝试解析HTML')

      // 2. 如果Google API失败，解析HTML查找图标
      const htmlIcons = await parseIconFromHTML(url)

      if (htmlIcons.length > 0) {
        console.log('🧪 测试HTML解析的图标:', htmlIcons)

        // 测试HTML中找到的图标
        for (const iconUrl of htmlIcons) {
          console.log(`🔍 测试HTML图标: ${iconUrl}`)
          const isValid = await testIconUrl(iconUrl)
          if (isValid) {
            console.log(`✅ 找到有效HTML图标: ${iconUrl}`)
            return iconUrl
          } else {
            console.log(`❌ HTML图标无效: ${iconUrl}`)
          }
        }
      }

      // 3. 如果都失败，使用默认图标
      console.log('⚠️ 所有图标都无效，使用默认图标')
      return '/assets/logo.png'

    } catch (error) {
      console.warn('无法解析网站URL，使用默认图标:', error)
      return '/assets/logo.png'
    }
  }



  // 保存网站
  const handleSaveWebsite = async () => {
    try {
      console.log('💾 开始保存网站...')

      // 异步获取网站图标
      const websiteIcon = await getWebsiteIcon(websiteForm.url.trim())

      const newWebsite = {
        id: editingWebsite === 'new' ? Date.now() : editingWebsite,
        name: websiteForm.name.trim(),
        description: websiteForm.description.trim(),
        url: websiteForm.url.trim(),
        category: websiteForm.category,
        tags: websiteForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        icon: websiteIcon // 使用异步获取的图标
      }

    console.log('💾 保存网站:', {
      name: newWebsite.name,
      url: newWebsite.url,
      icon: newWebsite.icon,
      category: newWebsite.category
    })

    if (editingWebsite === 'new') {
      // 添加新网站
      onUpdateWebsiteData([...config.websiteData, newWebsite])
    } else {
      // 编辑现有网站
      const updatedWebsites = config.websiteData.map(site => 
        site.id === editingWebsite ? newWebsite : site
      )
      onUpdateWebsiteData(updatedWebsites)
    }

    setEditingWebsite(null)
    resetWebsiteForm()
    showMessage('success', '网站信息已更新')

    } catch (error) {
      console.error('保存网站失败:', error)
      showMessage('error', '保存网站失败，请重试')
    }
  }

  // 删除网站
  const handleDeleteWebsite = (id) => {
    if (window.confirm('确定要删除这个网站吗？')) {
      const updatedWebsites = config.websiteData.filter(site => site.id !== id)
      onUpdateWebsiteData(updatedWebsites)
      showMessage('success', '网站已删除')
    }
  }

  // 批量更新所有网站图标
  const handleBatchUpdateIcons = async () => {
    if (!window.confirm('确定要更新所有网站的图标吗？这可能需要一些时间。')) {
      return
    }

    setIsUpdatingIcons(true)

    let updatedWebsites = [...config.websiteData]
    let successCount = 0
    let failCount = 0

    try {
      for (let i = 0; i < config.websiteData.length; i++) {
        const website = config.websiteData[i]

        try {
          console.log(`🔄 更新图标 ${i + 1}/${config.websiteData.length}: ${website.name}`)

          // 获取最新的图标URL
          const iconUrl = await getWebsiteIcon(website.url, true)

          if (iconUrl && iconUrl !== '/assets/logo.png') {
            // 直接使用新的图标URL
            updatedWebsites = updatedWebsites.map(site =>
              site.id === website.id
                ? { ...site, icon: iconUrl }
                : site
            )
            successCount++
          } else {
            failCount++
          }

          // 添加延迟避免请求过快
          await new Promise(resolve => setTimeout(resolve, 300))

        } catch (error) {
          console.error(`更新 ${website.name} 图标失败:`, error)
          failCount++
        }
      }

      // 更新所有网站数据
      onUpdateWebsiteData(updatedWebsites)
      showMessage('success', `图标更新完成！成功: ${successCount}, 失败: ${failCount}`)

    } catch (error) {
      showMessage('error', `批量更新失败: ${error.message}`)
    } finally {
      setIsUpdatingIcons(false)
    }
  }



  // 更新单个网站图标（简化方案）
  const handleUpdateSingleIcon = async (website) => {
    try {
      showMessage('info', `正在更新 ${website.name} 的图标...`)

      // 获取最新的图标URL
      const iconUrl = await getWebsiteIcon(website.url, true)

      if (iconUrl && iconUrl !== '/assets/logo.png') {
        // 直接保存图标URL
        const updatedWebsites = config.websiteData.map(site =>
          site.id === website.id
            ? { ...site, icon: iconUrl }
            : site
        )

        onUpdateWebsiteData(updatedWebsites)
        showMessage('success', `${website.name} 的图标已更新`)
        console.log('图标更新成功:', { name: website.name, iconUrl })
      } else {
        showMessage('warning', `${website.name} 的图标获取失败，保持原状`)
      }
    } catch (error) {
      showMessage('error', `更新 ${website.name} 图标失败: ${error.message}`)
    }
  }



  // 处理拖拽结束 - 只允许在同一分类内移动
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const activeWebsite = config.websiteData.find(site => site.id === active.id)
    const overWebsite = config.websiteData.find(site => site.id === over.id)

    if (!activeWebsite || !overWebsite) {
      return
    }

    // 检查是否在同一分类内
    if (activeWebsite.category !== overWebsite.category) {
      showMessage('warning', '只能在同一分类内调整网站顺序')
      return
    }

    const oldIndex = config.websiteData.findIndex(item => item.id === active.id)
    const newIndex = config.websiteData.findIndex(item => item.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = [...config.websiteData]
      const [reorderedItem] = newItems.splice(oldIndex, 1)
      newItems.splice(newIndex, 0, reorderedItem)
      onUpdateWebsiteData(newItems)
      showMessage('success', '网站顺序已调整')
    }
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingWebsite(null)
    resetWebsiteForm()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">网站管理</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBatchUpdateIcons}
            disabled={isUpdatingIcons}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isUpdatingIcons ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                更新中...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                更新图标
              </>
            )}
          </button>
          <button
            onClick={handleAddWebsite}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加网站
          </button>
        </div>
      </div>

      {/* 添加网站表单 */}
      {editingWebsite === 'new' && (
        <WebsiteForm
          websiteForm={websiteForm}
          setWebsiteForm={setWebsiteForm}
          onSave={handleSaveWebsite}
          onCancel={handleCancelEdit}
          isEditing={false}
          categories={config.categories}
        />
      )}

      {/* 网站列表 */}
      <div>
        {config.websiteData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-lg mb-2">还没有添加任何网站</div>
            <div className="text-sm">点击上方"添加网站"按钮开始添加</div>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={config.websiteData.map(site => site.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {config.websiteData
                  .sort((a, b) => {
                    // 获取分类信息和排序权重
                    const getCategoryWeight = (categoryId) => {
                      // 先在一级分类中查找
                      const topLevelIndex = config.categories.findIndex(cat => cat.id === categoryId)
                      if (topLevelIndex !== -1) {
                        const category = config.categories[topLevelIndex]
                        return {
                          weight: topLevelIndex * 1000, // 一级分类权重
                          special: category.special
                        }
                      }

                      // 再在二级分类中查找
                      for (let i = 0; i < config.categories.length; i++) {
                        const category = config.categories[i]
                        if (category.subcategories) {
                          const subIndex = category.subcategories.findIndex(sub => sub.id === categoryId)
                          if (subIndex !== -1) {
                            const subcategory = category.subcategories[subIndex]
                            return {
                              weight: i * 1000 + subIndex + 1, // 父分类权重 + 子分类权重
                              special: subcategory.special || category.special
                            }
                          }
                        }
                      }

                      return { weight: 999999, special: false } // 未分类的放最后
                    }

                    const aInfo = getCategoryWeight(a.category)
                    const bInfo = getCategoryWeight(b.category)

                    // 专栏分类优先显示
                    if (aInfo.special && !bInfo.special) return -1
                    if (!aInfo.special && bInfo.special) return 1

                    // 按分类顺序排序
                    return aInfo.weight - bInfo.weight
                  })
                  .map((website) => (
                  <SortableWebsiteItem
                    key={website.id}
                    website={website}
                    onEdit={handleEditWebsite}
                    onDelete={handleDeleteWebsite}
                    onUpdateIcon={handleUpdateSingleIcon}
                    editingWebsite={editingWebsite}
                    websiteForm={websiteForm}
                    setWebsiteForm={setWebsiteForm}
                    onSaveWebsite={handleSaveWebsite}
                    onCancelEdit={handleCancelEdit}
                    getCategoryName={getCategoryName}
                    getCategoryIcon={getCategoryIcon}
                    config={config}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}


      </div>
    </div>
  )
}

export default WebsiteManager 