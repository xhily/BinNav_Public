/**
 * 简化的站点提交测试API
 */

// 处理OPTIONS请求（CORS预检）
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// 处理POST请求
export async function onRequestPost(context) {
  try {
    console.log('测试API - 接收到请求');
    console.log('Context类型:', typeof context);
    
    // 尝试不同的参数结构
    let request, env;
    
    if (context && context.request) {
      request = context.request;
      env = context.env || {};
    } else if (context && typeof context.json === 'function') {
      request = context;
      env = {};
    } else {
      request = arguments[0];
      env = arguments[1] || {};
    }
    
    console.log('解析结果:', { hasRequest: !!request, hasEnv: !!env });
    
    // 尝试读取请求数据
    let data = {};
    try {
      data = await request.json();
      console.log('数据解析成功:', Object.keys(data));
    } catch (parseError) {
      console.log('数据解析失败:', parseError.message);
      return new Response(JSON.stringify({
        success: false,
        message: '请求数据解析失败: ' + parseError.message
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 检查环境变量
    const githubToken = env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    const githubRepo = env.GITHUB_REPO || process.env.GITHUB_REPO;
    
    console.log('环境变量检查:', {
      hasToken: !!githubToken,
      hasRepo: !!githubRepo,
      tokenLength: githubToken ? githubToken.length : 0
    });
    
    // 返回成功响应
    return new Response(JSON.stringify({
      success: true,
      message: '测试API工作正常',
      data: {
        receivedFields: Object.keys(data),
        hasGithubToken: !!githubToken,
        hasGithubRepo: !!githubRepo,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('测试API错误:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: '测试API发生错误: ' + error.message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 