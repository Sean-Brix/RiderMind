import { PrismaClient } from '@prisma/client';
import { seedQuizzes } from '../../prisma/seeds/quizzes.seed.js';

const prisma = new PrismaClient();

/**
 * Generate quizzes for all modules
 * POST /api/dev/generate-quizzes
 * 
 * Creates quizzes with 10+ random questions per module
 * Questions include random sample media (images/videos)
 */
export default async function generateQuizzes(req, res) {
  try {
    console.log('🎯 Starting quiz generation...');

    // Check if quizzes already exist
    const existingQuizzes = await prisma.quiz.count();
    
    if (existingQuizzes > 0) {
      return res.status(400).json({
        success: false,
        error: 'Quizzes already exist. Clear them first before generating new ones.',
        existingCount: existingQuizzes
      });
    }

    // Generate quizzes
    const result = await seedQuizzes(prisma);

    res.status(200).json({
      success: true,
      message: 'Quizzes generated successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Error generating quizzes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate quizzes',
      message: error.message
    });
  }
}
