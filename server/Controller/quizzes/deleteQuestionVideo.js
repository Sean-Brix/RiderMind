import { PrismaClient } from '@prisma/client';
import { deleteFile } from '../../utils/firebase.js';
import { clearFileCache } from '../../utils/firebaseCache.js';

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

    console.log('Deleting quiz question video from cloud:', {
      questionId,
      videoPath: question.videoPath
    });

    // Delete from cloud storage
    try {
      await deleteFile(question.videoPath);
      clearFileCache(question.videoPath);
    } catch (err) {
      console.error('Failed to delete cloud video:', question.videoPath, err);
    }

    // Update question to remove video references
    const updatedQuestion = await prisma.quizQuestion.update({
      where: { id: parseInt(questionId) },
      data: {
        videoUrl: null,
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
