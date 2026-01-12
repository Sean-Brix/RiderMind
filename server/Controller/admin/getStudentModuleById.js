import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get student module by ID (Admin only)
 * GET /api/admin/student-modules/:id
 */
export default async function getStudentModuleById(req, res) {
  try {
    const { id } = req.params;

    const studentModule = await prisma.studentModule.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        },
        module: {
          select: {
            id: true,
            title: true,
            description: true,
            quiz: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!studentModule) {
      return res.status(404).json({ 
        success: false,
        error: 'Student module not found' 
      });
    }

    res.json({
      success: true,
      data: studentModule
    });
  } catch (error) {
    console.error('Error fetching student module:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch student module',
      message: error.message 
    });
  }
}
