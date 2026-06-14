import { sendEmail } from '../../utils/emailService.js';
import { getDb, COLLECTIONS, findOne } from '../../db/firestore.js';
import crypto from 'crypto';

export default async function sendTestEmail(req, res) {
  try {
    const { template, to, data } = req.body;
    if (!template) return res.status(400).json({ error: 'Template name is required' });
    if (!to) return res.status(400).json({ error: 'Recipient email is required' });

    let emailData = data || {};

    if (template === 'forgotPassword') {
      const db = getDb();
      const user = await findOne(COLLECTIONS.USERS, 'email', to);
      if (user) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString();
        await db.collection(COLLECTIONS.USERS).doc(user.id).update({ resetToken, resetTokenExpiry, updatedAt: new Date().toISOString() });
        emailData = { ...emailData, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User', resetLink: `${process.env.APP_URL}/reset-password?token=${resetToken}`, resetToken, expiresIn: '1 hour' };
      }
    }

    const result = await sendEmail(to, template, emailData);
    if (result.success) {
      return res.status(200).json({ message: 'Test email sent successfully', template: result.template, recipient: result.recipient, messageId: result.messageId });
    }
    return res.status(500).json({ error: 'Failed to send email', details: result.error });
  } catch (error) {
    console.error('Send test email error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
