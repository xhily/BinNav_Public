/**
 * EdgeOne Functions - 网络访问测试
 * 路由: /api/test-network
 * 用途: 测试EdgeOne Functions是否能访问外网
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
    const { testUrl } = await request.json();
    const urlToTest = testUrl || 'https://www.google.com/s2/favicons?domain=github.com&sz=32';
    
    console.log('测试网络访问:', urlToTest);
    
    const startTime = Date.now();
    
    // 创建超时控制器
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(urlToTest, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`网络请求完成: ${response.status}, 耗时: ${duration}ms`);
      
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      let responseData = null;
      let responseSize = 0;
      
      if (response.ok) {
        try {
          const arrayBuffer = await response.arrayBuffer();
          responseSize = arrayBuffer.byteLength;
          console.log(`响应数据大小: ${responseSize} bytes`);
        } catch (e) {
          console.log('无法读取响应数据:', e.message);
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        testUrl: urlToTest,
        result: {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: headers,
          responseSize: responseSize,
          duration: duration
        },
        message: `网络访问测试${response.ok ? '成功' : '失败'}`,
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('网络请求失败:', fetchError.message);
      
      return new Response(JSON.stringify({
        success: false,
        testUrl: urlToTest,
        error: fetchError.message,
        errorType: fetchError.name,
        duration: duration,
        message: '网络访问失败',
        possibleCauses: [
          'EdgeOne Functions网络限制',
          '目标服务器不可访问',
          '请求超时',
          'CORS限制'
        ],
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
  } catch (error) {
    console.log('测试API错误:', error.message);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: '测试API内部错误',
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
