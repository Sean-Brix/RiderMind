import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// DELETE /api/dev/clear-student-modules - Delete all student modules
router.delete('/clear-student-modules', authenticate, async (req, res) => {
  try {
    // Delete all student modules
    const result = await prisma.studentModule.deleteMany({});
    
    console.log(`🗑️ Deleted ${result.count} student modules (requested by user ${req.user.id})`);
    
    res.json({
      success: true,
      message: 'All student modules deleted successfully',
      deletedCount: result.count
    });
  } catch (error) {
    console.error('❌ Error deleting student modules:', error);
    res.status(500).json({
      error: 'Failed to delete student modules',
      details: error.message
    });
  }
});

export default router;
