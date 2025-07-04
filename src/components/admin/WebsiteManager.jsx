import React, { useState } from 'react'
import { Plus, Edit3, Trash2, GripVertical, ChevronUp } from 'lucide-react'
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
  onUpdateIcon,
  editingWebsite,
  websiteForm,
  setWebsiteForm,
  onSaveWebsite,
  onCancelEdit,
  getCategoryName,
  config
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
            src={`https://www.google.com/s2/favicons?domain=${new URL(website.url).hostname}&sz=32`}
            alt={website.name}
            className="w-10 h-10 rounded-lg flex-shrink-0 bg-gray-50 p-1"
            onError={(e) => { e.target.src = '/assets/logo.png' }}
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
            onClick={() => {
              console.log('🖱️ 点击更新图标按钮:', {
                websiteId: website.id,
                websiteName: website.name,
                websiteUrl: website.url
              })
              onUpdateIcon(website.id)
            }}
            className="text-green-600 hover:text-green-800 p-1"
            title="更新图标"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
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
  const [editingWebsite, setEditingWebsite] = useState(null)
  const [websiteForm, setWebsiteForm] = useState({
    name: '',
    description: '',
    url: '',
    category: config.categories.length > 0 ? config.categories[0].id : '',
    tags: ''
  })

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

  // 获取网站图标
  const getWebsiteIcon = (url) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch (error) {
      console.warn('无法解析网站URL，使用默认图标:', error)
      return '/assets/logo.png'
    }
  }

  // 更新单个网站图标
  const handleUpdateSingleIcon = (websiteId) => {
    console.log('🔄 开始更新单个图标:', {
      websiteId,
      totalWebsites: config.websiteData.length,
      websiteIds: config.websiteData.map(w => w.id)
    })

    const website = config.websiteData.find(w => w.id == websiteId) // 使用 == 而不是 === 来处理类型差异
    if (!website) {
      console.error('❌ 找不到网站:', websiteId)
      showMessage('error', '找不到要更新的网站')
      return
    }

    console.log('📍 找到网站:', {
      name: website.name,
      url: website.url,
      currentIcon: website.icon
    })

    const newIcon = getWebsiteIcon(website.url)
    console.log('🎯 生成新图标:', newIcon)

    const updatedWebsites = config.websiteData.map(w =>
      w.id == websiteId ? { ...w, icon: newIcon } : w // 使用 == 而不是 === 来处理类型差异
    )

    console.log('📝 更新后的网站列表:', {
      totalCount: updatedWebsites.length,
      updatedWebsite: updatedWebsites.find(w => w.id == websiteId)
    })

    onUpdateWebsiteData(updatedWebsites)
    showMessage('success', `已更新 "${website.name}" 的图标`)

    console.log('✅ 图标更新完成:', {
      websiteName: website.name,
      oldIcon: website.icon,
      newIcon: newIcon
    })
  }

  // 批量更新所有网站图标
  const handleUpdateAllIcons = () => {
    console.log('🔄 开始批量更新图标:', {
      totalWebsites: config.websiteData.length,
      websites: config.websiteData.map(w => ({ id: w.id, name: w.name, url: w.url, currentIcon: w.icon }))
    })

    const updatedWebsites = config.websiteData.map(website => {
      const newIcon = getWebsiteIcon(website.url)
      console.log(`🎯 更新 "${website.name}":`, {
        oldIcon: website.icon,
        newIcon: newIcon
      })
      return {
        ...website,
        icon: newIcon
      }
    })

    console.log('📝 批量更新结果:', {
      totalCount: updatedWebsites.length,
      updatedWebsites: updatedWebsites.map(w => ({ name: w.name, icon: w.icon }))
    })

    onUpdateWebsiteData(updatedWebsites)
    showMessage('success', `已更新 ${config.websiteData.length} 个网站的图标`)

    console.log('✅ 批量更新完成')
  }

  // 保存网站
  const handleSaveWebsite = () => {
    const newWebsite = {
      id: editingWebsite === 'new' ? Date.now() : editingWebsite,
      name: websiteForm.name.trim(),
      description: websiteForm.description.trim(),
      url: websiteForm.url.trim(),
      category: websiteForm.category,
      tags: websiteForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      icon: getWebsiteIcon(websiteForm.url.trim()) // 自动获取网站图标
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
  }

  // 删除网站
  const handleDeleteWebsite = (id) => {
    if (window.confirm('确定要删除这个网站吗？')) {
      const updatedWebsites = config.websiteData.filter(site => site.id !== id)
      onUpdateWebsiteData(updatedWebsites)
      showMessage('success', '网站已删除')
    }
  }

  // 处理拖拽结束
  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = config.websiteData.findIndex(item => item.id === active.id)
    const newIndex = config.websiteData.findIndex(item => item.id === over.id)
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = [...config.websiteData]
      const [reorderedItem] = newItems.splice(oldIndex, 1)
      newItems.splice(newIndex, 0, reorderedItem)
      onUpdateWebsiteData(newItems)
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
            onClick={() => {
              console.log('🖱️ 点击批量更新图标按钮')
              handleUpdateAllIcons()
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            title="为所有网站重新获取图标"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            更新图标
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
                    // 获取分类信息
                    const getCategoryInfo = (categoryId) => {
                      const topLevel = config.categories.find(cat => cat.id === categoryId)
                      if (topLevel) return topLevel
                      
                      for (const category of config.categories) {
                        if (category.subcategories) {
                          const sub = category.subcategories.find(sub => sub.id === categoryId)
                          if (sub) return category // 返回父级分类信息
                        }
                      }
                      return null
                    }
                    
                    const aCat = getCategoryInfo(a.category)
                    const bCat = getCategoryInfo(b.category)
                    
                    // 专栏分类优先显示
                    if (aCat?.special && !bCat?.special) return -1
                    if (!aCat?.special && bCat?.special) return 1
                    
                    // 其他分类按原顺序
                    return 0
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