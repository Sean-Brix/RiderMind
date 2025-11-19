import { PrismaClient } from '@prisma/client';
import { uploadFile, deleteFile, generateUniqueFilename } from '../../utils/firebase.js';
import { clearFileCache } from '../../utils/firebaseCache.js';
import { uploadQuizVideo } from '../../utils/quizMediaHandler.js';

const prisma = new PrismaClient();

/**
 * Upload video for quiz question
 * PUT /api/quizzes/questions/:questionId/upload-video
 * Uses multer middleware to handle video upload
 * 
 * Files: video (from multer)
 * Response: Updated question with videoUrl and videoPath
 */
export default async function uploadQuestionVideo(req, res) {
  try {
    const { questionId } = req.params;

    console.log('=== QUIZ VIDEO UPLOAD START (Firebase) ===');
    console.log('Request params:', req.params);
    console.log('Has file:', !!req.file);

    // Validate question exists and get quiz info
    const question = await prisma.quizQuestion.findUnique({
      where: { id: parseInt(questionId) },
      include: {
        quiz: {
          select: { id: true }
        }
      }
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
        error: 'No video file provided'
      });
    }

    console.log('Uploading quiz video to Firebase:', {
      questionId,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Delete old video from Firebase if exists
    if (question.videoPath) {
      console.log('Deleting old video from Firebase:', question.videoPath);
      try {
        await deleteFile(question.videoPath);
        clearFileCache(question.videoPath);
      } catch (err) {
        console.error('Failed to delete old video:', err);
      }
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = generateUniqueFilename(req.file.originalname);
    
    // Create organized storage path
    const storagePath = `quizzes/${question.quiz.id}/questions/${questionId}/${timestamp}-${filename}`;
    
    console.log('Firebase storage path:', storagePath);

    // Upload to Firebase Storage
    const uploadResult = await uploadFile(
      req.file.buffer,
      storagePath,
      req.file.mimetype
    );

    console.log('Video uploaded to Firebase:', uploadResult.url);

    // Update question with Firebase references
    const updatedQuestion = await prisma.quizQuestion.update({
      where: { id: parseInt(questionId) },
      data: {
        videoUrl: uploadResult.url,
        videoPath: storagePath,
        updatedAt: new Date()
      },
      include: {
        options: {
          orderBy: { position: 'asc' }
        }
      }
    });

    console.log('Question updated with videoUrl and videoPath');
    console.log('=== QUIZ VIDEO UPLOAD SUCCESS ===');

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        id: updatedQuestion.id,
        videoUrl: updatedQuestion.videoUrl,
        videoPath: updatedQuestion.videoPath,
        question: updatedQuestion
      }
    });

  } catch (error) {
    console.error('Error uploading quiz question video:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to upload video',
      message: error.message
    });
  }
}

// Export multer middleware for route
export { uploadQuizVideo };
