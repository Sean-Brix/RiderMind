import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get student module statistics (Admin only)
 * GET /api/admin/student-modules/stats
 */
export default async function getStudentModuleStats(req, res) {
  try {
    // Get total count
    const total = await prisma.studentModule.count();

    // Get counts by status
    const [ongoing, completed] = await Promise.all([
      prisma.studentModule.count({ where: { status: 'ONGOING' } }),
      prisma.studentModule.count({ where: { status: 'COMPLETED' } })
    ]);

    // Get average progress
    const progressAgg = await prisma.studentModule.aggregate({
      _avg: {
        progress: true
      }
    });

    res.json({
      success: true,
      data: {
        total,
        ongoing,
        completed,
        averageProgress: progressAgg._avg.progress || 0
      }
    });
  } catch (error) {
    console.error('Error fetching student module stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message 
    });
  }
}
