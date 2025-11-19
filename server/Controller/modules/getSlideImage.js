import { PrismaClient } from '@prisma/client';

import { getFileUrlCached } from '../../utils/firebaseCache.js';
const prisma = new PrismaClient();

/**
 * Get slide image data (BLOB)
 * Params: slideId
 */
export default async function getSlideImage(req, res) {
  try {
    const { slideId } = req.params;

    const slide = await prisma.moduleSlide.findUnique({
      where: { id: parseInt(slideId) },
      select: {
        imageUrl: true,
        imagePath: true,
        imageMime: true,
        type: true
      }
    });

    if (!slide) {
      return res.status(404).json({ success: false, error: 'Slide not found' });
    }

    if (slide.type !== 'image' || !slide.imagePath) {
      return res.status(404).json({ success: false, error: 'No image available for this slide' });
    }

    // Use cached download URL if available
    try {
      const url = slide.imageUrl || await getFileUrlCached(slide.imagePath);
      if (!url) {
        return res.status(404).json({ success: false, error: 'Image URL not available' });
      }

      // Redirect to the signed download URL so the client can fetch directly from Firebase
      return res.redirect(url);
    } catch (err) {
      console.error('Error resolving image URL for slide:', slideId, err);
      return res.status(500).json({ success: false, error: 'Failed to resolve image URL', message: err.message });
    }

  } catch (error) {
    console.error('Error fetching slide image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch slide image',
      message: error.message
    });
  }
}
