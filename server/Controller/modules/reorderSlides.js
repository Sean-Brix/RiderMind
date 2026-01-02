import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Reorder slides within a module
 * Body: { slides: [{ id: number, position: number }, ...] }
 */
export default async function reorderSlides(req, res) {
  try {
    const { moduleId } = req.params;
    const { slides } = req.body;

    if (!slides || !Array.isArray(slides)) {
      return res.status(400).json({
        success: false,
        error: 'Slides array is required'
      });
    }

    // Verify module exists
    const module = await prisma.module.findUnique({
      where: { id: parseInt(moduleId) }
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found'
      });
    }

    // Update all slide positions in a transaction
    await prisma.$transaction(
      slides.map(({ id, position }) =>
        prisma.moduleSlide.update({
          where: { id: parseInt(id) },
          data: { position: parseInt(position) }
        })
      )
    );

    // Fetch updated slides
    const updatedSlides = await prisma.moduleSlide.findMany({
      where: { moduleId: parseInt(moduleId) },
      orderBy: { position: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: updatedSlides
    });

  } catch (error) {
    console.error('Error reordering slides:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder slides',
      message: error.message
    });
  }
}
