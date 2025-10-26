import { PrismaClient } from '@prisma/client';
import { 
  uploadQuizVideo, 
  getQuizVideoRelativePath,
  deleteQuizVideoFile 
} from '../../utils/quizMediaHandler.js';

const prisma = new PrismaClient();

/**
 * Upload video for quiz question
 * PUT /api/quizzes/questions/:questionId/upload-video
 * Uses multer middleware to handle video upload
 * 
 * Files: video (from multer)
 * Response: Updated question with videoPath
 */
export default async function uploadQuestionVideo(req, res) {
  try {
    const { questionId } = req.params;

    // Validate question exists
    const question = await prisma.quizQuestion.findUnique({
      where: { id: parseInt(questionId) }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file provided'
      });
    }

    console.log('Uploading quiz video:', {
      questionId,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Delete old video if exists
    if (question.videoPath) {
      deleteQuizVideoFile(question.videoPath);
    }

    // Get relative path for database
    const videoPath = getQuizVideoRelativePath(req.file.filename);

    // Update question with video path
    const updatedQuestion = await prisma.quizQuestion.update({
      where: { id: parseInt(questionId) },
      data: {
        videoPath,
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
      message: 'Video uploaded successfully',
      data: {
        id: updatedQuestion.id,
        videoPath: updatedQuestion.videoPath,
        question: updatedQuestion
      }
    });

  } catch (error) {
    console.error('Error uploading quiz question video:', error);
    
    // Delete uploaded file if database update failed
    if (req.file && req.file.filename) {
      const videoPath = getQuizVideoRelativePath(req.file.filename);
      deleteQuizVideoFile(videoPath);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload video',
      message: error.message
    });
  }
}

// Export the multer middleware
export { uploadQuizVideo };
