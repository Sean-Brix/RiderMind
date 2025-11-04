import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get a single module by ID with all details
 * Params: id
 */
export default async function getModuleById(req, res) {
  try {
    const { id } = req.params;

    const module = await prisma.module.findUnique({
      where: { id: parseInt(id) },
      include: {
        objectives: {
          orderBy: { position: 'asc' }
        },
        slides: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            type: true,
            title: true,
            content: true,
            description: true,
            position: true,
            skillLevel: true,
            videoPath: true,
            imageMime: true,
            // Don't include imageData by default
            imageData: false,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    res.status(200).json({
      success: true,
      data: module
    });

  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch module',
      message: error.message
    });
  }
}
