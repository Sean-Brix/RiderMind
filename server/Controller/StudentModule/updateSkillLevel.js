import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update student's skill level for their modules
 * This affects which slides are shown to the student
 * PUT /api/student-modules/skill-level
 * Body: { skillLevel: 'Beginner' | 'Intermediate' | 'Expert' }
 */
export default async function updateSkillLevel(req, res) {
  try {
    const userId = req.user.id;
    const { skillLevel } = req.body;

    // Validate skill level
    const validSkillLevels = ['Beginner', 'Intermediate', 'Expert'];
    if (!skillLevel || !validSkillLevels.includes(skillLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid skill level. Must be Beginner, Intermediate, or Expert'
      });
    }

    // Update all student modules for this user
    const updated = await prisma.studentModule.updateMany({
      where: { userId },
      data: { skillLevel }
    });

    res.status(200).json({
      success: true,
      message: `Skill level updated to ${skillLevel}`,
      data: {
        skillLevel,
        modulesUpdated: updated.count
      }
    });

  } catch (error) {
    console.error('Error updating skill level:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update skill level',
      message: error.message
    });
  }
}
