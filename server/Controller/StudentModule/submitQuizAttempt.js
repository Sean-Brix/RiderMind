import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Submit a quiz attempt and calculate score
 * POST /api/student-modules/:moduleId/submit-quiz
 */
export default async function submitQuizAttempt(req, res) {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    const { categoryId, quizId, answers, timeSpent } = req.body;

    console.log('Quiz submission received:', {
      userId,
      moduleId,
      categoryId,
      quizId,
      answersCount: answers?.length,
      timeSpent
    });

    // Get the quiz with questions and correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    console.log('Quiz found:', {
      quizId: quiz.id,
      questionsCount: quiz.questions?.length,
      questions: quiz.questions?.map(q => ({
        id: q.id,
        type: q.type,
        optionsCount: q.options?.length
      }))
    });

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        startedAt: new Date(),
        submittedAt: new Date(),
        timeSpent: timeSpent || 0
      }
    });

    // Process answers and calculate score
    let correctAnswers = 0;
    let pointsEarned = 0;
    const totalQuestions = quiz.questions.length;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const answerRecords = [];

    for (const answer of answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (!question) {
        console.warn(`Question not found for answer:`, answer);
        continue;
      }

      console.log(`Processing answer for question ${question.id} (type: ${question.type}):`, {
        answerData: answer,
        optionsCount: question.options?.length,
        questionPoints: question.points
      });

      let isCorrect = false;
      let earnedPoints = 0;

      // Check if answer is correct based on question type
      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && correctOption.id === answer.selectedOptionId;
        
        if (isCorrect) {
          correctAnswers++;
          earnedPoints = question.points || 1;
          pointsEarned += earnedPoints;
        }

        answerRecords.push({
          attemptId: attempt.id,
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect,
          pointsEarned: earnedPoints
        });

      } else if (question.type === 'MULTIPLE_ANSWER') {
        const correctOptionIds = question.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.id)
          .sort();
        
        const selectedIds = Array.isArray(answer.selectedOptionId) 
          ? answer.selectedOptionId.sort() 
          : [];
        
        isCorrect = JSON.stringify(correctOptionIds) === JSON.stringify(selectedIds);
        
        if (isCorrect) {
          correctAnswers++;
          earnedPoints = question.points || 1;
          pointsEarned += earnedPoints;
        }

        // Store as JSON string for multiple answers
        answerRecords.push({
          attemptId: attempt.id,
          questionId: answer.questionId,
          answerText: JSON.stringify(selectedIds),
          isCorrect,
          pointsEarned: earnedPoints
        });

      } else if (question.type === 'IDENTIFICATION' || question.type === 'FILL_BLANK') {
        // Case-insensitive comparison
        const correctAnswer = question.options.find(opt => opt.isCorrect);
        if (correctAnswer && correctAnswer.optionText && answer.answerText) {
          isCorrect = answer.answerText.toLowerCase().trim() === correctAnswer.optionText.toLowerCase().trim();
          
          if (isCorrect) {
            correctAnswers++;
            earnedPoints = question.points || 1;
            pointsEarned += earnedPoints;
          }
        }

        answerRecords.push({
          attemptId: attempt.id,
          questionId: answer.questionId,
          answerText: answer.answerText,
          isCorrect,
          pointsEarned: earnedPoints
        });

      } else if (question.type === 'ESSAY') {
        // Essays need manual grading
        answerRecords.push({
          attemptId: attempt.id,
          questionId: answer.questionId,
          answerText: answer.answerText,
          isCorrect: false, // Manual grading needed
          pointsEarned: 0
        });
      }
    }

    // Create answer records
    if (answerRecords.length > 0) {
      await prisma.quizAnswer.createMany({
        data: answerRecords
      });
    }

    // Calculate final score based on points earned
    const score = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
    const passed = score >= (quiz.passingScore || 70);

    console.log('Quiz scoring:', {
      correctAnswers,
      totalQuestions,
      pointsEarned,
      totalPoints,
      score,
      passed
    });

    // Update attempt with score
    await prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        score,
        passed
      }
    });

    // Update student module
    const studentModule = await prisma.studentModule.findFirst({
      where: {
        userId,
        moduleId: parseInt(moduleId),
        categoryId: parseInt(categoryId)
      }
    });

    if (studentModule) {
      const updateData = {
        quizAttempts: { increment: 1 },
        lastQuizAttemptId: attempt.id
      };

      // Only update score if this is better or first attempt
      if (!studentModule.quizScore || score > studentModule.quizScore) {
        updateData.quizScore = score;
      }

      // Update passed status and completion
      if (passed) {
        updateData.quizPassed = true;
        updateData.isCompleted = true;
        updateData.completedAt = new Date();
        updateData.progress = 100;
      }

      await prisma.studentModule.update({
        where: { id: studentModule.id },
        data: updateData
      });
    }

    res.status(200).json({
      success: true,
      data: {
        attemptId: attempt.id,
        score,
        passed,
        correctAnswers,
        totalQuestions,
        pointsEarned,
        totalPoints,
        passingScore: quiz.passingScore || 70,
        canRetake: !passed // Can only retake if failed
      }
    });

  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit quiz attempt',
      message: error.message
    });
  }
}
