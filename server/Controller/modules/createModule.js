import { PrismaClient } from '@prisma/client';
import { deleteVideoFile } from '../../utils/videoHandler.js';

const prisma = new PrismaClient();

/**
 * Create a new module with objectives and slides
 * Body: { title, description, isActive, position, objectives[], slides[] }
 */
export default async function createModule(req, res) {
  try {
    const { title, description, isActive, position, objectives, slides } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    // Check for duplicate title
    const existing = await prisma.module.findFirst({
      where: { title }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Module with this title already exists'
      });
    }

    // Prepare module data
    const moduleData = {
      title,
      description: description || null,
      isActive: isActive !== undefined ? isActive : false,
      position: position || 0,
      createdBy: req.user?.id || null,
      updatedBy: req.user?.id || null
    };

    // Add objectives if provided
    if (objectives && Array.isArray(objectives)) {
      moduleData.objectives = {
        create: objectives.map((obj, index) => ({
          objective: typeof obj === 'string' ? obj : obj.objective,
          position: obj.position || index + 1
        }))
      };
    }

    // Add slides if provided
    if (slides && Array.isArray(slides)) {
      moduleData.slides = {
        create: slides.map((slide, index) => ({
          type: slide.type || 'text',
          title: slide.title,
          content: slide.content || '',
          description: slide.description || null,
          position: slide.position || index + 1,
          imageData: slide.imageData || null,
          imageMime: slide.imageMime || null,
          videoPath: slide.videoPath || null
        }))
      };
    }

    // Create module
    const module = await prisma.module.create({
      data: moduleData,
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
            videoPath: true,
            imageMime: true,
            imageData: false // Don't return BLOB in response
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: module
    });

  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create module',
      message: error.message
    });
  }
}
