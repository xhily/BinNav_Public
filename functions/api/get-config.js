/**
 * EdgeOne Functions - 获取配置文件
 * 路由: /api/get-config
 * 用途: 获取当前websiteData.js文件内容，用于管理后台编辑
 */
export async function onRequestGet({ request, env }) {
  const { GITHUB_TOKEN, GITHUB_REPO } = env;
  
  // 检查环境变量
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return new Response(JSON.stringify({
      error: 'GitHub配置未设置',
      message: '请在EdgeOne项目中配置GITHUB_TOKEN和GITHUB_REPO环境变量'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 获取文件内容
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/src/websiteData.js`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'EdgeOne-Functions'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API错误: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      content: atob(data.content), // 解码base64内容
      sha: data.sha, // 用于后续更新
      path: data.path,
      size: data.size
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('获取配置失败:', error);
    
    return new Response(JSON.stringify({
      error: '获取配置失败',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 