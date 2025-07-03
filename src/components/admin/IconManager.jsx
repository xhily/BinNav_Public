import React, { useState, useEffect } from 'react'
import { Upload, Trash2, Plus, X, Image, Check } from 'lucide-react'

const IconManager = ({ 
  selectedIcon, 
  onIconSelect, 
  onClose, 
  showMessage 
}) => {
  const [availableIcons, setAvailableIcons] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(null)
  const [showDeleteMode, setShowDeleteMode] = useState(false)

  // 获取服务器上的图标列表
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
        // 将服务器返回的图标转换为组件需要的格式
        const serverIcons = result.icons.map(icon => ({
          name: icon.name,
          path: icon.path,
          type: 'server', // 标记为服务器图标
          size: icon.size,
          sha: icon.sha
        }))
        setAvailableIcons(serverIcons)
      } else {
        console.error('获取图标列表失败:', result.message)
        // 如果API失败，使用默认图标列表作为后备
        const fallbackIcons = [
          { name: 'dev_tools_icon.png', path: '/assets/dev_tools_icon.png', type: 'builtin' },
          { name: 'education_icon.png', path: '/assets/education_icon.png', type: 'builtin' },
          { name: 'innovation_icon.png', path: '/assets/innovation_icon.png', type: 'builtin' },
          { name: 'network_icon.png', path: '/assets/network_icon.png', type: 'builtin' },
          { name: 'server_icon.png', path: '/assets/server_icon.png', type: 'builtin' },
          { name: 'social_icon.png', path: '/assets/social_icon.png', type: 'builtin' },
          { name: 'tech_blogger_avatar.png', path: '/assets/tech_blogger_avatar.png', type: 'builtin' },
          { name: 'tools_icon.png', path: '/assets/tools_icon.png', type: 'builtin' }
        ]
        setAvailableIcons(fallbackIcons)
        showMessage('warning', '使用默认图标列表')
      }
    } catch (error) {
      console.error('获取图标列表失败:', error)
      // 如果请求失败，使用默认图标列表作为后备
      const fallbackIcons = [
        { name: 'dev_tools_icon.png', path: '/assets/dev_tools_icon.png', type: 'builtin' },
        { name: 'education_icon.png', path: '/assets/education_icon.png', type: 'builtin' },
        { name: 'innovation_icon.png', path: '/assets/innovation_icon.png', type: 'builtin' },
        { name: 'network_icon.png', path: '/assets/network_icon.png', type: 'builtin' },
        { name: 'server_icon.png', path: '/assets/server_icon.png', type: 'builtin' },
        { name: 'social_icon.png', path: '/assets/social_icon.png', type: 'builtin' },
        { name: 'tech_blogger_avatar.png', path: '/assets/tech_blogger_avatar.png', type: 'builtin' },
        { name: 'tools_icon.png', path: '/assets/tools_icon.png', type: 'builtin' }
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
      showMessage('error', '图片大小不能超过2MB')
      return
    }

    setIsUploading(true)

    try {
      // 读取文件为base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64Content = e.target.result

          // 调用EdgeOne Functions上传图标
          const response = await fetch('/api/upload-icon', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fileName: file.name,
              fileContent: base64Content,
              fileType: file.type
            })
          })

          const result = await response.json()

          if (result.success) {
            showMessage('success', result.message)
            // 重新获取图标列表
            await fetchAvailableIcons()
            // 自动选择新上传的图标
            onIconSelect(result.icon.path)
          } else {
            showMessage('error', result.message || '上传失败')
          }
        } catch (error) {
          showMessage('error', '上传失败：' + error.message)
        } finally {
          setIsUploading(false)
        }
      }

      reader.readAsDataURL(file)
    } catch (error) {
      showMessage('error', '读取文件失败：' + error.message)
      setIsUploading(false)
    }

    // 清空input值，允许重复上传同一文件
    event.target.value = ''
  }

  // 处理图标删除
  const handleDeleteIcon = async (icon) => {
    if (!window.confirm(`确定要删除图标 "${icon.name}" 吗？`)) {
      return
    }

    setIsDeleting(icon.name)

    try {
      const response = await fetch('/api/delete-icon', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: icon.name
        })
      })

      const result = await response.json()

      if (result.success) {
        showMessage('success', result.message)
        // 重新获取图标列表
        await fetchAvailableIcons()
        // 如果删除的是当前选中的图标，重置为默认图标
        if (selectedIcon === icon.path) {
          onIconSelect('/assets/tools_icon.png')
        }
      } else {
        showMessage('error', result.message || '删除失败')
      }
    } catch (error) {
      showMessage('error', '删除失败：' + error.message)
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">分类图标管理</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDeleteMode(!showDeleteMode)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                showDeleteMode 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showDeleteMode ? '退出删除' : '管理图标'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 说明 */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>说明：</strong>这里管理分类图标，站点Logo请在系统设置中单独更换。
              点击"管理图标"按钮可删除任何图标。
            </p>
          </div>

          {/* 上传区域 */}
          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="icon-upload"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <label
                htmlFor="icon-upload"
                className={`cursor-pointer ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <div className="flex flex-col items-center">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  )}
                  <p className="text-sm text-gray-600">
                    {isUploading ? '正在上传...' : '点击上传图标'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    支持PNG、JPG、GIF、SVG格式，大小不超过2MB
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 图标网格 */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {availableIcons.map((icon) => (
              <div
                key={icon.path}
                className={`relative group border-2 rounded-lg p-3 cursor-pointer transition-all ${
                  selectedIcon === icon.path
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onIconSelect(icon.path)}
              >
                {/* 图标预览 */}
                <div className="aspect-square flex items-center justify-center mb-2">
                  <img
                    src={icon.path}
                    alt={icon.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.src = '/assets/tools_icon.png'
                    }}
                  />
                </div>

                {/* 图标名称 */}
                <p className="text-xs text-gray-600 text-center truncate" title={icon.name}>
                  {icon.name.replace(/\.(png|jpg|jpeg|gif|svg)$/i, '')}
                </p>

                {/* 选中标识 */}
                {selectedIcon === icon.path && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
                    <Check size={12} />
                  </div>
                )}

                {/* 删除按钮（删除模式下显示） */}
                {showDeleteMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteIcon(icon)
                    }}
                    disabled={isDeleting === icon.name}
                    className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 disabled:opacity-50 shadow-lg border-2 border-white"
                    title="删除图标"
                  >
                    {isDeleting === icon.name ? (
                      <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                )}

                {/* 删除模式提示 */}
                {showDeleteMode && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-lg border-2 border-red-300 flex items-center justify-center">
                    <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      点击删除
                    </div>
                  </div>
                )}

                {/* 类型标识 */}
                <div className={`absolute bottom-1 right-1 text-xs px-1 rounded ${
                  icon.type === 'builtin'
                    ? 'bg-blue-100 text-blue-600'
                    : icon.type === 'server'
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-green-100 text-green-600'
                }`}>
                  {icon.type === 'builtin' ? '内置' : icon.type === 'server' ? '服务器' : '自定义'}
                </div>
              </div>
            ))}
          </div>

          {availableIcons.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <div className="text-lg mb-2">暂无图标</div>
              <div className="text-sm">点击上方上传按钮添加图标</div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => {
              if (selectedIcon) {
                onClose()
              } else {
                showMessage('error', '请选择一个图标')
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  )
}

export default IconManager 