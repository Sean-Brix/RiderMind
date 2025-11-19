/**
 * Dev Module Controller - Clear All Modules
 * DELETE /api/dev/clear-modules
 */

import { clearModules } from '../../prisma/Seeds/modules.seed.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function clearAllModules(req, res) {
  try {
    console.log('🗑️  Clearing all modules...');
    
    const result = await clearModules(prisma);
    
    res.status(200).json({
      success: true,
      message: 'All modules cleared successfully',
      data: result
    });
  } catch (error) {
    console.error('Error clearing modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear modules',
      details: error.message
    });
  }
}
