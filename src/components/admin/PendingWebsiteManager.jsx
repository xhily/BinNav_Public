import { useState, useEffect } from 'react'
import { Clock, Check, X, Eye, Mail, Calendar, Tag, Globe } from 'lucide-react'
import { Button } from '../ui/button.jsx'

function PendingWebsiteManager({ showMessage }) {
  const [pendingWebsites, setPendingWebsites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWebsite, setSelectedWebsite] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    fetchPendingWebsites()
  }, [])

  const fetchPendingWebsites = async () => {
    try {
      const response = await fetch('/api/get-pending-websites')
      const result = await response.json()
      
      if (result.success) {
        setPendingWebsites(result.data || [])
      } else {
        showMessage('error', '获取待审核站点失败')
      }
    } catch (error) {
      showMessage('error', '网络错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (websiteId, rejectReason = '') => {
    setProcessingId(websiteId)
    
    try {
      const response = await fetch('/api/process-website-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          websiteId,
          action: rejectReason ? 'reject' : 'approve',
          rejectReason
        })
      })

      const result = await response.json()
      
      if (result.success) {
        showMessage('success', rejectReason ? '站点已拒绝' : '站点已通过审核')
        // 更新列表
        setPendingWebsites(prev => prev.filter(site => site.id !== websiteId))
        setSelectedWebsite(null)
      } else {
        showMessage('error', result.message || '操作失败')
      }
    } catch (error) {
      showMessage('error', '网络错误，请重试')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">加载待审核站点中...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">待审核站点</h3>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-600">
            共 {pendingWebsites.length} 个待处理
          </span>
        </div>
      </div>

      {pendingWebsites.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">暂无待审核站点</h4>
          <p className="text-gray-500">所有提交的站点都已处理完成</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingWebsites.map((website) => (
            <div key={website.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h4 className="text-lg font-medium text-gray-900">{website.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(website.status)}`}>
                      {website.status === 'pending' ? '待审核' : 
                       website.status === 'approved' ? '已通过' : '已拒绝'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="w-4 h-4 mr-2" />
                      <a 
                        href={website.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {website.url}
                      </a>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {website.contactEmail}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(website.submittedAt)}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-2" />
                      {website.category}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{website.description}</p>
                  
                  {website.tags && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {website.tags.split(',').map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {website.submitterName && (
                    <p className="text-sm text-gray-500">
                      提交者：{website.submitterName}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedWebsite(website)}
                    className="flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    预览
                  </Button>
                  
                  {website.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(website.id)}
                        disabled={processingId === website.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processingId === website.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            通过
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const reason = prompt('请输入拒绝原因（可选）:')
                          if (reason !== null) {
                            handleApprove(website.id, reason || '不符合收录标准')
                          }
                        }}
                        disabled={processingId === website.id}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        拒绝
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 站点详情预览弹窗 */}
      {selectedWebsite && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">站点详情预览</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedWebsite(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">站点名称</label>
                  <p className="text-gray-900">{selectedWebsite.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">网站链接</label>
                  <a 
                    href={selectedWebsite.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline block"
                  >
                    {selectedWebsite.url}
                  </a>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">描述</label>
                  <p className="text-gray-900">{selectedWebsite.description}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">分类</label>
                  <p className="text-gray-900">{selectedWebsite.category}</p>
                </div>
                
                {selectedWebsite.tags && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">标签</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedWebsite.tags.split(',').map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-700">联系邮箱</label>
                  <p className="text-gray-900">{selectedWebsite.contactEmail}</p>
                </div>
                
                {selectedWebsite.submitterName && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">提交者</label>
                    <p className="text-gray-900">{selectedWebsite.submitterName}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-700">提交时间</label>
                  <p className="text-gray-900">{formatDate(selectedWebsite.submittedAt)}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedWebsite(null)}
                >
                  关闭
                </Button>
                {selectedWebsite.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleApprove(selectedWebsite.id)}
                      disabled={processingId === selectedWebsite.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      通过审核
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const reason = prompt('请输入拒绝原因（可选）:')
                        if (reason !== null) {
                          handleApprove(selectedWebsite.id, reason || '不符合收录标准')
                        }
                      }}
                      disabled={processingId === selectedWebsite.id}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      拒绝
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingWebsiteManager 