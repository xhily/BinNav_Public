/**
 * EdgeOne Functions - 批量缓存图标
 * 路由: /api/batch-cache-icons
 * 用途: 批量缓存所有网站的图标
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
    // 获取当前的websiteData.js
    const configResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/src/websiteData.js`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!configResponse.ok) {
      throw new Error('无法获取网站数据');
    }

    const configData = await configResponse.json();

    // 使用更安全的base64解码方式
    let configContent;
    try {
      // 清理base64字符串，移除换行符和空格
      const cleanBase64 = configData.content.replace(/\s/g, '');
      configContent = decodeURIComponent(escape(atob(cleanBase64)));
    } catch (decodeError) {
      throw new Error(`Base64解码失败: ${decodeError.message}`);
    }

    // 解析网站数据
    const websiteDataMatch = configContent.match(/export const websiteData = (\[[\s\S]*?\]);/);
    if (!websiteDataMatch) {
      throw new Error('无法解析网站数据');
    }

    let websiteData;
    try {
      websiteData = JSON.parse(websiteDataMatch[1]);
    } catch (parseError) {
      throw new Error(`网站数据JSON解析失败: ${parseError.message}`);
    }
    const results = [];
    let successCount = 0;
    let failCount = 0;

    // 批量处理图标缓存
    for (const website of websiteData) {
      try {
        const hostname = new URL(website.url).hostname;
        
        // 检查是否已经缓存
        const cacheCheckResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/public/cached-icons/${hostname}.png`, {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          }
        });

        if (cacheCheckResponse.ok) {
          results.push({
            name: website.name,
            domain: hostname,
            status: 'already_cached',
            message: '已缓存'
          });
          continue;
        }

        // 缓存图标
        const cacheResult = await cacheIconForDomain(hostname, website.icon, GITHUB_TOKEN, GITHUB_REPO);
        
        if (cacheResult.success) {
          successCount++;
          results.push({
            name: website.name,
            domain: hostname,
            status: 'success',
            message: '缓存成功'
          });
        } else {
          failCount++;
          results.push({
            name: website.name,
            domain: hostname,
            status: 'failed',
            message: cacheResult.error || '缓存失败'
          });
        }

        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        failCount++;
        results.push({
          name: website.name,
          domain: 'unknown',
          status: 'error',
          message: error.message
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      summary: {
        total: websiteData.length,
        success: successCount,
        failed: failCount,
        alreadyCached: results.filter(r => r.status === 'already_cached').length
      },
      results: results
    }), {
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

// 为特定域名缓存图标
async function cacheIconForDomain(domain, customIcon, githubToken, githubRepo) {
  const iconStrategies = customIcon ? [customIcon] : [
    `https://${domain}/favicon.ico`,
    `https://${domain}/favicon.png`,
    `https://api.iowen.cn/favicon/${domain}.png`,
    `https://favicon.yandex.net/favicon/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
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

  // 缓存到GitHub
  try {
    // 修复base64编码
    const uint8Array = new Uint8Array(iconData);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Data = btoa(binaryString);
    const iconPath = `public/cached-icons/${domain}.png`;
    
    const response = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${iconPath}`, {
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

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.text();
      return { success: false, error: `GitHub API错误: ${errorData}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
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
