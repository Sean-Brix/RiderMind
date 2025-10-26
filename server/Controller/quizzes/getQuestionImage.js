import { PrismaClient } from '@prisma/client';
import { getQuizImageDataURL } from '../../utils/quizMediaHandler.js';

const prisma = new PrismaClient();

/**
 * Get question image as base64 data URL
 * GET /api/quizzes/questions/:questionId/image
 * 
 * Response: Base64 encoded image data URL
 */
export default async function getQuestionImage(req, res) {
  try {
    const { questionId } = req.params;

    // Get question with image data
    const question = await prisma.quizQuestion.findUnique({
      where: { id: parseInt(questionId) },
      select: {
        id: true,
        imageData: true,
        imageMime: true
      }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    if (!question.imageData || !question.imageMime) {
      return res.status(404).json({
        success: false,
        error: 'Question has no image'
      });
    }

    // Convert to base64 data URL
    const imageDataURL = getQuizImageDataURL(question.imageData, question.imageMime);

    res.status(200).json({
      success: true,
      data: {
        id: question.id,
        imageUrl: imageDataURL,
        mimeType: question.imageMime
      }
    });

  } catch (error) {
    console.error('Error getting quiz question image:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to get image',
      message: error.message
    });
  }
}
