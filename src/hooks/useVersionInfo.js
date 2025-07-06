import { useState, useEffect } from 'react'

export const useVersionInfo = () => {
  const [versionInfo, setVersionInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastChecked, setLastChecked] = useState(null)

  const fetchVersionInfo = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/get-version')
      const result = await response.json()

      if (result.success) {
        setVersionInfo(result.data)
        setLastChecked(new Date())

        // 缓存到localStorage，避免频繁请求
        try {
          localStorage.setItem('versionInfo', JSON.stringify({
            data: result.data,
            timestamp: Date.now()
          }))
        } catch (e) {
          console.warn('缓存版本信息失败:', e)
        }
      } else {
        throw new Error(result.message || '获取版本信息失败')
      }
    } catch (err) {
      console.error('获取版本信息失败:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCachedVersionInfo = () => {
    try {
      const cached = localStorage.getItem('versionInfo')
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000

        // 如果缓存时间小于5分钟，使用缓存数据
        if (now - timestamp < fiveMinutes) {
          setVersionInfo(data)
          setLastChecked(new Date(timestamp))
          return true
        }
      }
    } catch (e) {
      console.warn('读取缓存版本信息失败:', e)
    }
    return false
  }

  // 初始化时尝试加载缓存数据
  useEffect(() => {
    const hasCached = loadCachedVersionInfo()
    if (!hasCached) {
      fetchVersionInfo()
    }
  }, [])

  const checkForUpdates = () => {
    fetchVersionInfo()
  }

  const formatVersion = (version) => {
    if (!version) return 'Unknown'
    return version.startsWith('v') ? version : `v${version}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return dateString
    }
  }

  const getUpdateMessage = () => {
    if (!versionInfo) return '检查版本信息中...'
    if (!versionInfo.latestVersion) return '暂无发布版本'
    if (versionInfo.hasNewVersion) {
      return `发现新版本 v${versionInfo.latestVersion}`
    }
    return '当前已是最新版本'
  }

  return {
    versionInfo,
    isLoading,
    error,
    lastChecked,
    checkForUpdates,
    formatVersion,
    formatDate,
    getUpdateMessage
  }
}
