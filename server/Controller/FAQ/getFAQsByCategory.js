import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getFAQsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Validate category
    const validCategories = ['General', 'System', 'Module', 'Quiz'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    const faqs = await prisma.fAQ.findMany({
      where: {
        category,
        isActive: true
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    return res.status(200).json({
      success: true,
      category,
      data: faqs,
      count: faqs.length
    });

  } catch (error) {
    console.error('Error fetching FAQs by category:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch FAQs',
      details: error.message
    });
  }
};

export default getFAQsByCategory;
