/**
 * EdgeOne Functions - 图标缓存服务
 * 路由: /api/cache-icon
 * 用途: 缓存网站图标到GitHub仓库，避免重复获取
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

  if (request.method === 'GET') {
    // 获取缓存的图标
    const domain = url.searchParams.get('domain');
    if (!domain) {
      return new Response('Missing domain parameter', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    try {
      // 尝试从GitHub获取缓存的图标
      const iconPath = `public/cached-icons/${domain}.png`;
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${iconPath}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        const imageData = atob(data.content.replace(/\s/g, ''));
        
        return new Response(imageData, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=2592000' // 缓存30天
          }
        });
      } else {
        // 缓存中没有，尝试获取并缓存
        return await fetchAndCacheIcon(domain, GITHUB_TOKEN, GITHUB_REPO, corsHeaders);
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
    // 手动缓存图标
    try {
      const { domain, iconUrl } = await request.json();
      
      if (!domain) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing domain parameter'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await fetchAndCacheIcon(domain, GITHUB_TOKEN, GITHUB_REPO, corsHeaders, iconUrl);
      return result;
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

// 获取并缓存图标
async function fetchAndCacheIcon(domain, githubToken, githubRepo, corsHeaders, customIconUrl = null) {
  // 图标获取策略
  const iconStrategies = customIconUrl ? [customIconUrl] : [
    `https://${domain}/favicon.ico`,
    `https://${domain}/favicon.png`,
    `https://api.iowen.cn/favicon/${domain}.png`,
    `https://favicon.yandex.net/favicon/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  ];

  let iconData = null;
  let contentType = 'image/png';

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
        const responseContentType = response.headers.get('content-type');
        if (responseContentType && responseContentType.startsWith('image/')) {
          iconData = await response.arrayBuffer();
          contentType = responseContentType;
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
    contentType = 'image/svg+xml';
  }

  // 缓存到GitHub
  try {
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(iconData)));
    const iconPath = `public/cached-icons/${domain}.png`;
    
    await fetch(`https://api.github.com/repos/${githubRepo}/contents/${iconPath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Cache icon for ${domain}`,
        content: base64Data
      })
    });
  } catch (error) {
    console.warn('Failed to cache icon to GitHub:', error);
  }

  // 返回图标数据
  return new Response(iconData, {
    headers: {
      ...corsHeaders,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=2592000'
    }
  });
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
