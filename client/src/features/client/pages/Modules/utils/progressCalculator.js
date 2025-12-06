/**
 * Progress Calculator Utilities
 * Helper functions for progress-related calculations
 */

/**
 * Calculate XP from module progress
 * Full module = 100 XP, partial progress gives fractional XP
 */
export function calculateModuleXP(module) {
  if (module.isCompleted) {
    return 100;
  }
  return Math.floor(module.progress || 0);
}

/**
 * Calculate total XP from all modules
 */
export function calculateTotalXP(modules = []) {
  return modules.reduce((sum, module) => {
    return sum + calculateModuleXP(module);
  }, 0);
}

/**
 * Calculate level from XP
 * Every 100 XP = 1 level
 */
export function calculateLevel(totalXP) {
  return Math.floor(totalXP / 100) + 1;
}

/**
 * Calculate XP needed for a specific level
 */
export function calculateXPForLevel(level) {
  return level * 100;
}

/**
 * Calculate progress percentage for a module
 */
export function calculateModuleProgress(currentSlideIndex, totalSlides, isCompleted = false) {
  if (isCompleted) return 100;
  if (totalSlides === 0) return 0;
  
  // Calculate raw progress
  const rawProgress = ((currentSlideIndex + 1) / totalSlides) * 100;
  
  // Cap at 90% until quiz is passed
  return Math.min(rawProgress, 90);
}

/**
 * Calculate overall journey completion percentage
 */
export function calculateJourneyProgress(modules = []) {
  if (modules.length === 0) return 0;
  
  const completedCount = modules.filter(m => m.isCompleted).length;
  return Math.round((completedCount / modules.length) * 100);
}

/**
 * Calculate distance traveled (in km)
 * Each module = 100km when completed, or partial distance for progress
 */
export function calculateDistanceTraveled(modules = []) {
  return modules.reduce((total, module) => {
    if (module.isCompleted) {
      return total + 100;
    }
    return total + Math.floor(module.progress || 0);
  }, 0);
}

/**
 * Calculate estimated time to complete remaining modules
 * Based on average time per module
 */
export function calculateEstimatedTimeRemaining(modules = [], avgMinutesPerModule = 30) {
  const remainingModules = modules.filter(m => !m.isCompleted).length;
  return remainingModules * avgMinutesPerModule;
}

/**
 * Get module unlock chain
 * Returns which modules depend on which for unlocking
 */
export function getModuleUnlockChain(modules = []) {
  return modules.map((module, index) => ({
    moduleId: module.module.id,
    index,
    isUnlocked: index === 0 || modules[index - 1]?.isCompleted,
    dependsOn: index > 0 ? modules[index - 1].module.id : null,
    unlocksNext: index < modules.length - 1 ? modules[index + 1].module.id : null,
  }));
}

/**
 * Calculate quiz readiness
 * Returns whether quiz is available and why/why not
 */
export function calculateQuizReadiness(module) {
  const progress = module.progress || 0;
  const isCompleted = module.isCompleted || false;
  
  if (isCompleted) {
    return {
      ready: false,
      reason: 'Module already completed',
      canRetake: true,
    };
  }
  
  if (progress < 90) {
    return {
      ready: false,
      reason: `Complete ${Math.ceil(90 - progress)}% more of the lesson`,
      canRetake: false,
    };
  }
  
  return {
    ready: true,
    reason: 'Quiz available',
    canRetake: module.quizAttempts > 0,
  };
}

/**
 * Calculate quiz performance stats
 */
export function calculateQuizStats(module) {
  return {
    attempts: module.quizAttempts || 0,
    bestScore: module.quizScore || 0,
    passed: module.quizPassed || false,
    passingScore: module.module.quizzes?.[0]?.passingScore || 70,
  };
}

/**
 * Calculate streak information
 * Returns consecutive days of module completion
 */
export function calculateStreak(modules = []) {
  const completedModules = modules
    .filter(m => m.isCompleted && m.completedAt)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  
  if (completedModules.length === 0) {
    return { current: 0, longest: 0 };
  }
  
  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;
  
  for (let i = 1; i < completedModules.length; i++) {
    const prevDate = new Date(completedModules[i - 1].completedAt);
    const currDate = new Date(completedModules[i].completedAt);
    
    const dayDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      tempStreak++;
      if (i === 1) currentStreak = tempStreak;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  return {
    current: currentStreak,
    longest: longestStreak,
  };
}

/**
 * Format time duration
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${mins} min`;
}

/**
 * Format XP display
 */
export function formatXP(xp) {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
}

/**
 * Get level tier (for badges, colors, etc.)
 */
export function getLevelTier(level) {
  if (level >= 20) return { tier: 'Master', color: 'purple' };
  if (level >= 15) return { tier: 'Expert', color: 'gold' };
  if (level >= 10) return { tier: 'Advanced', color: 'blue' };
  if (level >= 5) return { tier: 'Intermediate', color: 'green' };
  return { tier: 'Beginner', color: 'gray' };
}

/**
 * Calculate progress milestones
 * Returns which milestones have been reached
 */
export function calculateMilestones(totalXP, completedModules) {
  const milestones = [
    { id: 'first_module', threshold: 1, label: 'First Steps', reached: completedModules >= 1 },
    { id: 'five_modules', threshold: 5, label: 'Getting Started', reached: completedModules >= 5 },
    { id: 'ten_modules', threshold: 10, label: 'Dedicated Learner', reached: completedModules >= 10 },
    { id: 'level_5', threshold: 500, label: 'Rising Star', reached: totalXP >= 500 },
    { id: 'level_10', threshold: 1000, label: 'Expert Driver', reached: totalXP >= 1000 },
    { id: 'all_modules', threshold: 'all', label: 'Journey Complete', reached: false }, // Set externally
  ];
  
  return milestones.filter(m => m.reached);
}

export default {
  calculateModuleXP,
  calculateTotalXP,
  calculateLevel,
  calculateXPForLevel,
  calculateModuleProgress,
  calculateJourneyProgress,
  calculateDistanceTraveled,
  calculateEstimatedTimeRemaining,
  getModuleUnlockChain,
  calculateQuizReadiness,
  calculateQuizStats,
  calculateStreak,
  formatDuration,
  formatXP,
  getLevelTier,
  calculateMilestones,
};
