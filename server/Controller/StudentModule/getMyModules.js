import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get student's modules for a specific category
 * GET /api/student-modules/my-modules
 * Query params: 
 *  - categoryId (optional, defaults to default category)
 *  - checkOnly (optional, if true, don't auto-enroll - just check if modules exist)
 */
export default async function getMyModules(req, res) {
  try {
    const userId = req.user.id; // From auth middleware
    let { categoryId, checkOnly } = req.query;
    const shouldCheckOnly = checkOnly === 'true';

    // If no categoryId provided, check if user has modules in ANY category first
    if (!categoryId) {
      const anyEnrollment = await prisma.studentModule.findFirst({
        where: { userId },
        include: { category: true }
      });

      if (anyEnrollment) {
        // User is enrolled somewhere, use that category
        categoryId = anyEnrollment.categoryId;
        console.log(`📚 User ${userId} has enrollment in category ${categoryId}`);
      } else {
        // User has no enrollments, use default category for checking
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
                skillLevel: true, // Added for filtering
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

    // If not enrolled yet, auto-enroll the student (unless checkOnly mode)
    if (studentModules.length === 0) {
      // If just checking, return empty result without enrolling
      if (shouldCheckOnly) {
        return res.json({
          success: true,
          data: {
            modules: [],
            category: null,
            progress: { total: 0, completed: 0, completionPercentage: 0 }
          }
        });
      }

      // DYNAMIC APPROACH: Try moduleCategoryModule first, fallback to all active modules
      let categoryModules = await prisma.moduleCategoryModule.findMany({
        where: { categoryId: parseInt(categoryId) },
        orderBy: { position: 'asc' },
        include: { module: true }
      });

      // FALLBACK: If no junction records, get all active modules
      if (categoryModules.length === 0) {
        console.log('⚠️ No moduleCategoryModule records. Using all active modules.');
        
        const allModules = await prisma.module.findMany({
          where: { isActive: true },
          orderBy: { position: 'asc' }
        });

        categoryModules = allModules.map((module, index) => ({
          moduleId: module.id,
          position: index + 1,
          module: module
        }));
      }

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
                  skillLevel: true, // Added for filtering
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

    // Filter slides based on student's skill level
    const skillLevelRank = {
      'Beginner': 1,
      'Intermediate': 2,
      'Expert': 3
    };

    const filteredModules = studentModules.map(sm => {
      const studentRank = skillLevelRank[sm.skillLevel] || 1; // Default to Beginner if not set
      
      const filteredSlides = sm.module.slides.filter(slide => {
        const slideRank = skillLevelRank[slide.skillLevel] || 1;
        // Beginner (1): only Beginner slides
        // Intermediate (2): Beginner + Intermediate slides
        // Expert (3): all slides
        return slideRank <= studentRank;
      });
      
      return {
        ...sm,
        module: {
          ...sm.module,
          slides: filteredSlides
        }
      };
    });

    res.status(200).json({
      success: true,
      data: {
        category: studentModules[0]?.category || null,
        modules: filteredModules,
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
