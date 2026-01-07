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

/**
 * Get All Module Feedback (Admin)
 * GET /api/module-feedback/all
 */
export const getAllModuleFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', module, rating, sentiment, dateRange } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where = {
      isActive: true
    };

    // Module filter
    if (module && module !== 'all') {
      where.moduleId = parseInt(module);
    }

    // Rating filter
    if (rating && rating !== 'all') {
      where.rating = parseInt(rating);
    }

    // Sentiment filter
    if (sentiment === 'positive') {
      where.rating = { gte: 4 };
    } else if (sentiment === 'negative') {
      where.rating = { lte: 2 };
    }

    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      where.createdAt = { gte: cutoffDate };
    }

    // Get total count for pagination
    const totalCount = await prisma.moduleFeedback.count({ where });

    // Get paginated feedback
    let feedback = await prisma.moduleFeedback.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            email_address: true,
            first_name: true,
            last_name: true,
            middle_name: true
          }
        },
        module: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limitNum
    });

    // Apply search filter (post-query since it involves multiple fields)
    if (search) {
      const searchLower = search.toLowerCase();
      feedback = feedback.filter(item => {
        const userName = [item.user?.first_name, item.user?.middle_name, item.user?.last_name]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        const userEmail = (item.user?.email_address || item.user?.email || '').toLowerCase();
        
        return item.comment?.toLowerCase().includes(searchLower) ||
               item.module?.title?.toLowerCase().includes(searchLower) ||
               userName.includes(searchLower) ||
               userEmail.includes(searchLower);
      });
    }

    // Calculate stats from all feedback (not just current page)
    const allFeedback = await prisma.moduleFeedback.findMany({
      where: { isActive: true },
      select: {
        rating: true
      }
    });

    const stats = {
      totalFeedback: allFeedback.length,
      avgRating: allFeedback.length > 0 
        ? (allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length).toFixed(1)
        : 0,
      positiveCount: allFeedback.filter(f => f.rating >= 4).length,
      negativeCount: allFeedback.filter(f => f.rating <= 2).length
    };

    res.status(200).json({
      success: true,
      data: feedback,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      },
      stats
    });

  } catch (error) {
    console.error('Get all module feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};
