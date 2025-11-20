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
        ...studentModuleDateFilter,
        user: {
          role: 'USER' // Only include regular users, not admins
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            middle_name: true,
            last_name: true,
            createdAt: true
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

    // Get quiz attempts for more detailed scoring
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
        submittedAt: true
      }
    });

    // Group data by user
    const userStats = {};

    studentModules.forEach(sm => {
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
      if (sm.completed) {
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

    // Process quiz attempts to count passed quizzes
    quizAttempts.forEach(attempt => {
      const userId = attempt.userId;
      if (userId && userStats[userId]) {
        if (attempt.passed) {
          userStats[userId].totalQuizzesPassed++;
        }
      }
    });

    // Calculate average scores and create leaderboard array
    const leaderboardData = Object.values(userStats).map(user => {
      const avgScore = user.quizScoreCount > 0 
        ? Math.round(user.totalQuizScores / user.quizScoreCount) 
        : 0;
      
      user.averageQuizScore = avgScore;

      // Calculate overall performance score (weighted)
      // 40% average quiz score, 30% completion rate, 20% quiz attempts, 10% pass rate
      const completionWeight = user.totalModulesCompleted * 5; // Each completed module is worth 5 points
      const attemptWeight = Math.min(user.totalQuizAttempts * 2, 40); // Cap at 40 points
      const passRateWeight = user.totalQuizAttempts > 0 
        ? (user.totalQuizzesPassed / user.totalQuizAttempts) * 20 
        : 0;
      const scoreWeight = avgScore * 0.4;

      const performanceScore = Math.round(
        scoreWeight + completionWeight + attemptWeight + passRateWeight
      );

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
