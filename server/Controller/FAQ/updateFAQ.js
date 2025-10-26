import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, isActive } = req.body;

    // Check if FAQ exists
    const existingFAQ = await prisma.fAQ.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingFAQ) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    // Validate category if provided
    if (category) {
      const validCategories = ['General', 'System', 'Module', 'Quiz'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        });
      }
    }

    const updateData = {};
    if (question !== undefined) updateData.question = question;
    if (answer !== undefined) updateData.answer = answer;
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;

    const faq = await prisma.fAQ.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq
    });

  } catch (error) {
    console.error('Error updating FAQ:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update FAQ',
      details: error.message
    });
  }
};

export default updateFAQ;
