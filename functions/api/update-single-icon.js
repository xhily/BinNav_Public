/**
 * EdgeOne Functions - 单个网站图标更新
 * 路由: /api/update-single-icon
 * 用途: 更新单个网站的图标缓存
 */

export async function onRequest(context) {
  const { request, env } = context;

  // CORS头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  // 获取环境变量
  const GITHUB_TOKEN = env?.VITE_GITHUB_TOKEN || env?.GITHUB_TOKEN;
  const GITHUB_REPO = env?.VITE_GITHUB_REPO || env?.GITHUB_REPO;

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return new Response(JSON.stringify({
      success: false,
      error: 'GitHub配置缺失'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { url, customIcon } = await request.json();
    
    if (!url) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing URL parameter'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const hostname = new URL(url).hostname;
    const result = await updateIconForDomain(hostname, customIcon, GITHUB_TOKEN, GITHUB_REPO);
    
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

// 为特定域名更新图标
async function updateIconForDomain(domain, customIcon, githubToken, githubRepo) {
  const iconStrategies = customIcon ? [customIcon] : [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
    `https://${domain}/favicon.ico`,
    `https://${domain}/favicon.png`,
    `https://api.iowen.cn/favicon/${domain}.png`,
    `https://favicon.yandex.net/favicon/${domain}`
  ];

  let iconData = null;

  // 尝试获取图标
  for (const iconUrl of iconStrategies) {
    try {
      const response = await fetch(iconUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.startsWith('image/')) {
          iconData = await response.arrayBuffer();
          break;
        }
      }
    } catch (error) {
      continue;
    }
  }

  // 如果没有获取到图标，生成默认图标
  if (!iconData) {
    const defaultSvg = generateDefaultIcon(domain);
    iconData = new TextEncoder().encode(defaultSvg);
  }

  // 更新GitHub中的缓存
  try {
    // 修复base64编码
    const uint8Array = new Uint8Array(iconData);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Data = btoa(binaryString);
    const iconPath = `public/cached-icons/${domain}.png`;
    
    // 先检查文件是否存在，获取SHA
    let fileSha = null;
    try {
      const existingResponse = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${iconPath}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      if (existingResponse.ok) {
        const existingData = await existingResponse.json();
        fileSha = existingData.sha;
      }
    } catch (error) {
      // 文件不存在，继续创建
    }

    // 更新或创建文件
    const updateData = {
      message: `Update icon cache for ${domain}`,
      content: base64Data
    };

    if (fileSha) {
      updateData.sha = fileSha;
    }

    const response = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${iconPath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (response.ok) {
      return { 
        success: true, 
        message: '图标缓存更新成功',
        domain: domain
      };
    } else {
      const errorData = await response.text();
      return { 
        success: false, 
        error: `GitHub API错误: ${errorData}`,
        domain: domain
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      domain: domain
    };
  }
}

// 生成默认图标
function generateDefaultIcon(domain) {
  const firstLetter = domain.charAt(0).toUpperCase();
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];
  const color = colors[domain.length % colors.length];

  return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="6" fill="${color}"/>
    <text x="16" y="20" font-family="Arial" font-size="14" font-weight="bold" fill="white" text-anchor="middle">${firstLetter}</text>
  </svg>`;
}
