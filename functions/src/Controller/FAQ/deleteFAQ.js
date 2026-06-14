import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function deleteFAQ(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();
    const doc = await db.collection(COLLECTIONS.FAQS).doc(id).get();
    if (!docToObject(doc)) return res.status(404).json({ success: false, error: 'FAQ not found' });
    await db.collection(COLLECTIONS.FAQS).doc(id).delete();
    res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ success: false, error: 'Failed to delete FAQ', message: error.message });
  }
}
