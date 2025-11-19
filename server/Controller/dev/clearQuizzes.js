import { PrismaClient } from '@prisma/client';
import { clearQuizzes } from '../../prisma/Seeds/quizzes.seed.js';

const prisma = new PrismaClient();

/**
 * Clear all quizzes
 * DELETE /api/dev/clear-quizzes
 * 
 * Deletes all quizzes, questions, and options
 */
export default async function clearQuizzesController(req, res) {
  try {
    console.log('🗑️  Clearing all quizzes...');

    // Get count before deletion
    const count = await prisma.quiz.count();

    if (count === 0) {
      return res.status(400).json({
        success: false,
        error: 'No quizzes to clear'
      });
    }

    // Clear quizzes
    const result = await clearQuizzes(prisma);

    res.status(200).json({
      success: true,
      message: `Cleared ${count} quizzes successfully`,
      data: result
    });

  } catch (error) {
    console.error('❌ Error clearing quizzes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear quizzes',
      message: error.message
    });
  }
}
