import { PrismaClient } from '@prisma/client';
import { getFileUrlCached } from '../../utils/firebaseCache.js';

const prisma = new PrismaClient();

/**
 * Stream quiz question video (cloud redirect)
 * GET /api/quizzes/questions/:questionId/video
 * 
 * Response: Redirect to Firebase download URL
 */
export default async function streamQuestionVideo(req, res) {
  try {
    const { questionId } = req.params;

    // Get question with cloud references
    const question = await prisma.quizQuestion.findUnique({
      where: { id: parseInt(questionId) },
      select: {
        id: true,
        videoUrl: true,
        videoPath: true
      }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    if (!question.videoPath) {
      return res.status(404).json({
        success: false,
        error: 'Question has no video'
      });
    }

    // Use cached download URL if available
    try {
      const url = question.videoUrl || await getFileUrlCached(question.videoPath);
      if (!url) {
        return res.status(404).json({ success: false, error: 'Video URL not available' });
      }

      // Redirect to the signed download URL
      return res.redirect(url);
    } catch (err) {
      console.error('Error resolving quiz question video URL:', questionId, err);
      return res.status(500).json({ success: false, error: 'Failed to resolve video URL', message: err.message });
    }

  } catch (error) {
    console.error('Error streaming quiz question video:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to stream video',
      message: error.message
    });
  }
}
