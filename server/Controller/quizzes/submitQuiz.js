import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Submit a quiz attempt
 * Params: quizId
 * Body: { answers: [{ questionId, selectedOptionId?, answerText? }], timeSpent }
 */
export default async function submitQuiz(req, res) {
  try {
    const { quizId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Validation
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Answers are required'
      });
    }

    // Get quiz with questions and options
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) },
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

    // Check max attempts
    if (quiz.maxAttempts) {
      const attemptCount = await prisma.quizAttempt.count({
        where: {
          userId,
          quizId: parseInt(quizId)
        }
      });

      if (attemptCount >= quiz.maxAttempts) {
        return res.status(403).json({
          success: false,
          error: `Maximum attempts (${quiz.maxAttempts}) reached for this quiz`
        });
      }
    }

    // Create attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId: parseInt(quizId),
        timeSpent: timeSpent || 0,
        startedAt: new Date(Date.now() - (timeSpent || 0) * 1000), // Calculate start time
        score: 0, // Will be calculated
        passed: false // Will be determined
      }
    });

    // Process answers and calculate score
    let totalScore = 0;
    let maxScore = 0;
    const answersToCreate = [];

    for (const answer of answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      
      if (!question) continue;

      maxScore += question.points;

      let isCorrect = false;
      let pointsEarned = 0;

      // Check answer based on question type
      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        const selectedOption = question.options.find(opt => opt.id === answer.selectedOptionId);
        isCorrect = selectedOption?.isCorrect || false;
        pointsEarned = isCorrect ? question.points : 0;
      } 
      else if (question.type === 'MULTIPLE_ANSWER') {
        // For multiple answer, all correct options must be selected
        const correctOptionIds = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
        const selectedIds = Array.isArray(answer.selectedOptionId) ? answer.selectedOptionId : [answer.selectedOptionId];
        
        isCorrect = correctOptionIds.length === selectedIds.length && 
                    correctOptionIds.every(id => selectedIds.includes(id));
        pointsEarned = isCorrect ? question.points : 0;
      }
      else if (question.type === 'IDENTIFICATION' || question.type === 'FILL_BLANK') {
        // Get correct answer from options (first correct option's text)
        const correctOption = question.options.find(opt => opt.isCorrect);
        
        if (correctOption && answer.answerText) {
          const userAnswer = question.caseSensitive ? answer.answerText : answer.answerText.toLowerCase();
          const correctAnswer = question.caseSensitive ? correctOption.optionText : correctOption.optionText.toLowerCase();
          
          isCorrect = userAnswer.trim() === correctAnswer.trim();
          pointsEarned = isCorrect ? question.points : 0;
        }
      }
      else if (question.type === 'ESSAY') {
        // Essay questions require manual grading
        isCorrect = null; // null indicates pending review
        pointsEarned = 0; // Will be set during manual grading
      }

      totalScore += pointsEarned;

      answersToCreate.push({
        attemptId: attempt.id,
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId || null,
        answerText: answer.answerText || null,
        isCorrect,
        pointsEarned
      });
    }

    // Create all answers
    await prisma.quizAnswer.createMany({
      data: answersToCreate
    });

    // Calculate percentage and determine pass/fail
    const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = scorePercentage >= quiz.passingScore;

    // Update attempt with final score and status
    const finalAttempt = await prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        score: scorePercentage,
        passed,
        submittedAt: new Date()
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                type: true,
                points: true,
                explanation: quiz.showResults
              }
            },
            selectedOption: {
              select: {
                id: true,
                optionText: true,
                isCorrect: quiz.showResults
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: passed ? 'Quiz passed!' : 'Quiz submitted',
      data: {
        attemptId: finalAttempt.id,
        score: scorePercentage,
        totalScore,
        maxScore,
        passed,
        passingScore: quiz.passingScore,
        timeSpent: finalAttempt.timeSpent,
        showResults: quiz.showResults,
        answers: quiz.showResults ? finalAttempt.answers : undefined
      }
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit quiz',
      message: error.message
    });
  }
}
