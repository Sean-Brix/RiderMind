import { PrismaClient } from '@prisma/client';
import { 
  uploadQuizImage, 
  processQuizImageForDB 
} from '../../utils/quizMediaHandler.js';

const prisma = new PrismaClient();

/**
 * Upload image for quiz question
 * PUT /api/quizzes/questions/:questionId/upload-image
 * Uses multer middleware to handle image upload
 * 
 * Files: image (from multer)
 * Response: Updated question with image data
 */
export default async function uploadQuestionImage(req, res) {
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
        error: 'No image file provided'
      });
    }

    console.log('Uploading quiz question image:', {
      questionId,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Get image buffer from multer (memory storage)
    const { imageData, imageMime } = processQuizImageForDB(
      req.file.buffer,
      req.file.mimetype
    );

    // Update question with image data
    const updatedQuestion = await prisma.quizQuestion.update({
      where: { id: parseInt(questionId) },
      data: {
        imageData,
        imageMime,
        updatedAt: new Date()
      },
      include: {
        options: {
          orderBy: { position: 'asc' }
        }
      }
    });

    // Return question without binary data (too large for response)
    const questionResponse = {
      ...updatedQuestion,
      imageData: undefined, // Remove binary data
      hasImage: !!updatedQuestion.imageData
    };

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        id: updatedQuestion.id,
        hasImage: true,
        imageMime: updatedQuestion.imageMime,
        question: questionResponse
      }
    });

  } catch (error) {
    console.error('Error uploading quiz question image:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
      message: error.message
    });
  }
}

// Export the multer middleware
export { uploadQuizImage };
