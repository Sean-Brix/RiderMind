import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get Quizzes Analytics
 * GET /api/analytics/quizzes
 */
export const getQuizzesAnalytics = async (req, res) => {
  try {
    // Get all quizzes
    const quizzes = await prisma.quiz.findMany({
      where: {
        isActive: true
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            categoryModules: {
              include: {
                category: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            attempts: true
          }
        }
      }
    });

    // Get all quiz attempts
    const attempts = await prisma.quizAttempt.findMany({
      select: {
        id: true,
        score: true,
        passed: true,
        submittedAt: true,
        quiz: {
          select: {
            id: true,
            passingScore: true,
            module: {
              select: {
                categoryModules: {
                  include: {
                    category: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const now = new Date();

    // Calculate total quizzes
    const totalQuizzes = quizzes.length;

    // Calculate total attempts
    const totalAttempts = attempts.length;

    // Calculate average score
    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
    const avgScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;

    // Calculate pass rate
    const passedAttempts = attempts.filter(a => a.passed).length;
    const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

    // Calculate attempts over time (last 12 weeks)
    const attemptsOverTime = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekAttempts = attempts.filter(a => {
        const attemptDate = new Date(a.submittedAt);
        return attemptDate >= weekStart && attemptDate < weekEnd;
      }).length;

      attemptsOverTime.push({
        week: `Week ${12 - i}`,
        attempts: weekAttempts
      });
    }

    // Calculate score distribution
    const scoreRanges = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 }
    ];

    attempts.forEach(a => {
      if (a.score <= 20) scoreRanges[0].count++;
      else if (a.score <= 40) scoreRanges[1].count++;
      else if (a.score <= 60) scoreRanges[2].count++;
      else if (a.score <= 80) scoreRanges[3].count++;
      else scoreRanges[4].count++;
    });

    // Calculate category performance
    const categoryStats = {};
    
    attempts.forEach(a => {
      const categories = a.quiz?.module?.categoryModules || [];
      
      categories.forEach(cm => {
        const categoryName = cm.category?.name || 'Uncategorized';
        
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = {
            category: categoryName,
            attempts: 0,
            totalScore: 0,
            passed: 0
          };
        }
        
        categoryStats[categoryName].attempts++;
        categoryStats[categoryName].totalScore += a.score;
        if (a.passed) categoryStats[categoryName].passed++;
      });
    });

    const categoryPerformance = Object.values(categoryStats)
      .map(stat => ({
        category: stat.category,
        attempts: stat.attempts,
        avgScore: Math.round(stat.totalScore / stat.attempts),
        passRate: Math.round((stat.passed / stat.attempts) * 100)
      }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 5); // Top 5 categories

    res.status(200).json({
      success: true,
      data: {
        totalQuizzes,
        totalAttempts,
        avgScore,
        passRate,
        attemptsOverTime,
        scoreDistribution: scoreRanges,
        categoryPerformance
      }
    });

  } catch (error) {
    console.error('Get quizzes analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quizzes analytics',
      error: error.message
    });
  }
};
