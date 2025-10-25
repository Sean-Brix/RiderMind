import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get a single quiz by ID with all questions and options
 * Params: id
 * Query: includeCorrectAnswers (default: false for students)
 */
export default async function getQuizById(req, res) {
  try {
    const { id } = req.params;
    const { includeCorrectAnswers } = req.query;
    
    // Only admins should see correct answers before quiz submission
    const isAdmin = req.user?.role === 'ADMIN';
    const showAnswers = includeCorrectAnswers === 'true' && isAdmin;

    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(id) },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            description: true
          }
        },
        questions: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            type: true,
            question: true,
            points: true,
            position: true,
            explanation: showAnswers,
            caseSensitive: true,
            shuffleOptions: true,
            videoPath: true,
            imageMime: true,
            imageData: false,
            options: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                optionText: true,
                isCorrect: showAnswers, // Hide correct answers for students
                position: true,
                imageMime: true,
                imageData: false
              }
            }
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Shuffle options if specified (only for students taking quiz)
    if (!showAnswers && quiz.shuffleQuestions) {
      quiz.questions = quiz.questions.sort(() => Math.random() - 0.5);
    }

    quiz.questions.forEach(question => {
      if (question.shuffleOptions && !showAnswers) {
        question.options = question.options.sort(() => Math.random() - 0.5);
      }
    });

    res.status(200).json({
      success: true,
      data: quiz
    });

  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz',
      message: error.message
    });
  }
}
