import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all modules with optional filtering
 * Query params: isActive, includeObjectives, includeSlides
 */
export default async function getModules(req, res) {
  try {
    const { isActive, includeObjectives, includeSlides } = req.query;

    // Build query filter
    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Build include options
    const include = {};
    if (includeObjectives === 'true') {
      include.objectives = {
        orderBy: { position: 'asc' }
      };
    }
    if (includeSlides === 'true') {
      include.slides = {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          type: true,
          title: true,
          content: true,
          description: true,
          position: true,
          videoPath: true,
          imageMime: true,
          // Don't include imageData in list view (too large)
          imageData: false,
          createdAt: true,
          updatedAt: true
        }
      };
    }

    const modules = await prisma.module.findMany({
      where,
      include: Object.keys(include).length > 0 ? include : undefined,
      orderBy: { position: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: modules.length,
      data: modules
    });

  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch modules',
      message: error.message
    });
  }
}
