/**
 * EdgeOne Functions - 更新友情链接
 * 路由: /api/update-friend-links
 * 用途: 更新友情链接列表
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
    // 解析请求数据
    const requestData = await request.json();
    const { friendLinks } = requestData;

    if (!Array.isArray(friendLinks)) {
      return new Response(JSON.stringify({
        success: false,
        message: '友情链接数据格式错误'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 验证友情链接数据
    for (const link of friendLinks) {
      if (!link.name || !link.url) {
        return new Response(JSON.stringify({
          success: false,
          message: '友情链接必须包含名称和链接'
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // 验证URL格式
      try {
        new URL(link.url);
      } catch {
        return new Response(JSON.stringify({
          success: false,
          message: `"${link.name}"的链接格式不正确`
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    }

    // 确保每个链接都有ID和order
    const processedLinks = friendLinks.map((link, index) => ({
      id: link.id || Date.now() + index,
      name: link.name.trim(),
      url: link.url.trim(),
      description: link.description ? link.description.trim() : '',
      logo: link.logo ? link.logo.trim() : '',
      order: typeof link.order === 'number' ? link.order : index
    }));

    // 按order排序
    processedLinks.sort((a, b) => a.order - b.order);

    // 保存到KV存储
    const friendLinksKey = 'friend_links';
    await env.BINNAV_KV.put(friendLinksKey, JSON.stringify(processedLinks));

    return new Response(JSON.stringify({
      success: true,
      message: '友情链接更新成功',
      data: processedLinks,
      count: processedLinks.length
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('更新友情链接失败:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: '更新友情链接失败，请稍后重试'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 