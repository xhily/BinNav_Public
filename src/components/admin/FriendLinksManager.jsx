import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, ExternalLink, Save, X } from 'lucide-react'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'

function FriendLinksManager({ showMessage }) {
  const [friendLinks, setFriendLinks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingLink, setEditingLink] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    logo: '',
    order: 0
  })

  useEffect(() => {
    fetchFriendLinks()
  }, [])

  const fetchFriendLinks = async () => {
    try {
      const response = await fetch('/api/get-friend-links')
      const result = await response.json()
      
      if (result.success) {
        setFriendLinks(result.data || [])
      } else {
        showMessage('error', '获取友情链接失败')
      }
    } catch (error) {
      showMessage('error', '网络错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value
    }))
  }

  const handleAdd = () => {
    setFormData({
      name: '',
      url: '',
      description: '',
      logo: '',
      order: friendLinks.length
    })
    setEditingLink(null)
    setShowAddForm(true)
  }

  const handleEdit = (link) => {
    setFormData({
      name: link.name || '',
      url: link.url || '',
      description: link.description || '',
      logo: link.logo || '',
      order: link.order || 0
    })
    setEditingLink(link)
    setShowAddForm(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      showMessage('error', '请填写必填字段')
      return
    }

    setIsSaving(true)

    try {
      const linkData = {
        ...formData,
        id: editingLink ? editingLink.id : Date.now()
      }

      const updatedLinks = editingLink 
        ? friendLinks.map(link => link.id === editingLink.id ? linkData : link)
        : [...friendLinks, linkData]

      // 按order排序
      updatedLinks.sort((a, b) => (a.order || 0) - (b.order || 0))

      const response = await fetch('/api/update-friend-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          friendLinks: updatedLinks
        })
      })

      const result = await response.json()

      if (result.success) {
        setFriendLinks(updatedLinks)
        setShowAddForm(false)
        setEditingLink(null)
        showMessage('success', editingLink ? '友情链接已更新' : '友情链接已添加')
      } else {
        showMessage('error', result.message || '保存失败')
      }
    } catch (error) {
      showMessage('error', '网络错误，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (linkId) => {
    if (!confirm('确定要删除这个友情链接吗？')) {
      return
    }

    try {
      const updatedLinks = friendLinks.filter(link => link.id !== linkId)

      const response = await fetch('/api/update-friend-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          friendLinks: updatedLinks
        })
      })

      const result = await response.json()

      if (result.success) {
        setFriendLinks(updatedLinks)
        showMessage('success', '友情链接已删除')
      } else {
        showMessage('error', result.message || '删除失败')
      }
    } catch (error) {
      showMessage('error', '网络错误，请重试')
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingLink(null)
    setFormData({
      name: '',
      url: '',
      description: '',
      logo: '',
      order: 0
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">加载友情链接中...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">友情链接管理</h3>
        <Button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加链接
        </Button>
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {editingLink ? '编辑友情链接' : '添加友情链接'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                名称 <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="网站名称"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                链接 <span className="text-red-500">*</span>
              </label>
              <Input
                name="url"
                type="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo链接
              </label>
              <Input
                name="logo"
                type="url"
                value={formData.logo}
                onChange={handleInputChange}
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                排序
              </label>
              <Input
                name="order"
                type="number"
                value={formData.order}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">数字越小越靠前</p>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="网站描述（可选）"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* 友情链接列表 */}
      {friendLinks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">暂无友情链接</h4>
          <p className="text-gray-500">点击"添加链接"按钮创建第一个友情链接</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friendLinks.map((link) => (
            <div key={link.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {link.logo ? (
                    <img 
                      src={link.logo} 
                      alt={link.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm ${link.logo ? 'hidden' : 'flex'}`}
                  >
                    {link.name?.charAt(0) || '?'}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">{link.name}</h4>
                    <p className="text-xs text-gray-500">排序: {link.order || 0}</p>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(link)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(link.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline block mb-2"
              >
                {link.url}
              </a>
              
              {link.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {link.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FriendLinksManager 