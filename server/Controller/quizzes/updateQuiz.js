import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update a quiz
 * Params: id
 * Body: { title, description, instructions, passingScore, timeLimit, shuffleQuestions, showResults, questions[], etc. }
 * Note: If questions array is provided, it will replace all existing questions
 */
export default async function updateQuiz(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      instructions,
      passingScore,
      timeLimit,
      shuffleQuestions,
      showResults,
      isActive,
      questions // Now we accept questions array
    } = req.body;

    console.log('🔄 updateQuiz called for quiz ID:', id);
    console.log('📝 Questions to update:', questions?.length);
    if (questions && questions.length > 0) {
      console.log('First question:', questions[0]);
      console.log('First question options:', questions[0].options);
    }

    // Check if quiz exists
    const existing = await prisma.quiz.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Check for duplicate title in same module (if title is being changed)
    if (title && title !== existing.title) {
      const duplicate = await prisma.quiz.findFirst({
        where: {
          moduleId: existing.moduleId,
          title,
          id: { not: parseInt(id) }
        }
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: 'Quiz with this title already exists in this module'
        });
      }
    }

    // Build update data
    const updateData = {
      updatedBy: req.user?.id || null
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (passingScore !== undefined) updateData.passingScore = passingScore;
    if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
    if (shuffleQuestions !== undefined) updateData.shuffleQuestions = shuffleQuestions;
    if (showResults !== undefined) updateData.showResults = showResults;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle questions update if provided
    if (questions && Array.isArray(questions)) {
      // Delete all existing questions (this will cascade delete options)
      await prisma.quizQuestion.deleteMany({
        where: { quizId: parseInt(id) }
      });

      // Create new questions with options
      updateData.questions = {
        create: questions.map((q, qIndex) => {
          const questionData = {
            type: q.type,
            question: q.question,
            description: q.description || null,
            points: q.points || 1,
            position: q.position || qIndex + 1,
            caseSensitive: q.caseSensitive || false,
            shuffleOptions: q.shuffleOptions !== undefined ? q.shuffleOptions : false,
            imageData: q.imageData || null,
            imageMime: q.imageMime || null,
            videoPath: q.videoPath || null
          };

          // Add options if provided
          if (q.options && Array.isArray(q.options)) {
            console.log(`Question "${q.question}" options:`, q.options);
            questionData.options = {
              create: q.options.map((opt, optIndex) => {
                console.log(`  Option ${optIndex}: "${opt.optionText}" - isCorrect: ${opt.isCorrect} (type: ${typeof opt.isCorrect})`);
                return {
                  optionText: opt.optionText,
                  isCorrect: opt.isCorrect === true, // Explicit boolean check
                  position: opt.position || optIndex + 1,
                  imageData: opt.imageData || null,
                  imageMime: opt.imageMime || null
                };
              })
            };
          }

          return questionData;
        })
      };
    }

    // Update quiz
    const quiz = await prisma.quiz.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        module: {
          select: {
            id: true,
            title: true,
            description: true
          }
        },
        questions: {
          orderBy: { position: 'asc' },
          include: {
            options: {
              orderBy: { position: 'asc' },
              select: {
                id: true,
                optionText: true,
                isCorrect: true,
                position: true,
                imageMime: true,
                imageData: false // Don't return binary data in response
              }
            }
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });

  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update quiz',
      message: error.message
    });
  }
}
