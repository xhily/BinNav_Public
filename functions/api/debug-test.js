/**
 * EdgeOne Functions - 调试测试
 * 路由: /api/debug-test
 * 用途: 测试Functions服务和API端点
 */

// 处理OPTIONS请求（CORS预检）
export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// 处理GET请求
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const testType = url.searchParams.get('test') || 'basic';

  try {
    let result = {
      status: 'success',
      timestamp: new Date().toISOString(),
      testType: testType,
      url: request.url,
      method: request.method
    };

    if (testType === 'submit-website') {
      // 测试submit-website API的可用性
      result.submitWebsiteTest = {
        message: '测试submit-website API可用性',
        expected_method: 'POST',
        expected_content_type: 'application/json',
        env_check: {
          hasGithubToken: !!env.GITHUB_TOKEN,
          hasGithubRepo: !!env.GITHUB_REPO,
          repoName: env.GITHUB_REPO || 'not configured'
        }
      };
    } else {
      // 基础测试
      result.basic = {
        message: 'EdgeOne Functions 正常运行',
        functions_available: [
          '/api/health',
          '/api/verify-password', 
          '/api/get-config',
          '/api/update-config',
          '/api/submit-website',
          '/api/process-website-submission',
          '/api/upload-icon',
          '/api/delete-icon',
          '/api/debug-test'
        ]
      };
    }

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 处理POST请求 - 用于测试POST方法
export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    
    return new Response(JSON.stringify({
      status: 'success',
      message: 'POST请求测试成功',
      timestamp: new Date().toISOString(),
      receivedData: body,
      method: request.method
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: 'POST请求测试失败: ' + error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 