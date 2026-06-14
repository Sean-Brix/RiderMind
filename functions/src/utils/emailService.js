import nodemailer from 'nodemailer';

const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: { rejectUnauthorized: false, ciphers: 'SSLv3' },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
  } else {
    console.log(`✅ Email service ready (port ${smtpPort})`);
  }
});

const emailTemplates = {
  forgotPassword: (data) => ({
    subject: 'Reset Your Password - RiderMind',
    html: `<!DOCTYPE html><html><head><style>
      body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
      .container{max-width:600px;margin:0 auto;padding:20px}
      .header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;text-align:center;border-radius:8px 8px 0 0}
      .content{background:#f9fafb;padding:30px;border-radius:0 0 8px 8px}
      .button{display:inline-block;padding:12px 30px;background:#667eea;color:white;text-decoration:none;border-radius:6px;margin:20px 0}
      .footer{text-align:center;margin-top:30px;color:#666;font-size:12px}
    </style></head><body>
      <div class="container">
        <div class="header"><h1>🔐 Password Reset Request</h1></div>
        <div class="content">
          <h2>Hello ${data.name || 'User'},</h2>
          <p>We received a request to reset your password for your RiderMind account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${data.resetLink}" class="button">Reset Password</a>
          <p><strong>This link will expire in ${data.expiresIn || '1 hour'}.</strong></p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} RiderMind. All rights reserved.</p></div>
      </div>
    </body></html>`,
    text: `Password Reset\n\nHello ${data.name || 'User'},\n\nReset Link: ${data.resetLink}\n\nThis link will expire in ${data.expiresIn || '1 hour'}.\n\n© ${new Date().getFullYear()} RiderMind`,
  }),

  notification: (data) => ({
    subject: data.subject || 'Notification from RiderMind',
    html: `<!DOCTYPE html><html><head><style>
      body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
      .container{max-width:600px;margin:0 auto;padding:20px}
      .header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;text-align:center;border-radius:8px 8px 0 0}
      .content{background:#f9fafb;padding:30px;border-radius:0 0 8px 8px}
      .button{display:inline-block;padding:12px 30px;background:#667eea;color:white;text-decoration:none;border-radius:6px;margin:20px 0}
      .footer{text-align:center;margin-top:30px;color:#666;font-size:12px}
    </style></head><body>
      <div class="container">
        <div class="header"><h1>${data.icon || '🔔'} ${data.title || 'Notification'}</h1></div>
        <div class="content">
          <h2>Hello ${data.name || 'User'},</h2>
          <p>${data.message}</p>
          ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">${data.actionText || 'View Details'}</a>` : ''}
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} RiderMind. All rights reserved.</p></div>
      </div>
    </body></html>`,
    text: `${data.title || 'Notification'}\n\nHello ${data.name || 'User'},\n\n${data.message}\n\n${data.actionUrl ? `View: ${data.actionUrl}` : ''}\n\n© ${new Date().getFullYear()} RiderMind`,
  }),

  registrationRejected: (data) => ({
    subject: 'Registration Status - RiderMind',
    html: `<!DOCTYPE html><html><head><style>
      body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
      .container{max-width:600px;margin:0 auto;padding:20px}
      .header{background:linear-gradient(135deg,#ef4444 0%,#dc2626 100%);color:white;padding:30px;text-align:center;border-radius:8px 8px 0 0}
      .content{background:#f9fafb;padding:30px;border-radius:0 0 8px 8px}
      .button{display:inline-block;padding:12px 30px;background:#667eea;color:white;text-decoration:none;border-radius:6px;margin:20px 0}
      .footer{text-align:center;margin-top:30px;color:#666;font-size:12px}
      .alert{background:#fee2e2;border-left:4px solid #ef4444;padding:15px;border-radius:6px;margin:20px 0}
      .reason-box{background:white;padding:20px;border-radius:6px;border:1px solid #e5e7eb;margin:20px 0}
    </style></head><body>
      <div class="container">
        <div class="header"><h1>❌ Registration Not Approved</h1></div>
        <div class="content">
          <h2>Hello ${data.name || 'Applicant'},</h2>
          <div class="alert"><strong>Registration Status:</strong> Not Approved</div>
          <p>Thank you for your interest in joining RiderMind. After careful review, we are unable to approve your account at this time.</p>
          ${data.reason ? `<div class="reason-box"><h3 style="margin-top:0;color:#dc2626;">Reason for Rejection:</h3><p style="margin-bottom:0">${data.reason}</p></div>` : ''}
          ${data.allowReapply !== false ? `<p>You may submit a new registration application after addressing the issues mentioned above.</p><a href="${data.registrationUrl || (process.env.APP_URL + '/register')}" class="button">Apply Again</a>` : ''}
          <p>Questions? Contact <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}">${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}</a>.</p>
        </div>
        <div class="footer"><p>© ${new Date().getFullYear()} RiderMind. All rights reserved.</p></div>
      </div>
    </body></html>`,
    text: `Registration Not Approved\n\nHello ${data.name || 'Applicant'},\n\n${data.reason ? 'Reason: ' + data.reason : ''}\n\n© ${new Date().getFullYear()} RiderMind`,
  }),
};

export async function sendEmail(to, template, data = {}) {
  try {
    if (!emailTemplates[template]) {
      throw new Error(`Email template "${template}" not found`);
    }
    const { subject, html, text } = emailTemplates[template](data);
    const info = await transporter.sendMail({
      from: `"RiderMind" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    });
    console.log(`✅ Email sent to ${to} (Template: ${template})`);
    return { success: true, messageId: info.messageId, template, recipient: to };
  } catch (error) {
    console.error(`❌ Email send failed to ${to}:`, error.message);
    return { success: false, error: error.message, template, recipient: to };
  }
}

export default { sendEmail };
