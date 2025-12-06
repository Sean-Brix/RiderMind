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

    console.log('=== GRADING DEBUG ===');
    console.log('Total questions:', quiz.questions.length);
    console.log('Total answers submitted:', answers.length);

    for (const answer of answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      
      if (!question) continue;

      maxScore += question.points;

      let isCorrect = false;
      let pointsEarned = 0;

      console.log(`\n--- Question ${question.id} (${question.type}) ---`);
      console.log('Question text:', question.question);
      console.log('Points:', question.points);

      // Check answer based on question type
      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
        const selectedOption = question.options.find(opt => opt.id === answer.selectedOptionId);
        isCorrect = selectedOption?.isCorrect || false;
        pointsEarned = isCorrect ? question.points : 0;
        
        console.log('User selected option ID:', answer.selectedOptionId);
        console.log('Selected option:', selectedOption?.optionText);
        console.log('Is correct:', selectedOption?.isCorrect);
        console.log('All options:', question.options.map(o => ({ id: o.id, text: o.optionText, isCorrect: o.isCorrect })));
      } 
      else if (question.type === 'MULTIPLE_ANSWER') {
        // For multiple answer, all correct options must be selected
        const correctOptionIds = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
        const selectedIds = Array.isArray(answer.selectedOptionId) ? answer.selectedOptionId : [answer.selectedOptionId];
        
        isCorrect = correctOptionIds.length === selectedIds.length && 
                    correctOptionIds.every(id => selectedIds.includes(id));
        pointsEarned = isCorrect ? question.points : 0;
        
        console.log('Correct option IDs:', correctOptionIds);
        console.log('Selected option IDs:', selectedIds);
      }
      else if (question.type === 'IDENTIFICATION' || question.type === 'FILL_BLANK') {
        // Get correct answer from options (first correct option's text)
        const correctOption = question.options.find(opt => opt.isCorrect);
        
        console.log('User answer text:', answer.answerText);
        console.log('Correct option:', correctOption);
        
        if (correctOption) {
          if (answer.answerText) {
            const userAnswer = question.caseSensitive ? answer.answerText : answer.answerText.toLowerCase();
            const correctAnswer = question.caseSensitive ? correctOption.optionText : correctOption.optionText.toLowerCase();
            
            isCorrect = userAnswer.trim() === correctAnswer.trim();
            pointsEarned = isCorrect ? question.points : 0;
            
            console.log('Correct answer:', correctOption.optionText);
            console.log('Case sensitive:', question.caseSensitive);
            console.log('After processing - User:', userAnswer.trim(), 'Correct:', correctAnswer.trim());
            console.log('Match:', isCorrect);
          } else {
            console.log('ERROR: No answerText provided');
          }
        } else {
          console.log('ERROR: No correct option found for this question');
        }
      }
      else if (question.type === 'ESSAY') {
        // Essay questions require manual grading
        isCorrect = null; // null indicates pending review
        pointsEarned = 0; // Will be set during manual grading
      }

      console.log('Points earned:', pointsEarned);
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

    console.log('\n=== FINAL SCORE ===');
    console.log('Total score:', totalScore);
    console.log('Max score:', maxScore);
    console.log('Percentage:', scorePercentage);
    console.log('Passing score required:', quiz.passingScore);
    console.log('Passed:', passed);
    console.log('==================\n');

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
                description: true
              }
            },
            selectedOption: {
              select: {
                id: true,
                optionText: true,
                isCorrect: true
              }
            }
          }
        }
      }
    });

    // Build feedback array for client
    const feedback = finalAttempt.answers.map(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      
      // Get correct answer based on question type
      let correctAnswer = null;
      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE' || question.type === 'MULTIPLE_ANSWER') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        correctAnswer = correctOption?.id;
      } else if (question.type === 'IDENTIFICATION' || question.type === 'FILL_BLANK') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        correctAnswer = correctOption?.id;
      }
      
      return {
        questionId: answer.questionId,
        question: answer.question.question,
        questionText: answer.question.question,
        userAnswer: answer.selectedOptionId || answer.answerText,
        correctAnswer: correctAnswer,
        isCorrect: answer.isCorrect,
        explanation: answer.question.description,
        options: question.options
      };
    });

    // Count correct answers
    const correctCount = finalAttempt.answers.filter(a => a.isCorrect === true).length;

    res.status(201).json({
      success: true,
      message: passed ? 'Quiz passed!' : 'Quiz submitted',
      score: scorePercentage,
      passed,
      feedback,
      correctCount,
      totalQuestions: quiz.questions.length,
      attempt: finalAttempt.id,
      completedModule: false,
      data: {
        attemptId: finalAttempt.id,
        score: scorePercentage,
        totalScore,
        maxScore,
        passed,
        passingScore: quiz.passingScore,
        timeSpent: finalAttempt.timeSpent,
        showResults: quiz.showResults
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
