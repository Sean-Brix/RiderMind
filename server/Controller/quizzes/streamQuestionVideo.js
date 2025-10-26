import { PrismaClient } from '@prisma/client';
import { streamQuizVideo } from '../../utils/quizMediaHandler.js';

const prisma = new PrismaClient();

/**
 * Stream quiz question video
 * GET /api/quizzes/questions/:questionId/video
 * 
 * Supports range requests for video streaming
 * Response: Video stream
 */
export default async function streamQuestionVideo(req, res) {
  try {
    const { questionId } = req.params;

    // Get question with video path
    const question = await prisma.quizQuestion.findUnique({
      where: { id: parseInt(questionId) },
      select: {
        id: true,
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

    // Stream the video
    streamQuizVideo(question.videoPath, req, res);

  } catch (error) {
    console.error('Error streaming quiz question video:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to stream video',
      message: error.message
    });
  }
}
