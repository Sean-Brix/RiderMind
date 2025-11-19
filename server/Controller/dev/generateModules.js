/**
 * Dev Module Controller - Generate Sample Modules
 * POST /api/dev/generate-modules
 */

import { seedModules } from '../../prisma/Seeds/modules.seed.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function generateModules(req, res) {
  try {
    console.log('🏍️  Generating 10 sample modules...');
    
    const result = await seedModules(prisma);
    
    res.status(201).json({
      success: true,
      message: '10 sample modules generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error generating modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate modules',
      details: error.message
    });
  }
}
