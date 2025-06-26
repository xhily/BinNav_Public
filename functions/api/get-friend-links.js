/**
 * EdgeOne Functions - 获取友情链接
 * 路由: /api/get-friend-links
 * 用途: 获取友情链接列表
 */

// 处理OPTIONS请求（CORS预检）
export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// 处理GET请求
export async function onRequestGet({ request, env }) {
  try {
    // 从KV存储获取友情链接数据
    const friendLinksKey = 'friend_links';
    const data = await env.BINNAV_KV.get(friendLinksKey);
    
    let friendLinks = [];
    if (data) {
      try {
        const parsed = JSON.parse(data);
        friendLinks = Array.isArray(parsed) ? parsed : [];
      } catch (parseError) {
        console.error('解析友情链接数据失败:', parseError);
      }
    }

    // 按order字段排序
    friendLinks.sort((a, b) => (a.order || 0) - (b.order || 0));

    return new Response(JSON.stringify({
      success: true,
      data: friendLinks,
      count: friendLinks.length
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('获取友情链接失败:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: '获取友情链接失败',
      data: []
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 