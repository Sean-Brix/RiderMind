import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function duplicateModule(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const db = getDb();

    const origDoc = await db.collection(COLLECTIONS.MODULES).doc(id).get();
    const original = docToObject(origDoc);
    if (!original) return res.status(404).json({ success: false, error: 'Module not found' });

    const [objSnap, slideSnap] = await Promise.all([
      db.collection(COLLECTIONS.MODULE_OBJECTIVES).where('moduleId', '==', id).orderBy('position', 'asc').get(),
      db.collection(COLLECTIONS.MODULE_SLIDES).where('moduleId', '==', id).orderBy('position', 'asc').get(),
    ]);

    const objectives = snapshotToArray(objSnap);
    const slides = snapshotToArray(slideSnap);

    const ts = new Date().toISOString();
    const newModRef = db.collection(COLLECTIONS.MODULES).doc();
    const batch = db.batch();

    const newModData = {
      title: `${original.title} (Copy)`, description: original.description,
      isActive: false, position: original.position,
      createdBy: userId || null, updatedBy: userId || null,
      createdAt: ts, updatedAt: ts,
    };
    batch.set(newModRef, newModData);

    const savedObjectives = [];
    const savedSlides = [];

    objectives.forEach(obj => {
      const ref = db.collection(COLLECTIONS.MODULE_OBJECTIVES).doc();
      const data = { moduleId: newModRef.id, objective: obj.objective, position: obj.position, createdAt: ts, updatedAt: ts };
      batch.set(ref, data);
      savedObjectives.push({ id: ref.id, ...data });
    });

    slides.forEach(slide => {
      const ref = db.collection(COLLECTIONS.MODULE_SLIDES).doc();
      const data = {
        moduleId: newModRef.id, type: slide.type, title: slide.title, content: slide.content,
        description: slide.description, position: slide.position, skillLevel: slide.skillLevel,
        imageUrl: slide.imageUrl, imagePath: slide.imagePath, imageMime: slide.imageMime,
        videoUrl: slide.videoUrl, videoPath: slide.videoPath, createdAt: ts, updatedAt: ts,
      };
      batch.set(ref, data);
      savedSlides.push({ id: ref.id, ...data });
    });

    await batch.commit();

    res.status(201).json({
      success: true,
      message: 'Module duplicated successfully',
      data: { id: newModRef.id, ...newModData, objectives: savedObjectives, slides: savedSlides }
    });
  } catch (error) {
    console.error('Error duplicating module:', error);
    res.status(500).json({ success: false, error: 'Failed to duplicate module', message: error.message });
  }
}
