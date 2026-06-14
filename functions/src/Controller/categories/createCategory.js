import { getDb, COLLECTIONS, findOne, createDoc, snapshotToArray } from '../../db/firestore.js';

export default async function createCategory(req, res) {
  try {
    const { name, description, vehicleType, isActive, isDefault } = req.body;
    const db = getDb();

    if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Category name is required' });
    if (!vehicleType || !['MOTORCYCLE', 'CAR'].includes(vehicleType)) {
      return res.status(400).json({ success: false, error: 'Vehicle type must be either MOTORCYCLE or CAR' });
    }

    const existing = await findOne(COLLECTIONS.MODULE_CATEGORIES, 'name', name.trim());
    if (existing) return res.status(409).json({ success: false, error: 'A category with this name already exists' });

    if (isDefault) {
      const defaultSnap = await db.collection(COLLECTIONS.MODULE_CATEGORIES).where('isDefault', '==', true).get();
      const batch = db.batch();
      const ts = new Date().toISOString();
      defaultSnap.docs.forEach(d => batch.update(d.ref, { isDefault: false, updatedAt: ts }));
      await batch.commit();
    }

    const category = await createDoc(COLLECTIONS.MODULE_CATEGORIES, {
      name: name.trim(), description: description?.trim() || null, vehicleType,
      isActive: isActive !== undefined ? isActive : true,
      isDefault: isDefault || false,
      createdBy: req.user?.id || null, updatedBy: req.user?.id || null,
    });

    res.status(201).json({ success: true, message: 'Category created successfully', data: { ...category, modules: [] } });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, error: 'Failed to create category', message: error.message });
  }
}
