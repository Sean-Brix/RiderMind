import { getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';

const VALID_CATEGORIES = ['General', 'System', 'Module', 'Quiz'];

export default async function getFAQsByCategory(req, res) {
  try {
    const { category } = req.params;
    if (!VALID_CATEGORIES.includes(category)) return res.status(400).json({ success: false, error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });

    const db = getDb();
    const snap = await db.collection(COLLECTIONS.FAQS).where('category', '==', category).get();
    res.status(200).json({ success: true, data: snapshotToArray(snap) });
  } catch (error) {
    console.error('Error fetching FAQs by category:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch FAQs', message: error.message });
  }
}
