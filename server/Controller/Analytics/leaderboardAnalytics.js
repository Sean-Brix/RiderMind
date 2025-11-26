import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get leaderboard in the format expected by Analytics UI
 * GET /api/analytics/leaderboard
 */
export const getLeaderboardAnalytics = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    // Get all student modules with user data
    const studentModules = await prisma.studentModule.findMany({
      where: {
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
        }
      }
    });

    // Get quiz attempts for scoring
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        user: {
          role: 'USER'
        }
      },
      select: {
        userId: true,
        score: true,
        passed: true
      }
    });

    // Group data by user
    const userStats = {};

    studentModules.forEach(sm => {
      const userId = sm.userId;
      if (!userStats[userId]) {
        // Build display name
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
          name: displayName,
          modulesCompleted: 0,
          quizzesTaken: 0,
          quizzesPassed: 0,
          totalQuizScore: 0,
          quizScoreCount: 0
        };
      }

      // Count completed modules
      if (sm.isCompleted) {
        userStats[userId].modulesCompleted++;
      }

      // Quiz stats from student module
      if (sm.quizScore !== null && sm.quizScore !== undefined) {
        userStats[userId].totalQuizScore += sm.quizScore;
        userStats[userId].quizScoreCount++;
      }
    });

    // Process quiz attempts
    quizAttempts.forEach(attempt => {
      const userId = attempt.userId;
      if (userStats[userId]) {
        userStats[userId].quizzesTaken++;
        if (attempt.passed) {
          userStats[userId].quizzesPassed++;
        }
      }
    });

    // Calculate scores and create leaderboard
    const leaderboardData = Object.values(userStats).map(user => {
      const avgScore = user.quizScoreCount > 0 
        ? Math.round(user.totalQuizScore / user.quizScoreCount) 
        : 0;

      // Calculate performance score (weighted)
      const completionWeight = user.modulesCompleted * 10;
      const quizWeight = user.quizzesPassed * 5;
      const scoreWeight = avgScore * 2;
      
      const score = Math.round(completionWeight + quizWeight + scoreWeight);

      // Calculate level based on score
      let level = 1;
      if (score >= 1000) level = 10;
      else if (score >= 800) level = 9;
      else if (score >= 600) level = 8;
      else if (score >= 500) level = 7;
      else if (score >= 400) level = 6;
      else if (score >= 300) level = 5;
      else if (score >= 200) level = 4;
      else if (score >= 100) level = 3;
      else if (score >= 50) level = 2;

      return {
        name: user.name,
        score,
        level,
        modules: user.modulesCompleted,
        quizzes: user.quizzesTaken,
        avgScore
      };
    });

    // Sort by score (highest first)
    leaderboardData.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
      return b.modules - a.modules;
    });

    // Add rank and limit results
    const rankedLeaderboard = leaderboardData.slice(0, limitNum).map((user, index) => ({
      rank: index + 1,
      ...user
    }));

    res.status(200).json({
      success: true,
      data: rankedLeaderboard
    });

  } catch (error) {
    console.error('Error fetching leaderboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard analytics',
      error: error.message
    });
  }
};
