import bcrypt from 'bcryptjs';
import { getDb, COLLECTIONS, snapshotToArray, updateDoc } from '../../db/firestore.js';

export async function validateResetToken(req, res) {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    const db = getDb();
    const snapshot = await db.collection(COLLECTIONS.USERS)
      .where('resetToken', '==', token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    return res.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Validate reset token error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const db = getDb();
    const snapshot = await db.collection(COLLECTIONS.USERS)
      .where('resetToken', '==', token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const userDoc = snapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() };

    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await updateDoc(COLLECTIONS.USERS, user.id, {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    });

    console.log(`✅ Password reset successful for user ${user.email}`);
    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
