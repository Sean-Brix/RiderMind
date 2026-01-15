import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Get leaderboard data with filtering options
 * Query params:
 * - timeFrame: 'all-time', 'month', 'year'
 * - limit: number of results (default 50)
 */
export default async function getLeaderboard(req, res) {
  try {
    const { timeFrame = 'all-time', limit = 50 } = req.query;
    const limitNum = parseInt(limit);

    // Calculate date filter based on timeFrame
    let studentModuleDateFilter = {};
    let quizAttemptDateFilter = {};
    const now = new Date();

    if (timeFrame === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      studentModuleDateFilter = {
        updatedAt: {
          gte: startOfMonth
        }
      };
      quizAttemptDateFilter = {
        submittedAt: {
          gte: startOfMonth
        }
      };
    } else if (timeFrame === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      studentModuleDateFilter = {
        updatedAt: {
          gte: startOfYear
        }
      };
      quizAttemptDateFilter = {
        submittedAt: {
          gte: startOfYear
        }
      };
    }

    // Get all student modules with user data
    const studentModules = await prisma.studentModule.findMany({
      where: {
        ...studentModuleDateFilter
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            middle_name: true,
            last_name: true,
            createdAt: true,
            role: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            vehicleType: true
          }
        }
      }
    });

    console.log(`[Leaderboard] Found ${studentModules.length} student modules (before role filter)`);
    
    // Use all student modules (including admins for testing)
    const userModules = studentModules;
    
    console.log(`[Leaderboard] After role filter: ${userModules.length} student modules`);
    console.log(`[Leaderboard] TimeFrame: ${timeFrame}, Date filter:`, studentModuleDateFilter);

    // Get quiz attempts for more detailed scoring (including time spent)
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        ...quizAttemptDateFilter,
        user: {
          role: 'USER'
        }
      },
      select: {
        id: true,
        userId: true,
        score: true,
        passed: true,
        submittedAt: true,
        timeSpent: true,
        quiz: {
          select: {
            timeLimit: true
          }
        }
      }
    });

    // Group data by user
    const userStats = {};

    userModules.forEach(sm => {
      const userId = sm.userId;
      if (!userStats[userId]) {
        // Build display name from first, middle, and last name
        const nameParts = [
          sm.user.first_name,
          sm.user.middle_name,
          sm.user.last_name
        ].filter(Boolean);
        const displayName = nameParts.length > 0 
          ? nameParts.join(' ') 
          : sm.user.email?.split('@')[0] || 'Anonymous';

        userStats[userId] = {
          userId,
          displayName,
          email: sm.user.email,
          totalModulesCompleted: 0,
          totalModulesInProgress: 0,
          totalQuizAttempts: 0,
          totalQuizzesPassed: 0,
          averageQuizScore: 0,
          totalQuizScores: 0,
          quizScoreCount: 0,
          highestScore: 0,
          categories: []
        };
      }

      // Count completed modules
      if (sm.isCompleted) {
        userStats[userId].totalModulesCompleted++;
      } else if (sm.progress > 0) {
        userStats[userId].totalModulesInProgress++;
      }

      // Quiz stats from student module
      userStats[userId].totalQuizAttempts += sm.quizAttempts || 0;
      
      if (sm.quizScore !== null && sm.quizScore !== undefined) {
        userStats[userId].totalQuizScores += sm.quizScore;
        userStats[userId].quizScoreCount++;
        if (sm.quizScore > userStats[userId].highestScore) {
          userStats[userId].highestScore = sm.quizScore;
        }
      }

      // Track categories
      if (sm.category && !userStats[userId].categories.includes(sm.category.name)) {
        userStats[userId].categories.push(sm.category.name);
      }
    });

    // Aggregate quiz attempts per user for time and pass stats
    const userTimeStats = {};

    // Process quiz attempts to count passed quizzes and track time usage
    quizAttempts.forEach(attempt => {
      const userId = attempt.userId;
      if (userId && userStats[userId]) {
        if (attempt.passed) {
          userStats[userId].totalQuizzesPassed++;
        }

        const timeSpent = attempt.timeSpent || 0;
        const timeLimit = attempt.quiz?.timeLimit || 0;

        if (!userTimeStats[userId]) {
          userTimeStats[userId] = {
            totalTimeSpent: 0,
            totalTimeLimit: 0
          };
        }

        userTimeStats[userId].totalTimeSpent += timeSpent;
        if (timeLimit > 0) {
          userTimeStats[userId].totalTimeLimit += timeLimit;
        }
      }
    });

    // Calculate average scores and create leaderboard array
    const leaderboardData = Object.values(userStats).map(user => {
      const avgScore = user.quizScoreCount > 0 
        ? Math.round(user.totalQuizScores / user.quizScoreCount) 
        : 0;
      
      user.averageQuizScore = avgScore;

      // For ranking and display, we now align "Points" directly
      // with the visible total score percentage. This avoids
      // confusing cases where someone has a high % but 0 points.
      const performanceScore = Math.max(0, Math.round(avgScore));

      return {
        ...user,
        performanceScore,
        passRate: user.totalQuizAttempts > 0 
          ? Math.round((user.totalQuizzesPassed / user.totalQuizAttempts) * 100) 
          : 0
      };
    });

    // Sort by performance score (highest first)
    leaderboardData.sort((a, b) => {
      // Primary: performance score
      if (b.performanceScore !== a.performanceScore) {
        return b.performanceScore - a.performanceScore;
      }
      // Tiebreaker 1: average quiz score
      if (b.averageQuizScore !== a.averageQuizScore) {
        return b.averageQuizScore - a.averageQuizScore;
      }
      // Tiebreaker 2: modules completed
      if (b.totalModulesCompleted !== a.totalModulesCompleted) {
        return b.totalModulesCompleted - a.totalModulesCompleted;
      }
      // Tiebreaker 3: quiz attempts (more engagement)
      return b.totalQuizAttempts - a.totalQuizAttempts;
    });

    // Add rank
    const rankedLeaderboard = leaderboardData.slice(0, limitNum).map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    console.log(`[Leaderboard] Returning ${rankedLeaderboard.length} users`);
    console.log('[Leaderboard] Sample data:', rankedLeaderboard[0]);

    return res.status(200).json({
      success: true,
      data: rankedLeaderboard,
      timeFrame,
      totalUsers: leaderboardData.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard',
      details: error.message
    });
  }
}
