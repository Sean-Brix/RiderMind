import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

const VALID_CATEGORIES = ['General', 'System', 'Module', 'Quiz'];

export default async function updateFAQ(req, res) {
  try {
    const { id } = req.params;
    const { question, answer, category } = req.body;
    const db = getDb();

    const doc = await db.collection(COLLECTIONS.FAQS).doc(id).get();
    if (!docToObject(doc)) return res.status(404).json({ success: false, error: 'FAQ not found' });

    if (category && !VALID_CATEGORIES.includes(category)) return res.status(400).json({ success: false, error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });

    const data = { updatedAt: new Date().toISOString() };
    if (question !== undefined) data.question = question;
    if (answer !== undefined) data.answer = answer;
    if (category !== undefined) data.category = category;

    await db.collection(COLLECTIONS.FAQS).doc(id).update(data);
    const updated = docToObject(await db.collection(COLLECTIONS.FAQS).doc(id).get());
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ success: false, error: 'Failed to update FAQ', message: error.message });
  }
}
