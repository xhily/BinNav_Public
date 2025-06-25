import { useState, useEffect } from 'react'
import { getEnvConfig, getGitHubApiConfig, isDevelopment } from '../config/env.js'
import { AlertCircle, CheckCircle, Settings, Eye, EyeOff } from 'lucide-react'

/**
 * 配置调试组件
 * 仅在开发环境下显示，用于调试配置相关逻辑
 * 不影响生产环境的页面显示
 */
function ConfigDebugger() {
  const [isVisible, setIsVisible] = useState(false)
  const [configData, setConfigData] = useState(null)
  
  // 只在开发环境下显示
  if (!isDevelopment()) {
    return null
  }
  
  useEffect(() => {
    // 获取配置数据
    const envConfig = getEnvConfig()
    const apiConfig = getGitHubApiConfig()
    const configStatus = envConfig.getConfigStatus()
    const validationStatus = envConfig.isConfigValid()
    
    setConfigData({
      env: {
        ADMIN_PASSWORD: envConfig.ADMIN_PASSWORD === 'admin123' ? '[默认密码]' : '[已设置]',
        GITHUB_TOKEN: envConfig.GITHUB_TOKEN ? `${envConfig.GITHUB_TOKEN.substring(0, 10)}...` : '[未设置]',
        GITHUB_REPO: envConfig.GITHUB_REPO || '[未设置]'
      },
      api: {
        repoName: apiConfig.repoName,
        hasToken: apiConfig.hasToken,
        hasRepo: apiConfig.hasRepo,
        endpoints: apiConfig.endpoints
      },
      status: configStatus,
      validation: validationStatus,
      environment: {
        NODE_ENV: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD
      }
    })
  }, [])
  
  if (!configData) {
    return null
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 切换按钮 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors mb-2"
        title="配置调试器"
      >
        <Settings className="w-5 h-5" />
      </button>
      
      {/* 调试面板 */}
      {isVisible && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              配置调试器
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
          
          {/* 环境信息 */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">环境信息</h4>
            <div className="bg-gray-50 p-2 rounded text-sm">
              <div>模式: {configData.environment.NODE_ENV}</div>
              <div>开发环境: {configData.environment.DEV ? '✅' : '❌'}</div>
              <div>生产环境: {configData.environment.PROD ? '✅' : '❌'}</div>
            </div>
          </div>
          
          {/* 环境变量 */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">环境变量</h4>
            <div className="bg-gray-50 p-2 rounded text-sm space-y-1">
              <div>密码: {configData.env.ADMIN_PASSWORD}</div>
              <div>Token: {configData.env.GITHUB_TOKEN}</div>
              <div>仓库: {configData.env.GITHUB_REPO}</div>
            </div>
          </div>
          
          {/* EdgeOne Functions API */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">EdgeOne Functions API</h4>
            <div className="bg-blue-50 p-2 rounded text-sm space-y-1 border border-blue-200">
              <div>🏥 健康检查: /api/health</div>
              <div>📥 获取配置: /api/get-config</div>
              <div>📤 更新配置: /api/update-config</div>
              <div>🔧 GitHub仓库: {configData.api.repoName || '[未设置]'}</div>
            </div>
          </div>
          
          {/* 配置状态 */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">配置状态</h4>
            <div className="space-y-2">
              {Object.entries(configData.status).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  {value.status === 'configured' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="capitalize">{key}:</span>
                  <span className={value.status === 'configured' ? 'text-green-600' : 'text-red-600'}>
                    {value.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 验证状态 */}
          <div>
            <h4 className="font-medium text-gray-800 mb-2">验证结果</h4>
            <div className="bg-gray-50 p-2 rounded text-sm">
              <div className="flex items-center gap-2">
                {configData.validation.isFullyConfigured ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={configData.validation.isFullyConfigured ? 'text-green-600' : 'text-red-600'}>
                  {configData.validation.isFullyConfigured ? '配置完整' : '配置不完整'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConfigDebugger 