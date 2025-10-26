import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createFAQ = async (req, res) => {
  try {
    const { question, answer, category, isActive } = req.body;

    // Validation
    if (!question || !answer || !category) {
      return res.status(400).json({
        success: false,
        error: 'Question, answer, and category are required'
      });
    }

    // Validate category
    const validCategories = ['General', 'System', 'Module', 'Quiz'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq
    });

  } catch (error) {
    console.error('Error creating FAQ:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create FAQ',
      details: error.message
    });
  }
};

export default createFAQ;
