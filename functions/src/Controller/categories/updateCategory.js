import { getDb, COLLECTIONS, docToObject, updateDoc, snapshotToArray } from '../../db/firestore.js';

export default async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description, vehicleType, isActive, isDefault } = req.body;
    const db = getDb();

    const catDoc = await db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(id).get();
    const existing = docToObject(catDoc);
    if (!existing) return res.status(404).json({ success: false, error: 'Category not found' });

    if (name && name.trim()) {
      const dupSnap = await db.collection(COLLECTIONS.MODULE_CATEGORIES).where('name', '==', name.trim()).get();
      const dup = dupSnap.docs.find(d => d.id !== id);
      if (dup) return res.status(409).json({ success: false, error: 'A category with this name already exists' });
    }

    if (vehicleType && !['MOTORCYCLE', 'CAR'].includes(vehicleType)) {
      return res.status(400).json({ success: false, error: 'Vehicle type must be either MOTORCYCLE or CAR' });
    }

    if (isDefault && !existing.isDefault) {
      const defaultSnap = await db.collection(COLLECTIONS.MODULE_CATEGORIES).where('isDefault', '==', true).get();
      const batch = db.batch();
      const ts = new Date().toISOString();
      defaultSnap.docs.filter(d => d.id !== id).forEach(d => batch.update(d.ref, { isDefault: false, updatedAt: ts }));
      await batch.commit();
    }

    const data = { updatedBy: req.user?.id || null };
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description?.trim() || null;
    if (vehicleType !== undefined) data.vehicleType = vehicleType;
    if (isActive !== undefined) data.isActive = isActive;
    if (isDefault !== undefined) data.isDefault = isDefault;

    await updateDoc(COLLECTIONS.MODULE_CATEGORIES, id, data);

    const catModSnap = await db.collection(COLLECTIONS.MODULE_CATEGORY_MODULES).where('categoryId', '==', id).orderBy('position', 'asc').get();
    const catMods = snapshotToArray(catModSnap);
    const modSnap = await db.collection(COLLECTIONS.MODULES).get();
    const modMap = {};
    modSnap.docs.forEach(d => { modMap[d.id] = { id: d.id, ...d.data() }; });

    const modules = catMods.map(cm => ({
      ...cm,
      module: modMap[cm.moduleId] ? { id: modMap[cm.moduleId].id, title: modMap[cm.moduleId].title, description: modMap[cm.moduleId].description, isActive: modMap[cm.moduleId].isActive } : null
    }));

    const updated = docToObject(await db.collection(COLLECTIONS.MODULE_CATEGORIES).doc(id).get());
    res.status(200).json({ success: true, message: 'Category updated successfully', data: { ...updated, modules } });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, error: 'Failed to update category', message: error.message });
  }
}
