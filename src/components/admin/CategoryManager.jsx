import React, { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, GripVertical, ChevronUp, ChevronDown, Folder, X, Save, Upload, Image, Eye, EyeOff } from 'lucide-react'
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

/**
 * 图标选择器组件
 */
const IconSelector = ({ selectedIcon, onIconSelect, showMessage }) => {
  const [availableIcons, setAvailableIcons] = useState([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(null)

  // 获取现有图标列表
  const fetchAvailableIcons = async () => {
    try {
      const response = await fetch('/api/list-icons', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        // 提取图标文件名列表
        const iconNames = result.icons.map(icon => icon.name)
        setAvailableIcons(iconNames)
      } else {
        console.error('获取图标列表失败:', result.message)
        // 如果API失败，使用默认图标列表作为后备
        const fallbackIcons = [
          'dev_tools_icon.png',
          'education_icon.png',
          'innovation_icon.png',
          'network_icon.png',
          'server_icon.png',
          'social_icon.png',
          'tech_blogger_avatar.png',
          'tools_icon.png'
        ]
        setAvailableIcons(fallbackIcons)
        showMessage('warning', '使用默认图标列表')
      }
    } catch (error) {
      console.error('获取图标列表失败:', error)
      // 如果请求失败，使用默认图标列表作为后备
      const fallbackIcons = [
        'dev_tools_icon.png',
        'education_icon.png',
        'innovation_icon.png',
        'network_icon.png',
        'server_icon.png',
        'social_icon.png',
        'tech_blogger_avatar.png',
        'tools_icon.png'
      ]
      setAvailableIcons(fallbackIcons)
      showMessage('error', '获取图标列表失败，使用默认列表')
    }
  }

  useEffect(() => {
    fetchAvailableIcons()
  }, [])

  // 处理文件上传
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // 验证文件类型
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      showMessage('error', '仅支持PNG、JPG、GIF、SVG格式的图片')
      return
    }

    // 验证文件大小（限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', '文件大小不能超过2MB')
      return
    }

    setUploading(true)

    try {
      // 转换为base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const fileContent = e.target.result

        const response = await fetch('/api/upload-icon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileName: file.name,
            fileContent: fileContent,
            fileType: file.type
          })
        })

        const result = await response.json()

        if (result.success) {
          showMessage('success', result.message)
          // 刷新图标列表
          await fetchAvailableIcons()
          // 自动选择新上传的图标
          onIconSelect(result.icon.path)
        } else {
          throw new Error(result.message || '上传失败')
        }
      }

      reader.onerror = () => {
        throw new Error('文件读取失败')
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error('上传图标失败:', error)
      showMessage('error', `上传失败: ${error.message}`)
    } finally {
      setUploading(false)
      // 清空文件输入
      event.target.value = ''
    }
  }

  // 删除图标
  const handleDeleteIcon = async (iconName) => {
    if (!window.confirm(`确定要删除图标 "${iconName}" 吗？`)) {
      return
    }

    setDeleting(iconName)

    try {
      const response = await fetch('/api/delete-icon', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: iconName
        })
      })

      const result = await response.json()

      if (result.success) {
        showMessage('success', result.message)
        // 刷新图标列表
        await fetchAvailableIcons()
        // 如果删除的是当前选中的图标，重置为默认图标
        if (selectedIcon === `/assets/${iconName}`) {
          onIconSelect('/assets/tools_icon.png')
        }
      } else {
        throw new Error(result.message || '删除失败')
      }
    } catch (error) {
      console.error('删除图标失败:', error)
      showMessage('error', `删除失败: ${error.message}`)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">图标选择</label>
        <div className="flex items-center space-x-2">
          {/* 上传按钮 */}
          <label className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded cursor-pointer transition-colors">
            <Upload size={12} />
            <span>{uploading ? '上传中...' : '上传图标'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {/* 展开/收起按钮 */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
          >
            {isExpanded ? <EyeOff size={12} /> : <Eye size={12} />}
            <span>{isExpanded ? '收起' : '展开'}</span>
          </button>
        </div>
      </div>

      {/* 当前选中的图标 */}
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
        <img 
          src={selectedIcon} 
          alt="当前图标"
          className="w-10 h-10 rounded border border-gray-200 bg-white p-1"
          onError={(e) => { e.target.src = '/assets/tools_icon.png' }}
        />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">当前选中</div>
          <div className="text-xs text-gray-500">{selectedIcon}</div>
        </div>
      </div>

      {/* 图标网格 */}
      {isExpanded && (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="text-sm font-medium text-gray-700 mb-3">
            可用图标 ({availableIcons.length} 个)
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {availableIcons.map((iconName) => {
              const iconPath = `/assets/${iconName}`
              const isSelected = selectedIcon === iconPath
              
              return (
                <div key={iconName} className="relative group">
                  <button
                    type="button"
                    onClick={() => onIconSelect(iconPath)}
                    className={`
                      w-12 h-12 rounded-lg border-2 p-1 transition-all duration-200
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                    title={iconName}
                  >
                    <img
                      src={iconPath}
                      alt={iconName}
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.src = '/assets/tools_icon.png' }}
                    />
                  </button>
                  
                  {/* 删除按钮 */}
                  <button
                    type="button"
                    onClick={() => handleDeleteIcon(iconName)}
                    disabled={deleting === iconName}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs"
                    title="删除图标"
                  >
                    {deleting === iconName ? '...' : '×'}
                  </button>
                </div>
              )
            })}
          </div>
          
          {availableIcons.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Image className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <div className="text-sm">暂无可用图标</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 内联编辑表单组件
 */
const InlineEditForm = ({
  category,
  isEditing,
  onSave,
  onCancel,
  showMessage,
  categories = [],
  isSubcategory = false,
  parentCategory = null
}) => {
  // 获取当前分类的父级分类ID（如果是编辑现有分类）
  const getCurrentParentId = () => {
    if (!isEditing || !category) return ''

    // 如果是子分类编辑，返回父分类ID
    if (isSubcategory && parentCategory) {
      console.log('子分类编辑，父分类ID:', parentCategory.id)
      return parentCategory.id
    }

    // 如果是一级分类编辑，检查是否实际上是某个分类的子分类
    // 这种情况可能发生在分类结构不一致时
    for (const cat of categories) {
      if (cat.subcategories?.some(sub => sub.id === category.id)) {
        console.log('发现分类实际是子分类，父分类:', cat.name, cat.id)
        return cat.id
      }
    }

    console.log('确认是一级分类')
    return '' // 确实是一级分类
  }

  const [formData, setFormData] = useState({
    name: category?.name || '',
    icon: category?.icon || '/assets/tools_icon.png',
    special: category?.special || false,
    parentId: getCurrentParentId()
  })

  // 添加调试日志
  console.log('InlineEditForm 初始化:', {
    category: category?.name,
    isEditing,
    isSubcategory,
    parentCategory: parentCategory?.name,
    initialParentId: getCurrentParentId(),
    formData
  })

  // 调试：打印当前分类结构
  console.log('当前分类结构:', categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    subcategories: cat.subcategories?.map(sub => ({ id: sub.id, name: sub.name })) || []
  })))

  const handleSubmit = (e) => {
    e.preventDefault()

    console.log('表单提交:', {
      formData,
      category: category?.name,
      isEditing,
      isSubcategory
    })

    if (!formData.name.trim()) {
      showMessage('error', '分类名称不能为空')
      return
    }

    if (!formData.icon.trim()) {
      showMessage('error', '图标路径不能为空')
      return
    }

    const newCategory = {
      id: category?.id || `category_${Date.now()}`,
      name: formData.name.trim(),
      icon: formData.icon.trim(),
      special: formData.special,
      subcategories: category?.subcategories || []
    }

    console.log('调用 onSave:', {
      newCategory,
      parentId: formData.parentId
    })

    onSave(newCategory, formData.parentId)
  }

  // 获取可选的父级分类（排除当前分类及其子分类）
  const getAvailableParentCategories = () => {
    if (isEditing && category) {
      return categories.filter(cat => 
        cat.id !== category.id && 
        !category.subcategories?.some(sub => sub.id === cat.id)
      )
    }
    return categories
  }

  const availableParents = getAvailableParentCategories()

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-3 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-sm font-medium text-gray-900">
          {isEditing ? '编辑分类' : '添加分类'}
        </h5>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <X size={16} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="输入分类名称..."
              required
            />
          </div>
          
          <div className="mb-4">
            <IconSelector
              selectedIcon={formData.icon}
              onIconSelect={(iconPath) => setFormData({...formData, icon: iconPath})}
              showMessage={showMessage}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分类级别
            {isEditing && (
              <span className="ml-2 text-xs text-gray-500">
                (当前: {formData.parentId ? '子分类' : '一级分类'})
              </span>
            )}
          </label>
          <select
            value={formData.parentId}
            onChange={(e) => {
              console.log('分类级别变更:', e.target.value)
              setFormData({...formData, parentId: e.target.value})
            }}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {isSubcategory ? (
              <>
                <option value="">升级为一级分类</option>
                {availableParents.map(parent => (
                  <option key={parent.id} value={parent.id}>
                    {parent.id === parentCategory?.id ? 
                      `保持在 "${parent.name}" 下（当前）` : 
                      `移动到 "${parent.name}" 下`
                    }
                  </option>
                ))}
              </>
            ) : (
              <>
                <option value="">作为一级分类</option>
                {availableParents.map(parent => (
                  <option key={parent.id} value={parent.id}>
                    作为 "{parent.name}" 的子分类
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`special-${category?.id || 'new'}`}
            checked={formData.special}
            onChange={(e) => setFormData({...formData, special: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`special-${category?.id || 'new'}`} className="ml-2 text-sm text-gray-700">
            标记为专栏分类
          </label>
        </div>
        
        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
          >
            <Save size={14} />
            <span>{isEditing ? '保存修改' : '添加'}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}

/**
 * 可拖拽的分类项组件
 */
const SortableCategoryItem = ({ 
  category, 
  onEdit, 
  onDelete, 
  onToggleSubcategories,
  expandedCategories,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
  onSaveSubcategory,
  config,
  editingCategory,
  editingSubcategory,
  onCancelEdit,
  showMessage
}) => {
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

  // 计算该分类下的网站数量
  const websiteCount = config.websiteData.filter(site => {
    if (site.category === category.id) return true
    if (category.subcategories) {
      return category.subcategories.some(sub => sub.id === site.category)
    }
    return false
  }).length

  const isExpanded = expandedCategories[category.id]
  const isEditingThis = editingCategory === category.id
  const showAddSubcategoryForm = editingSubcategory?.parentId === category.id && !editingSubcategory?.subcategory

  return (
    <div ref={setNodeRef} style={style}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            >
              <GripVertical size={18} />
            </div>
            
            <img 
              src={category.icon} 
              alt={category.name}
              className="w-8 h-8 rounded border border-gray-200 bg-white p-1"
              onError={(e) => { e.target.src = '/assets/tools_icon.png' }}
            />
            
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{category.name}</h4>
                {category.special && (
                  <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full">
                    专栏
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {websiteCount} 个网站
                {category.subcategories && category.subcategories.length > 0 && 
                  ` • ${category.subcategories.length} 个子分类`
                }
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {category.subcategories && category.subcategories.length > 0 && (
              <button
                onClick={() => onToggleSubcategories(category.id)}
                className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                title={isExpanded ? '收起子分类' : '展开子分类'}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
            
            <button
              onClick={() => onAddSubcategory(category.id)}
              className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
              title="添加子分类"
            >
              <Plus size={16} />
            </button>
            
            <button
              onClick={() => onEdit(category)}
              className={`p-1 transition-colors ${
                isEditingThis 
                  ? 'text-blue-700 bg-blue-50 rounded' 
                  : 'text-blue-600 hover:text-blue-800'
              }`}
              title="编辑分类"
            >
              <Edit3 size={16} />
            </button>
            
            <button
              onClick={() => onDelete(category.id)}
              className="text-red-600 hover:text-red-800 p-1 transition-colors"
              title="删除分类"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        {/* 分类编辑表单 */}
        {isEditingThis && (
          <InlineEditForm
            category={category}
            isEditing={true}
            onSave={(categoryData, parentId) => {
              console.log('一级分类保存调用:', {
                categoryData,
                parentId,
                originalCategory: category
              })
              onEdit(categoryData, true, parentId)
            }}
            onCancel={onCancelEdit}
            showMessage={showMessage}
            categories={config.categories}
            isSubcategory={false}
            parentCategory={null}
          />
        )}
        
        {/* 添加子分类表单 */}
        {showAddSubcategoryForm && (
          <InlineEditForm
            category={null}
            isEditing={false}
                          onSave={(subcategoryData, newParentId) => {
                if (newParentId === '') {
                  // 如果选择升级为一级分类
                  onUpdateCategories([...config.categories, subcategoryData])
                  showMessage('success', '分类已添加')
                  onCancelEdit()
                } else if (newParentId && newParentId !== category.id) {
                  // 如果选择了不同的父分类，需要添加到新的父分类下
                  const updatedCategories = config.categories.map(cat => {
                    if (cat.id === newParentId) {
                      return {
                        ...cat,
                        subcategories: [...(cat.subcategories || []), subcategoryData]
                      }
                    }
                    return cat
                  })
                  onUpdateCategories(updatedCategories)
                  showMessage('success', '子分类已添加')
                  onCancelEdit()
                } else {
                  // 默认添加到当前父分类下
                  onSaveSubcategory(category.id, subcategoryData)
                }
              }}
            onCancel={onCancelEdit}
            showMessage={showMessage}
            isSubcategory={true}
            parentCategory={category}
            categories={config.categories}
          />
        )}
        
        {/* 子分类列表 */}
        {category.subcategories && category.subcategories.length > 0 && isExpanded && (
          <div className="mt-4 ml-8 space-y-2">
            {category.subcategories.map((subcategory) => {
              const subWebsiteCount = config.websiteData.filter(site => site.category === subcategory.id).length
              const isEditingThisSub = editingSubcategory?.parentId === category.id && editingSubcategory?.subcategory?.id === subcategory.id
              
              return (
                <div key={subcategory.id}>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={subcategory.icon} 
                        alt={subcategory.name}
                        className="w-6 h-6 rounded border border-gray-200 bg-white p-0.5"
                        onError={(e) => { e.target.src = '/assets/tools_icon.png' }}
                      />
                      <div>
                        <h5 className="font-medium text-gray-800">{subcategory.name}</h5>
                        <div className="text-sm text-gray-500">{subWebsiteCount} 个网站</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditSubcategory(category.id, subcategory)}
                        className={`p-1 transition-colors ${
                          isEditingThisSub 
                            ? 'text-blue-700 bg-blue-50 rounded' 
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                        title="编辑子分类"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteSubcategory(category.id, subcategory.id)}
                        className="text-red-600 hover:text-red-800 p-1 transition-colors"
                        title="删除子分类"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* 子分类编辑表单 */}
                  {isEditingThisSub && (
                    <InlineEditForm
                      category={subcategory}
                      isEditing={true}
                      onSave={(subcategoryData, newParentId) => {
                        console.log('子分类保存:', {
                          subcategoryName: subcategoryData.name,
                          subcategoryId: subcategoryData.id,
                          newParentId,
                          currentParentId: category.id
                        })

                        if (newParentId === '') {
                          // 升级为一级分类
                          console.log('升级子分类为一级分类')
                          const updatedCategories = config.categories.map(cat => {
                            if (cat.id === category.id) {
                              return {
                                ...cat,
                                subcategories: (cat.subcategories || []).filter(sub => sub.id !== subcategory.id)
                              }
                            }
                            return cat
                          })
                          updatedCategories.push({
                            ...subcategoryData,
                            subcategories: subcategoryData.subcategories || []
                          })
                          onUpdateCategories(updatedCategories)
                          showMessage('success', '已升级为一级分类')
                          onCancelEdit()
                        } else if (newParentId && newParentId !== category.id) {
                          // 移动到其他父分类下
                          console.log('移动子分类到其他父分类:', newParentId)
                          const updatedCategories = config.categories.map(cat => {
                            if (cat.id === category.id) {
                              return {
                                ...cat,
                                subcategories: (cat.subcategories || []).filter(sub => sub.id !== subcategory.id)
                              }
                            } else if (cat.id === newParentId) {
                              return {
                                ...cat,
                                subcategories: [...(cat.subcategories || []), {
                                  id: subcategoryData.id,
                                  name: subcategoryData.name,
                                  icon: subcategoryData.icon,
                                  special: subcategoryData.special
                                }]
                              }
                            }
                            return cat
                          })
                          onUpdateCategories(updatedCategories)
                          showMessage('success', '子分类已移动')
                          onCancelEdit()
                        } else {
                          // 保持在当前父分类下
                          console.log('保持在当前父分类下，仅更新内容')
                          onEditSubcategory(category.id, subcategoryData, true)
                        }
                      }}
                      onCancel={onCancelEdit}
                      showMessage={showMessage}
                      isSubcategory={true}
                      parentCategory={category}
                      categories={config.categories}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 分类管理组件
 */
const CategoryManager = ({ 
  config, 
  onUpdateCategories, 
  showMessage 
}) => {
  const [expandedCategories, setExpandedCategories] = useState({})
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingSubcategory, setEditingSubcategory] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // 添加分类
  const handleAddCategory = () => {
    setShowAddForm(true)
    setEditingCategory(null)
    setEditingSubcategory(null)
  }

  // 编辑分类
  const handleEditCategory = (category, shouldSave = false, parentId = null) => {
    console.log('handleEditCategory 调用:', {
      categoryName: category.name,
      categoryId: category.id,
      shouldSave,
      parentId,
      editingCategory
    })

    if (shouldSave) {
      console.log('开始保存分类，当前分类结构:', config.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        subcategories: cat.subcategories?.map(sub => ({ id: sub.id, name: sub.name })) || []
      })))

      // 首先从所有位置移除该分类（包括子分类位置）
      let updatedCategories = config.categories.map(cat => {
        if (cat.id === category.id) {
          // 如果是一级分类，直接移除
          console.log('移除一级分类:', category.name)
          return null
        } else {
          // 从子分类中移除
          const filteredSubs = (cat.subcategories || []).filter(sub => sub.id !== category.id)
          if (filteredSubs.length !== (cat.subcategories || []).length) {
            console.log('从分类', cat.name, '中移除子分类:', category.name)
          }
          return {
            ...cat,
            subcategories: filteredSubs
          }
        }
      }).filter(Boolean) // 移除null值

      console.log('移除后的分类结构:', updatedCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        subcategories: cat.subcategories?.map(sub => ({ id: sub.id, name: sub.name })) || []
      })))

      // 如果指定了父级分类，添加为子分类
      if (parentId && parentId !== '') {
        updatedCategories = updatedCategories.map(cat => {
          if (cat.id === parentId) {
            return {
              ...cat,
              subcategories: [...(cat.subcategories || []), {
                id: category.id,
                name: category.name,
                icon: category.icon,
                special: category.special
              }]
            }
          }
          return cat
        })
        console.log('移动到父分类下:', parentId)
      } else {
        // 添加为一级分类
        updatedCategories.push({
          ...category,
          subcategories: category.subcategories || []
        })
        console.log('升级为一级分类')
      }

      onUpdateCategories(updatedCategories)
      setEditingCategory(null)
      showMessage('success', '分类已更新')
    } else {
      // 开始编辑
      setEditingCategory(category.id)
      setEditingSubcategory(null)
      setShowAddForm(false)
    }
  }

  // 保存新分类
  const handleSaveNewCategory = (categoryData, parentId = null) => {
    if (parentId && parentId !== '') {
      // 添加为子分类
      const updatedCategories = config.categories.map(category => {
        if (category.id === parentId) {
          return {
            ...category,
            subcategories: [...(category.subcategories || []), {
              id: categoryData.id,
              name: categoryData.name,
              icon: categoryData.icon
            }]
          }
        }
        return category
      })
      onUpdateCategories(updatedCategories)
    } else {
      // 添加为一级分类
      const updatedCategories = [...config.categories, categoryData]
      onUpdateCategories(updatedCategories)
    }
    
    setShowAddForm(false)
    showMessage('success', '分类已添加')
  }

  // 删除分类
  const handleDeleteCategory = (categoryId) => {
    const category = config.categories.find(cat => cat.id === categoryId)
    const websiteCount = config.websiteData.filter(site => {
      if (site.category === categoryId) return true
      if (category?.subcategories) {
        return category.subcategories.some(sub => sub.id === site.category)
      }
      return false
    }).length

    if (websiteCount > 0) {
      if (!window.confirm(`删除分类「${category.name}」将影响 ${websiteCount} 个网站，确定要删除吗？`)) {
        return
      }
    } else {
      if (!window.confirm(`确定要删除分类「${category.name}」吗？`)) {
        return
      }
    }

    const updatedCategories = config.categories.filter(cat => cat.id !== categoryId)
    onUpdateCategories(updatedCategories)
    showMessage('success', '分类已删除')
  }

  // 切换子分类展开状态
  const handleToggleSubcategories = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  // 添加子分类
  const handleAddSubcategory = (parentId) => {
    setEditingSubcategory({ parentId, subcategory: null })
    setEditingCategory(null)
    setShowAddForm(false)
  }

  // 编辑子分类
  const handleEditSubcategory = (parentId, subcategory, shouldSave = false) => {
    if (shouldSave) {
      console.log('保存子分类:', {
        parentId,
        subcategory,
        editingSubcategory
      })

      // 保存子分类
      const updatedCategories = config.categories.map(category => {
        if (category.id === parentId) {
          const updatedSubcategories = (category.subcategories || []).map(sub =>
            sub.id === editingSubcategory.subcategory.id ? {
              ...subcategory,
              // 确保所有属性都被正确传递
              id: subcategory.id,
              name: subcategory.name,
              icon: subcategory.icon,
              special: subcategory.special
            } : sub
          )
          console.log('更新后的子分类列表:', updatedSubcategories)
          return { ...category, subcategories: updatedSubcategories }
        }
        return category
      })

      onUpdateCategories(updatedCategories)
      setEditingSubcategory(null)
      showMessage('success', '子分类已更新')
    } else {
      // 开始编辑
      setEditingSubcategory({ parentId, subcategory })
      setEditingCategory(null)
      setShowAddForm(false)
    }
  }

  // 保存新子分类
  const handleSaveSubcategory = (parentId, subcategoryData) => {
    console.log('保存新子分类:', {
      parentId,
      subcategoryData
    })

    const updatedCategories = config.categories.map(category => {
      if (category.id === parentId) {
        const newSubcategory = {
          id: subcategoryData.id,
          name: subcategoryData.name,
          icon: subcategoryData.icon,
          special: subcategoryData.special || false
        }
        const updatedSubcategories = [...(category.subcategories || []), newSubcategory]
        console.log('添加子分类到:', category.name, '新子分类:', newSubcategory)
        return { ...category, subcategories: updatedSubcategories }
      }
      return category
    })

    onUpdateCategories(updatedCategories)
    setEditingSubcategory(null)
    showMessage('success', '子分类已添加')
  }

  // 删除子分类
  const handleDeleteSubcategory = (parentId, subcategoryId) => {
    const parentCategory = config.categories.find(cat => cat.id === parentId)
    const subcategory = parentCategory?.subcategories?.find(sub => sub.id === subcategoryId)
    const websiteCount = config.websiteData.filter(site => site.category === subcategoryId).length

    if (websiteCount > 0) {
      if (!window.confirm(`删除子分类「${subcategory?.name}」将影响 ${websiteCount} 个网站，确定要删除吗？`)) {
        return
      }
    } else {
      if (!window.confirm(`确定要删除子分类「${subcategory?.name}」吗？`)) {
        return
      }
    }

    const updatedCategories = config.categories.map(category => {
      if (category.id === parentId) {
        return {
          ...category,
          subcategories: (category.subcategories || []).filter(sub => sub.id !== subcategoryId)
        }
      }
      return category
    })
    
    onUpdateCategories(updatedCategories)
    showMessage('success', '子分类已删除')
  }

  // 处理拖拽结束
  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = config.categories.findIndex(item => item.id === active.id)
    const newIndex = config.categories.findIndex(item => item.id === over.id)
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = [...config.categories]
      const [reorderedItem] = newItems.splice(oldIndex, 1)
      newItems.splice(newIndex, 0, reorderedItem)
      onUpdateCategories(newItems)
    }
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditingSubcategory(null)
    setShowAddForm(false)
  }

  return (
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
      {showAddForm && (
        <div className="mb-6">
          <InlineEditForm
            category={null}
            isEditing={false}
            onSave={handleSaveNewCategory}
            onCancel={handleCancelEdit}
            showMessage={showMessage}
            categories={config.categories}
          />
        </div>
      )}

      {/* 分类列表 */}
      <div className="space-y-4">
        {config.categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <div className="text-lg mb-2">暂无分类</div>
            <div className="text-sm">点击上方按钮添加第一个分类</div>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={config.categories.map(cat => cat.id)} strategy={verticalListSortingStrategy}>
              {config.categories.map((category) => (
                <SortableCategoryItem 
                  key={category.id} 
                  category={category}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  onToggleSubcategories={handleToggleSubcategories}
                  expandedCategories={expandedCategories}
                  onAddSubcategory={handleAddSubcategory}
                  onEditSubcategory={handleEditSubcategory}
                  onDeleteSubcategory={handleDeleteSubcategory}
                  onSaveSubcategory={handleSaveSubcategory}
                  config={config}
                  editingCategory={editingCategory}
                  editingSubcategory={editingSubcategory}
                  onCancelEdit={handleCancelEdit}
                  showMessage={showMessage}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}

export default CategoryManager
