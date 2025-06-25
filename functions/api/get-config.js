/**
 * EdgeOne Functions - 获取配置文件
 * 路由: /api/get-config
 * 用途: 获取当前websiteData.js文件内容，用于管理后台编辑
 */

// 简化的Base64解码函数
function base64Decode(str) {
  console.log('🔍 开始Base64解码，输入长度:', str.length);
  console.log('🔍 输入内容前50字符:', str.substring(0, 50));
  
  try {
    // 检查环境支持
    console.log('🔍 环境检查:', {
      hasAtob: typeof atob !== 'undefined',
      hasBuffer: typeof Buffer !== 'undefined',
      hasTextDecoder: typeof TextDecoder !== 'undefined'
    });
    
    // 方法1：标准 atob
    if (typeof atob !== 'undefined') {
      console.log('💡 使用标准atob函数');
      const result = atob(str);
      console.log('✅ atob解码成功，长度:', result.length);
      return result;
    }
    
    // 方法2：Node.js Buffer
    if (typeof Buffer !== 'undefined') {
      console.log('💡 使用Node.js Buffer');
      const result = Buffer.from(str, 'base64').toString('utf-8');
      console.log('✅ Buffer解码成功，长度:', result.length);
      return result;
    }
    
    // 方法3：使用 TextDecoder（如果可用）
    if (typeof TextDecoder !== 'undefined') {
      console.log('💡 尝试使用TextDecoder');
      const decoder = new TextDecoder('utf-8');
      // 这里需要先将base64转换为Uint8Array
      // 但这需要手动实现，所以跳过
    }
    
    // 方法4：最简单的纯JS实现
    console.log('💡 使用简化的纯JavaScript实现');
    
    // Base64字符表
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    
    // 移除换行和空格
    const cleanStr = str.replace(/[\r\n\s]/g, '');
    console.log('🔍 清理后长度:', cleanStr.length);
    
    // 简单的4字符->3字节转换
    for (let i = 0; i < cleanStr.length; i += 4) {
      const chunk = cleanStr.substr(i, 4);
      if (chunk.length < 4) break;
      
      const a = chars.indexOf(chunk[0]);
      const b = chars.indexOf(chunk[1]); 
      const c = chunk[2] === '=' ? 0 : chars.indexOf(chunk[2]);
      const d = chunk[3] === '=' ? 0 : chars.indexOf(chunk[3]);
      
      if (a === -1 || b === -1 || (chunk[2] !== '=' && c === -1) || (chunk[3] !== '=' && d === -1)) {
        throw new Error(`无效的Base64字符: ${chunk}`);
      }
      
      const bitmap = (a << 18) | (b << 12) | (c << 6) | d;
      
      result += String.fromCharCode((bitmap >> 16) & 255);
      if (chunk[2] !== '=') result += String.fromCharCode((bitmap >> 8) & 255);
      if (chunk[3] !== '=') result += String.fromCharCode(bitmap & 255);
    }
    
    console.log('✅ 纯JS解码完成，长度:', result.length);
    return result;
    
  } catch (error) {
    console.error('❌ Base64解码失败:', error);
    console.error('❌ 错误类型:', error.name);
    console.error('❌ 错误消息:', error.message);
    
    // 提供更多调试信息
    return null; // 返回null而不是抛出异常，让调用者处理
  }
}

export async function onRequestGet({ request, env }) {
  console.log('🚀 GET /api/get-config 开始执行');
  
  const { GITHUB_TOKEN, GITHUB_REPO } = env;
  
  // 详细的环境变量检查  
  console.log('🔍 环境变量检查:', {
    hasToken: Boolean(GITHUB_TOKEN),
    tokenLength: GITHUB_TOKEN ? GITHUB_TOKEN.length : 0,
    hasRepo: Boolean(GITHUB_REPO),
    repoName: GITHUB_REPO || 'undefined'
  });
  
  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN未配置');
    return new Response(JSON.stringify({
      success: false,
      error: 'GITHUB_TOKEN未配置',
      message: '请在EdgeOne项目中配置GITHUB_TOKEN环境变量',
      debug: 'MISSING_GITHUB_TOKEN'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  if (!GITHUB_REPO) {
    console.error('❌ GITHUB_REPO未配置');
    return new Response(JSON.stringify({
      success: false,
      error: 'GITHUB_REPO未配置', 
      message: '请在EdgeOne项目中配置GITHUB_REPO环境变量',
      debug: 'MISSING_GITHUB_REPO'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/src/websiteData.js`;
    console.log('📡 调用GitHub API:', apiUrl);
    
    // 获取文件内容
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'EdgeOne-Functions/1.0'
      }
    });

    console.log('📦 GitHub API响应:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type')
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GitHub API错误:', errorText);
      
      throw new Error(`GitHub API错误: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📄 GitHub文件信息:', {
      path: data.path,
      size: data.size,
      sha: data.sha ? data.sha.substring(0, 10) + '...' : 'undefined',
      hasContent: Boolean(data.content),
      contentLength: data.content ? data.content.length : 0
    });
    
    // 尝试Base64解码
    const decodedContent = base64Decode(data.content);
    
    if (decodedContent === null) {
      // 解码失败，但不影响功能，返回原始内容让前端处理
      console.log('⚠️ Base64解码失败，返回原始base64内容');
      return new Response(JSON.stringify({
        success: true,
        content: data.content, // 返回原始base64内容
        contentType: 'base64', // 标记内容类型
        sha: data.sha,
        path: data.path,
        size: data.size,
        timestamp: new Date().toISOString(),
        warning: 'Base64解码失败，返回原始内容'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS', 
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    console.log('✅ 配置文件解码成功，长度:', decodedContent.length);
    
    return new Response(JSON.stringify({
      success: true,
      content: decodedContent,
      contentType: 'text',
      sha: data.sha, // 用于后续更新
      path: data.path,
      size: data.size,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('❌ 获取配置失败:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: '获取配置失败',
      message: error.message,
      debug: {
        timestamp: new Date().toISOString(),
        errorName: error.name,
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