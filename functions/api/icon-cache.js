/**
 * EdgeOne Functions - 图标缓存服务
 * 路由: /api/icon-cache
 * 用途: 下载外网图标并缓存到GitHub项目的public/cached-icons目录
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
  const { GITHUB_TOKEN, GITHUB_REPO } = env;
  
  if (!GITHUB_TOKEN) {
    return new Response(JSON.stringify({
      success: false,
      error: 'GITHUB_TOKEN未配置',
      message: '请在EdgeOne项目中配置GITHUB_TOKEN环境变量'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  if (!GITHUB_REPO) {
    return new Response(JSON.stringify({
      success: false,
      error: 'GITHUB_REPO未配置',
      message: '请在EdgeOne项目中配置GITHUB_REPO环境变量'
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
    const { domain, iconUrl } = requestData;
    
    if (!domain) {
      throw new Error('域名不能为空');
    }
    
    if (!iconUrl) {
      throw new Error('图标URL不能为空');
    }

    console.log('开始缓存图标:', { domain, iconUrl });

    // 下载图标
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const iconResponse = await fetch(iconUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!iconResponse.ok) {
      throw new Error(`下载图标失败: HTTP ${iconResponse.status}`);
    }

    const contentType = iconResponse.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('不是有效的图片格式');
    }

    const iconData = await iconResponse.arrayBuffer();
    console.log('图标下载成功，大小:', iconData.byteLength);
    
    // 转换为base64
    const uint8Array = new Uint8Array(iconData);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Data = btoa(binaryString);

    // 确定文件扩展名
    let extension = '.png';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      extension = '.jpg';
    } else if (contentType.includes('gif')) {
      extension = '.gif';
    } else if (contentType.includes('svg')) {
      extension = '.svg';
    }

    // 确保域名安全
    const safeDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${safeDomain}${extension}`;
    const filePath = `public/cached-icons/${fileName}`;
    
    // 首先检查文件是否已存在
    const checkUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
    
    let existingFileSha = null;
    try {
      const checkResponse = await fetch(checkUrl, {
        method: 'GET',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'EdgeOne-Functions/1.0'
        }
      });
      
      if (checkResponse.ok) {
        const existingFile = await checkResponse.json();
        existingFileSha = existingFile.sha;
        console.log('文件已存在，将覆盖:', filePath);
      }
    } catch (e) {
      console.log('文件不存在，将创建新文件:', filePath);
    }

    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;

    // 上传或更新GitHub文件
    const requestBody = {
      message: `📸 Cache icon for ${domain}`,
      content: base64Data
    };

    // 如果文件已存在，需要提供SHA值
    if (existingFileSha) {
      requestBody.sha = existingFileSha;
    }

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'EdgeOne-Functions/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      throw new Error(`GitHub API错误: ${response.status} ${response.statusText} - ${errorData.message || errorText}`);
    }

    const result = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: `图标${existingFileSha ? '更新' : '缓存'}成功！`,
      staticPath: `/cached-icons/${fileName}`,
      fileName: fileName,
      size: iconData.byteLength,
      commit: {
        sha: result.commit.sha,
        url: result.commit.html_url
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.log('缓存图标失败:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '缓存图标失败',
      message: error.message,
      debug: {
        timestamp: new Date().toISOString(),
        errorName: error.name
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
