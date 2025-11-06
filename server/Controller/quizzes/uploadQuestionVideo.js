import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  uploadQuizVideo, 
  getQuizVideoRelativePath,
  deleteQuizVideoFile 
} from '../../utils/quizMediaHandler.js';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    console.log('=== QUIZ VIDEO UPLOAD START ===');
    console.log('Request params:', req.params);
    console.log('Has file:', !!req.file);
    
    // CRITICAL DEBUG - Check if multer saved the file
    if (req.file) {
      console.log('🔍 MULTER FILE CHECK:');
      console.log('  - File path:', req.file.path);
      console.log('  - File exists after multer:', fs.existsSync(req.file.path));
      console.log('  - File size on disk:', fs.existsSync(req.file.path) ? fs.statSync(req.file.path).size : 'N/A');
      console.log('File details:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        destination: req.file.destination,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      });
    } else {
      console.log('❌ NO FILE FROM MULTER');
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
        error: 'No video file provided'
      });
    }

    console.log('Uploading quiz video:', {
      questionId,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Get the new file extension
    const newFileExt = path.extname(req.file.filename);
    
    // Delete old video if exists (including different extensions)
    // BUT SKIP THE NEWLY UPLOADED FILE!
    if (question.videoPath) {
      console.log('Deleting old video:', question.videoPath);
      deleteQuizVideoFile(question.videoPath);
    }
    
    // Also check for any existing video files with this question ID (different extension)
    // IMPORTANT: Skip the file we just uploaded
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const videoDir = path.join(__dirname, '..', '..', 'public', 'quiz-videos');
    
    for (const ext of videoExtensions) {
      // Skip the extension of the newly uploaded file
      if (ext === newFileExt) {
        console.log(`Skipping cleanup for ${ext} - this is the new file`);
        continue;
      }
      
      const oldFile = path.join(videoDir, `question-${questionId}${ext}`);
      if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile);
        console.log(`Deleted old video file with different extension: question-${questionId}${ext}`);
      }
    }

    // Get relative path for database
    const videoPath = getQuizVideoRelativePath(req.file.filename);
    
    console.log('Video path for database:', videoPath);
    console.log('Full file path on disk:', req.file.path);

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

    console.log('Question updated with videoPath:', videoPath);
    
    // CRITICAL DEBUG - Verify file still exists after DB update
    console.log('🔍 FINAL FILE CHECK:');
    console.log('  - File path:', req.file.path);
    console.log('  - File exists after DB update:', fs.existsSync(req.file.path));
    console.log('  - Expected path matches:', req.file.path.endsWith(`question-${questionId}${path.extname(req.file.originalname)}`));
    
    console.log('=== QUIZ VIDEO UPLOAD SUCCESS ===');

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
