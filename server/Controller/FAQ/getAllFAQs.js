import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getAllFAQs = async (req, res) => {
  try {
    const { category, isActive } = req.query;

    const where = {};

    // Filter by category if provided
    if (category) {
      where.category = category;
    }

    // Filter by active status (default to true for public viewing)
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    } else {
      // Default: only show active FAQs for non-admin users
      where.isActive = true;
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return res.status(200).json({
      success: true,
      data: faqs,
      count: faqs.length
    });

  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch FAQs',
      details: error.message
    });
  }
};

export default getAllFAQs;
