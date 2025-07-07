/**
 * EdgeOne Functions - 调试测试
 * 路由: /api/debug-test
 * 用途: 测试Functions服务和API端点
 */

// 处理OPTIONS请求（CORS预检）
export async function onRequestOptions({ request }) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

// 处理GET请求
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const testType = url.searchParams.get('test') || 'basic';

  try {
    let result = {
      status: 'success',
      timestamp: new Date().toISOString(),
      testType: testType,
      url: request.url,
      method: request.method
    };

    if (testType === 'submit-website') {
      // 测试submit-website API的可用性
      result.submitWebsiteTest = {
        message: '测试submit-website API可用性',
        expected_method: 'POST',
        expected_content_type: 'application/json',
        env_check: {
          hasGithubToken: !!env.GITHUB_TOKEN,
          hasGithubRepo: !!env.GITHUB_REPO,
          repoName: env.GITHUB_REPO || 'not configured'
        }
      };
    } else if (testType === 'email') {
      // 测试邮件相关环境变量
      result.emailTest = {
        message: '邮件环境变量检查',
        environment_variables: {
          RESEND_API_KEY: {
            exists: !!env.RESEND_API_KEY,
            length: env.RESEND_API_KEY ? env.RESEND_API_KEY.length : 0,
            status: !!env.RESEND_API_KEY ? '✅ 已配置' : '❌ 未配置'
          },
          ADMIN_EMAIL: {
            exists: !!env.ADMIN_EMAIL,
            value: env.ADMIN_EMAIL ? env.ADMIN_EMAIL : 'not configured',
            length: env.ADMIN_EMAIL ? env.ADMIN_EMAIL.length : 0,
            status: !!env.ADMIN_EMAIL ? '✅ 已配置' : '❌ 未配置'
          },
          RESEND_DOMAIN: {
            exists: !!env.RESEND_DOMAIN,
            value: env.RESEND_DOMAIN ? `${env.RESEND_DOMAIN} (将使用: noreply@${env.RESEND_DOMAIN})` : 'not configured (using default: onboarding@resend.dev)',
            length: env.RESEND_DOMAIN ? env.RESEND_DOMAIN.length : 0,
            status: !!env.RESEND_DOMAIN ? '✅ 已配置' : '⚠️ 未配置（使用默认域名）'
          }
        },
        all_env_keys: Object.keys(env),
        email_functionality: {
          can_send_submitter_email: !!env.RESEND_API_KEY,
          can_send_admin_email: !!(env.RESEND_API_KEY && env.ADMIN_EMAIL),
          recommendation: !env.ADMIN_EMAIL ? '请在EdgeOne控制台配置 ADMIN_EMAIL 环境变量' : '邮件配置正常'
        }
      };
    } else {
      // 基础测试
      result.basic = {
        message: 'EdgeOne Functions 正常运行',
        functions_available: [
          '/api/health',
          '/api/verify-password',
          '/api/get-config',
          '/api/update-config',
          '/api/submit-website',
          '/api/process-website-submission',
          '/api/upload-icon',
          '/api/delete-icon',
          '/api/list-icons',
          '/api/debug-test',
          '/api/get-version'
        ]
      };
    }

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message,
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

// 处理POST请求 - 用于测试POST方法
export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    
    // 测试管理员邮件发送
    if (body.test === 'admin-email') {
      const { RESEND_API_KEY, ADMIN_EMAIL, RESEND_DOMAIN } = env;
      
      if (!RESEND_API_KEY) {
        return new Response(JSON.stringify({
          status: 'error',
          message: 'RESEND_API_KEY未配置'
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      if (!ADMIN_EMAIL) {
        return new Response(JSON.stringify({
          status: 'error',
          message: 'ADMIN_EMAIL未配置'
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      try {
        const testEmailPayload = {
          from: RESEND_DOMAIN ? `noreply@${RESEND_DOMAIN}` : 'onboarding@resend.dev',
          to: [ADMIN_EMAIL],
          subject: '[BinNav] 管理员邮件测试',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">🧪 邮件系统测试</h1>
              </div>
              
              <div style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                  这是一封测试邮件，用于验证管理员邮件通知功能是否正常工作。
                </p>
                
                <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h3 style="margin-top: 0; color: #2563eb;">测试信息</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #6b7280; width: 120px;">测试时间:</td>
                      <td style="padding: 8px 0;">${new Date().toLocaleString('zh-CN')}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">收件人:</td>
                      <td style="padding: 8px 0;">${ADMIN_EMAIL}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">发送方式:</td>
                      <td style="padding: 8px 0;">EdgeOne Functions + Resend API</td>
                    </tr>
                  </table>
                </div>
                
                <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #065f46;">
                    <strong>✅ 如果您收到这封邮件，说明管理员邮件通知功能正常！</strong><br>
                    如果在站点提交时没有收到通知邮件，请检查垃圾邮件箱或联系技术支持。
                  </p>
                </div>
              </div>
              
              <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                此邮件由 BinNav 邮件测试系统发送。
              </div>
            </div>
          `
        };
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testEmailPayload)
        });
        
        const responseText = await emailResponse.text();
        
        if (emailResponse.ok) {
          let emailId = null;
          try {
            const responseData = JSON.parse(responseText);
            emailId = responseData.id;
          } catch (e) {
            // 忽略解析错误
          }
          
          return new Response(JSON.stringify({
            status: 'success',
            message: '管理员测试邮件发送成功',
            email_details: {
              to: ADMIN_EMAIL,
              from: RESEND_DOMAIN ? `noreply@${RESEND_DOMAIN}` : 'onboarding@resend.dev',
              subject: '[BinNav] 管理员邮件测试',
              email_id: emailId,
              response_status: emailResponse.status,
              timestamp: new Date().toISOString()
            },
            next_steps: [
              '1. 检查管理员邮箱: ' + ADMIN_EMAIL,
              '2. 如果没收到，检查垃圾邮件箱',
              '3. 确认邮箱地址是否正确',
              '4. 等待几分钟，邮件可能有延迟'
            ]
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } else {
          return new Response(JSON.stringify({
            status: 'error',
            message: '管理员测试邮件发送失败',
            error_details: {
              response_status: emailResponse.status,
              response_text: responseText,
              to: ADMIN_EMAIL,
              timestamp: new Date().toISOString()
            }
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        
      } catch (emailError) {
        return new Response(JSON.stringify({
          status: 'error',
          message: '邮件发送异常',
          error_details: {
            name: emailError.name,
            message: emailError.message,
            to: ADMIN_EMAIL,
            timestamp: new Date().toISOString()
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
    
    // 原有的POST测试功能
    return new Response(JSON.stringify({
      status: 'success',
      message: 'POST请求测试成功',
      timestamp: new Date().toISOString(),
      receivedData: body,
      method: request.method
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: 'POST请求测试失败: ' + error.message,
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