import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new quiz with questions and options
 * Body: { moduleId, title, description, instructions, passingScore, timeLimit, shuffleQuestions, showResults, questions[] }
 */
export default async function createQuiz(req, res) {
  try {
    const {
      moduleId,
      title,
      description,
      instructions,
      passingScore,
      timeLimit,
      shuffleQuestions,
      showResults,
      allowReview,
      maxAttempts,
      questions
    } = req.body;

    // Validation
    if (!moduleId || !title) {
      return res.status(400).json({
        success: false,
        error: 'Module ID and title are required'
      });
    }

    // Verify module exists
    const module = await prisma.module.findUnique({
      where: { id: parseInt(moduleId) }
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Check for duplicate title in same module
    const existing = await prisma.quiz.findFirst({
      where: {
        moduleId: parseInt(moduleId),
        title
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Quiz with this title already exists in this module'
      });
    }

    // Prepare quiz data
    const quizData = {
      title,
      description: description || null,
      instructions: instructions || null,
      passingScore: passingScore || 70,
      timeLimit: timeLimit || null,
      shuffleQuestions: shuffleQuestions !== undefined ? shuffleQuestions : false,
      showResults: showResults !== undefined ? showResults : true,
      createdBy: req.user?.id || null,
      updatedBy: req.user?.id || null,
      module: {
        connect: { id: parseInt(moduleId) }
      }
    };

    // Add questions if provided
    if (questions && Array.isArray(questions)) {
      quizData.questions = {
        create: questions.map((q, qIndex) => {
          const questionData = {
            type: q.type,
            question: q.question,
            description: q.description || null,
            points: q.points || 1,
            position: q.position || qIndex + 1,
            caseSensitive: q.caseSensitive || false,
            shuffleOptions: q.shuffleOptions !== undefined ? q.shuffleOptions : false,
            imageData: q.imageData || null,
            imageMime: q.imageMime || null,
            videoPath: q.videoPath || null
          };

          // Add options if provided
          if (q.options && Array.isArray(q.options)) {
            console.log(`Question "${q.question}" options:`, q.options);
            questionData.options = {
              create: q.options.map((opt, optIndex) => {
                console.log(`  Option ${optIndex}: "${opt.optionText}" - isCorrect: ${opt.isCorrect} (type: ${typeof opt.isCorrect})`);
                return {
                  optionText: opt.optionText,
                  isCorrect: opt.isCorrect === true, // Explicit boolean check
                  position: opt.position || optIndex + 1,
                  imageData: opt.imageData || null,
                  imageMime: opt.imageMime || null
                };
              })
            };
          }

          return questionData;
        })
      };
    }

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: quizData,
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
          include: {
            options: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                optionText: true,
                isCorrect: true,
                position: true,
                imageMime: true,
                imageData: false
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });

  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create quiz',
      message: error.message
    });
  }
}
