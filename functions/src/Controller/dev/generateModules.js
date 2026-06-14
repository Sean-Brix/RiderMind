import { getDb, COLLECTIONS } from '../../db/firestore.js';

const SAMPLE_MODULES = [
  { title: 'Traffic Rules and Regulations', description: 'Comprehensive guide to traffic rules for motorcycles and cars.' },
  { title: 'Defensive Driving Techniques', description: 'Learn strategies to avoid accidents and stay safe on the road.' },
  { title: 'Road Signs and Markings', description: 'Understanding all road signs, pavement markings, and signals.' },
  { title: 'Vehicle Maintenance Basics', description: 'Essential maintenance tips to keep your vehicle road-ready.' },
  { title: 'Night Driving Safety', description: 'Best practices for safe driving during nighttime conditions.' },
  { title: 'Emergency Situations Handling', description: 'How to respond to brake failures, blowouts, and accidents.' },
  { title: 'Intersection Navigation', description: 'Safe navigation through intersections and roundabouts.' },
  { title: 'Highway Driving Skills', description: 'Techniques for safe merging, lane changes, and highway driving.' },
  { title: 'Parking Procedures', description: 'Parallel, perpendicular, and angle parking techniques.' },
  { title: 'Environmental Awareness', description: 'Adapting to rain, fog, and adverse road conditions.' },
];

export default async function generateModules(req, res) {
  try {
    const db = getDb();
    const existingSnap = await db.collection(COLLECTIONS.MODULES).limit(1).get();
    if (!existingSnap.empty) {
      return res.status(400).json({ success: false, error: 'Modules already exist. Clear them first.' });
    }

    const ts = new Date().toISOString();
    const batch = db.batch();
    const created = [];

    SAMPLE_MODULES.forEach((m, i) => {
      const ref = db.collection(COLLECTIONS.MODULES).doc();
      const data = { ...m, position: i + 1, isActive: true, thumbnailUrl: null, thumbnailPath: null, createdAt: ts, updatedAt: ts };
      batch.set(ref, data);
      created.push({ id: ref.id, ...data });
    });
    await batch.commit();

    res.status(201).json({ success: true, message: `${created.length} sample modules generated successfully`, data: { count: created.length, modules: created.map(m => ({ id: m.id, title: m.title })) } });
  } catch (error) {
    console.error('Error generating modules:', error);
    res.status(500).json({ success: false, error: 'Failed to generate modules', details: error.message });
  }
}
