/**
 * Forgot Password Controller
 * Handles password reset request and sends email
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendEmail } from '../../utils/emailService.js';

const prisma = new PrismaClient();

/**
 * POST /api/auth/forgot-password
 * Request a password reset email
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security, always return success even if user doesn't exist
    if (!user) {
      return res.status(200).json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send email
    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';

    const emailResult = await sendEmail(user.email, 'forgotPassword', {
      name: fullName,
      resetLink,
      resetToken: resetToken, // Full token for manual entry
      expiresIn: '1 hour',
    });

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    console.log(`✅ Password reset email sent to ${user.email}`);

    return res.status(200).json({
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}

export default forgotPassword;
