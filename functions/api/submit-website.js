/**
 * EdgeOne Functions - 站点提交 (简化调试版本)
 * 路由: /api/submit-website
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
    // 第一步：测试基础响应
    console.log('Step 1: API调用成功');
    
    // 第二步：测试环境变量
    const GITHUB_TOKEN = env?.GITHUB_TOKEN;
    const GITHUB_REPO = env?.GITHUB_REPO;
    console.log('Step 2: 环境变量检查', { 
      hasToken: !!GITHUB_TOKEN, 
      hasRepo: !!GITHUB_REPO 
    });
    
    // 第三步：测试请求解析
    let requestData = {};
    try {
      requestData = await request.json();
      console.log('Step 3: 请求解析成功', Object.keys(requestData));
    } catch (parseError) {
      console.log('Step 3: 请求解析失败', parseError.message);
      return new Response(JSON.stringify({
        success: false,
        message: '请求数据解析失败',
        step: 3,
        error: parseError.message
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 第四步：检查必填字段
    const { name, url, description, category, contactEmail } = requestData;
    if (!name || !url || !description || !category || !contactEmail) {
      console.log('Step 4: 必填字段检查失败');
      return new Response(JSON.stringify({
        success: false,
        message: '请填写所有必填字段',
        step: 4,
        receivedFields: Object.keys(requestData)
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    console.log('Step 4: 必填字段检查通过');
    
    // 第五步：检查GitHub配置
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      console.log('Step 5: GitHub配置检查失败');
      return new Response(JSON.stringify({
        success: false,
        message: 'GitHub配置未完成',
        step: 5,
        hasToken: !!GITHUB_TOKEN,
        hasRepo: !!GITHUB_REPO
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    console.log('Step 5: GitHub配置检查通过');
    
    // 暂时跳过GitHub API调用，直接返回成功
    console.log('Step 6: 暂时跳过GitHub调用，返回成功');
    
    return new Response(JSON.stringify({
      success: true,
      message: '测试提交成功（暂未实际保存）',
      debug: {
        step: 6,
        receivedData: {
          name,
          url,
          description,
          category,
          contactEmail
        },
        hasGithubToken: !!GITHUB_TOKEN,
        hasGithubRepo: !!GITHUB_REPO,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('严重错误:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: '服务器内部错误',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 