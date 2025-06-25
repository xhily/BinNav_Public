/**
 * EdgeOne Functions - 更新配置文件
 * 路由: /api/update-config
 * 用途: 更新websiteData.js文件内容，触发EdgeOne Pages重新部署
 */

// 处理OPTIONS请求（CORS预检）
export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// 处理POST请求
export async function onRequestPost({ request, env }) {
  const { GITHUB_TOKEN, GITHUB_REPO } = env;
  
  // 检查环境变量
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return new Response(JSON.stringify({
      error: 'GitHub配置未设置',
      message: '请在EdgeOne项目中配置GITHUB_TOKEN和GITHUB_REPO环境变量'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    // 解析请求数据
    const requestData = await request.json();
    const { config, sha } = requestData;
    
    if (!config) {
      throw new Error('配置内容不能为空');
    }

    if (!sha) {
      throw new Error('文件SHA值缺失，请先获取最新配置');
    }

    // 更新GitHub文件
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/src/websiteData.js`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'EdgeOne-Functions'
      },
      body: JSON.stringify({
        message: '🔧 Auto-update website config via EdgeOne Functions',
        content: btoa(unescape(encodeURIComponent(config))), // 编码为base64
        sha: sha // 必须提供当前文件的SHA
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API错误: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: '配置更新成功！EdgeOne Pages正在自动重新部署',
      commit: {
        sha: result.commit.sha,
        url: result.commit.html_url,
        message: result.commit.message
      },
      file: {
        sha: result.content.sha,
        size: result.content.size,
        path: result.content.path
      }
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('更新配置失败:', error);
    
    return new Response(JSON.stringify({
      error: '更新配置失败',
      message: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 