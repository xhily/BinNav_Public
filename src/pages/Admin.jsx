import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, ExternalLink, Save, Plus, Edit3, Trash2, Download, ChevronDown, ChevronUp, Settings, GripVertical } from 'lucide-react'
import { websiteData, categories } from '../websiteData.js'
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

  // 拖拽传感器设置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

  // 保存配置到本地文件（开发模式）
  const saveConfig = async () => {
    setIsUpdating(true)
    showMessage('info', '正在保存配置...')

    try {
      // 生成新的配置文件内容
      const newContent = generateConfigFile(config.websiteData, config.categories)
      
      // 模拟文件保存（实际项目中需要通过API保存）
      console.log('新的配置文件内容:', newContent)
      
      // 下载配置文件到本地
      const blob = new Blob([newContent], { type: 'text/javascript' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'websiteData.js'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      showMessage('success', '配置已保存！请将下载的 websiteData.js 文件替换到 src/websiteData.js，然后刷新页面查看更新。')
    } catch (error) {
      showMessage('error', `保存失败: ${error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const showMessage = (type, content) => {
    setMessage({ type, content })
    if (type === 'success' || type === 'info') {
      setTimeout(() => setMessage({ type: '', content: '' }), 8000)
    }
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

    if (active.id !== over?.id) {
      const oldIndex = config.categories.findIndex(cat => cat.id === active.id)
      const newIndex = config.categories.findIndex(cat => cat.id === over.id)
      
      const newCategories = arrayMove(config.categories, oldIndex, newIndex)
      setConfig(prev => ({ ...prev, categories: newCategories }))
      showMessage('success', '分类顺序已更新')
    }
  }

  // 处理子分类拖拽排序
  const handleSubcategoryDragEnd = (event, parentId) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const updatedCategories = config.categories.map(cat => {
        if (cat.id === parentId && cat.subcategories) {
          const oldIndex = cat.subcategories.findIndex(sub => sub.id === active.id)
          const newIndex = cat.subcategories.findIndex(sub => sub.id === over.id)
          
          const newSubcategories = arrayMove(cat.subcategories, oldIndex, newIndex)
          return { ...cat, subcategories: newSubcategories }
        }
        return cat
      })
      
      setConfig(prev => ({ ...prev, categories: updatedCategories }))
      showMessage('success', '子分类顺序已更新')
    }
  }

  // 处理网站拖拽排序（分类内排序）
  const handleWebsiteDragEnd = (event, categoryId) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      // 获取当前分类下的网站
      const categoryWebsites = config.websiteData.filter(site => site.category === categoryId)
      
      const oldIndex = categoryWebsites.findIndex(site => site.id === active.id)
      const newIndex = categoryWebsites.findIndex(site => site.id === over.id)
      
      // 在分类内重新排序
      const reorderedCategoryWebsites = arrayMove(categoryWebsites, oldIndex, newIndex)
      
      // 重新构建完整的网站数组
      const finalWebsiteData = []
      let categoryWebsiteIndex = 0
      
      for (const site of config.websiteData) {
        if (site.category === categoryId) {
          // 使用重新排序后的网站
          finalWebsiteData.push(reorderedCategoryWebsites[categoryWebsiteIndex])
          categoryWebsiteIndex++
        } else {
          // 保持其他分类的网站不变
          finalWebsiteData.push(site)
        }
      }
      
      setConfig(prev => ({ ...prev, websiteData: finalWebsiteData }))
      showMessage('success', '网站顺序已更新')
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
                  {config.categories.filter(cat => cat.id !== category.id).map(cat => (
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
              onDragEnd={(event) => handleSubcategoryDragEnd(event, category.id)}
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
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">BinNav 管理后台</h1>
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                🚧 开发模式
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <a 
                href="/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 flex items-center text-sm"
              >
                <ExternalLink size={16} className="mr-1" />
                查看网站
              </a>
              
              <button
                onClick={saveConfig}
                disabled={isUpdating}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  isUpdating
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <Save size={16} className="mr-2" />
                {isUpdating ? '保存中...' : '导出配置'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 消息提示 */}
      {message.content && (
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4`}>
          <div className={`p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-50 text-green-800' :
            message.type === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} className="mr-2" /> :
             message.type === 'error' ? <AlertCircle size={20} className="mr-2" /> :
             <AlertCircle size={20} className="mr-2" />}
            {message.content}
          </div>
        </div>
      )}

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 状态概览 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">BinNav 管理后台</h2>
          <p className="text-gray-600 mb-4">
            管理您的导航网站。当前为开发模式，配置将下载到本地文件，需要手动替换后刷新页面。
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-1">网站总数</h3>
              <p className="text-2xl font-bold text-blue-600">{config.websiteData.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-1">分类总数</h3>
              <p className="text-2xl font-bold text-green-600">{config.categories.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-1">最新网站</h3>
              <p className="text-2xl font-bold text-purple-600">
                {config.websiteData.slice(-7).length}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-1">标签总数</h3>
              <p className="text-2xl font-bold text-orange-600">
                {[...new Set(config.websiteData.flatMap(site => site.tags || []))].length}
              </p>
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('websites')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'websites'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              网站管理
              <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                {config.websiteData.length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              分类管理
              <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                {config.categories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              系统设置
            </button>
          </nav>
        </div>

        {/* 网站管理 */}
        {activeTab === 'websites' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">网站列表</h3>
                <p className="text-sm text-gray-600 mt-1">
                  通过拖拽可以调整网站的显示顺序和优先级
                </p>
              </div>
              <button
                onClick={handleAddWebsite}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>添加网站</span>
              </button>
            </div>

            {/* 添加网站表单 - 顶部显示 */}
            {editingWebsite === 'new' && (
              <div className="bg-white rounded-lg border p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingWebsite ? '编辑网站' : '添加新网站'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">网站名称</label>
                    <input
                      type="text"
                      value={websiteForm.name}
                      onChange={(e) => setWebsiteForm({...websiteForm, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例如：GitHub"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">网站URL</label>
                    <input
                      type="url"
                      value={websiteForm.url}
                      onChange={(e) => setWebsiteForm({...websiteForm, url: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://github.com"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">网站描述</label>
                    <textarea
                      value={websiteForm.description}
                      onChange={(e) => setWebsiteForm({...websiteForm, description: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="简要描述网站的功能和特点"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                    <select
                      value={websiteForm.category}
                      onChange={(e) => setWebsiteForm({...websiteForm, category: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  

                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">标签 (用逗号分隔)</label>
                    <input
                      type="text"
                      value={websiteForm.tags}
                      onChange={(e) => setWebsiteForm({...websiteForm, tags: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="设计工具, 免费, 在线工具"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleSaveWebsite}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {setEditingWebsite(null); resetWebsiteForm()}}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* 按分类显示网站列表 */}
            <div className="space-y-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500">网站按分类分组显示，可在同分类内拖拽调整顺序</p>
              </div>
              
              {config.categories.map((category) => {
                // 获取所有相关网站（包括子分类的网站）
                const getAllCategoryWebsites = (cat) => {
                  let websites = config.websiteData.filter(site => site.category === cat.id)
                  if (cat.subcategories) {
                    cat.subcategories.forEach(subcat => {
                      websites = [...websites, ...config.websiteData.filter(site => site.category === subcat.id)]
                    })
                  }
                  return websites
                }
                
                const categoryWebsites = getAllCategoryWebsites(category)
                if (categoryWebsites.length === 0) return null
                
                return (
                  <div key={category.id} className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <img 
                          src={category.icon || '/default_icon.png'}
                          alt={category.name}
                          className="w-8 h-8 mr-3 rounded"
                          onError={(e) => { e.target.src = '/logo.png' }}
                        />
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {categoryWebsites.length} 个网站
                        </span>
                      </div>
                      
                      {/* 一级分类的网站 */}
                      {config.websiteData.filter(site => site.category === category.id).length > 0 && (
                        <div className="mb-6">
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event) => handleWebsiteDragEnd(event, category.id)}
                          >
                            <SortableContext
                              items={config.websiteData.filter(site => site.category === category.id).map(site => site.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {config.websiteData.filter(site => site.category === category.id).map((website) => (
                                  <SortableWebsiteItem key={website.id} website={website} />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        </div>
                      )}
                      
                      {/* 子分类的网站 */}
                      {category.subcategories && category.subcategories.map((subcategory) => {
                        const subcategoryWebsites = config.websiteData.filter(site => site.category === subcategory.id)
                        if (subcategoryWebsites.length === 0) return null
                        
                        return (
                          <div key={subcategory.id} className="mb-6 last:mb-0">
                            <div className="flex items-center mb-3 ml-6">
                              <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                              <img 
                                src={subcategory.icon || '/default_icon.png'}
                                alt={subcategory.name}
                                className="w-6 h-6 mr-2 rounded"
                                onError={(e) => { e.target.src = '/logo.png' }}
                              />
                              <h4 className="text-md font-medium text-gray-800">{subcategory.name}</h4>
                              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {subcategoryWebsites.length} 个网站
                              </span>
                            </div>
                            
                            <div className="ml-6">
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(event) => handleWebsiteDragEnd(event, subcategory.id)}
                              >
                                <SortableContext
                                  items={subcategoryWebsites.map(site => site.id)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {subcategoryWebsites.map((website) => (
                                      <SortableWebsiteItem key={website.id} website={website} />
                                    ))}
                                  </div>
                                </SortableContext>
                              </DndContext>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 分类管理 */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">分类列表</h3>
              <button
                onClick={handleAddCategory}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>添加分类</span>
              </button>
            </div>

            {/* 添加分类表单 - 顶部显示 */}
            {editingCategory === 'new' && (
              <div className="bg-white rounded-lg border p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">添加新分类</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分类名称</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例如：设计工具"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">图标路径</label>
                    <input
                      type="text"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="/category_icon.png"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">父分类 (可选)</label>
                    <select
                      value={categoryForm.parentId || ''}
                      onChange={(e) => setCategoryForm({...categoryForm, parentId: e.target.value || null})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- 一级分类 --</option>
                      {config.categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        checked={categoryForm.special}
                        onChange={(e) => setCategoryForm({...categoryForm, special: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">特殊分类（如作者专栏）</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleSaveCategory}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {setEditingCategory(null); resetCategoryForm()}}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* 分类列表 */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">分类列表</h3>
                  <p className="text-sm text-gray-500">拖拽分类项可以调整显示顺序</p>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={config.categories.map(cat => cat.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1">
                      {config.categories.map((category) => (
                        <SortableCategoryItem key={category.id} category={category} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
        )}

        {/* 系统设置 */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* 站点基础设置 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings size={20} className="mr-2" />
                站点基础设置
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">站点名称</label>
                  <input
                    type="text"
                    value={siteSettings.siteName}
                    onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="例如：BinNav"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">站点Logo路径</label>
                  <input
                    type="text"
                    value={siteSettings.siteLogo}
                    onChange={(e) => setSiteSettings({...siteSettings, siteLogo: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="/logo.png"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">站点描述</label>
                  <textarea
                    value={siteSettings.siteDescription}
                    onChange={(e) => setSiteSettings({...siteSettings, siteDescription: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="精选网站导航"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleSaveSettings}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  保存设置
                </button>
              </div>
            </div>

            {/* 开发模式说明 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="font-medium text-gray-900 mb-2">开发模式说明</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm mb-2">
                  <strong>当前为开发模式</strong>，配置修改暂时无法直接生效。
                </p>
                <p className="text-blue-700 text-sm">
                  点击"导出配置"按钮将下载 websiteData.js 文件，请手动替换到 src/websiteData.js，然后刷新页面查看更新。
                </p>
              </div>
            </div>

            {/* 数据导出 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="font-medium text-gray-900 mb-2">数据导出</h4>
              <p className="text-sm text-gray-600 mb-4">
                导出当前的网站数据和分类配置，用于备份或手动更新。
              </p>
              <button 
                onClick={saveConfig}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
              >
                <Download size={16} />
                <span>导出配置文件</span>
              </button>
            </div>

            {/* 统计信息 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="font-medium text-gray-900 mb-2">统计信息</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">网站总数</div>
                  <div className="text-lg font-semibold text-gray-900">{config.websiteData.length}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">分类总数</div>
                  <div className="text-lg font-semibold text-gray-900">{config.categories.length}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">最新网站</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {config.websiteData.slice(-7).length}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">标签总数</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {[...new Set(config.websiteData.flatMap(site => site.tags || []))].length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Admin 