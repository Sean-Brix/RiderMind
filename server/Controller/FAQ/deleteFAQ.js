import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

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

    await prisma.fAQ.delete({
      where: { id: parseInt(id) }
    });

    return res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete FAQ',
      details: error.message
    });
  }
};

export default deleteFAQ;
