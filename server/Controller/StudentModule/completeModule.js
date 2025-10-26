import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Mark a module as completed (after passing the quiz)
 * POST /api/student-modules/:moduleId/complete
 * Body: { categoryId, quizScore, quizAttemptId }
 */
export default async function completeModule(req, res) {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params;
    const { categoryId, quizScore, quizAttemptId } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: 'categoryId is required'
      });
    }

    // Find the student module record
    const studentModule = await prisma.studentModule.findFirst({
      where: {
        userId,
        moduleId: parseInt(moduleId),
        categoryId: parseInt(categoryId)
      },
      include: {
        module: {
          include: {
            quizzes: {
              where: { isActive: true },
              select: { passingScore: true }
            }
          }
        }
      }
    });

    if (!studentModule) {
      return res.status(404).json({
        success: false,
        error: 'Student module not found'
      });
    }

    // Check if quiz was passed
    const passingScore = studentModule.module.quizzes[0]?.passingScore || 70;
    const passed = quizScore >= passingScore;

    if (!passed) {
      return res.status(400).json({
        success: false,
        error: `Quiz score (${quizScore}%) is below passing score (${passingScore}%)`,
        quizScore,
        passingScore,
        passed: false
      });
    }

    // Update student module
    const updated = await prisma.studentModule.update({
      where: { id: studentModule.id },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        progress: 100,
        quizScore,
        quizPassed: true,
        quizAttempts: studentModule.quizAttempts + 1,
        lastQuizAttemptId: quizAttemptId || null,
        startedAt: studentModule.startedAt || new Date()
      },
      include: {
        module: true,
        category: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Module completed successfully!',
      data: updated
    });

  } catch (error) {
    console.error('Error completing module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete module',
      message: error.message
    });
  }
}
