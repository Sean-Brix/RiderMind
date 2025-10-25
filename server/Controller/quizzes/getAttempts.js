import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get user's quiz attempts
 * Query: userId (admin only), quizId
 */
export default async function getAttempts(req, res) {
  try {
    const { userId: queryUserId, quizId } = req.query;
    const currentUserId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    // Determine which user's attempts to fetch
    let userId = currentUserId;
    if (queryUserId && isAdmin) {
      userId = parseInt(queryUserId);
    } else if (queryUserId && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view other users\' attempts'
      });
    }

    // Build query
    const where = { userId };
    if (quizId) {
      where.quizId = parseInt(quizId);
    }

    const attempts = await prisma.quizAttempt.findMany({
      where,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            module: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        _count: {
          select: {
            answers: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });

  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attempts',
      message: error.message
    });
  }
}
