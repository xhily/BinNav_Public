/**
 * EdgeOne Functions - 测试API
 * 路由: /api/test-submit
 * 用途: 测试EdgeOne Functions基本功能
 */

// 处理OPTIONS请求（CORS预检）
export async function onRequestOptions({ request }) {
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
  try {
    console.log('测试API被调用');
    
    // 解析请求数据
    const requestData = await request.json();
    console.log('接收到的数据:', requestData);
    
    return new Response(JSON.stringify({
      success: true,
      message: '测试API工作正常',
      receivedData: requestData,
      timestamp: new Date().toISOString()
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
      message: '测试API错误: ' + error.message,
      error: {
        name: error.name,
        message: error.message
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