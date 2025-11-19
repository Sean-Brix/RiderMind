import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all quizzes with optional filtering
 * Query params: moduleId, includeQuestions, includeOptions
 */
export default async function getQuizzes(req, res) {
  try {
    const { moduleId, includeQuestions, includeOptions } = req.query;

    // Build query filter
    const where = {};
    if (moduleId) {
      where.moduleId = parseInt(moduleId);
    }

    // Build include options
    const include = {};
    
    if (includeQuestions === 'true') {
      include.questions = {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          type: true,
          question: true,
          description: true,
          points: true,
          position: true,
          isRequired: true,
          caseSensitive: true,
          shuffleOptions: true,
          imageUrl: true,
          imagePath: true,
          imageMime: true,
          videoUrl: true,
          videoPath: true,
          createdAt: true,
          updatedAt: true,
          // Include options if requested
          options: includeOptions === 'true' ? {
            orderBy: { position: 'asc' },
            select: {
              id: true,
              optionText: true,
              isCorrect: true,
              position: true,
              imageUrl: true,
              imagePath: true,
              imageMime: true
            }
          } : false
        }
      };
    }

    // Always include module info
    include.module = {
      select: {
        id: true,
        title: true,
        description: true
      }
    };

    // Always include question count for analytics
    include._count = {
      select: {
        questions: true
      }
    };

    const quizzes = await prisma.quiz.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });

  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quizzes',
      message: error.message
    });
  }
}
