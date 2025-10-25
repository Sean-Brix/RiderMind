import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Add an option to a question
 * Params: questionId
 * Body: { optionText, isCorrect, position, imageData, imageMime }
 */
export default async function addOption(req, res) {
  try {
    const { questionId } = req.params;
    const { optionText, isCorrect, position, imageData, imageMime } = req.body;

    // Validation
    if (!optionText) {
      return res.status(400).json({
        success: false,
        error: 'Option text is required'
      });
    }

    // Verify question exists
    const question = await prisma.quizQuestion.findUnique({
      where: { id: parseInt(questionId) },
      include: {
        _count: {
          select: { options: true }
        }
      }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Create option
    const option = await prisma.quizQuestionOption.create({
      data: {
        questionId: parseInt(questionId),
        optionText,
        isCorrect: isCorrect || false,
        position: position || question._count.options + 1,
        imageData: imageData || null,
        imageMime: imageMime || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Option added successfully',
      data: option
    });

  } catch (error) {
    console.error('Error adding option:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add option',
      message: error.message
    });
  }
}
