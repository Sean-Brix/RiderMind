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
    const showAnswers = (includeCorrectAnswers === 'true' || includeCorrectAnswers === true) && isAdmin;

    console.log('📚 getQuizById called:', {
      quizId: id,
      userId: req.user?.id,
      userRole: req.user?.role,
      isAdmin,
      includeCorrectAnswers,
      includeCorrectAnswersType: typeof includeCorrectAnswers,
      showAnswers
    });

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
            description: showAnswers,
            points: true,
            position: true,
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
                isCorrect: true, // Always select it
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
      
      console.log(`Processing question: "${question.question}"`);
      console.log(`  showAnswers: ${showAnswers}`);
      console.log(`  Options before filter:`, question.options.map(o => ({text: o.optionText, isCorrect: o.isCorrect})));
      
      // Remove isCorrect from options if user is not allowed to see it
      if (!showAnswers) {
        console.log(`  ❌ Removing isCorrect because showAnswers is false`);
        question.options = question.options.map(opt => {
          const { isCorrect, ...optionWithoutCorrect } = opt;
          return optionWithoutCorrect;
        });
      } else {
        console.log(`  ✅ Keeping isCorrect because showAnswers is true`);
      }
      
      console.log(`  Options after filter:`, question.options.map(o => ({text: o.optionText, isCorrect: o.isCorrect})));
    });

    console.log('📝 Quiz data loaded:', {
      quizId: quiz?.id,
      title: quiz?.title,
      questionsCount: quiz?.questions?.length,
      firstQuestionOptions: quiz?.questions?.[0]?.options,
      showAnswers
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
