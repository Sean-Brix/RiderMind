import { useState, useCallback, useMemo } from 'react';

/**
 * useProgress Hook
 * 
 * Manages progress tracking for modules, XP, and levels.
 * Handles all progress-related calculations and state updates.
 * 
 * Features:
 * - XP calculation
 * - Level progression
 * - Module completion tracking
 * - Progress percentages
 * - Unlock status determination
 * 
 * @param {Array} modules - Array of student modules
 * @returns {Object} Progress manager interface
 */
export function useProgress(modules = []) {
  const [localProgress, setLocalProgress] = useState({});

  /**
   * Calculate total XP from completed modules and current progress
   */
  const totalXP = useMemo(() => {
    return modules.reduce((sum, module) => {
      if (module.isCompleted) {
        return sum + 100; // Full XP for completed modules
      }
      // Partial XP for in-progress modules
      return sum + Math.floor(module.progress || 0);
    }, 0);
  }, [modules]);

  /**
   * Calculate current level based on XP
   * Every 100 XP = 1 level
   */
  const level = useMemo(() => {
    return Math.floor(totalXP / 100) + 1;
  }, [totalXP]);

  /**
   * Calculate XP needed for next level
   */
  const xpForNextLevel = useMemo(() => {
    return level * 100;
  }, [level]);

  /**
   * Calculate progress to next level (percentage)
   */
  const xpProgress = useMemo(() => {
    const currentLevelXP = totalXP % 100;
    return (currentLevelXP / 100) * 100;
  }, [totalXP]);

  /**
   * Calculate remaining XP to next level
   */
  const xpToNextLevel = useMemo(() => {
    return xpForNextLevel - totalXP;
  }, [xpForNextLevel, totalXP]);

  /**
   * Count completed modules
   */
  const completedCount = useMemo(() => {
    return modules.filter(m => m.isCompleted).length;
  }, [modules]);

  /**
   * Calculate overall completion percentage
   */
  const completionPercentage = useMemo(() => {
    if (modules.length === 0) return 0;
    return Math.round((completedCount / modules.length) * 100);
  }, [completedCount, modules.length]);

  /**
   * Get the current active module (first incomplete)
   */
  const currentModule = useMemo(() => {
    return modules.find(m => !m.isCompleted) || null;
  }, [modules]);

  /**
   * Get the current module index
   */
  const currentModuleIndex = useMemo(() => {
    const index = modules.findIndex(m => !m.isCompleted);
    return index >= 0 ? index : modules.length - 1;
  }, [modules]);

  /**
   * Check if a module is unlocked
   * Module is unlocked if it's the first one or all previous modules are completed
   */
  const isModuleUnlocked = useCallback((moduleIndex) => {
    if (moduleIndex === 0) return true;
    if (moduleIndex < 0 || moduleIndex >= modules.length) return false;
    
    // Check if previous module is completed
    return modules[moduleIndex - 1]?.isCompleted || false;
  }, [modules]);

  /**
   * Get module status: locked, unlocked, in-progress, or completed
   */
  const getModuleStatus = useCallback((moduleIndex) => {
    if (moduleIndex < 0 || moduleIndex >= modules.length) {
      return 'invalid';
    }

    const module = modules[moduleIndex];
    
    if (module.isCompleted) {
      return 'completed';
    }
    
    if (!isModuleUnlocked(moduleIndex)) {
      return 'locked';
    }
    
    if (module.progress > 0) {
      return 'in-progress';
    }
    
    return 'unlocked';
  }, [modules, isModuleUnlocked]);

  /**
   * Check if quiz is available for a module
   * Quiz available when progress >= 90%
   */
  const isQuizAvailable = useCallback((moduleIndex) => {
    if (moduleIndex < 0 || moduleIndex >= modules.length) {
      return false;
    }

    const module = modules[moduleIndex];
    return module.progress >= 90 && !module.isCompleted;
  }, [modules]);

  /**
   * Calculate slide progress (which slide user is on)
   */
  const calculateSlideProgress = useCallback((currentSlideIndex, totalSlides) => {
    if (totalSlides === 0) return 100;
    
    // Cap at 90% until quiz is passed
    const rawProgress = ((currentSlideIndex + 1) / totalSlides) * 100;
    return Math.min(rawProgress, 90);
  }, []);

  /**
   * Update local progress for a module
   * Useful for optimistic UI updates before API confirms
   */
  const updateLocalProgress = useCallback((moduleId, progress) => {
    setLocalProgress(prev => ({
      ...prev,
      [moduleId]: progress,
    }));
  }, []);

  /**
   * Get effective progress (local or from modules array)
   */
  const getModuleProgress = useCallback((moduleId) => {
    return localProgress[moduleId] ?? 
           modules.find(m => m.module.id === moduleId)?.progress ?? 
           0;
  }, [modules, localProgress]);

  /**
   * Clear local progress cache
   */
  const clearLocalProgress = useCallback(() => {
    setLocalProgress({});
  }, []);

  /**
   * Get stats summary object
   */
  const stats = useMemo(() => ({
    totalModules: modules.length,
    completedModules: completedCount,
    inProgressModules: modules.filter(m => m.progress > 0 && !m.isCompleted).length,
    lockedModules: modules.filter((m, i) => !isModuleUnlocked(i)).length,
    totalXP,
    level,
    xpForNextLevel,
    xpProgress,
    xpToNextLevel,
    completionPercentage,
  }), [
    modules.length,
    completedCount,
    modules,
    isModuleUnlocked,
    totalXP,
    level,
    xpForNextLevel,
    xpProgress,
    xpToNextLevel,
    completionPercentage,
  ]);

  /**
   * Get next module to unlock
   */
  const nextModuleToUnlock = useMemo(() => {
    const nextIndex = modules.findIndex((m, i) => 
      !m.isCompleted && isModuleUnlocked(i)
    );
    return nextIndex >= 0 ? modules[nextIndex] : null;
  }, [modules, isModuleUnlocked]);

  /**
   * Check if all modules are completed
   */
  const isJourneyComplete = useMemo(() => {
    return modules.length > 0 && modules.every(m => m.isCompleted);
  }, [modules]);

  return {
    // XP & Level
    totalXP,
    level,
    xpForNextLevel,
    xpProgress,
    xpToNextLevel,
    
    // Module Progress
    completedCount,
    completionPercentage,
    currentModule,
    currentModuleIndex,
    nextModuleToUnlock,
    isJourneyComplete,
    
    // Module Status Checks
    isModuleUnlocked,
    getModuleStatus,
    isQuizAvailable,
    
    // Progress Calculations
    calculateSlideProgress,
    getModuleProgress,
    
    // Local Progress Management
    updateLocalProgress,
    clearLocalProgress,
    
    // Stats Summary
    stats,
  };
}

export default useProgress;
