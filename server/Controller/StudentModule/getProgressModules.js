import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all student modules for progress tracking (both ONGOING and COMPLETED)
 * GET /api/student-modules/progress
 */
export default async function getProgressModules(req, res) {
  try {
    const userId = req.user.id;

    // Get all student modules for this user (both ONGOING and COMPLETED)
    const studentModules = await prisma.studentModule.findMany({
      where: { userId },
      orderBy: [
        { createdAt: 'desc' }, // Most recent first
        { position: 'asc' }
      ],
      include: {
        module: {
          include: {
            objectives: { orderBy: { position: 'asc' } },
            quizzes: {
              where: { isActive: true },
              select: {
                id: true,
                title: true,
                passingScore: true
              }
            }
          }
        },
        category: true
      }
    });

    if (!studentModules || studentModules.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          modules: [],
          stats: {
            total: 0,
            completed: 0,
            inProgress: 0,
            notStarted: 0,
            completionRate: 0
          }
        }
      });
    }

    // Calculate statistics
    const stats = {
      total: studentModules.length,
      completed: studentModules.filter(m => m.isCompleted).length,
      inProgress: studentModules.filter(m => m.progress > 0 && !m.isCompleted).length,
      notStarted: studentModules.filter(m => m.progress === 0).length,
      avgProgress: studentModules.reduce((acc, m) => acc + m.progress, 0) / studentModules.length,
      completionRate: (studentModules.filter(m => m.isCompleted).length / studentModules.length) * 100
    };

    res.status(200).json({
      success: true,
      data: {
        modules: studentModules,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching progress modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress data',
      message: error.message
    });
  }
}
