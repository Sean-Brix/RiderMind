import { PrismaClient } from '@prisma/client';
import { deleteQuizVideoFile } from '../../utils/quizMediaHandler.js';

const prisma = new PrismaClient();

/**
 * Delete video from quiz question
 * DELETE /api/quizzes/questions/:questionId/video
 * 
 * Response: Updated question without video
 */
export default async function deleteQuestionVideo(req, res) {
  try {
    const { questionId } = req.params;

    // Get question with current video
    const question = await prisma.quizQuestion.findUnique({
      where: { id: parseInt(questionId) }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    if (!question.videoPath) {
      return res.status(400).json({
        success: false,
        error: 'Question has no video'
      });
    }

    console.log('Deleting quiz video:', {
      questionId,
      videoPath: question.videoPath
    });

    // Delete video file from filesystem
    deleteQuizVideoFile(question.videoPath);

    // Update question to remove video path
    const updatedQuestion = await prisma.quizQuestion.update({
      where: { id: parseInt(questionId) },
      data: {
        videoPath: null,
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
      message: 'Video deleted successfully',
      data: updatedQuestion
    });

  } catch (error) {
    console.error('Error deleting quiz question video:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to delete video',
      message: error.message
    });
  }
}
