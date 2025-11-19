import { PrismaClient } from '@prisma/client';
import { uploadFile, deleteFile, generateUniqueFilename } from '../../utils/firebase.js';
import { clearFileCache } from '../../utils/firebaseCache.js';
import { uploadQuizImage } from '../../utils/quizMediaHandler.js';

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

    // Get quiz info for organized path
    const quiz = await prisma.quiz.findFirst({
      where: {
        questions: {
          some: { id: parseInt(questionId) }
        }
      }
    });

    console.log('Uploading quiz question image to Firebase:', {
      questionId,
      quizId: quiz?.id,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Delete old image from Firebase if exists
    if (question.imagePath) {
      try {
        await deleteFile(question.imagePath);
        await clearFileCache(question.imagePath);
        console.log('Deleted old image:', question.imagePath);
      } catch (err) {
        console.warn('Could not delete old image:', err.message);
      }
    }

    // Generate unique filename and upload to Firebase
    const filename = generateUniqueFilename(req.file.originalname);
    const storagePath = `quizzes/${quiz?.id || 'unknown'}/questions/${questionId}/${filename}`;
    
    const uploadResult = await uploadFile(
      req.file.buffer,
      storagePath,
      req.file.mimetype
    );

    console.log('✅ Uploaded to Firebase:', storagePath);

    // Update question with Firebase URLs
    const updatedQuestion = await prisma.quizQuestion.update({
      where: { id: parseInt(questionId) },
      data: {
        imageUrl: uploadResult.url,
        imagePath: storagePath,
        imageMime: req.file.mimetype,
        updatedAt: new Date()
      },
      include: {
        options: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            optionText: true,
            isCorrect: true,
            position: true,
            imageUrl: true,
            imagePath: true,
            imageMime: true
          }
        }
      }
    });

    console.log('Question updated with Firebase URLs');
    console.log('=== QUIZ IMAGE UPLOAD SUCCESS ===');

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to Firebase Storage',
      data: {
        id: updatedQuestion.id,
        imageUrl: updatedQuestion.imageUrl,
        imagePath: updatedQuestion.imagePath,
        imageMime: updatedQuestion.imageMime,
        question: updatedQuestion
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

// Export multer middleware for route
export { uploadQuizImage };
