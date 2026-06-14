import crypto from 'crypto';
import { findOne, updateDoc, COLLECTIONS } from '../../db/firestore.js';
import { sendEmail } from '../../utils/emailService.js';

export default async function forgotPassword(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await findOne(COLLECTIONS.USERS, 'email', email);
    if (!user) {
      // Don't reveal whether user exists
      return res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await updateDoc(COLLECTIONS.USERS, user.id, { resetToken, resetTokenExpiry });

    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`;
    const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;

    await sendEmail(email, 'forgotPassword', {
      name: displayName,
      resetLink,
      expiresIn: '1 hour',
    });

    return res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
