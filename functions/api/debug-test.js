/**
 * 最简调试测试API
 */

// 处理OPTIONS请求
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
export async function onRequestPost({ request, env }) {
  console.log('调试API被调用');
  
  return new Response(JSON.stringify({
    success: true,
    message: '调试API工作正常',
    data: {
      timestamp: new Date().toISOString(),
      hasEnv: !!env,
      envKeys: env ? Object.keys(env) : [],
      hasRequest: !!request
    }
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
} 