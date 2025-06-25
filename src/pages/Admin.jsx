import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, ExternalLink, Save, Plus, Edit3, Trash2, Download, ChevronDown, ChevronUp, Settings, GripVertical, LogOut, User, Lock } from 'lucide-react'
import { websiteData, categories } from '../websiteData.js'
import { getEnvConfig } from '../config/env.js'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [config, setConfig] = useState({ 
    websiteData: websiteData || [], 
    categories: categories || [] 
  })
  const [message, setMessage] = useState({ type: '', content: '' })
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState('websites')
  
  // 网站管理相关状态
  const [editingWebsite, setEditingWebsite] = useState(null)
  const [websiteForm, setWebsiteForm] = useState({
    name: '',
    description: '',
    url: '',
    category: 'recommended',
    tags: ''
  })

  // 分类管理相关状态
  const [editingCategory, setEditingCategory] = useState(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '',
    special: false,
    parentId: null // 新增：用于二级分类
  })

  // 系统设置相关状态
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'BinNav',
    siteLogo: '/logo.png',
    siteDescription: '精选网站导航'
  })

  // 获取环境配置（仅用于状态检查，密码验证通过API进行）
  const envConfig = getEnvConfig()

  // 拖拽传感器设置 - 必须在所有条件渲染之前
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 检查认证状态
  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_authenticated')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoginLoading(true)
    
    // 显示加载状态
    showMessage('info', '正在验证密码...')
    
    try {
      // 调用EdgeOne Functions验证密码
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: password
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setIsAuthenticated(true)
        localStorage.setItem('admin_authenticated', 'true')
        showMessage('success', '登录成功！')
      } else {
        showMessage('error', result.message || '密码错误！')
      }
    } catch (error) {
      console.error('登录验证失败:', error)
      showMessage('error', '登录验证失败，请检查网络连接')
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated')
    setIsAuthenticated(false)
    setPassword('')
    showMessage('success', '已成功退出登录')
  }

  const showMessage = (type, content) => {
    setMessage({ type, content })
    setTimeout(() => setMessage({ type: '', content: '' }), 5000)
  }

  const saveConfig = async () => {
    setIsUpdating(true)
    
    try {
      // 生成配置文件内容
      const configContent = generateConfigFile(config.websiteData, config.categories)
      console.log('🚀 开始保存配置...')
      
      // 首先获取当前文件的SHA值
      console.log('📡 获取当前配置SHA值...')
      const getResponse = await fetch('/api/get-config')
      if (!getResponse.ok) {
        throw new Error('获取当前配置失败，请刷新页面重试')
      }
      const currentData = await getResponse.json()
      console.log('📄 当前配置获取结果:', { 
        success: currentData.success, 
        hasContent: !!currentData.content, 
        hasSha: !!currentData.sha,
        contentType: currentData.contentType,
        warning: currentData.warning
      })
      
      if (!currentData.success) {
        throw new Error(currentData.message || '获取当前配置失败')
      }

      if (!currentData.sha) {
        throw new Error('未获取到文件SHA值，无法更新配置')
      }
      
      // 如果返回的是base64内容，给用户一个提示
      if (currentData.contentType === 'base64') {
        console.log('⚠️ 注意：获取到的是base64格式内容，EdgeOne Functions解码可能有问题')
        showMessage('info', '⚠️ 注意：配置获取可能存在编码问题，但仍可正常保存')
      }
      
      // 调用EdgeOne Functions更新配置
      console.log('📤 发送配置更新请求...')
      const updateResponse = await fetch('/api/update-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config: configContent,
          sha: currentData.sha
        })
      })

      const result = await updateResponse.json()
      console.log('📦 更新配置响应:', { success: result.success, error: result.error, message: result.message })
      
      if (result.success) {
        showMessage('success', '✅ 配置更新成功！EdgeOne Pages正在自动重新部署，1-2分钟后生效')
      } else {
        throw new Error(result.message || result.error || '未知错误')
      }
    } catch (error) {
      console.error('❌ 保存配置失败:', error)
      showMessage('error', `❌ 保存失败: ${error.message}`)
      
      // 失败时提供下载作为备用方案
      downloadConfig()
      showMessage('info', '💾 已下载配置文件备份，可手动替换src/websiteData.js')
    } finally {
      setIsUpdating(false)
    }
  }

  const downloadConfig = () => {
    const configContent = generateConfigFile(config.websiteData, config.categories)
    const blob = new Blob([configContent], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'websiteData.js'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 登录页面UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">检查登录状态中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">管理后台</h1>
            <p className="text-gray-600">请输入管理密码以继续</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                管理密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="请输入管理密码"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoginLoading}
              className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                isLoginLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              } text-white`}
            >
              {isLoginLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  验证中...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  登录管理后台
                </>
              )}
            </button>
          </form>
          
          {message.content && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {message.content}
            </div>
          )}
          
          <p className="text-sm text-gray-500 text-center mt-4">
            登录后您可以管理网站内容并通过EdgeOne Functions自动部署更新
          </p>
        </div>
      </div>
    )
  }

  // 用户信息头部组件
  const UserHeader = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">管理员</h2>
            <p className="text-sm text-gray-600">BinNav 后台管理</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>
      </div>
    </div>
  )

  // 生成新的配置文件内容
  const generateConfigFile = (websiteData, categories) => {
    const timestamp = new Date().toLocaleString('zh-CN')
    return `// 网站数据 - 通过管理后台更新于 ${timestamp}
export const websiteData = ${JSON.stringify(websiteData, null, 2)};

// 分类定义 - 支持二级分类
export const categories = ${JSON.stringify(categories, null, 2)};

// 搜索引擎配置
export const searchEngines = [
  { id: "bing", name: "必应", url: "https://www.bing.com/search?q=", color: "bg-blue-600" },
  { id: "baidu", name: "百度", url: "https://www.baidu.com/s?wd=", color: "bg-red-600" },
  { id: "google", name: "谷歌", url: "https://www.google.com/search?q=", color: "bg-green-600" },
  { id: "internal", name: "站内搜索", url: "", color: "bg-purple-600" }
];

// 推荐内容配置
export const recommendations = [
  {
    id: 1,
    title: "阿里云",
    description: "点击领取2000元限量云产品优惠券",
    url: "https://aliyun.com",
    type: "sponsor",
    color: "from-blue-50 to-blue-100"
  },
  {
    id: 2,
    title: "设计资源",
    description: "高质量设计素材网站推荐",
    url: "#design_resources",
    type: "internal",
    color: "from-green-50 to-green-100"
  }
];

// 热门标签
export const popularTags = [
  "设计工具", "免费素材", "UI设计", "前端开发", "图标库", "配色方案",
  "设计灵感", "原型工具", "代码托管", "学习平台", "社区论坛", "创业资讯"
];

// 网站统计信息
export const siteStats = {
  totalSites: websiteData.length,
  totalCategories: categories.length,
  totalTags: [...new Set(websiteData.flatMap(site => site.tags || []))].length,
  lastUpdated: "${new Date().toISOString().split('T')[0]}"
};
`
  }

  // 网站管理功能
  const resetWebsiteForm = () => {
    setWebsiteForm({
      name: '',
      description: '',
      url: '',
      category: 'recommended',
      tags: ''
    })
  }

  const handleAddWebsite = () => {
    setEditingWebsite('new')
    resetWebsiteForm()
  }

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

  const handleSaveWebsite = () => {
    const newWebsite = {
      id: editingWebsite === 'new' ? Date.now() : editingWebsite,
      name: websiteForm.name.trim(),
      description: websiteForm.description.trim(),
      url: websiteForm.url.trim(),
      category: websiteForm.category,
      tags: websiteForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      icon: `/default_icon.png`
    }

    if (editingWebsite === 'new') {
      // 添加新网站
      setConfig(prev => ({ ...prev, websiteData: [...prev.websiteData, newWebsite] }))
    } else {
      // 编辑现有网站
      const updatedWebsites = config.websiteData.map(site => 
        site.id === editingWebsite ? newWebsite : site
      )
      setConfig(prev => ({ ...prev, websiteData: updatedWebsites }))
    }

    setEditingWebsite(null)
    resetWebsiteForm()
    showMessage('success', '网站信息已更新')
  }

  const handleDeleteWebsite = (id) => {
    if (window.confirm('确定要删除这个网站吗？')) {
      const updatedWebsites = config.websiteData.filter(site => site.id !== id)
      setConfig(prev => ({ ...prev, websiteData: updatedWebsites }))
      showMessage('success', '网站已删除')
    }
  }

  // 分类管理功能
  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      icon: '',
      special: false,
      parentId: null
    })
  }

  // 保存系统设置
  const handleSaveSettings = () => {
    // 在实际实现中，这里会生成包含系统设置的配置文件
    showMessage('success', '系统设置已更新')
  }

  const handleAddCategory = () => {
    setEditingCategory('new')
    resetCategoryForm()
  }

  const handleEditCategory = (category) => {
    if (editingCategory === category.id) {
      // 如果正在编辑这个分类，则取消编辑
      setEditingCategory(null)
      resetCategoryForm()
    } else {
      // 否则开始编辑这个分类
      setEditingCategory(category.id)
      
      // 查找分类的父级ID
      let parentId = null
      for (const parentCategory of config.categories) {
        if (parentCategory.subcategories && parentCategory.subcategories.find(sub => sub.id === category.id)) {
          parentId = parentCategory.id
          break
        }
      }
      
      setCategoryForm({
        name: category.name,
        icon: category.icon || '',
        special: category.special || false,
        parentId: parentId // 正确设置父分类ID
      })
    }
  }

  const handleSaveCategory = () => {
    const isNewCategory = editingCategory === 'new' || editingCategory?.startsWith('new-sub-')
    const isEditingSubcategory = editingCategory?.startsWith('edit-sub-')
    
    let categoryId
    if (isNewCategory) {
      categoryId = categoryForm.name.toLowerCase().replace(/\s+/g, '_')
    } else if (isEditingSubcategory) {
      categoryId = editingCategory.replace('edit-sub-', '')
    } else {
      categoryId = editingCategory
    }
    
    const newCategory = {
      id: categoryId,
      name: categoryForm.name.trim(),
      icon: categoryForm.icon.trim() || '/default_icon.png',
      special: categoryForm.special
    }

    if (isNewCategory) {
      // 新增分类逻辑
      if (categoryForm.parentId) {
        // 添加新子分类
        const updatedCategories = config.categories.map(cat => {
          if (cat.id === categoryForm.parentId) {
            const subcategories = cat.subcategories || []
            return {
              ...cat,
              subcategories: [...subcategories, newCategory]
            }
          }
          return cat
        })
        setConfig(prev => ({ ...prev, categories: updatedCategories }))
      } else {
        // 添加新一级分类
        setConfig(prev => ({ ...prev, categories: [...prev.categories, newCategory] }))
      }
    } else {
      // 编辑现有分类逻辑
      let updatedCategories = [...config.categories]
      
      // 首先从原位置移除分类
      updatedCategories = updatedCategories.map(cat => {
        if (cat.id === categoryId) {
          // 从一级分类中移除
          return null
        } else if (cat.subcategories) {
          // 从子分类中移除
          const filteredSubcategories = cat.subcategories.filter(sub => sub.id !== categoryId)
          return {
            ...cat,
            subcategories: filteredSubcategories
          }
        }
        return cat
      }).filter(cat => cat !== null)
      
      // 然后添加到新位置
      if (categoryForm.parentId) {
        // 作为子分类添加
        updatedCategories = updatedCategories.map(cat => {
          if (cat.id === categoryForm.parentId) {
            const subcategories = cat.subcategories || []
            return {
              ...cat,
              subcategories: [...subcategories, newCategory]
            }
          }
          return cat
        })
      } else {
        // 作为一级分类添加
        updatedCategories.push(newCategory)
      }
      
      setConfig(prev => ({ ...prev, categories: updatedCategories }))
    }

    setEditingCategory(null)
    resetCategoryForm()
    showMessage('success', '分类信息已更新')
  }

  const handleDeleteCategory = (id) => {
    // 查找要删除的分类
    let categoryToDelete = null
    let isTopLevel = false
    let parentCategory = null
    
    // 先在一级分类中查找
    categoryToDelete = config.categories.find(cat => cat.id === id)
    if (categoryToDelete) {
      isTopLevel = true
    } else {
      // 在二级分类中查找
      for (const parentCat of config.categories) {
        if (parentCat.subcategories) {
          const foundSub = parentCat.subcategories.find(sub => sub.id === id)
          if (foundSub) {
            categoryToDelete = foundSub
            parentCategory = parentCat
            break
          }
        }
      }
    }

    if (!categoryToDelete) {
      showMessage('error', '找不到要删除的分类')
      return
    }

    // 统计受影响的内容
    let affectedWebsites = []
    let affectedSubcategories = []
    
    if (isTopLevel) {
      // 一级分类：统计直接关联的网站 + 所有子分类及其网站
      affectedWebsites = config.websiteData.filter(site => site.category === id)
      
      if (categoryToDelete.subcategories) {
        affectedSubcategories = categoryToDelete.subcategories
        // 统计子分类下的网站
        categoryToDelete.subcategories.forEach(sub => {
          const subWebsites = config.websiteData.filter(site => site.category === sub.id)
          affectedWebsites = [...affectedWebsites, ...subWebsites]
        })
      }
    } else {
      // 二级分类：只统计直接关联的网站
      affectedWebsites = config.websiteData.filter(site => site.category === id)
    }

    // 构建确认消息
    let confirmMessage = `确定要删除分类"${categoryToDelete.name}"吗？\n\n`
    
    if (isTopLevel && affectedSubcategories.length > 0) {
      confirmMessage += `这将同时删除 ${affectedSubcategories.length} 个子分类：\n`
      affectedSubcategories.forEach(sub => {
        const subWebsiteCount = config.websiteData.filter(site => site.category === sub.id).length
        confirmMessage += `• ${sub.name} (${subWebsiteCount} 个网站)\n`
      })
      confirmMessage += '\n'
    }
    
    if (affectedWebsites.length > 0) {
      confirmMessage += `这将同时删除 ${affectedWebsites.length} 个网站：\n`
      affectedWebsites.slice(0, 5).forEach(site => {
        confirmMessage += `• ${site.name}\n`
      })
      if (affectedWebsites.length > 5) {
        confirmMessage += `• ...还有 ${affectedWebsites.length - 5} 个网站\n`
      }
      confirmMessage += '\n此操作不可撤销！'
    } else {
      confirmMessage += '此分类下没有网站，可以安全删除。'
    }

    if (window.confirm(confirmMessage)) {
      // 执行删除操作
      let updatedCategories = [...config.categories]
      let updatedWebsites = [...config.websiteData]
      
      if (isTopLevel) {
        // 删除一级分类及其所有子分类和网站
        updatedCategories = updatedCategories.filter(cat => cat.id !== id)
        
        // 删除该分类及其子分类下的所有网站
        const categoriesToRemove = [id]
        if (categoryToDelete.subcategories) {
          categoryToDelete.subcategories.forEach(sub => {
            categoriesToRemove.push(sub.id)
          })
        }
        
        updatedWebsites = updatedWebsites.filter(site => !categoriesToRemove.includes(site.category))
      } else {
        // 删除二级分类
        updatedCategories = updatedCategories.map(cat => {
          if (cat.id === parentCategory.id) {
            return {
              ...cat,
              subcategories: cat.subcategories.filter(sub => sub.id !== id)
            }
          }
          return cat
        })
        
        // 删除该二级分类下的所有网站
        updatedWebsites = updatedWebsites.filter(site => site.category !== id)
      }
      
      setConfig(prev => ({ 
        ...prev, 
        categories: updatedCategories,
        websiteData: updatedWebsites
      }))
      
      const deletedCount = affectedWebsites.length
      const subcatCount = affectedSubcategories.length
      let successMessage = `分类"${categoryToDelete.name}"已删除`
      
      if (subcatCount > 0) {
        successMessage += `，同时删除了 ${subcatCount} 个子分类`
      }
      if (deletedCount > 0) {
        successMessage += `，同时删除了 ${deletedCount} 个网站`
      }
      
      showMessage('success', successMessage)
    }
  }

  const getCategoryName = (categoryId) => {
    // 先在一级分类中查找
    const category = config.categories.find(cat => cat.id === categoryId)
    if (category) {
      return category.name
    }
    
    // 在子分类中查找
    for (const parentCategory of config.categories) {
      if (parentCategory.subcategories) {
        const subcategory = parentCategory.subcategories.find(sub => sub.id === categoryId)
        if (subcategory) {
          return `${parentCategory.name} > ${subcategory.name}`
        }
      }
    }
    
    return categoryId
  }

  // 添加子分类
  const handleAddSubcategory = (parentId) => {
    setEditingCategory(`new-sub-${parentId}`)
    setCategoryForm({
      name: '',
      icon: '',
      special: false,
      parentId: parentId
    })
  }

  // 编辑子分类
  const handleEditSubcategory = (subcategory, parentId) => {
    const editKey = `edit-sub-${subcategory.id}`
    if (editingCategory === editKey) {
      // 如果正在编辑这个子分类，则取消编辑
      setEditingCategory(null)
      resetCategoryForm()
    } else {
      // 否则开始编辑这个子分类
      setEditingCategory(editKey)
      setCategoryForm({
        name: subcategory.name,
        icon: subcategory.icon || '',
        special: subcategory.special || false,
        parentId: parentId
      })
    }
  }

  // 处理分类拖拽排序
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      if (activeTab === 'websites') {
        setConfig(prev => ({
          ...prev,
          websiteData: arrayMove(prev.websiteData, 
            prev.websiteData.findIndex(item => item.id === active.id),
            prev.websiteData.findIndex(item => item.id === over.id)
          )
        }))
      } else if (activeTab === 'categories') {
        setConfig(prev => ({
          ...prev,
          categories: arrayMove(prev.categories,
            prev.categories.findIndex(item => item.id === active.id),
            prev.categories.findIndex(item => item.id === over.id)
          )
        }))
      }
    }
  }

  // 可拖拽的网站卡片组件
  const SortableWebsiteItem = ({ website }) => {
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
              src={`https://www.google.com/s2/favicons?domain=${new URL(website.url).hostname}&sz=32`}
              alt={website.name}
              className="w-10 h-10 rounded-lg flex-shrink-0 bg-gray-50 p-1"
              onError={(e) => { e.target.src = '/logo.png' }}
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
            <span className="text-xs text-gray-600 truncate block" title={getCategoryName(website.category)}>
              📁 {getCategoryName(website.category)}
            </span>
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
              onClick={() => handleEditWebsite(website)}
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
              onClick={() => handleDeleteWebsite(website.id)}
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
                onClick={handleSaveWebsite}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex-1"
              >
                保存
              </button>
              <button
                onClick={() => {setEditingWebsite(null); resetWebsiteForm()}}
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

  // 可拖拽的分类项组件
  const SortableCategoryItem = ({ category }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: category.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    return (
      <div ref={setNodeRef} style={style} className="relative">
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 bg-white">
          <div className="flex items-center space-x-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <GripVertical size={16} />
            </div>
            <img 
              src={category.icon || '/default_icon.png'}
              alt={category.name}
              className="w-6 h-6 rounded"
              onError={(e) => { e.target.src = '/logo.png' }}
            />
            <div>
              <span className="font-medium text-gray-900">{category.name}</span>
              <span className="ml-2 text-xs text-gray-500">
                ({config.websiteData.filter(site => site.category === category.id).length} 个网站)
              </span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              category.special ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {category.special ? '特殊' : '普通'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAddSubcategory(category.id)}
              className="text-green-600 hover:text-green-800 text-sm px-2 py-1"
              title="添加子分类"
            >
              + 子分类
            </button>
            <button
              onClick={() => handleEditCategory(category)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors ${
                editingCategory === category.id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              {editingCategory === category.id ? <ChevronUp size={14} /> : <Edit3 size={14} />}
              <span>{editingCategory === category.id ? '收起' : '编辑'}</span>
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="text-red-600 hover:text-red-800 p-1"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* 编辑表单 - 在对应分类下方展开 */}
        {editingCategory === category.id && (
          <div className="mt-2 ml-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900 mb-3">编辑分类信息</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">分类名称</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例如：设计工具"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">图标路径</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/category_icon.png"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">父分类 (可选)</label>
                <select
                  value={categoryForm.parentId || ''}
                  onChange={(e) => setCategoryForm({...categoryForm, parentId: e.target.value || null})}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- 一级分类 --</option>
                  {config.categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="flex items-center space-x-2 pt-4">
                  <input
                    type="checkbox"
                    checked={categoryForm.special}
                    onChange={(e) => setCategoryForm({...categoryForm, special: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-medium text-gray-700">特殊分类（如作者专栏）</span>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleSaveCategory}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex-1"
              >
                保存
              </button>
              <button
                onClick={() => {setEditingCategory(null); resetCategoryForm()}}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm flex-1"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 添加子分类表单 */}
        {editingCategory === `new-sub-${category.id}` && (
          <div className="mt-2 ml-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900 mb-3">添加子分类</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">子分类名称</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="例如：UI设计"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">图标路径</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="/subcategory_icon.png"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleSaveCategory}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm flex-1"
              >
                添加
              </button>
              <button
                onClick={() => {setEditingCategory(null); resetCategoryForm()}}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm flex-1"
              >
                取消
              </button>
            </div>
          </div>
        )}
        
        {/* 二级分类 */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="ml-6 mt-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => handleDragEnd(event)}
            >
              <SortableContext
                items={category.subcategories.map(sub => sub.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {category.subcategories.map((subcategory) => (
                    <SortableSubcategoryItem 
                      key={subcategory.id} 
                      subcategory={subcategory} 
                      parentId={category.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    )
  }

  // 可拖拽的子分类项组件
  const SortableSubcategoryItem = ({ subcategory, parentId }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: subcategory.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    return (
      <div ref={setNodeRef} style={style}>
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 border border-gray-100 bg-gray-25">
          <div className="flex items-center space-x-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <GripVertical size={12} />
            </div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <img 
              src={subcategory.icon || '/default_icon.png'}
              alt={subcategory.name}
              className="w-5 h-5 rounded"
              onError={(e) => { e.target.src = '/logo.png' }}
            />
            <span className="text-sm text-gray-800">{subcategory.name}</span>
            <span className="text-xs text-gray-500">
              ({config.websiteData.filter(site => site.category === subcategory.id).length} 个网站)
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleEditSubcategory(subcategory, parentId)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                editingCategory === `edit-sub-${subcategory.id}` 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              {editingCategory === `edit-sub-${subcategory.id}` ? <ChevronUp size={12} /> : <Edit3 size={12} />}
              <span>{editingCategory === `edit-sub-${subcategory.id}` ? '收起' : '编辑'}</span>
            </button>
            <button
              onClick={() => handleDeleteCategory(subcategory.id)}
              className="text-red-600 hover:text-red-800 p-1"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
        
        {/* 编辑子分类表单 */}
        {editingCategory === `edit-sub-${subcategory.id}` && (
          <div className="mt-2 ml-8 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h6 className="text-xs font-medium text-gray-900 mb-2">编辑子分类</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">子分类名称</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例如：UI设计"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">图标路径</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/subcategory_icon.png"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">父分类</label>
                <select
                  value={categoryForm.parentId || ''}
                  onChange={(e) => setCategoryForm({...categoryForm, parentId: e.target.value || null})}
                  className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- 升级为一级分类 --</option>
                  {config.categories.filter(cat => cat.id !== subcategory.id).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleSaveCategory}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs flex-1"
              >
                保存
              </button>
              <button
                onClick={() => {setEditingCategory(null); resetCategoryForm()}}
                className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs flex-1"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <UserHeader />

      {/* 消息提示 */}
      {message.content && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            {message.content}
          </div>
        </div>
      )}

        {/* 主要操作按钮 */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={saveConfig}
            disabled={isUpdating}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Save className="w-5 h-5" />
            {isUpdating ? '保存中...' : '保存并发布'}
          </button>
        </div>

        {/* 标签页导航 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('websites')}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'websites'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              网站管理 ({config.websiteData.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'categories'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              分类管理 ({config.categories.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              系统设置
            </button>
        </div>

          {/* 标签页内容 */}
          <div className="p-6">
        {activeTab === 'websites' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">网站管理</h3>
              <button
                onClick={handleAddWebsite}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                    <Plus className="w-4 h-4" />
                    添加网站
              </button>
            </div>

                {/* 添加网站表单 */}
            {editingWebsite === 'new' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">添加新网站</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">网站名称</label>
                    <input
                      type="text"
                      value={websiteForm.name}
                      onChange={(e) => setWebsiteForm({...websiteForm, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例如：GitHub"
                    />
                  </div>
                  
                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">网站地址</label>
                    <input
                      type="url"
                      value={websiteForm.url}
                      onChange={(e) => setWebsiteForm({...websiteForm, url: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://github.com"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">网站描述</label>
                    <textarea
                      value={websiteForm.description}
                      onChange={(e) => setWebsiteForm({...websiteForm, description: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows="3"
                          placeholder="简要描述网站的功能和特色..."
                    />
                  </div>
                  
                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">所属分类</label>
                    <select
                      value={websiteForm.category}
                      onChange={(e) => setWebsiteForm({...websiteForm, category: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                          <option value="recommended">常用推荐</option>
                          <option value="design_tools">设计工具</option>
                          <option value="developer_tools">开发工具</option>
                          <option value="learning">学习教程</option>
                    </select>
                  </div>
                  
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">标签 (用逗号分隔)</label>
                    <input
                      type="text"
                      value={websiteForm.tags}
                      onChange={(e) => setWebsiteForm({...websiteForm, tags: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="设计, 工具, 免费"
                    />
                  </div>
                </div>
                
                    <div className="flex space-x-3">
                  <button
                    onClick={handleSaveWebsite}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex-1"
                  >
                        保存网站
                  </button>
                  <button
                    onClick={() => {setEditingWebsite(null); resetWebsiteForm()}}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex-1"
                  >
                    取消
                  </button>
                </div>
              </div>
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
                          {config.websiteData.map((website) => (
                                  <SortableWebsiteItem key={website.id} website={website} />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                  )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">分类管理</h3>
              <button
                onClick={handleAddCategory}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                    <Plus className="w-4 h-4" />
                    添加分类
              </button>
            </div>

                {/* 添加分类表单 */}
            {editingCategory === 'new' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">添加新分类</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">分类名称</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例如：设计工具"
                    />
                  </div>
                  
                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">图标路径</label>
                    <input
                      type="text"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="/category_icon.png"
                    />
                  </div>
                  
                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">父分类</label>
                    <select
                      value={categoryForm.parentId || ''}
                      onChange={(e) => setCategoryForm({...categoryForm, parentId: e.target.value || null})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- 一级分类 --</option>
                          {config.categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                      </div>
                  </div>
                  
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="special"
                        checked={categoryForm.special}
                        onChange={(e) => setCategoryForm({...categoryForm, special: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="special" className="ml-2 block text-sm text-gray-700">
                        设为特殊分类（如：作者专栏）
                    </label>
                </div>
                
                    <div className="flex space-x-3">
                  <button
                    onClick={handleSaveCategory}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex-1"
                  >
                        保存分类
                  </button>
                  <button
                    onClick={() => {setEditingCategory(null); resetCategoryForm()}}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex-1"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* 分类列表 */}
                <div className="space-y-4">
                  {config.categories.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-lg mb-2">还没有添加任何分类</div>
                      <div className="text-sm">点击上方"添加分类"按钮开始添加</div>
                </div>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={config.categories.map(cat => cat.id)} strategy={verticalListSortingStrategy}>
                      {config.categories.map((category) => (
                        <SortableCategoryItem key={category.id} category={category} />
                      ))}
                  </SortableContext>
                </DndContext>
                  )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
                <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">系统设置</h3>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-base font-medium text-gray-900 mb-4">站点基本信息</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">站点名称</label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="BinNav"
                  />
                </div>
                
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logo路径</label>
                  <input
                    type="text"
                    value={siteSettings.siteLogo}
                    onChange={(e) => setSiteSettings({...siteSettings, siteLogo: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="/logo.png"
                  />
                </div>
                
                <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">站点描述</label>
                  <textarea
                    value={siteSettings.siteDescription}
                    onChange={(e) => setSiteSettings({...siteSettings, siteDescription: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                    placeholder="精选网站导航"
                  />
                </div>
              </div>
              
                  <div className="mt-6">
                <button
                  onClick={handleSaveSettings}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  保存设置
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin 