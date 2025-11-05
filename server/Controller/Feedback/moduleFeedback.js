import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Submit or Update Module Feedback
 * POST /api/modules/:moduleId/feedback
 */
export const submitModuleFeedback = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { rating, comment, isLike } = req.body;
    const userId = req.user.id; // From authenticate middleware

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be at least 10 characters'
      });
    }

    if (comment.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment must not exceed 1000 characters'
      });
    }

    // Check if module exists
    const module = await prisma.module.findUnique({
      where: { id: parseInt(moduleId) }
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Upsert feedback (create or update)
    const feedback = await prisma.moduleFeedback.upsert({
      where: {
        userId_moduleId: {
          userId: userId,
          moduleId: parseInt(moduleId)
        }
      },
      update: {
        rating: parseInt(rating),
        comment: comment.trim(),
        isLike: isLike !== undefined ? isLike : rating >= 4,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        moduleId: parseInt(moduleId),
        userId: userId,
        rating: parseInt(rating),
        comment: comment.trim(),
        isLike: isLike !== undefined ? isLike : rating >= 4,
        isActive: true
      },
      include: {
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

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Submit module feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};

/**
 * Get Module Feedback List
 * GET /api/modules/:moduleId/feedback
 */
export const getModuleFeedback = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get feedback with pagination
    const [feedbacks, total] = await Promise.all([
      prisma.moduleFeedback.findMany({
        where: {
          moduleId: parseInt(moduleId),
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true
            }
          }
        },
        orderBy: {
          [sortBy]: order
        },
        skip: skip,
        take: parseInt(limit)
      }),
      prisma.moduleFeedback.count({
        where: {
          moduleId: parseInt(moduleId),
          isActive: true
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        feedbacks,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get module feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback',
      error: error.message
    });
  }
};

/**
 * Get Module Feedback Statistics
 * GET /api/modules/:moduleId/feedback/stats
 */
export const getModuleFeedbackStats = async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Get all active feedback for the module
    const feedbacks = await prisma.moduleFeedback.findMany({
      where: {
        moduleId: parseInt(moduleId),
        isActive: true
      },
      select: {
        rating: true,
        isLike: true
      }
    });

    if (feedbacks.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalFeedbacks: 0,
          averageRating: 0,
          totalLikes: 0,
          totalDislikes: 0,
          totalComments: 0,
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          }
        }
      });
    }

    // Calculate statistics
    const totalFeedbacks = feedbacks.length;
    const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = (totalRating / totalFeedbacks).toFixed(2);
    const totalLikes = feedbacks.filter(f => f.isLike).length;
    const totalDislikes = feedbacks.filter(f => !f.isLike).length;

    // Rating distribution
    const ratingDistribution = {
      1: feedbacks.filter(f => f.rating === 1).length,
      2: feedbacks.filter(f => f.rating === 2).length,
      3: feedbacks.filter(f => f.rating === 3).length,
      4: feedbacks.filter(f => f.rating === 4).length,
      5: feedbacks.filter(f => f.rating === 5).length
    };

    res.status(200).json({
      success: true,
      data: {
        totalFeedbacks,
        averageRating: parseFloat(averageRating),
        totalLikes,
        totalDislikes,
        totalComments: totalFeedbacks,
        ratingDistribution
      }
    });

  } catch (error) {
    console.error('Get module feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback statistics',
      error: error.message
    });
  }
};

/**
 * Get User's Feedback for a Module
 * GET /api/modules/:moduleId/feedback/my
 */
export const getMyModuleFeedback = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.id; // From authenticate middleware

    const feedback = await prisma.moduleFeedback.findUnique({
      where: {
        userId_moduleId: {
          userId: userId,
          moduleId: parseInt(moduleId)
        }
      },
      include: {
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

    // Check if feedback exists and is active
    if (!feedback || !feedback.isActive) {
      return res.status(404).json({
        success: false,
        message: 'No feedback found'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error('Get my module feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your feedback',
      error: error.message
    });
  }
};

/**
 * Delete Module Feedback (Soft Delete)
 * DELETE /api/modules/:moduleId/feedback
 */
export const deleteModuleFeedback = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const userId = req.user.id; // From authenticate middleware

    // Find the feedback
    const feedback = await prisma.moduleFeedback.findUnique({
      where: {
        userId_moduleId: {
          userId: userId,
          moduleId: parseInt(moduleId)
        }
      }
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Soft delete
    await prisma.moduleFeedback.update({
      where: {
        userId_moduleId: {
          userId: userId,
          moduleId: parseInt(moduleId)
        }
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('Delete module feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback',
      error: error.message
    });
  }
};
