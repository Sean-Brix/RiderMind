import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update a quiz
 * Params: id
 * Body: { title, description, instructions, passingScore, timeLimit, shuffleQuestions, showResults, etc. }
 * Note: To update questions/options, use dedicated endpoints
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
      isActive
    } = req.body;

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
              orderBy: { position: 'asc' }
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
