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

    console.log('=== QUIZ IMAGE UPLOAD START ===');
    console.log('Request params:', req.params);
    console.log('Has file:', !!req.file);
    if (req.file) {
      console.log('File details:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        size: req.file.size,
        bufferLength: req.file.buffer?.length
      });
    }

    // Validate question exists
    const question = await prisma.quizQuestion.findUnique({
      where: { id: parseInt(questionId) }
    });

    if (!question) {
      console.log('Question not found:', questionId);
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    console.log('Uploading quiz question image:', {
      questionId,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      bufferSize: req.file.buffer.length
    });

    // Get image buffer from multer (memory storage)
    const { imageData, imageMime } = processQuizImageForDB(
      req.file.buffer,
      req.file.mimetype
    );

    console.log('Processed image for DB:', {
      imageMime,
      imageDataLength: imageData.length,
      isBuffer: Buffer.isBuffer(imageData)
    });

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

    console.log('Question updated with image data');
    console.log('=== QUIZ IMAGE UPLOAD SUCCESS ===');

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
