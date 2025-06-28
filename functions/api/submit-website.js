/**
 * EdgeOne Functions - 站点提交
 * 路由: /api/submit-website
 * 用途: 接收用户提交的站点，保存到待审核列表并发送邮件通知
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
  const RESEND_API_KEY = env.RESEND_API_KEY;
  const ADMIN_EMAIL = env.ADMIN_EMAIL;

  // 检查GitHub配置
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
    const submissionData = await request.json();
    const { name, url, description, category, tags, contactEmail, submitterName } = submissionData;

    // 验证必填字段
    if (!name || !url || !description || !category || !contactEmail) {
      return new Response(JSON.stringify({
        success: false,
        message: '请填写所有必填字段'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 自动补全URL协议并验证格式
    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    
    try {
      new URL(processedUrl);
    } catch {
      return new Response(JSON.stringify({
        success: false,
        message: '请输入有效的网站链接'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return new Response(JSON.stringify({
        success: false,
        message: '请输入有效的邮箱地址'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 生成提交ID和时间戳
    const submissionId = Date.now().toString();
    const currentTime = new Date().toISOString();

    // 构建待审核站点数据
    const pendingWebsite = {
      id: submissionId,
      name: name.trim(),
      url: processedUrl,
      description: description.trim(),
      category: category.trim(),
      tags: tags ? tags.trim() : '',
      contactEmail: contactEmail.trim(),
      submitterName: submitterName ? submitterName.trim() : '',
      status: 'pending',
      submittedAt: currentTime
    };

    // 获取现有的待审核文件
    let pendingWebsites = [];
    let fileSha = null;

    try {
      const fileResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/public/pending-websites.json`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'BinNav-EdgeOne-Functions'
        }
      });

      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        fileSha = fileData.sha;
        // 清理base64字符串，移除换行符和空格
        const cleanBase64 = fileData.content.replace(/\s/g, '');
        const content = decodeURIComponent(escape(atob(cleanBase64)));
        pendingWebsites = JSON.parse(content);
      }
    } catch (error) {
      console.log('获取现有待审核列表失败，使用空列表:', error);
    }

    // 检查是否重复提交
    const existingSubmission = pendingWebsites.find(site => 
      site.url.toLowerCase() === processedUrl.toLowerCase() ||
      (site.name.toLowerCase() === name.toLowerCase().trim() && site.contactEmail === contactEmail.trim())
    );

    if (existingSubmission) {
      return new Response(JSON.stringify({
        success: false,
        message: '该网站或邮箱已经提交过，请等待审核结果'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 添加新提交到列表
    pendingWebsites.push(pendingWebsite);

    // 保存更新后的待审核列表
    const jsonString = JSON.stringify(pendingWebsites, null, 2);
    const updatedContent = btoa(unescape(encodeURIComponent(jsonString)));
    
    const commitResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/public/pending-websites.json`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'BinNav-EdgeOne-Functions'
      },
      body: JSON.stringify({
        message: `新站点提交: ${name}`,
        content: updatedContent,
        sha: fileSha
      })
    });

    if (!commitResponse.ok) {
      const errorText = await commitResponse.text();
      throw new Error(`GitHub更新失败: ${commitResponse.status} ${commitResponse.statusText} - ${errorText}`);
    }

    // 发送邮件通知（如果配置了）
    if (RESEND_API_KEY && ADMIN_EMAIL) {
      console.log('开始发送邮件通知，ADMIN_EMAIL:', ADMIN_EMAIL);
      try {
        const emailPayload = {
          from: 'onboarding@resend.dev',
          to: [ADMIN_EMAIL],
          subject: `[BinNav] 新站点提交 - ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">新站点提交通知</h2>
              <p><strong>网站名称:</strong> ${name}</p>
              <p><strong>网站链接:</strong> <a href="${processedUrl}">${processedUrl}</a></p>
              <p><strong>描述:</strong> ${description}</p>
              <p><strong>分类:</strong> ${category}</p>
              <p><strong>标签:</strong> ${tags || '无'}</p>
              <p><strong>联系邮箱:</strong> ${contactEmail}</p>
              <p><strong>提交者:</strong> ${submitterName || '未提供'}</p>
              <p><strong>提交时间:</strong> ${new Date(currentTime).toLocaleString('zh-CN')}</p>
              <hr style="margin: 20px 0;">
              <p style="color: #666; font-size: 14px;">请前往管理后台进行审核处理</p>
            </div>
          `
        };
        
        console.log('邮件载荷:', JSON.stringify(emailPayload, null, 2));
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload)
        });
        
        const responseText = await emailResponse.text();
        
        if (emailResponse.ok) {
          console.log('邮件发送成功，响应:', responseText);
        } else {
          console.error('邮件发送失败，状态:', emailResponse.status);
          console.error('邮件发送失败，响应:', responseText);
          console.error('邮件发送失败，响应头:', [...emailResponse.headers.entries()]);
        }
      } catch (emailError) {
        console.error('邮件发送异常:', emailError);
        console.error('邮件发送异常详情:', {
          name: emailError.name,
          message: emailError.message,
          stack: emailError.stack
        });
        // 邮件发送失败不影响提交成功
      }
    } else {
      console.log('邮件配置检查:');
      console.log('- RESEND_API_KEY存在:', !!RESEND_API_KEY);
      console.log('- RESEND_API_KEY长度:', RESEND_API_KEY ? RESEND_API_KEY.length : 0);
      console.log('- ADMIN_EMAIL存在:', !!ADMIN_EMAIL);
      console.log('- ADMIN_EMAIL值:', ADMIN_EMAIL || 'undefined');
      console.log('跳过邮件发送');
    }

    return new Response(JSON.stringify({
      success: true,
      message: '站点提交成功！我们将在1-3个工作日内审核您的提交。',
      submissionId: submissionId
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('站点提交失败:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: '提交失败: ' + error.message,
      error: {
        name: error.name,
        message: error.message
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