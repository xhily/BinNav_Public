/**
 * EdgeOne Functions - 获取待审核站点
 * 路由: /api/get-pending-websites
 * 用途: 获取所有待审核的站点列表
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
    // 从KV存储获取待审核站点列表
    const pendingWebsitesKey = 'pending_websites';
    const data = await env.BINNAV_KV.get(pendingWebsitesKey);
    
    let pendingWebsites = [];
    if (data) {
      try {
        const parsed = JSON.parse(data);
        pendingWebsites = Array.isArray(parsed) ? parsed : [];
      } catch (parseError) {
        console.error('解析待审核站点数据失败:', parseError);
      }
    }

    // 按提交时间倒序排列
    pendingWebsites.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    return new Response(JSON.stringify({
      success: true,
      data: pendingWebsites,
      count: pendingWebsites.length
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('获取待审核站点失败:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: '获取待审核站点失败',
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