import { getDb, COLLECTIONS } from '../../db/firestore.js';

const VALID_CATEGORIES = ['General', 'System', 'Module', 'Quiz'];

export default async function createFAQ(req, res) {
  try {
    const { question, answer, category } = req.body;
    if (!question || !answer || !category) return res.status(400).json({ success: false, error: 'question, answer, and category are required' });
    if (!VALID_CATEGORIES.includes(category)) return res.status(400).json({ success: false, error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });

    const db = getDb();
    const ts = new Date().toISOString();
    const ref = db.collection(COLLECTIONS.FAQS).doc();
    const data = { question, answer, category, createdAt: ts, updatedAt: ts };
    await ref.set(data);
    res.status(201).json({ success: true, data: { id: ref.id, ...data } });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ success: false, error: 'Failed to create FAQ', message: error.message });
  }
}
