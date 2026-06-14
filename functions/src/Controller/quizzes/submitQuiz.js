import { getDb, COLLECTIONS, docToObject, snapshotToArray } from '../../db/firestore.js';

export default async function submitQuiz(req, res) {
  try {
    const { quizId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user?.id;
    const db = getDb();

    if (!userId) return res.status(401).json({ success: false, error: 'User not authenticated' });
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, error: 'Answers are required' });
    }

    const quizDoc = await db.collection(COLLECTIONS.QUIZZES).doc(quizId).get();
    const quiz = docToObject(quizDoc);
    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });

    if (quiz.maxAttempts) {
      const attSnap = await db.collection(COLLECTIONS.QUIZ_ATTEMPTS).where('userId', '==', userId).where('quizId', '==', quizId).get();
      if (attSnap.size >= quiz.maxAttempts) {
        return res.status(403).json({ success: false, error: `Maximum attempts (${quiz.maxAttempts}) reached for this quiz` });
      }
    }

    const qSnap = await db.collection(COLLECTIONS.QUIZ_QUESTIONS).where('quizId', '==', quizId).get();
    const questions = snapshotToArray(qSnap);

    let totalScore = 0;
    let maxScore = 0;
    const processedAnswers = [];

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      maxScore += question.points;
      let isCorrect = false;
      let pointsEarned = 0;
      const options = question.options || [];

      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        const selectedOption = options.find(opt => opt.id === answer.selectedOptionId);
        isCorrect = selectedOption?.isCorrect || false;
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.type === 'MULTIPLE_ANSWER') {
        const correctIds = options.filter(o => o.isCorrect).map(o => o.id);
        const selectedIds = Array.isArray(answer.selectedOptionId) ? answer.selectedOptionId : [answer.selectedOptionId];
        isCorrect = correctIds.length === selectedIds.length && correctIds.every(cid => selectedIds.includes(cid));
        pointsEarned = isCorrect ? question.points : 0;
      } else if (question.type === 'IDENTIFICATION' || question.type === 'FILL_BLANK') {
        const correctOption = options.find(o => o.isCorrect);
        if (correctOption && answer.answerText) {
          const userAns = question.caseSensitive ? answer.answerText : answer.answerText.toLowerCase();
          const correctAns = question.caseSensitive ? correctOption.optionText : correctOption.optionText.toLowerCase();
          isCorrect = userAns.trim() === correctAns.trim();
          pointsEarned = isCorrect ? question.points : 0;
        }
      } else if (question.type === 'ESSAY') {
        isCorrect = null;
        pointsEarned = 0;
      }

      totalScore += pointsEarned;
      processedAnswers.push({
        questionId: answer.questionId, selectedOptionId: answer.selectedOptionId || null,
        answerText: answer.answerText || null, isCorrect, pointsEarned,
      });
    }

    const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = scorePercentage >= quiz.passingScore;
    const ts = new Date().toISOString();
    const startedAt = new Date(Date.now() - (timeSpent || 0) * 1000).toISOString();

    const attemptRef = db.collection(COLLECTIONS.QUIZ_ATTEMPTS).doc();
    await attemptRef.set({
      userId, quizId, score: scorePercentage, passed,
      timeSpent: timeSpent || 0, startedAt, submittedAt: ts,
      answers: processedAnswers, createdAt: ts, updatedAt: ts,
    });

    const feedback = processedAnswers.map(ans => {
      const question = questions.find(q => q.id === ans.questionId);
      const opts = question?.options || [];
      let correctAnswer = null;
      if (['MULTIPLE_CHOICE', 'TRUE_FALSE', 'IDENTIFICATION', 'FILL_BLANK', 'MULTIPLE_ANSWER'].includes(question?.type)) {
        correctAnswer = opts.find(o => o.isCorrect)?.id || null;
      }
      return {
        questionId: ans.questionId, question: question?.question,
        questionText: question?.question, userAnswer: ans.selectedOptionId || ans.answerText,
        correctAnswer, isCorrect: ans.isCorrect, explanation: question?.description, options: opts,
      };
    });

    const correctCount = processedAnswers.filter(a => a.isCorrect === true).length;

    res.status(201).json({
      success: true, message: passed ? 'Quiz passed!' : 'Quiz submitted',
      score: scorePercentage, passed, feedback, correctCount,
      totalQuestions: questions.length, attempt: attemptRef.id, completedModule: false,
      data: { attemptId: attemptRef.id, score: scorePercentage, totalScore, maxScore, passed, passingScore: quiz.passingScore, timeSpent: timeSpent || 0, showResults: quiz.showResults },
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ success: false, error: 'Failed to submit quiz', message: error.message });
  }
}
