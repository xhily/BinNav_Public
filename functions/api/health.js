/**
 * EdgeOne Functions - 健康检查
 * 路由: /api/health
 * 用途: 检查EdgeOne Functions服务状态和配置
 */
export async function onRequestGet({ request, env }) {
  const { GITHUB_TOKEN, GITHUB_REPO, ADMIN_PASSWORD } = env;
  
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EdgeOne Functions',
    version: '1.0.0',
    config: {
      hasGitHubToken: Boolean(GITHUB_TOKEN),
      hasGitHubRepo: Boolean(GITHUB_REPO),
      hasAdminPassword: Boolean(ADMIN_PASSWORD),
      repoName: GITHUB_REPO ? GITHUB_REPO : 'not configured'
    },
    endpoints: [
      '/api/health',
      '/api/verify-password',
      '/api/get-config',
      '/api/update-config'
    ]
  }), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
} 