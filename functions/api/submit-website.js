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
  const { RESEND_API_KEY, ADMIN_EMAIL, GITHUB_TOKEN, GITHUB_REPO } = env;

  console.log('接收到站点提交请求');
  console.log('环境变量检查:', { 
    hasGithubToken: !!GITHUB_TOKEN, 
    hasGithubRepo: !!GITHUB_REPO,
    hasResendKey: !!RESEND_API_KEY,
    hasAdminEmail: !!ADMIN_EMAIL
  });

  try {
    // 解析请求数据
    const submissionData = await request.json();
    console.log('提交数据:', { name: submissionData.name, url: submissionData.url });
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

    // 检查GitHub配置
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      console.error('GitHub配置缺失:', { hasToken: !!GITHUB_TOKEN, hasRepo: !!GITHUB_REPO });
      return new Response(JSON.stringify({
        success: false,
        message: 'GitHub配置未完成，请联系管理员'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    let pendingWebsites = [];
    let fileSha = null;

    try {
      // 尝试获取现有的待审核文件
      const fileResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/public/pending-websites.json`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        fileSha = fileData.sha;
        const content = atob(fileData.content);
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

    // 通过GitHub API保存更新后的待审核列表
    const updatedContent = btoa(JSON.stringify(pendingWebsites, null, 2));
    
    const commitResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/public/pending-websites.json`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `新站点提交: ${name}`,
        content: updatedContent,
        sha: fileSha
      })
    });

    if (!commitResponse.ok) {
      throw new Error('GitHub更新失败');
    }

    // 发送邮件通知管理员（使用Resend）
    if (RESEND_API_KEY && ADMIN_EMAIL) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'BinNav <noreply@binnav.top>',
            to: [ADMIN_EMAIL],
            subject: `[BinNav] 新站点提交 - ${name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                  新站点提交通知
                </h2>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #374151;">站点信息</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #6b7280; width: 100px;">网站名称:</td>
                      <td style="padding: 8px 0;">${name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">网站链接:</td>
                      <td style="padding: 8px 0;"><a href="${url}" target="_blank" style="color: #2563eb;">${url}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">描述:</td>
                      <td style="padding: 8px 0;">${description}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">分类:</td>
                      <td style="padding: 8px 0;">${category}</td>
                    </tr>
                    ${tags ? `
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">标签:</td>
                      <td style="padding: 8px 0;">${tags}</td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">联系邮箱:</td>
                      <td style="padding: 8px 0;">${contactEmail}</td>
                    </tr>
                    ${submitterName ? `
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">提交者:</td>
                      <td style="padding: 8px 0;">${submitterName}</td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">提交时间:</td>
                      <td style="padding: 8px 0;">${new Date(currentTime).toLocaleString('zh-CN')}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p style="color: #6b7280; margin-bottom: 15px;">请登录管理后台进行审核</p>
                  <a href="${request.headers.get('origin') || 'https://binnav.top'}/admin" 
                     style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    前往管理后台
                  </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                  此邮件由 BinNav 系统自动发送，请勿回复。
                </p>
              </div>
            `
          })
        });

        if (!emailResponse.ok) {
          console.error('发送邮件失败:', await emailResponse.text());
        }
      } catch (emailError) {
        console.error('邮件发送失败:', emailError);
        // 邮件发送失败不影响提交成功
      }
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
    
    // 提供更详细的错误信息
    let errorMessage = '提交失败，请稍后重试';
    
    if (error.message) {
      // 根据错误类型提供更具体的错误信息
      if (error.message.includes('GitHub')) {
        errorMessage = 'GitHub配置错误，请联系管理员';
      } else if (error.message.includes('fetch')) {
        errorMessage = '网络连接失败，请检查网络后重试';
      } else {
        errorMessage = `提交失败: ${error.message}`;
      }
    }
    
    return new Response(JSON.stringify({
      success: false,
      message: errorMessage,
      debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 