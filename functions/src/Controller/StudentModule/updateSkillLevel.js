import { getDb, COLLECTIONS } from '../../db/firestore.js';

export default async function updateSkillLevel(req, res) {
  try {
    const userId = req.user.id;
    const { skillLevel } = req.body;
    const db = getDb();

    const valid = ['Beginner', 'Intermediate', 'Expert'];
    if (!skillLevel || !valid.includes(skillLevel)) {
      return res.status(400).json({ success: false, error: 'Invalid skill level. Must be Beginner, Intermediate, or Expert' });
    }

    const smSnap = await db.collection(COLLECTIONS.STUDENT_MODULES).where('userId', '==', userId).get();
    const ts = new Date().toISOString();
    const batch = db.batch();
    smSnap.docs.forEach(d => batch.update(d.ref, { skillLevel, updatedAt: ts }));
    await batch.commit();

    res.status(200).json({ success: true, message: `Skill level updated to ${skillLevel}`, data: { skillLevel, modulesUpdated: smSnap.size } });
  } catch (error) {
    console.error('Error updating skill level:', error);
    res.status(500).json({ success: false, error: 'Failed to update skill level', message: error.message });
  }
}
