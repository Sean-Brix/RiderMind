import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Delete image from quiz question
 * DELETE /api/quizzes/questions/:questionId/image
 * 
 * Response: Updated question without image
 */
export default async function deleteQuestionImage(req, res) {
  try {
    const { questionId } = req.params;

    // Get question with current image
    const question = await prisma.quizQuestion.findUnique({
      where: { id: parseInt(questionId) }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    if (!question.imageData) {
      return res.status(400).json({
        success: false,
        error: 'Question has no image'
      });
    }

    console.log('Deleting quiz question image:', {
      questionId,
      imageMime: question.imageMime
    });

    // Update question to remove image data
    const updatedQuestion = await prisma.quizQuestion.update({
      where: { id: parseInt(questionId) },
      data: {
        imageData: null,
        imageMime: null,
        updatedAt: new Date()
      },
      include: {
        options: {
          orderBy: { position: 'asc' }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: updatedQuestion
    });

  } catch (error) {
    console.error('Error deleting quiz question image:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to delete image',
      message: error.message
    });
  }
}
