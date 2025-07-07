/**
 * EdgeOne Functions - 调试缓存图标
 * 路由: /api/debug-cache
 * 用途: 调试缓存图标的获取和显示
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // CORS头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const domain = url.searchParams.get('domain') || 'github.com';
  const GITHUB_TOKEN = env?.VITE_GITHUB_TOKEN || env?.GITHUB_TOKEN;
  const GITHUB_REPO = env?.VITE_GITHUB_REPO || env?.GITHUB_REPO;

  const result = {
    domain: domain,
    steps: [],
    success: false,
    error: null
  };

  try {
    // 步骤1: 检查环境变量
    result.steps.push({
      step: '检查环境变量',
      hasToken: Boolean(GITHUB_TOKEN),
      hasRepo: Boolean(GITHUB_REPO),
      repo: GITHUB_REPO
    });

    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      throw new Error('GitHub配置缺失');
    }

    // 步骤2: 检查缓存文件是否存在
    const iconPath = `public/cached-icons/${domain}.png`;
    const checkResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${iconPath}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    result.steps.push({
      step: '检查缓存文件',
      status: checkResponse.status,
      exists: checkResponse.ok,
      path: iconPath
    });

    if (checkResponse.ok) {
      // 步骤3: 获取文件信息
      const fileData = await checkResponse.json();
      result.steps.push({
        step: '获取文件信息',
        size: fileData.size,
        sha: fileData.sha,
        encoding: fileData.encoding
      });

      // 步骤4: 解码图标数据
      try {
        const cleanBase64 = fileData.content.replace(/\s/g, '');
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        result.steps.push({
          step: '解码图标数据',
          originalSize: fileData.size,
          decodedSize: bytes.length,
          isValidImage: bytes.length > 0 && (
            // PNG signature
            (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) ||
            // JPEG signature
            (bytes[0] === 0xFF && bytes[1] === 0xD8) ||
            // GIF signature
            (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46)
          )
        });

        result.success = true;

        // 如果请求包含 returnImage=true，直接返回图片
        if (url.searchParams.get('returnImage') === 'true') {
          return new Response(bytes, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }

      } catch (decodeError) {
        result.steps.push({
          step: '解码图标数据',
          error: decodeError.message
        });
      }
    } else {
      // 步骤3: 尝试直接获取图标
      const directUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      try {
        const directResponse = await fetch(directUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(5000)
        });

        result.steps.push({
          step: '直接获取图标',
          url: directUrl,
          status: directResponse.status,
          contentType: directResponse.headers.get('content-type'),
          success: directResponse.ok
        });

        if (directResponse.ok && url.searchParams.get('returnImage') === 'true') {
          const imageData = await directResponse.arrayBuffer();
          return new Response(imageData, {
            headers: {
              ...corsHeaders,
              'Content-Type': directResponse.headers.get('content-type') || 'image/png',
              'Cache-Control': 'public, max-age=3600'
            }
          });
        }
      } catch (directError) {
        result.steps.push({
          step: '直接获取图标',
          error: directError.message
        });
      }
    }

  } catch (error) {
    result.error = error.message;
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
