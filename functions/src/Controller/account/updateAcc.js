import bcrypt from 'bcryptjs';
import { findById, findOne, updateDoc, COLLECTIONS } from '../../db/firestore.js';

export default async function updateAcc(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Invalid id' });

    const authenticatedUserId = req.user.id;
    if (authenticatedUserId !== id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const body = req.body || {};
    const data = { ...body };

    if (body.email) {
      const existing = await findOne(COLLECTIONS.USERS, 'email', body.email);
      if (existing && existing.id !== id) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    if (body.password) {
      data.passwordHash = await bcrypt.hash(body.password, 10);
      delete data.password;
    }

    if (body.weight != null) data.weight = Number(body.weight);
    if (body.height != null) data.height = Number(body.height);

    const toNull = v => (!v || v === '' || v === 'null') ? null : v;
    if (body.nationality !== undefined) data.nationality = toNull(body.nationality);
    if (body.civil_status !== undefined) data.civil_status = toNull(body.civil_status);
    if (body.student_type !== undefined) data.student_type = toNull(body.student_type);

    if (body.role && !['ADMIN', 'USER'].includes(body.role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await updateDoc(COLLECTIONS.USERS, id, data);
    const updated = await findById(COLLECTIONS.USERS, id);
    const displayName = [updated.first_name, updated.last_name, updated.name_extension].filter(Boolean).join(' ') || updated.email;
    return res.json({ user: { ...updated, displayName } });
  } catch (err) {
    console.error('Update account error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
