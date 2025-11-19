import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Add a question to a quiz
 * Params: quizId
 * Body: { type, question, points, explanation, caseSensitive, shuffleOptions, imageUrl, imagePath, imageMime, videoUrl, videoPath, options[] }
 */
export default async function addQuestion(req, res) {
  try {
    const { quizId } = req.params;
    const {
      type,
      question,
      points,
      position,
      explanation,
      caseSensitive,
      shuffleOptions,
      imageUrl,
      imagePath,
      imageMime,
      videoUrl,
      videoPath,
      options
    } = req.body;

    // Validation
    if (!type || !question) {
      return res.status(400).json({
        success: false,
        error: 'Type and question are required'
      });
    }

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Prepare question data
    const questionData = {
      quizId: parseInt(quizId),
      type,
      question,
      points: points || 1,
      position: position || quiz._count.questions + 1,
      explanation: explanation || null,
      caseSensitive: caseSensitive || false,
      shuffleOptions: shuffleOptions !== undefined ? shuffleOptions : false,
      imageUrl: imageUrl || null,
      imagePath: imagePath || null,
      imageMime: imageMime || null,
      videoUrl: videoUrl || null,
      videoPath: videoPath || null
    };

    // Add options if provided
    if (options && Array.isArray(options)) {
      questionData.options = {
        create: options.map((opt, index) => ({
          optionText: opt.optionText,
          isCorrect: opt.isCorrect || false,
          position: opt.position || index + 1,
          imageUrl: opt.imageUrl || null,
          imagePath: opt.imagePath || null,
          imageMime: opt.imageMime || null
        }))
      };
    }

    // Create question
    const newQuestion = await prisma.quizQuestion.create({
      data: questionData,
      include: {
        options: {
          orderBy: { position: 'asc' }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      data: newQuestion
    });

  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add question',
      message: error.message
    });
  }
}
