import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Mark current ongoing student modules as COMPLETED
 * This allows the user to enroll in a new module/category
 * 
 * @route PUT /api/student-modules/mark-completed
 * @access Private (Authenticated users only)
 */
export default async function markModulesCompleted(req, res) {
  try {
    const userId = req.user.id;

    // Update all ONGOING modules for this user to COMPLETED
    const result = await prisma.studentModule.updateMany({
      where: {
        userId,
        status: 'ONGOING'
      },
      data: {
        status: 'COMPLETED'
      }
    });

    console.log(`✓ Marked ${result.count} modules as COMPLETED for user ${userId}`);

    res.json({
      success: true,
      message: `Successfully marked ${result.count} module(s) as completed`,
      count: result.count
    });
  } catch (error) {
    console.error('❌ Error marking modules as completed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark modules as completed',
      error: error.message
    });
  }
}
