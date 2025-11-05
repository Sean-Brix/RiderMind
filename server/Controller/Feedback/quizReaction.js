import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Toggle Quiz Question Reaction (Like/Dislike)
 * POST /api/quiz-questions/:questionId/reaction
 */
export const toggleQuizReaction = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { isLike } = req.body;
    const userId = req.user.id;

    // Validation
    if (typeof isLike !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isLike must be a boolean value (true for like, false for dislike)'
      });
    }

    // Check if question exists
    const question = await prisma.quizQuestion.findUnique({
      where: { id: parseInt(questionId) }
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Quiz question not found'
      });
    }

    // Check if reaction already exists
    const existingReaction = await prisma.quizQuestionReaction.findUnique({
      where: {
        userId_questionId: {
          userId: userId,
          questionId: parseInt(questionId)
        }
      }
    });

    let reaction;

    if (existingReaction) {
      // If same reaction, remove it (toggle off)
      if (existingReaction.isLike === isLike) {
        await prisma.quizQuestionReaction.delete({
          where: {
            userId_questionId: {
              userId: userId,
              questionId: parseInt(questionId)
            }
          }
        });

        return res.status(200).json({
          success: true,
          message: 'Reaction removed',
          data: null
        });
      } else {
        // Update to opposite reaction
        reaction = await prisma.quizQuestionReaction.update({
          where: {
            userId_questionId: {
              userId: userId,
              questionId: parseInt(questionId)
            }
          },
          data: {
            isLike: isLike,
            updatedAt: new Date()
          }
        });

        return res.status(200).json({
          success: true,
          message: `Reaction updated to ${isLike ? 'like' : 'dislike'}`,
          data: reaction
        });
      }
    } else {
      // Create new reaction
      reaction = await prisma.quizQuestionReaction.create({
        data: {
          questionId: parseInt(questionId),
          userId: userId,
          isLike: isLike
        }
      });

      return res.status(201).json({
        success: true,
        message: `${isLike ? 'Like' : 'Dislike'} added`,
        data: reaction
      });
    }

  } catch (error) {
    console.error('Toggle quiz reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle reaction',
      error: error.message
    });
  }
};

/**
 * Get Quiz Question Reaction Statistics
 * GET /api/quiz-questions/:questionId/reactions
 */
export const getQuestionReactionStats = async (req, res) => {
  try {
    const { questionId } = req.params;

    const reactions = await prisma.quizQuestionReaction.findMany({
      where: {
        questionId: parseInt(questionId)
      },
      select: {
        isLike: true
      }
    });

    const totalReactions = reactions.length;
    const totalLikes = reactions.filter(r => r.isLike).length;
    const totalDislikes = reactions.filter(r => !r.isLike).length;

    res.status(200).json({
      success: true,
      data: {
        totalReactions,
        totalLikes,
        totalDislikes,
        likePercentage: totalReactions > 0 ? ((totalLikes / totalReactions) * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('Get question reaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reaction statistics',
      error: error.message
    });
  }
};

/**
 * Get User's Reaction for a Question
 * GET /api/quiz-questions/:questionId/reaction/my
 */
export const getMyQuestionReaction = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.id;

    const reaction = await prisma.quizQuestionReaction.findUnique({
      where: {
        userId_questionId: {
          userId: userId,
          questionId: parseInt(questionId)
        }
      }
    });

    if (!reaction) {
      return res.status(200).json({
        success: true,
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: reaction
    });

  } catch (error) {
    console.error('Get my question reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your reaction',
      error: error.message
    });
  }
};

/**
 * Get All Reactions for a Quiz (All Questions)
 * GET /api/quizzes/:quizId/reactions
 */
/**
 * Get Quiz Reactions
 * GET /api/quizzes/:quizId/reactions
 * Returns all reactions for questions in a specific quiz
 */
export const getQuizReactions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    // Get all questions for this quiz
    const questions = await prisma.quizQuestion.findMany({
      where: {
        quizId: parseInt(quizId)
      },
      select: {
        id: true,
        question: true
      }
    });

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions found for this quiz'
      });
    }

    const questionIds = questions.map(q => q.id);

    // Get all reactions for these questions
    const reactions = await prisma.quizQuestionReaction.findMany({
      where: {
        questionId: {
          in: questionIds
        }
      },
      select: {
        questionId: true,
        isLike: true,
        userId: true
      }
    });

    // Aggregate reactions per question
    const questionStats = questions.map(question => {
      const questionReactions = reactions.filter(r => r.questionId === question.id);
      const userReaction = reactions.find(r => r.questionId === question.id && r.userId === userId);
      
      const totalLikes = questionReactions.filter(r => r.isLike).length;
      const totalDislikes = questionReactions.filter(r => !r.isLike).length;

      return {
        questionId: question.id,
        questionText: question.question,
        totalLikes,
        totalDislikes,
        totalReactions: questionReactions.length,
        userReaction: userReaction ? (userReaction.isLike ? 'like' : 'dislike') : null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        quizId: parseInt(quizId),
        questions: questionStats
      }
    });

  } catch (error) {
    console.error('Get quiz reactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz reactions',
      error: error.message
    });
  }
};

/**
 * Delete Quiz Question Reaction
 * DELETE /api/quiz-questions/:questionId/reaction
 */
export const deleteQuizReaction = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.id;

    const reaction = await prisma.quizQuestionReaction.findUnique({
      where: {
        userId_questionId: {
          userId: userId,
          questionId: parseInt(questionId)
        }
      }
    });

    if (!reaction) {
      return res.status(404).json({
        success: false,
        message: 'Reaction not found'
      });
    }

    await prisma.quizQuestionReaction.delete({
      where: {
        userId_questionId: {
          userId: userId,
          questionId: parseInt(questionId)
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Reaction deleted successfully'
    });

  } catch (error) {
    console.error('Delete quiz reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reaction',
      error: error.message
    });
  }
};
