import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all module categories
 * Query params: isActive (optional)
 */
export default async function getCategories(req, res) {
  try {
    const { isActive } = req.query;

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const categories = await prisma.moduleCategory.findMany({
      where,
      include: {
        modules: {
          include: {
            module: {
              select: {
                id: true,
                title: true,
                description: true,
                isActive: true
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
}
