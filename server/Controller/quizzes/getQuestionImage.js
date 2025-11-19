import { PrismaClient } from '@prisma/client';
import { getFileUrlCached } from '../../utils/firebaseCache.js';

const prisma = new PrismaClient();

/**
 * Get question image data (cloud redirect)
 * GET /api/quizzes/questions/:questionId/image
 * 
 * Response: Redirect to Firebase download URL
 */
export default async function getQuestionImage(req, res) {
  try {
    const { questionId } = req.params;

    // Get question with cloud references
    const question = await prisma.quizQuestion.findUnique({
      where: { id: parseInt(questionId) },
      select: {
        id: true,
        imageUrl: true,
        imagePath: true,
        imageMime: true
      }
    });

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    if (!question.imagePath) {
      return res.status(404).json({ success: false, error: 'Question has no image' });
    }

    // Use cached download URL if available
    try {
      const url = question.imageUrl || await getFileUrlCached(question.imagePath);
      if (!url) {
        return res.status(404).json({ success: false, error: 'Image URL not available' });
      }

      // Redirect to the signed download URL
      return res.redirect(url);
    } catch (err) {
      console.error('Error resolving quiz question image URL:', questionId, err);
      return res.status(500).json({ success: false, error: 'Failed to resolve image URL', message: err.message });
    }

  } catch (error) {
    console.error('Error getting quiz question image:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to get image',
      message: error.message
    });
  }
}
