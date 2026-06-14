import { getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';

export default async function getAllFAQs(req, res) {
  try {
    const db = getDb();
    const snap = await db.collection(COLLECTIONS.FAQS).orderBy('category', 'asc').get();
    const faqs = snapshotToArray(snap);
    res.status(200).json({ success: true, data: faqs });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch FAQs', message: error.message });
  }
}
