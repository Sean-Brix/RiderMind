import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get quiz attempt results
 * Params: attemptId
 */
export default async function getAttemptResults(req, res) {
  try {
    const { attemptId } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: parseInt(attemptId) },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            passingScore: true,
            showResults: true,
            allowReview: true,
            module: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                type: true,
                question: true,
                points: true,
                explanation: true,
                imageUrl: true,
                imagePath: true,
                imageMime: true,
                videoUrl: true,
                videoPath: true
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
        },
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: 'Attempt not found'
      });
    }

    // Check permissions
    if (!isAdmin && attempt.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view this attempt'
      });
    }

    // Check if results should be shown
    if (!isAdmin && !attempt.quiz.allowReview) {
      return res.status(403).json({
        success: false,
        error: 'Review is not allowed for this quiz'
      });
    }

    // Calculate max score
    const maxScore = attempt.answers.reduce((sum, ans) => sum + (ans.question.points || 0), 0);
    const totalScore = attempt.answers.reduce((sum, ans) => sum + (ans.pointsEarned || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        id: attempt.id,
        score: attempt.score,
        totalScore,
        maxScore,
        passed: attempt.passed,
        passingScore: attempt.quiz.passingScore,
        timeSpent: attempt.timeSpent,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        quiz: attempt.quiz,
        user: isAdmin ? attempt.user : undefined,
        answers: attempt.quiz.showResults || isAdmin ? attempt.answers : undefined
      }
    });

  } catch (error) {
    console.error('Error fetching attempt results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attempt results',
      message: error.message
    });
  }
}
