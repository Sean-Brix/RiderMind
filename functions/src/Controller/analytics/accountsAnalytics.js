import { getDb, COLLECTIONS, snapshotToArray } from '../../db/firestore.js';

export const getAccountsAnalytics = async (req, res) => {
  try {
    const db = getDb();
    const [userSnap, smSnap] = await Promise.all([
      db.collection(COLLECTIONS.USERS).get(),
      db.collection(COLLECTIONS.STUDENT_MODULES).get(),
    ]);

    const users = snapshotToArray(userSnap);
    const studentModules = snapshotToArray(smSnap);

    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();

    const total = users.length;
    const active = users.filter(u => studentModules.some(sm => sm.userId === u.id && sm.updatedAt > oneMonthAgo)).length;
    const inactive = total - active;
    const newThisMonth = users.filter(u => u.createdAt > oneMonthAgo).length;

    const roleDistribution = [
      { role: 'Users', count: users.filter(u => u.role === 'USER').length },
      { role: 'Admins', count: users.filter(u => u.role === 'ADMIN').length },
    ];
    const statusDistribution = [{ status: 'Active', count: active }, { status: 'Inactive', count: inactive }];

    const growth = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      growth.push({ month: monthDate.toLocaleDateString('en-US', { month: 'short' }), users: users.filter(u => u.createdAt < nextMonthDate.toISOString()).length });
    }

    res.status(200).json({ success: true, data: { total, active, inactive, newThisMonth, roleDistribution, statusDistribution, growth } });
  } catch (error) {
    console.error('Get accounts analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve accounts analytics', error: error.message });
  }
};
