import { useState } from 'react'
import { Github, RefreshCw, ExternalLink, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useVersionInfo } from '../../hooks/useVersionInfo'

const VersionManager = () => {
  const {
    versionInfo,
    isLoading,
    error,
    lastChecked,
    checkForUpdates,
    formatVersion,
    formatDate,
    getUpdateMessage
  } = useVersionInfo()

  const [isChecking, setIsChecking] = useState(false)

  const handleCheckUpdates = async () => {
    setIsChecking(true)
    await checkForUpdates()
    setIsChecking(false)
  }

  const getStatusIcon = () => {
    if (!versionInfo) return <Clock className="w-5 h-5 text-gray-400" />
    if (!versionInfo.latestVersion) return <Clock className="w-5 h-5 text-gray-500" />
    if (versionInfo.hasNewVersion) return <AlertCircle className="w-5 h-5 text-orange-500" />
    return <CheckCircle className="w-5 h-5 text-green-500" />
  }

  const getStatusColor = () => {
    if (!versionInfo) return 'border-gray-200 bg-gray-50'
    if (!versionInfo.latestVersion) return 'border-gray-200 bg-gray-50'
    if (versionInfo.hasNewVersion) return 'border-orange-200 bg-orange-50'
    return 'border-green-200 bg-green-50'
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-base font-medium text-gray-900 mb-4">版本信息</h4>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">获取版本信息失败: {error}</span>
          </div>
          <button
            onClick={handleCheckUpdates}
            disabled={isChecking}
            className="mt-3 inline-flex items-center space-x-2 px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>重试</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-medium text-gray-900">版本信息</h4>
        <button
          onClick={handleCheckUpdates}
          disabled={isLoading || isChecking}
          className="inline-flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${(isLoading || isChecking) ? 'animate-spin' : ''}`} />
          <span>检查更新</span>
        </button>
      </div>

      {/* 版本信息 */}
      <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium text-gray-900">版本状态</span>
          </div>
          {lastChecked && (
            <span className="text-xs text-gray-500">
              最后检查: {formatDate(lastChecked)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">当前版本</label>
            <div className="text-lg font-mono text-gray-900">
              {versionInfo ? formatVersion(versionInfo.currentVersion) : 'v1.0.0'}
            </div>
          </div>

          {versionInfo?.latestVersion && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最新版本</label>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-mono text-gray-900">
                  {formatVersion(versionInfo.latestVersion)}
                </span>
                {versionInfo.latestRelease?.prerelease && (
                  <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                    预发布
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 text-sm text-gray-600">
          {getUpdateMessage()}
        </div>

        {/* GitHub链接 */}
        {versionInfo?.latestRelease && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <a
              href={versionInfo.latestRelease.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>查看发布详情</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

    </div>
  )
}

export default VersionManager
