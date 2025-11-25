/**
 * Send Test Email Controller
 * Development endpoint for testing email templates
 */

import { sendEmail } from '../../utils/emailService.js';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * POST /api/dev/send-test-email
 * Send a test email using one of the available templates
 * For forgotPassword template, creates a real reset token in the database
 */
async function sendTestEmail(req, res) {
  try {
    const { template, to, data } = req.body;

    // Validate request
    if (!template) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    if (!to) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    let emailData = data || {};

    // Special handling for forgotPassword template - create real token
    if (template === 'forgotPassword') {
      const user = await prisma.user.findUnique({
        where: { email: to },
      });

      if (user) {
        // Generate real reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Save to database
        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetToken,
            resetTokenExpiry,
          },
        });

        // Override data with real token
        emailData = {
          ...emailData,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
          resetLink: `${process.env.APP_URL}/reset-password?token=${resetToken}`,
          resetToken: resetToken, // Full token for manual entry
          expiresIn: '1 hour',
        };

        console.log(`🔑 Generated real reset token for ${to}: ${resetToken.substring(0, 10)}...`);
      }
    }

    // Send email
    const result = await sendEmail(to, template, emailData);

    if (result.success) {
      return res.status(200).json({
        message: 'Test email sent successfully',
        template: result.template,
        recipient: result.recipient,
        messageId: result.messageId,
        note: template === 'forgotPassword' ? 'Real reset token created and saved to database' : undefined,
      });
    } else {
      return res.status(500).json({
        error: 'Failed to send email',
        details: result.error,
      });
    }
  } catch (error) {
    console.error('Send test email error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}

export default sendTestEmail;
