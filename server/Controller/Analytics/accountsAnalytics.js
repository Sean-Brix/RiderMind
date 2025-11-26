import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get Accounts Analytics
 * GET /api/analytics/accounts
 */
export const getAccountsAnalytics = async (req, res) => {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        studentModules: {
          select: {
            isCompleted: true,
            updatedAt: true
          }
        }
      }
    });

    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Calculate total users
    const total = users.length;

    // Calculate active users (users who have activity in last 30 days)
    const active = users.filter(user => {
      const hasRecentActivity = user.studentModules.some(
        sm => new Date(sm.updatedAt) > oneMonthAgo
      );
      return hasRecentActivity;
    }).length;

    // Calculate inactive users
    const inactive = total - active;

    // Calculate new users this month
    const newThisMonth = users.filter(
      user => new Date(user.createdAt) > oneMonthAgo
    ).length;

    // Calculate role distribution
    const roleDistribution = [
      { role: 'Users', count: users.filter(u => u.role === 'USER').length },
      { role: 'Admins', count: users.filter(u => u.role === 'ADMIN').length }
    ];

    // Calculate status distribution (active vs inactive)
    const statusDistribution = [
      { status: 'Active', count: active },
      { status: 'Inactive', count: inactive }
    ];

    // Calculate user growth over last 12 months
    const growth = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const usersInMonth = users.filter(
        user => new Date(user.createdAt) < nextMonthDate
      ).length;

      growth.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        users: usersInMonth
      });
    }

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        inactive,
        newThisMonth,
        roleDistribution,
        statusDistribution,
        growth
      }
    });

  } catch (error) {
    console.error('Get accounts analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve accounts analytics',
      error: error.message
    });
  }
};
