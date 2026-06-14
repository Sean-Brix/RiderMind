import { getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';
import { v4 as uuidv4 } from 'uuid';

const QUESTION_TYPES = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'IDENTIFICATION'];

function makeOptions(type) {
  if (type === 'TRUE_FALSE') {
    return [{ id: uuidv4(), optionText: 'True', isCorrect: true }, { id: uuidv4(), optionText: 'False', isCorrect: false }];
  }
  if (type === 'IDENTIFICATION') {
    return [{ id: uuidv4(), optionText: 'Sample Answer', isCorrect: true }];
  }
  return [
    { id: uuidv4(), optionText: 'Option A', isCorrect: true },
    { id: uuidv4(), optionText: 'Option B', isCorrect: false },
    { id: uuidv4(), optionText: 'Option C', isCorrect: false },
    { id: uuidv4(), optionText: 'Option D', isCorrect: false },
  ];
}

export default async function generateQuizzes(req, res) {
  try {
    const db = getDb();

    const existingSnap = await db.collection(COLLECTIONS.QUIZZES).limit(1).get();
    if (!existingSnap.empty) {
      return res.status(400).json({ success: false, error: 'Quizzes already exist. Clear them first before generating new ones.' });
    }

    const modSnap = await db.collection(COLLECTIONS.MODULES).where('isActive', '==', true).get();
    const modules = snapshotToArray(modSnap);

    if (!modules.length) return res.status(400).json({ success: false, error: 'No active modules found. Generate modules first.' });

    const ts = new Date().toISOString();
    const results = [];

    for (const mod of modules) {
      const quizRef = db.collection(COLLECTIONS.QUIZZES).doc();
      await quizRef.set({ moduleId: mod.id, title: `${mod.title} Quiz`, description: `Test your knowledge about ${mod.title}`, passingScore: 70, timeLimit: 30, isActive: true, shuffle: false, showResults: true, createdAt: ts, updatedAt: ts });

      const questionBatch = db.batch();
      const questions = [];
      for (let i = 0; i < 10; i++) {
        const type = QUESTION_TYPES[i % QUESTION_TYPES.length];
        const ref = db.collection(COLLECTIONS.QUIZ_QUESTIONS).doc();
        const q = { quizId: quizRef.id, questionText: `Sample question ${i + 1} for ${mod.title}?`, type, points: 1, position: i + 1, options: makeOptions(type), imageUrl: null, imagePath: null, videoUrl: null, videoPath: null, createdAt: ts, updatedAt: ts };
        questionBatch.set(ref, q);
        questions.push({ id: ref.id, ...q });
      }
      await questionBatch.commit();
      results.push({ quizId: quizRef.id, moduleTitle: mod.title, questionsGenerated: questions.length });
    }

    res.status(201).json({ success: true, message: 'Quizzes generated successfully', data: { quizzesCreated: results.length, details: results } });
  } catch (error) {
    console.error('Error generating quizzes:', error);
    res.status(500).json({ success: false, error: 'Failed to generate quizzes', message: error.message });
  }
}
