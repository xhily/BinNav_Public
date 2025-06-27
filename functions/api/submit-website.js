/**
 * EdgeOne Functions - 站点提交 (简化调试版本)
 * 路由: /api/submit-website
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
    console.log('API调用开始');
    
    // 测试请求数据解析
    let requestData = {};
    try {
      requestData = await request.json();
      console.log('请求解析成功，字段数量:', Object.keys(requestData).length);
    } catch (parseError) {
      console.log('请求解析失败:', parseError.message);
      return new Response(JSON.stringify({
        success: false,
        message: '请求数据解析失败: ' + parseError.message,
        step: 'parse_request'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: '请求解析成功',
      debug: {
        receivedFields: Object.keys(requestData),
        fieldCount: Object.keys(requestData).length,
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
    console.error('严重错误:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: '服务器内部错误',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
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