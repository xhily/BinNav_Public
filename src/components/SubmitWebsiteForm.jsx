import { useState } from 'react'
import { X, Send, Globe, Tag, Mail, FileText } from 'lucide-react'
import { Button } from './ui/button.jsx'
import { Input } from './ui/input.jsx'

function SubmitWebsiteForm({ isOpen, onClose, categories }) {
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
    setMessage({ type: 'info', content: '正在提交站点信息...' })

    try {
      const response = await fetch('/api/submit-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', content: '站点提交成功！我们将在1-3个工作日内审核，审核结果将发送至您的邮箱。' })
        // 3秒后关闭表单
        setTimeout(() => {
          onClose()
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
        }, 3000)
      } else {
        setMessage({ type: 'error', content: result.message || '提交失败，请重试' })
      }
    } catch (error) {
      setMessage({ type: 'error', content: '网络错误，请检查网络连接后重试' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">提交网站</h2>
                <p className="text-sm text-gray-500">推荐优质网站，与更多用户分享</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 mr-2" />
                网站名称 <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="请输入网站名称"
                required
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 mr-2" />
                网站链接 <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                name="url"
                type="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://example.com"
                required
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                网站描述 <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="请简要描述网站的主要功能和特色（建议50字以内）"
                required
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 mr-2" />
                网站分类 <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">请选择分类</option>
                {categories?.map((category) => (
                  <optgroup key={category.id} label={category.name}>
                    {category.subcategories ? 
                      category.subcategories.map((subcat) => (
                        <option key={subcat.id} value={subcat.id}>
                          {subcat.name}
                        </option>
                      )) : 
                      <option value={category.id}>
                        {category.name}
                      </option>
                    }
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 mr-2" />
                标签
              </label>
              <Input
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="标签1, 标签2, 标签3"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">用逗号分隔多个标签</p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 mr-2" />
                联系邮箱 <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">审核结果将发送至此邮箱</p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 mr-2" />
                您的姓名
              </label>
              <Input
                name="submitterName"
                value={formData.submitterName}
                onChange={handleInputChange}
                placeholder="张三"
                className="w-full"
              />
            </div>
          </div>

          {message.content && (
            <div className={`p-4 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {message.content}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">提交须知</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 请确保提交的网站内容健康、合法，符合相关法律法规</li>
              <li>• 建议提交有价值、实用的网站，避免重复提交</li>
              <li>• 我们将在1-3个工作日内完成审核，审核结果将通过邮件通知</li>
              <li>• 通过审核的网站将显示在相应分类中</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
        </form>
      </div>
    </div>
  )
}

export default SubmitWebsiteForm 