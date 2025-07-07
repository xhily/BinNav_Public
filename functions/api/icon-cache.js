/**
 * EdgeOne Functions - 图标缓存服务
 * 路由: /api/icon-cache
 * 用途: 下载外网图标并缓存到GitHub，提供本地访问路径
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // CORS头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const domain = url.searchParams.get('domain');
  const GITHUB_TOKEN = env?.VITE_GITHUB_TOKEN || env?.GITHUB_TOKEN;
  const GITHUB_REPO = env?.VITE_GITHUB_REPO || env?.GITHUB_REPO;

  if (!domain) {
    return new Response('Missing domain parameter', { 
      status: 400, 
      headers: corsHeaders 
    });
  }

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return new Response(JSON.stringify({
      success: false,
      error: 'GitHub配置缺失'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'GET') {
    // 获取缓存的图标
    try {
      const iconPath = `public/cached-icons/${domain}.png`;
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${iconPath}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const cleanBase64 = data.content.replace(/\s/g, '');
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        return new Response(bytes, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=2592000' // 缓存30天
          }
        });
      } else {
        // 缓存中没有，返回404
        return new Response('Icon not found', { 
          status: 404, 
          headers: corsHeaders 
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  if (request.method === 'POST') {
    // 缓存图标
    try {
      const { iconUrl } = await request.json();
      
      if (!iconUrl) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing iconUrl parameter'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await downloadAndCacheIcon(domain, iconUrl, GITHUB_TOKEN, GITHUB_REPO);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method not allowed', { 
    status: 405, 
    headers: corsHeaders 
  });
}

// 下载并缓存图标
async function downloadAndCacheIcon(domain, iconUrl, githubToken, githubRepo) {
  try {
    // 下载图标
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(iconUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`下载图标失败: HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('不是有效的图片格式');
    }

    const iconData = await response.arrayBuffer();
    
    // 转换为base64
    const uint8Array = new Uint8Array(iconData);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Data = btoa(binaryString);

    // 保存到GitHub
    const iconPath = `public/cached-icons/${domain}.png`;
    
    // 检查文件是否已存在
    let fileSha = null;
    try {
      const existingResponse = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${iconPath}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (existingResponse.ok) {
        const existingData = await existingResponse.json();
        fileSha = existingData.sha;
      }
    } catch (error) {
      // 文件不存在，继续创建
    }

    // 上传到GitHub
    const updateData = {
      message: `Cache icon for ${domain}`,
      content: base64Data
    };

    if (fileSha) {
      updateData.sha = fileSha;
    }

    const uploadResponse = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${iconPath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify(updateData)
    });

    if (uploadResponse.ok) {
      return { 
        success: true, 
        message: '图标缓存成功',
        localPath: `/api/icon-cache?domain=${domain}`,
        size: iconData.byteLength
      };
    } else {
      const errorData = await uploadResponse.text();
      throw new Error(`GitHub上传失败: ${errorData}`);
    }

  } catch (error) {
    return { 
      success: false, 
      error: error.message
    };
  }
}
