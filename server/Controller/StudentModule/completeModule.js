import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Mark a module as completed (after passing the quiz)
 * POST /api/student-modules/:studentModuleId/complete
 * Body: { categoryId, quizScore, quizAttemptId }
 */
export default async function completeModule(req, res) {
  try {
    const userId = req.user.id;
    const { moduleId } = req.params; // Actually studentModuleId, but route param is named moduleId
    const { categoryId, quizScore, quizAttemptId } = req.body;

    console.log('🔧 Complete Module Request:', {
      userId,
      studentModuleId: req.params.moduleId,
      categoryId,
      quizScore,
      quizAttemptId
    });

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        error: 'categoryId is required'
      });
    }

    // Find the student module record by ID directly
    const studentModule = await prisma.studentModule.findUnique({
      where: {
        id: parseInt(moduleId) // This is actually the studentModuleId
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

    console.log('🔍 Found studentModule:', {
      id: studentModule?.id,
      moduleId: studentModule?.moduleId,
      isCompleted: studentModule?.isCompleted,
      progress: studentModule?.progress
    });

    if (!studentModule) {
      return res.status(404).json({
        success: false,
        error: 'Student module not found'
      });
    }

    // Verify this belongs to the requesting user
    if (studentModule.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
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
