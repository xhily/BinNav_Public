/**
 * EdgeOne Functions - 获取配置文件
 * 路由: /api/get-config
 * 用途: 获取当前websiteData.js文件内容，用于管理后台编辑
 */

// Base64 解码函数（纯JavaScript实现，兼容所有环境）
function base64Decode(str) {
  try {
    // 尝试使用标准atob函数
    if (typeof atob !== 'undefined') {
      console.log('💡 使用标准atob函数');
      return atob(str);
    }
    
    // 尝试使用Node.js Buffer
    if (typeof Buffer !== 'undefined') {
      console.log('💡 使用Node.js Buffer');
      return Buffer.from(str, 'base64').toString('utf-8');
    }
    
    // 纯JavaScript实现的Base64解码
    console.log('💡 使用纯JavaScript实现');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup = {};
    for (let i = 0; i < chars.length; i++) {
      lookup[chars[i]] = i;
    }
    
    let bufferLength = str.length * 0.75;
    if (str[str.length - 1] === '=') {
      bufferLength--;
      if (str[str.length - 2] === '=') {
        bufferLength--;
      }
    }
    
    const bytes = new Array(bufferLength);
    let p = 0;
    
    for (let i = 0; i < str.length; i += 4) {
      const encoded1 = lookup[str[i]];
      const encoded2 = lookup[str[i + 1]];
      const encoded3 = lookup[str[i + 2]];
      const encoded4 = lookup[str[i + 3]];
      
      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
    
    // 转换为UTF-8字符串
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] !== undefined) {
        result += String.fromCharCode(bytes[i]);
      }
    }
    
    // 处理UTF-8编码
    try {
      return decodeURIComponent(escape(result));
    } catch (e) {
      return result;
    }
    
  } catch (error) {
    console.error('❌ Base64解码失败:', error);
    console.error('输入内容预览:', str.substring(0, 100) + '...');
    throw new Error(`Base64解码失败: ${error.message}`);
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
      hasContent: Boolean(data.content)
    });
    
    // 使用兼容的base64解码
    const decodedContent = base64Decode(data.content);
    console.log('✅ 配置文件解码成功，长度:', decodedContent.length);
    
    return new Response(JSON.stringify({
      success: true,
      content: decodedContent,
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