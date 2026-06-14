import { getDb, COLLECTIONS, createDoc, findOne, snapshotToArray } from '../../db/firestore.js';

export default async function createModule(req, res) {
  try {
    const { title, description, isActive, position, objectives, slides } = req.body;
    if (!title) return res.status(400).json({ success: false, error: 'Title is required' });

    const existing = await findOne(COLLECTIONS.MODULES, 'title', title);
    if (existing) return res.status(409).json({ success: false, error: 'Module with this title already exists' });

    const mod = await createDoc(COLLECTIONS.MODULES, {
      title, description: description || null,
      isActive: isActive !== undefined ? isActive : false,
      position: position || 0,
      createdBy: req.user?.id || null, updatedBy: req.user?.id || null,
    });

    const db = getDb();
    const batch = db.batch();
    const savedObjectives = [];
    const savedSlides = [];
    const ts = new Date().toISOString();

    if (objectives && Array.isArray(objectives)) {
      objectives.forEach((obj, index) => {
        const ref = db.collection(COLLECTIONS.MODULE_OBJECTIVES).doc();
        const data = { moduleId: mod.id, objective: typeof obj === 'string' ? obj : obj.objective, position: obj.position || index + 1, createdAt: ts, updatedAt: ts };
        batch.set(ref, data);
        savedObjectives.push({ id: ref.id, ...data });
      });
    }

    if (slides && Array.isArray(slides)) {
      slides.forEach((slide, index) => {
        const ref = db.collection(COLLECTIONS.MODULE_SLIDES).doc();
        const data = {
          moduleId: mod.id, type: slide.type || 'text', title: slide.title || '', content: slide.content || '',
          description: slide.description || null, skillLevel: slide.skillLevel || 'Beginner',
          position: slide.position || index + 1, imageUrl: slide.imageUrl || null,
          imagePath: slide.imagePath || null, imageMime: slide.imageMime || null,
          videoUrl: slide.videoUrl || null, videoPath: slide.videoPath || null,
          createdAt: ts, updatedAt: ts,
        };
        batch.set(ref, data);
        savedSlides.push({ id: ref.id, ...data });
      });
    }

    await batch.commit();

    res.status(201).json({ success: true, message: 'Module created successfully', data: { ...mod, objectives: savedObjectives, slides: savedSlides } });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ success: false, error: 'Failed to create module', message: error.message });
  }
}
