import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get student's modules for a specific category
 * GET /api/student-modules/my-modules
 * Query params: categoryId (optional, defaults to MOTORCYCLE category)
 */
export default async function getMyModules(req, res) {
  try {
    const userId = req.user.id; // From auth middleware
    let { categoryId } = req.query;

    // If no categoryId provided, get the default motorcycle category or first active category
    if (!categoryId) {
      const defaultCategory = await prisma.moduleCategory.findFirst({
        where: { 
          isDefault: true,
          isActive: true
        }
      });

      if (!defaultCategory) {
        // If no default, get first active category
        const firstCategory = await prisma.moduleCategory.findFirst({
          where: { isActive: true },
          orderBy: { id: 'asc' }
        });

        if (!firstCategory) {
          return res.status(404).json({
            success: false,
            error: 'No active categories found'
          });
        }

        categoryId = firstCategory.id;
      } else {
        categoryId = defaultCategory.id;
      }
    }

    // Check if student is enrolled in this category
    let studentModules = await prisma.studentModule.findMany({
      where: {
        userId,
        categoryId: parseInt(categoryId)
      },
      orderBy: { position: 'asc' },
      include: {
        module: {
          include: {
            objectives: { orderBy: { position: 'asc' } },
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
                // imageData excluded from list
              }
            },
            quizzes: {
              where: { isActive: true },
              select: {
                id: true,
                title: true,
                description: true,
                passingScore: true,
                timeLimit: true,
                questions: {
                  orderBy: { position: 'asc' },
                  include: {
                    options: {
                      orderBy: { position: 'asc' }
                    }
                  }
                }
              }
            }
          }
        },
        category: true
      }
    });

    // If not enrolled yet, auto-enroll the student
    if (studentModules.length === 0) {
      const categoryModules = await prisma.moduleCategoryModule.findMany({
        where: { categoryId: parseInt(categoryId) },
        orderBy: { position: 'asc' },
        include: { module: true }
      });

      if (categoryModules.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No modules found in this category'
        });
      }

      // Create student module records
      const enrollmentData = categoryModules.map(cm => ({
        userId,
        categoryId: parseInt(categoryId),
        moduleId: cm.moduleId,
        position: cm.position,
      }));

      await prisma.studentModule.createMany({
        data: enrollmentData,
        skipDuplicates: true
      });

      // Fetch the newly created records
      studentModules = await prisma.studentModule.findMany({
        where: {
          userId,
          categoryId: parseInt(categoryId)
        },
        orderBy: { position: 'asc' },
        include: {
          module: {
            include: {
              objectives: { orderBy: { position: 'asc' } },
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
                }
              },
              quizzes: {
                where: { isActive: true },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  passingScore: true,
                  timeLimit: true,
                  questions: {
                    orderBy: { position: 'asc' },
                    include: {
                      options: {
                        orderBy: { position: 'asc' }
                      }
                    }
                  }
                }
              }
            }
          },
          category: true
        }
      });
    }

    // Calculate overall progress
    const total = studentModules.length;
    const completed = studentModules.filter(m => m.isCompleted).length;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        category: studentModules[0]?.category || null,
        modules: studentModules,
        progress: {
          total,
          completed,
          completionPercentage
        }
      }
    });

  } catch (error) {
    console.error('Error fetching student modules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student modules',
      message: error.message
    });
  }
}
