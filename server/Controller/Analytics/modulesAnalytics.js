import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get Modules Analytics
 * GET /api/analytics/modules
 */
export const getModulesAnalytics = async (req, res) => {
  try {
    // Get all modules
    const modules = await prisma.module.findMany({
      where: {
        isActive: true
      },
      include: {
        categoryModules: {
          include: {
            category: {
              select: {
                name: true
              }
            }
          }
        },
        studentModules: {
          select: {
            id: true,
            userId: true,
            progress: true,
            isCompleted: true,
            skillLevel: true,
            quizScore: true,
            startedAt: true,
            completedAt: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            studentModules: true
          }
        }
      }
    });

    const now = new Date();

    // Calculate total modules
    const totalModules = modules.length;

    // Calculate total enrollments
    const totalEnrollments = modules.reduce((sum, m) => sum + m._count.studentModules, 0);

    // Calculate average completion rate
    let totalCompletionSum = 0;
    let completedModules = 0;
    
    modules.forEach(m => {
      m.studentModules.forEach(sm => {
        totalCompletionSum += sm.progress;
        if (sm.isCompleted) completedModules++;
      });
    });

    const avgCompletionRate = totalEnrollments > 0 
      ? Math.round(totalCompletionSum / totalEnrollments) 
      : 0;

    // Calculate average time to complete (in hours)
    let totalTimeInMs = 0;
    let countWithTime = 0;

    modules.forEach(m => {
      m.studentModules.forEach(sm => {
        if (sm.startedAt && sm.completedAt) {
          const timeSpent = new Date(sm.completedAt) - new Date(sm.startedAt);
          totalTimeInMs += timeSpent;
          countWithTime++;
        }
      });
    });

    const avgTimeInHours = countWithTime > 0 
      ? totalTimeInMs / countWithTime / (1000 * 60 * 60) 
      : 0;

    let avgTimeToComplete;
    if (avgTimeInHours < 1) {
      avgTimeToComplete = `${Math.round(avgTimeInHours * 60)} min`;
    } else if (avgTimeInHours < 24) {
      avgTimeToComplete = `${Math.round(avgTimeInHours * 10) / 10} hrs`;
    } else {
      avgTimeToComplete = `${Math.round(avgTimeInHours / 24 * 10) / 10} days`;
    }

    // Calculate enrollment trend (last 12 months)
    const enrollmentTrend = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      let monthEnrollments = 0;
      modules.forEach(m => {
        m.studentModules.forEach(sm => {
          const enrollDate = new Date(sm.createdAt);
          if (enrollDate >= monthDate && enrollDate < nextMonthDate) {
            monthEnrollments++;
          }
        });
      });

      enrollmentTrend.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        enrollments: monthEnrollments
      });
    }

    // Calculate completion by category
    const categoryStats = {};

    modules.forEach(m => {
      m.categoryModules.forEach(cm => {
        const categoryName = cm.category?.name || 'Uncategorized';
        
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = {
            category: categoryName,
            totalProgress: 0,
            count: 0
          };
        }

        m.studentModules.forEach(sm => {
          categoryStats[categoryName].totalProgress += sm.progress;
          categoryStats[categoryName].count++;
        });
      });
    });

    const completionByCategory = Object.values(categoryStats)
      .map(stat => ({
        category: stat.category,
        avgCompletion: stat.count > 0 ? Math.round(stat.totalProgress / stat.count) : 0
      }))
      .sort((a, b) => b.avgCompletion - a.avgCompletion);

    // Calculate skill level distribution
    const skillLevelCounts = {
      Beginner: 0,
      Intermediate: 0,
      Expert: 0
    };

    modules.forEach(m => {
      m.studentModules.forEach(sm => {
        if (skillLevelCounts[sm.skillLevel] !== undefined) {
          skillLevelCounts[sm.skillLevel]++;
        }
      });
    });

    const skillLevelDistribution = [
      { level: 'Beginner', enrollments: skillLevelCounts.Beginner },
      { level: 'Intermediate', enrollments: skillLevelCounts.Intermediate },
      { level: 'Expert', enrollments: skillLevelCounts.Expert }
    ];

    // Get top performing modules
    const modulePerformance = modules.map(m => {
      const enrollments = m.studentModules.length;
      const completed = m.studentModules.filter(sm => sm.isCompleted).length;
      const completionRate = enrollments > 0 
        ? Math.round((completed / enrollments) * 100) 
        : 0;

      const quizScores = m.studentModules
        .map(sm => sm.quizScore)
        .filter(score => score !== null && score !== undefined);
      
      const avgScore = quizScores.length > 0
        ? Math.round(quizScores.reduce((sum, s) => sum + s, 0) / quizScores.length)
        : 0;

      return {
        name: m.title,
        enrollments,
        completionRate,
        avgScore
      };
    });

    const topModules = modulePerformance
      .sort((a, b) => {
        // Sort by completion rate first, then by enrollments
        if (b.completionRate !== a.completionRate) {
          return b.completionRate - a.completionRate;
        }
        return b.enrollments - a.enrollments;
      })
      .slice(0, 5); // Top 5 modules

    res.status(200).json({
      success: true,
      data: {
        totalModules,
        totalEnrollments,
        avgCompletionRate,
        avgTimeToComplete,
        enrollmentTrend,
        completionByCategory,
        skillLevelDistribution,
        topModules
      }
    });

  } catch (error) {
    console.error('Get modules analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve modules analytics',
      error: error.message
    });
  }
};
