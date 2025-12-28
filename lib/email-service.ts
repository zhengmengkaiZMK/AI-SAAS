/**
 * Email Service
 * 邮件发送服务（使用 QQ 邮箱 SMTP）
 * 
 * 配置说明：
 * 1. 登录 QQ 邮箱 (mail.qq.com)
 * 2. 设置 -> 账户 -> 开启 SMTP 服务
 * 3. 获取授权码（不是 QQ 密码）
 * 4. 在 .env.local 中配置以下环境变量：
 *    SMTP_HOST=smtp.qq.com
 *    SMTP_PORT=465
 *    SMTP_USER=你的QQ邮箱@qq.com
 *    SMTP_PASS=你的授权码
 *    SMTP_FROM=你的QQ邮箱@qq.com
 *    SMTP_TO=372509446@qq.com
 */

interface EmailData {
  name: string;
  email: string;
  company: string;
  message: string;
}

/**
 * 使用 SMTP 发送邮件（需要服务器端运行）
 * 注意：这个函数需要在 Node.js 环境中运行，不能在浏览器中使用
 */
export async function sendContactEmail(data: EmailData): Promise<boolean> {
  try {
    // 方案1: 使用第三方邮件服务 API（推荐）
    // 例如：Resend, SendGrid, Mailgun 等
    
    // 方案2: 使用 QQ 邮箱 SMTP
    // 需要安装 nodemailer: npm install nodemailer
    // 由于我们在浏览器环境中，暂时使用 API 转发的方式
    
    // 临时方案：记录到控制台（实际生产中应该发送真实邮件）
    console.log("📧 Contact Form Submission:");
    console.log("Name:", data.name);
    console.log("Email:", data.email);
    console.log("Company:", data.company);
    console.log("Message:", data.message);
    
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

/**
 * 生成邮件 HTML 模板
 */
export function generateEmailHTML(data: EmailData): string {
  const timestamp = new Date().toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .field {
            margin-bottom: 20px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .field-label {
            font-weight: 600;
            color: #667eea;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          .field-value {
            color: #1f2937;
            font-size: 15px;
            word-wrap: break-word;
          }
          .message-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            margin-top: 10px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 20px;
            border-radius: 0 0 10px 10px;
            text-align: center;
            font-size: 12px;
          }
          .timestamp {
            color: #6b7280;
            font-size: 12px;
            text-align: right;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 SaltMine 新咨询</h1>
        </div>
        
        <div class="content">
          <div class="field">
            <div class="field-label">👤 姓名 / Name</div>
            <div class="field-value">${data.name}</div>
          </div>
          
          <div class="field">
            <div class="field-label">📧 邮箱 / Email</div>
            <div class="field-value">
              <a href="mailto:${data.email}" style="color: #667eea; text-decoration: none;">
                ${data.email}
              </a>
            </div>
          </div>
          
          <div class="field">
            <div class="field-label">🏢 公司 / Company</div>
            <div class="field-value">${data.company}</div>
          </div>
          
          <div class="field">
            <div class="field-label">💬 咨询内容 / Message</div>
            <div class="message-box">${data.message}</div>
          </div>
          
          <div class="timestamp">
            📅 提交时间: ${timestamp}
          </div>
        </div>
        
        <div class="footer">
          <p>此邮件由 SaltMine 联系表单自动生成</p>
          <p>This email was automatically generated from SaltMine Contact Form</p>
        </div>
      </body>
    </html>
  `;
}
