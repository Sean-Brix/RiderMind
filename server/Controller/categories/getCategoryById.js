import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get a single category by ID
 * Params: id
 */
export default async function getCategoryById(req, res) {
  try {
    const { id } = req.params;

    const category = await prisma.moduleCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        modules: {
          include: {
            module: {
              select: {
                id: true,
                title: true,
                description: true,
                isActive: true,
                position: true
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category',
      message: error.message
    });
  }
}
