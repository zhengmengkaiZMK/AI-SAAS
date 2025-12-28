import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/smtp-mailer";

/**
 * Contact Form Email API
 * 发送联系表单信息到指定邮箱
 */

// 邮件配置
const RECIPIENT_EMAIL = "372509446@qq.com";

// 邮件模板生成函数
function generateEmailTemplate(data: {
  name: string;
  email: string;
  company: string;
  message: string;
}) {
  const timestamp = new Date().toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
  });

  return {
    subject: `[SaltMine Contact] 来自 ${data.name} 的咨询`,
    html: `
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
            .action-button {
              display: inline-block;
              padding: 12px 24px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 6px;
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
            
            <div style="text-align: center;">
              <a href="mailto:${data.email}" class="action-button">
                📧 回复客户
              </a>
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
    `,
    text: `
SaltMine 新的联系表单提交
======================

姓名: ${data.name}
邮箱: ${data.email}
公司: ${data.company}

咨询内容:
${data.message}

---
提交时间: ${timestamp}
此邮件由 SaltMine 联系表单自动生成

回复客户: ${data.email}
    `,
  };
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { name, email, company, message } = body;

    // 验证必填字段
    if (!name || !email || !company || !message) {
      return NextResponse.json(
        { error: "所有字段都是必填的 / All fields are required" },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "邮箱格式不正确 / Invalid email format" },
        { status: 400 }
      );
    }

    // 生成邮件内容
    const emailContent = generateEmailTemplate({ name, email, company, message });

    // 发送邮件
    const emailSent = await sendEmail({
      to: RECIPIENT_EMAIL,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    // 记录到控制台（便于调试）
    console.log("=".repeat(80));
    console.log("📧 新的联系表单提交");
    console.log("=".repeat(80));
    console.log("收件人:", RECIPIENT_EMAIL);
    console.log("发件人:", email);
    console.log("姓名:", name);
    console.log("公司:", company);
    console.log("邮件发送状态:", emailSent ? "✅ 成功" : "❌ 失败");
    console.log("=".repeat(80));

    if (emailSent) {
      return NextResponse.json(
        {
          success: true,
          message: "感谢您的咨询，我们会尽快回复！/ Thank you for contacting us, we will reply soon!",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "邮件发送失败，请稍后重试 / Email sending failed, please try again later" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "发送失败，请稍后重试 / Failed to send, please try again later" },
      { status: 500 }
    );
  }
}
