import { getDb, COLLECTIONS, docToObject } from '../../db/firestore.js';

export default async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const db = getDb();

    const catDoc = await db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(id).get();
    const category = docToObject(catDoc);
    if (!category) return res.status(404).json({ success: false, error: 'Category not found' });

    if (category.isDefault) return res.status(400).json({ success: false, error: 'Cannot delete the default category' });

    const catModSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', id).get();
    const batch = db.batch();
    catModSnap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(id));
    await batch.commit();

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, error: 'Failed to delete category', message: error.message });
  }
}
