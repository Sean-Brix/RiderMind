import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get Aggregated Module Feedback Analytics
 * GET /api/analytics/feedback/modules
 */
export const getModuleFeedbackAnalytics = async (req, res) => {
  try {
    // Get all active module feedbacks with module details
    const feedbacks = await prisma.moduleFeedback.findMany({
      where: {
        isActive: true
      },
      include: {
        module: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (feedbacks.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalFeedback: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
          avgRating: 0,
          sentimentTrend: [],
          ratingDistribution: [],
          categoryBreakdown: []
        }
      });
    }

    // Calculate sentiment (based on rating)
    const positive = feedbacks.filter(f => f.rating >= 4).length;
    const neutral = feedbacks.filter(f => f.rating === 3).length;
    const negative = feedbacks.filter(f => f.rating <= 2).length;

    // Calculate average rating
    const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const avgRating = parseFloat((totalRating / feedbacks.length).toFixed(1));

    // Rating distribution for chart
    const ratingDistribution = [
      { stars: '5 Stars', count: feedbacks.filter(f => f.rating === 5).length },
      { stars: '4 Stars', count: feedbacks.filter(f => f.rating === 4).length },
      { stars: '3 Stars', count: feedbacks.filter(f => f.rating === 3).length },
      { stars: '2 Stars', count: feedbacks.filter(f => f.rating === 2).length },
      { stars: '1 Star', count: feedbacks.filter(f => f.rating === 1).length }
    ];

    // Group by module for category breakdown
    const moduleStats = {};
    feedbacks.forEach(f => {
      const moduleId = f.moduleId;
      const moduleName = f.module?.title || `Module ${moduleId}`;
      
      if (!moduleStats[moduleId]) {
        moduleStats[moduleId] = {
          category: moduleName,
          count: 0,
          totalRating: 0,
          avgRating: 0
        };
      }
      
      moduleStats[moduleId].count++;
      moduleStats[moduleId].totalRating += f.rating;
    });

    const categoryBreakdown = Object.values(moduleStats)
      .map(stat => ({
        category: stat.category,
        count: stat.count,
        avgRating: parseFloat((stat.totalRating / stat.count).toFixed(1))
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 modules

    // Sentiment trend over time (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentFeedbacks = await prisma.moduleFeedback.findMany({
      where: {
        isActive: true,
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        rating: true,
        createdAt: true
      }
    });

    // Group by month
    const monthlyData = {};
    recentFeedbacks.forEach(f => {
      const monthKey = f.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { positive: 0, neutral: 0, negative: 0 };
      }
      
      if (f.rating >= 4) monthlyData[monthKey].positive++;
      else if (f.rating === 3) monthlyData[monthKey].neutral++;
      else monthlyData[monthKey].negative++;
    });

    const sentimentTrend = Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        positive: data.positive,
        neutral: data.neutral,
        negative: data.negative
      }));

    res.status(200).json({
      success: true,
      data: {
        totalFeedback: feedbacks.length,
        positive,
        neutral,
        negative,
        avgRating,
        sentimentTrend,
        ratingDistribution,
        categoryBreakdown
      }
    });

  } catch (error) {
    console.error('Get module feedback analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve module feedback analytics',
      error: error.message
    });
  }
};

/**
 * Get Aggregated Quiz Reaction Analytics
 * GET /api/analytics/feedback/quizzes
 */
export const getQuizReactionAnalytics = async (req, res) => {
  try {
    // Get all quiz reactions with quiz and question details
    const reactions = await prisma.quizQuestionReaction.findMany({
      where: {
        isActive: true
      },
      include: {
        quizQuestion: {
          include: {
            quiz: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    if (reactions.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalReactions: 0,
          likes: 0,
          dislikes: 0,
          likePercentage: 0,
          topQuizzes: []
        }
      });
    }

    // Calculate totals
    const totalReactions = reactions.length;
    const likes = reactions.filter(r => r.isLike).length;
    const dislikes = reactions.filter(r => !r.isLike).length;
    const likePercentage = parseFloat(((likes / totalReactions) * 100).toFixed(1));

    // Group by quiz
    const quizStats = {};
    reactions.forEach(r => {
      const quizId = r.quizQuestion?.quiz?.id;
      const quizName = r.quizQuestion?.quiz?.title || `Quiz ${quizId}`;
      
      if (!quizId) return;
      
      if (!quizStats[quizId]) {
        quizStats[quizId] = {
          quizName,
          likes: 0,
          dislikes: 0,
          total: 0
        };
      }
      
      quizStats[quizId].total++;
      if (r.isLike) {
        quizStats[quizId].likes++;
      } else {
        quizStats[quizId].dislikes++;
      }
    });

    // Calculate percentages and sort
    const topQuizzes = Object.values(quizStats)
      .map(stat => ({
        quizName: stat.quizName,
        likes: stat.likes,
        dislikes: stat.dislikes,
        total: stat.total,
        likePercentage: parseFloat(((stat.likes / stat.total) * 100).toFixed(1))
      }))
      .sort((a, b) => b.likePercentage - a.likePercentage)
      .slice(0, 10); // Top 10 quizzes

    res.status(200).json({
      success: true,
      data: {
        totalReactions,
        likes,
        dislikes,
        likePercentage,
        topQuizzes
      }
    });

  } catch (error) {
    console.error('Get quiz reaction analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz reaction analytics',
      error: error.message
    });
  }
};
