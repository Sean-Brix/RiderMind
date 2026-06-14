import { getDb, COLLECTIONS, docToObject, snapshotToArray, updateDoc } from '../../db/firestore.js';

export default async function submitQuizAttempt(req, res) {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    const { categoryId, quizId, answers, timeSpent } = req.body;
    const db = getDb();

    const quizDoc = await db.collection(COLLECTIONS.QUIZZES).doc(quizId).get();
    const quiz = docToObject(quizDoc);
    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });

    const qSnap = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).where('quizId', '==', quizId).get();
    const questions = snapshotToArray(qSnap);

    let correctAnswers = 0;
    let pointsEarned = 0;
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const processedAnswers = [];

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      let isCorrect = false;
      let earned = 0;
      const opts = question.options || [];

      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        const correct = opts.find(o => o.isCorrect);
        isCorrect = correct && correct.id === answer.selectedOptionId;
        if (isCorrect) { correctAnswers++; earned = question.points || 1; pointsEarned += earned; }
        processedAnswers.push({ questionId: answer.questionId, selectedOptionId: answer.selectedOptionId, isCorrect, pointsEarned: earned });
      } else if (question.type === 'MULTIPLE_ANSWER') {
        const correctIds = opts.filter(o => o.isCorrect).map(o => o.id).sort();
        const selectedIds = Array.isArray(answer.selectedOptionId) ? answer.selectedOptionId.sort() : [];
        isCorrect = JSON.stringify(correctIds) === JSON.stringify(selectedIds);
        if (isCorrect) { correctAnswers++; earned = question.points || 1; pointsEarned += earned; }
        processedAnswers.push({ questionId: answer.questionId, answerText: JSON.stringify(selectedIds), isCorrect, pointsEarned: earned });
      } else if (question.type === 'IDENTIFICATION' || question.type === 'FILL_BLANK') {
        const correct = opts.find(o => o.isCorrect);
        if (correct && answer.answerText) {
          isCorrect = answer.answerText.toLowerCase().trim() === correct.optionText.toLowerCase().trim();
          if (isCorrect) { correctAnswers++; earned = question.points || 1; pointsEarned += earned; }
        }
        processedAnswers.push({ questionId: answer.questionId, answerText: answer.answerText, isCorrect, pointsEarned: earned });
      } else if (question.type === 'ESSAY') {
        processedAnswers.push({ questionId: answer.questionId, answerText: answer.answerText, isCorrect: false, pointsEarned: 0 });
      }
    }

    const score = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
    const passed = score >= (quiz.passingScore || 70);
    const ts = new Date().toISOString();

    const attemptRef = db.collection(COLLECTIONS.QUIZ_ATTEMPTS).doc();
    await attemptRef.set({ userId, quizId, score, passed, timeSpent: timeSpent || 0, startedAt: ts, submittedAt: ts, answers: processedAnswers, createdAt: ts, updatedAt: ts });

    // Update student module
    const smSnap = await db.collection(COLLECTIONS.STUDENT_MODULES)
      .where('userId', '==', userId).where('moduleId', '==', moduleId).where('categoryId', '==', categoryId).limit(1).get();

    if (!smSnap.empty) {
      const sm = { id: smSnap.docs[0].id, ...smSnap.docs[0].data() };
      const smData = { quizAttempts: (sm.quizAttempts || 0) + 1, lastQuizAttemptId: attemptRef.id };
      if (!sm.quizScore || score > sm.quizScore) smData.quizScore = score;
      if (passed) { smData.quizPassed = true; smData.isCompleted = true; smData.completedAt = ts; smData.progress = 100; }
      await updateDoc(COLLECTIONS.STUDENT_MODULES, sm.id, smData);
    }

    res.status(200).json({ success: true, data: { attemptId: attemptRef.id, score, passed, correctAnswers, totalQuestions: questions.length, pointsEarned, totalPoints, passingScore: quiz.passingScore || 70, canRetake: !passed } });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({ success: false, error: 'Failed to submit quiz attempt', message: error.message });
  }
}
