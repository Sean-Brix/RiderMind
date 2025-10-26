import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getFAQById = async (req, res) => {
  try {
    const { id } = req.params;

    const faq = await prisma.fAQ.findUnique({
      where: { id: parseInt(id) }
    });

    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: faq
    });

  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch FAQ',
      details: error.message
    });
  }
};

export default getFAQById;
