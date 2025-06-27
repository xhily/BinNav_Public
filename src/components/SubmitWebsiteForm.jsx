import { useState } from 'react'
import { X, Send, Globe, Tag, User, Mail, FileText, Folder } from 'lucide-react'
import { Button } from './ui/button.jsx'
import { Input } from './ui/input.jsx'
import { categories } from '../websiteData.js'

const SubmitWebsiteForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    category: '',
    tags: '',
    contactEmail: '',
    submitterName: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', content: '' })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: '', content: '' })

    try {
      const response = await fetch('/api/submit-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      // 检查响应是否成功
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text()
        console.error('服务器返回非JSON响应:', textResponse)
        throw new Error('服务器响应格式错误，请联系管理员')
      }

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', content: result.message })
        // 清空表单
        setFormData({
          name: '',
          url: '',
          description: '',
          category: '',
          tags: '',
          contactEmail: '',
          submitterName: ''
        })
        // 3秒后关闭表单
        setTimeout(() => {
          onClose()
        }, 3000)
      } else {
        setMessage({ type: 'error', content: result.message })
        // 如果有调试信息，也记录到控制台
        if (result.debug) {
          console.error('API调试信息:', result.debug)
        }
      }
    } catch (error) {
      console.error('提交失败:', error)
      
      // 提供更具体的错误信息
      let errorMessage = '提交失败，请稍后重试'
      
      if (error.message.includes('HTTP 500')) {
        errorMessage = '服务器内部错误，请联系管理员'
      } else if (error.message.includes('网络') || error.message.includes('fetch')) {
        errorMessage = '网络连接失败，请检查网络后重试'
      } else if (error.message.includes('JSON')) {
        errorMessage = '服务器响应格式错误，请联系管理员'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setMessage({ type: 'error', content: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        url: '',
        description: '',
        category: '',
        tags: '',
        contactEmail: '',
        submitterName: ''
      })
      setMessage({ type: '', content: '' })
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            提交新网站
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 消息提示 */}
          {message.content && (
            <div className={`p-3 rounded-lg text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.content}
            </div>
          )}

          {/* 网站名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              网站名称 *
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="请输入网站名称"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 网站链接 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              网站链接 *
            </label>
            <Input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://example.com"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 网站描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              网站描述 *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="请简要描述网站的主要功能或特色"
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="3"
            />
          </div>

          {/* 分类选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Folder className="w-4 h-4 inline mr-1" />
              分类 *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">请选择分类</option>
              {categories.map(category => (
                <optgroup key={category.id} label={category.name}>
                  <option value={category.id}>{category.name}</option>
                  {category.subcategories && category.subcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      └ {sub.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              标签 (可选)
            </label>
            <Input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="用逗号分隔，如：设计,工具,免费"
              disabled={isSubmitting}
            />
          </div>

          {/* 联系邮箱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              联系邮箱 *
            </label>
            <Input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 提交者姓名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              您的姓名 (可选)
            </label>
            <Input
              type="text"
              name="submitterName"
              value={formData.submitterName}
              onChange={handleInputChange}
              placeholder="请输入您的姓名"
              disabled={isSubmitting}
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  提交网站
                </>
              )}
            </Button>
          </div>

          {/* 提示信息 */}
          <div className="text-xs text-gray-500 pt-2">
            <p>· 我们会在1-3个工作日内审核您的提交</p>
            <p>· 审核结果将通过邮件通知您</p>
            <p>· 请确保提交的网站内容健康、合法</p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubmitWebsiteForm 