/**
 * Email Service Utility
 * Sends emails using Nodemailer with customizable templates
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
// Use port 465 (SSL) as fallback for cloud platforms that block port 587
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465, // Default to 465 for better cloud compatibility
  secure: process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error);
    console.log('💡 Tip: If deployed on Render/Heroku, try setting SMTP_PORT=465 in environment variables');
    console.log('💡 Or consider using SendGrid/Resend for cloud deployments');
  } else {
    console.log('✅ Email service ready');
    console.log(`📧 Using SMTP: ${process.env.EMAIL_USER} on port ${process.env.SMTP_PORT || 465}`);
  }
});

/**
 * Email Templates
 * Add new templates here as needed
 */
const emailTemplates = {
  /**
   * Forgot Password Email Template
   */
  forgotPassword: (data) => ({
    subject: 'Reset Your Password - RiderMind',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .code { background: #e5e7eb; padding: 15px; border-radius: 6px; font-size: 24px; letter-spacing: 5px; text-align: center; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name || 'User'},</h2>
            <p>We received a request to reset your password for your RiderMind account.</p>
            
            <p>Click the button below to reset your password:</p>
            <a href="${data.resetLink}" class="button">Reset Password</a>
            
            
            <p><strong>This link will expire in ${data.expiresIn || '1 hour'}.</strong></p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 14px;">For security reasons, never share this link or code with anyone.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} RiderMind. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request
      
      Hello ${data.name || 'User'},
      
      We received a request to reset your password for your RiderMind account.
      
      Reset Link: ${data.resetLink}
      ${data.resetToken ? `\nOr use this reset code: ${data.resetToken}` : ''}
      
      This link will expire in ${data.expiresIn || '1 hour'}.
      
      If you didn't request a password reset, please ignore this email.
      
      © ${new Date().getFullYear()} RiderMind
    `,
  }),

  /**
   * General Notification Email Template
   */
  notification: (data) => ({
    subject: data.subject || 'Notification from RiderMind',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .badge { display: inline-block; padding: 6px 12px; background: #10b981; color: white; border-radius: 12px; font-size: 12px; font-weight: bold; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${data.icon || '🔔'} ${data.title || 'Notification'}</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name || 'User'},</h2>
            ${data.badge ? `<span class="badge">${data.badge}</span>` : ''}
            <p>${data.message}</p>
            
            ${data.actionUrl ? `
              <a href="${data.actionUrl}" class="button">${data.actionText || 'View Details'}</a>
            ` : ''}
            
            ${data.additionalInfo ? `
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #666; font-size: 14px;">${data.additionalInfo}</p>
            ` : ''}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} RiderMind. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      ${data.title || 'Notification'}
      
      Hello ${data.name || 'User'},
      
      ${data.message}
      
      ${data.actionUrl ? `View: ${data.actionUrl}` : ''}
      
      © ${new Date().getFullYear()} RiderMind
    `,
  }),

  /**
   * Registration Rejected Email Template
   */
  registrationRejected: (data) => ({
    subject: 'Registration Status - RiderMind',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .reason-box { background: white; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Registration Not Approved</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name || 'Applicant'},</h2>
            
            <div class="alert">
              <strong>Registration Status:</strong> Not Approved
            </div>
            
            <p>Thank you for your interest in joining RiderMind. After careful review of your registration application, we regret to inform you that we are unable to approve your account at this time.</p>
            
            ${data.reason ? `
              <div class="reason-box">
                <h3 style="margin-top: 0; color: #dc2626;">Reason for Rejection:</h3>
                <p style="margin-bottom: 0;">${data.reason}</p>
              </div>
            ` : ''}
            
            ${data.allowReapply !== false ? `
              <p><strong>What's Next?</strong></p>
              <p>You may submit a new registration application after addressing the issues mentioned above. Please ensure all information provided is accurate and complete.</p>
              <a href="${data.registrationUrl || process.env.APP_URL + '/register'}" class="button">Apply Again</a>
            ` : ''}
            
            <p>If you have any questions or believe this decision was made in error, please contact our support team at <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}">${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}</a>.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #666; font-size: 14px;">We appreciate your understanding and interest in RiderMind.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} RiderMind. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Registration Not Approved
      
      Hello ${data.name || 'Applicant'},
      
      Thank you for your interest in joining RiderMind. We regret to inform you that we are unable to approve your account at this time.
      
      ${data.reason ? `Reason: ${data.reason}` : ''}
      
      ${data.allowReapply !== false ? `You may submit a new registration application.` : ''}
      
      If you have questions, contact: ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}
      
      © ${new Date().getFullYear()} RiderMind
    `,
  }),
};

/**
 * Send Email
 * @param {string} to - Recipient email address
 * @param {string} template - Template name ('forgotPassword', 'notification', 'registrationRejected')
 * @param {object} data - Template data
 * @returns {Promise<object>} Send result
 */
export async function sendEmail(to, template, data = {}) {
  try {
    // Validate template exists
    if (!emailTemplates[template]) {
      throw new Error(`Email template "${template}" not found`);
    }

    // Get template content
    const { subject, html, text } = emailTemplates[template](data);

    // Email options
    const mailOptions = {
      from: `"RiderMind" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent to ${to} (Template: ${template})`);
    return {
      success: true,
      messageId: info.messageId,
      template,
      recipient: to,
    };
  } catch (error) {
    console.error(`❌ Email send failed to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
      template,
      recipient: to,
    };
  }
}

/**
 * Send Multiple Emails
 * @param {Array<{to: string, template: string, data: object}>} emails - Array of email configs
 * @returns {Promise<Array>} Results for each email
 */
export async function sendBulkEmails(emails) {
  const results = [];
  
  for (const email of emails) {
    const result = await sendEmail(email.to, email.template, email.data);
    results.push(result);
  }
  
  return results;
}

/**
 * Add Custom Email Template
 * @param {string} name - Template name
 * @param {Function} templateFunction - Function that returns {subject, html, text}
 */
export function addEmailTemplate(name, templateFunction) {
  if (emailTemplates[name]) {
    console.warn(`⚠️ Email template "${name}" already exists. Overwriting...`);
  }
  emailTemplates[name] = templateFunction;
  console.log(`✅ Email template "${name}" registered`);
}

/**
 * Get Available Templates
 * @returns {Array<string>} List of template names
 */
export function getAvailableTemplates() {
  return Object.keys(emailTemplates);
}

export default {
  sendEmail,
  sendBulkEmails,
  addEmailTemplate,
  getAvailableTemplates,
};
