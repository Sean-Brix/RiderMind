import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Record a quiz attempt for a module
 * POST /api/student-modules/:moduleId/quiz-attempt
 * Body: { categoryId, quizScore, quizAttemptId, passed }
 */
export default async function recordQuizAttempt(req, res) {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    const { categoryId, quizScore, quizAttemptId, passed } = req.body;

    if (!categoryId || quizScore === undefined) {
      return res.status(400).json({
        success: false,
        error: 'categoryId and quizScore are required'
      });
    }

    // Find the student module record
    const studentModule = await prisma.studentModule.findFirst({
      where: {
        userId,
        moduleId: parseInt(moduleId),
        categoryId: parseInt(categoryId)
      }
    });

    if (!studentModule) {
      return res.status(404).json({
        success: false,
        error: 'Student module not found'
      });
    }

    // Update quiz attempt info
    const updateData = {
      quizAttempts: studentModule.quizAttempts + 1,
      lastQuizAttemptId: quizAttemptId || null,
    };

    // Only update score if it's better than previous
    if (!studentModule.quizScore || quizScore > studentModule.quizScore) {
      updateData.quizScore = quizScore;
    }

    // Update passed status if this attempt passed
    if (passed && !studentModule.quizPassed) {
      updateData.quizPassed = true;
    }

    const updated = await prisma.studentModule.update({
      where: { id: studentModule.id },
      data: updateData,
      include: {
        module: true
      }
    });

    res.status(200).json({
      success: true,
      data: updated
    });

  } catch (error) {
    console.error('Error recording quiz attempt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record quiz attempt',
      message: error.message
    });
  }
}
