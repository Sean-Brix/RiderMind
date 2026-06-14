import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function getFAQById(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();
    const doc = await db.collection(COLLECTIONS.FAQS).doc(id).get();
    const faq = docToObject(doc);
    if (!faq) return res.status(404).json({ success: false, error: 'FAQ not found' });
    res.status(200).json({ success: true, data: faq });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch FAQ', message: error.message });
  }
}
