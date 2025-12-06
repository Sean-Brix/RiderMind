import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { RoadTimeline } from './components/RoadTimeline';
import { FeedbackProvider } from './contexts/FeedbackContext';
import Navbar from '../../../../components/Navbar';
import HeaderJourney from './components/HeaderJourney';
import { getMyModules, completeModule, updateModuleProgress } from '../../../../services/studentModuleService';
import { useModalManager, ModalType } from './hooks/useModalManager';
import { useProgress } from './hooks/useProgress';
import { Zap } from 'lucide-react';

// Lazy load modal components for better performance
const LessonViewer = lazy(() => import('./components/LessonViewer').then(module => ({ default: module.LessonViewer })));
const QuizViewer = lazy(() => import('./components/QuizViewer').then(module => ({ default: module.QuizViewer })));
const CongratulationsModal = lazy(() => import('./components/Modals/CongratulationsModal').then(module => ({ default: module.CongratulationsModal })));
const CompletionModal = lazy(() => import('./components/Modals/CompletionModal').then(module => ({ default: module.CompletionModal })));
const ConfirmationModal = lazy(() => import('./components/Modals/ConfirmationModal').then(module => ({ default: module.ConfirmationModal })));

/**
 * ModulesTest Component
 * Test page using new architecture with modal management and progress tracking
 */
function ModulesTest() {
  // Modal Management (Phase 2 Architecture)
  const modalManager = useModalManager();

  // Real database data
  const [modules, setModules] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pending completion state - stores module data until congrats modal closes
  const [pendingCompletion, setPendingCompletion] = useState(null);
  
  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });
  
  // Progress Tracking (Phase 2 Architecture)
  const progressTracker = useProgress(modules);

  // Check if user is authenticated
  const user = useMemo(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      console.log('👤 User from localStorage:', userData);
      return userData;
    } catch {
      return null;
    }
  }, []);

  const [userDetails, setUserDetails] = useState(null);

  // Fetch complete user details from API
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.id) return;
      
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/account/${user.id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log('✅ Fetched user details:', data);
          setUserDetails(data.user || data);
        }
      } catch (error) {
        console.error('❌ Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadModules();
    }
  }, [user]);

  const loadModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading modules...');
      const response = await getMyModules(null, true);
      console.log('📦 Modules response:', response);
      
      if (response.success) {
        if (response.data.modules && response.data.modules.length > 0) {
          console.log('✅ Setting modules:', response.data.modules.map(m => ({
            id: m.id,
            moduleId: m.module.id,
            title: m.module.title,
            isCompleted: m.isCompleted,
            progress: m.progress,
            quizPassed: m.quizPassed
          })));
          setModules(response.data.modules);
          setCategoryInfo(response.data.category);
          // Progress is now calculated by useProgress hook, no need to set it
        } else {
          setError('No modules found. Please enroll in a course first.');
        }
      } else {
        setError(response.message || 'Failed to load modules');
      }
    } catch (err) {
      console.error('Error loading modules:', err);
      setError('Failed to load modules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data for development (only used if no real data)
  const mockModules = [
    {
      id: 1,
      module: {
        id: 1,
        title: 'Traffic Signs & Signals',
        description: 'Learn to identify and understand all common traffic signs, signals, and road markings.',
      },
      progress: 100,
      isCompleted: true,
      quizAttempts: 2,
    },
    {
      id: 2,
      module: {
        id: 2,
        title: 'Right of Way Rules',
        description: 'Master the rules of right-of-way at intersections, pedestrian crossings, and merging lanes.',
      },
      progress: 100,
      isCompleted: true,
      quizAttempts: 1,
    },
    {
      id: 3,
      module: {
        id: 3,
        title: 'Speed Limits & Road Safety',
        description: 'Understand speed limit regulations, safe following distances, and defensive driving techniques.',
      },
      progress: 65,
      isCompleted: false,
      quizAttempts: 0,
    },
    {
      id: 4,
      module: {
        id: 4,
        title: 'Parking Rules & Techniques',
        description: 'Learn proper parking procedures, parking restrictions, and parallel parking techniques.',
      },
      progress: 20,
      isCompleted: false,
      quizAttempts: 0,
    },
    {
      id: 5,
      module: {
        id: 5,
        title: 'Road Sharing & Courtesy',
        description: 'Learn to share the road safely with cyclists, motorcycles, pedestrians, and large vehicles.',
      },
      progress: 0,
      isCompleted: false,
      quizAttempts: 0,
    },
    {
      id: 6,
      module: {
        id: 6,
        title: 'Emergency Situations',
        description: 'Prepare for handling emergencies like accidents, breakdowns, and adverse weather conditions.',
      },
      progress: 0,
      isCompleted: false,
      quizAttempts: 0,
    },
  ];

  // Use real modules if available, otherwise use mock data for development
  const displayModules = useMemo(() => {
    return modules.length > 0 ? modules : mockModules;
  }, [modules]);

  // Auto-scroll to finish line when all modules completed
  useEffect(() => {
    if (displayModules.length > 0 && displayModules.every(m => m.isCompleted)) {
      setTimeout(() => {
        // Scroll to the finish line element
        const finishLine = document.getElementById('finish-line');
        if (finishLine) {
          finishLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1000); // Delay to allow page to render
    }
  }, [displayModules]);

  // Debug logging
  console.log('👤 User:', user);
  console.log('📊 Display Modules:', displayModules.length);
  console.log('🔧 Show Dev Button:', user?.role === 'super_admin' || user?.role === 'admin' || import.meta.env.DEV);

  const handleModuleClick = (studentModule) => {
    console.log('Module clicked:', studentModule.module.title);
    
    // Calculate current slide index from currentSlideId
    let currentSlideIndex = 0;
    if (studentModule.currentSlideId && studentModule.module.slides) {
      const slideIndex = studentModule.module.slides.findIndex(s => s.id === studentModule.currentSlideId);
      if (slideIndex !== -1) {
        currentSlideIndex = slideIndex;
      }
    }
    
    // Create lesson data from real module data
    const lessonData = {
      id: studentModule.module.id,
      moduleId: studentModule.module.id,
      studentModuleId: studentModule.id,
      categoryId: studentModule.categoryId,
      title: studentModule.module.title,
      description: studentModule.module.description,
      objectives: studentModule.module.objectives?.map(obj => obj.objective) || [],
      currentSlideIndex,
      slides: studentModule.module.slides?.map(slide => {
        let content = slide.content;
        // Map image and video URLs to API endpoints
        if (slide.type === 'image') {
          content = `/api/modules/slides/${slide.id}/image`;
        } else if (slide.type === 'video') {
          content = `/api/modules/slides/${slide.id}/video`;
        }
        return {
          id: slide.id,
          type: slide.type,
          title: slide.title,
          content: content,
          description: slide.description,
        };
      }) || [],
      quiz: studentModule.module.quizzes?.[0] || null,
      progress: studentModule.progress,
    };

    console.log('📚 Lesson data:', lessonData);
    
    // Use modal manager to open lesson (Phase 2 Architecture)
    modalManager.openModal(ModalType.LESSON, lessonData);
  };

  const handleQuizClick = (studentModule) => {
    console.log('🎯 Quiz clicked:', studentModule.module.title);
    console.log('🎯 Full studentModule:', studentModule);
    console.log('🎯 Module:', studentModule.module);
    
    // Get the first quiz from the quizzes array
    const quiz = studentModule.module.quizzes?.[0];
    console.log('🎯 Quiz:', quiz);
    console.log('🎯 Questions:', quiz?.questions);
    
    // Prepare quiz data
    const quizData = {
      id: quiz?.id,
      title: quiz?.title || `${studentModule.module.title} Quiz`,
      description: quiz?.description,
      questions: quiz?.questions || [],
      moduleId: studentModule.module.id,
      studentModuleId: studentModule.id,
    };

    console.log('📝 Quiz data:', quizData);
    
    // Use modal manager to open quiz (Phase 2 Architecture)
    modalManager.openModal(ModalType.QUIZ, quizData);
  };

  const handleStopSignClick = (previousModule) => {
    console.log('Stop sign clicked:', previousModule.module.title);
    alert(`Viewing feedback for: ${previousModule.module.title}`);
  };

  // Super Admin: Auto-complete all modules except the last one (for testing)
  const handleAutoCompleteModules = () => {
    setConfirmationModal({
      isOpen: true,
      title: '🔧 DEV MODE',
      message: `Auto-complete all modules except the last one?\n\nThis will:\n• Mark ${displayModules.length - 1} modules as completed\n• Set progress to 100% for each\n• Pass all quizzes with 100% score\n\nThis action is for testing purposes only.`,
      type: 'dev',
      confirmText: 'Auto-Complete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setLoading(true);
          
          // Complete all modules except the last one
          for (let i = 0; i < displayModules.length - 1; i++) {
            const studentModule = displayModules[i];
            await completeModule(studentModule.id, {
              categoryId: categoryInfo?.id || studentModule.categoryId,
              quizScore: 100,
              quizPassed: true
            });
          }

          // Reload modules to reflect changes
          await loadModules();
          
          // Show success message
          setConfirmationModal({
            isOpen: true,
            title: '✅ Success',
            message: `Auto-completed ${displayModules.length - 1} modules!\n\nYou can now complete the last module manually to see the full completion experience.`,
            type: 'dev',
            confirmText: 'Got it!',
            onConfirm: () => {}
          });
        } catch (error) {
          console.error('Error auto-completing modules:', error);
          setConfirmationModal({
            isOpen: true,
            title: '❌ Error',
            message: `Failed to auto-complete modules.\n\n${error.message || 'Check console for details.'}`,
            type: 'warning',
            confirmText: 'Close',
            onConfirm: () => {}
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Show completion modal
  const handleShowCompletionModal = () => {
    setShowCompletionModal(true);
  };

  // Get stats from useProgress hook (Phase 2 Architecture)
  const { totalXP, level, xpProgress, xpForNextLevel } = progressTracker;
  
  // Memoize expensive filtering operations
  const completedCount = useMemo(() => 
    displayModules.filter(m => m.isCompleted).length, 
    [displayModules]
  );
  
  const moduleStats = useMemo(() => ({
    completed: displayModules.filter(m => m.isCompleted).length,
    inProgress: displayModules.filter(m => !m.isCompleted && m.progress > 0).length,
    locked: displayModules.filter(m => m.progress === 0 && !m.isCompleted).length
  }), [displayModules]);
  
  const overallProgress = useMemo(() => 
    displayModules.length > 0 ? (completedCount / displayModules.length) * 100 : 0,
    [displayModules.length, completedCount]
  );

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading modules...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <svg className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">Error Loading Modules</h3>
              <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
              <button
                onClick={loadModules}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Skip Navigation Link */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:font-semibold"
      >
        Skip to main content
      </a>
      
      <Navbar />
      
      {/* Screen Reader Announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {completedCount > 0 && `${completedCount} of ${modules.length} modules completed. ${Math.round(overallProgress)}% progress.`}
      </div>
      
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
        {/* Header Journey */}
        <HeaderJourney
          progress={overallProgress}
          level={level}
          xp={totalXP}
          routesCompleted={{ completed: completedCount, total: modules.length }}
        />

      {/* Road Timeline */}
      <main id="main-content" role="main">
        <RoadTimeline
          modules={displayModules}
          onModuleClick={handleModuleClick}
          onQuizClick={handleQuizClick}
          onStopSignClick={handleStopSignClick}
          onShowCompletionModal={handleShowCompletionModal}
        />
      </main>

      {/* Debug Info */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-bold mb-4 text-neutral-900 dark:text-white">
            🔧 Debug Info
          </h3>
          <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <p>✅ Total Modules: {displayModules.length}</p>
            <p>✅ Completed: {moduleStats.completed}</p>
            <p>✅ In Progress: {moduleStats.inProgress}</p>
            <p>✅ Locked: {moduleStats.locked}</p>
            <p>✅ Data Source: {modules.length > 0 ? '🗄️ Database' : '🧪 Mock Data'}</p>
            {categoryInfo && (
              <p>✅ Category: {categoryInfo.name}</p>
            )}
            <p className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
              💡 Click modules, quiz buttons, or stop signs to test interactions
            </p>
          </div>

          {/* Super Admin Dev Button */}
          {(user?.role === 'super_admin' || user?.role === 'admin' || import.meta.env.DEV) && (
            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={handleAutoCompleteModules}
                disabled={loading || displayModules.length === 0}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                <span>🔧 DEV: Auto-Complete All Modules (Except Last)</span>
              </button>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center">
                {user?.role === 'super_admin' || user?.role === 'admin' 
                  ? 'Admin Only - For testing completion experience'
                  : 'Development Mode - For testing completion experience'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Viewer Modal - Managed by useModalManager */}
      {modalManager.activeModal === ModalType.LESSON && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="text-white text-xl">Loading...</div></div>}>
          <LessonViewer
            isOpen={true}
            onClose={modalManager.closeModal}
            lesson={modalManager.modalData}
            initialSlide={modalManager.modalData?.currentSlideIndex || 0}
          onSlideChange={async (slideIndex) => {
            console.log('Slide changed to:', slideIndex);
            
            // Calculate progress based on slide position
            const moduleId = modalManager.modalData?.moduleId;
            const studentModuleId = modalManager.modalData?.studentModuleId;
            const totalSlides = modalManager.modalData?.slides?.length || 1;
            const progressPercentage = ((slideIndex + 1) / totalSlides) * 100;
            
            if (moduleId && categoryInfo?.id) {
              try {
                // Update progress as user navigates through slides
                await updateModuleProgress(moduleId, {
                  categoryId: categoryInfo.id,
                  progress: progressPercentage,
                  currentSlideId: modalManager.modalData?.slides?.[slideIndex]?.id
                });
                
                // Update local state
                setModules(prevModules =>
                  prevModules.map(m =>
                    m.id === studentModuleId
                      ? { ...m, progress: progressPercentage }
                      : m
                  )
                );
                
                console.log(`✅ Progress updated to ${progressPercentage}%`);
              } catch (error) {
                console.error('❌ Error updating progress:', error);
              }
            }
          }}
          onComplete={async (lessonId) => {
            console.log('📚 Lesson completed:', lessonId);
            
            // Update module progress to 100% (allows quiz to be taken)
            const studentModuleId = modalManager.modalData?.studentModuleId;
            const moduleId = modalManager.modalData?.moduleId;
            
            if (moduleId && categoryInfo?.id) {
              try {
                // Call API to update progress using the service (needs moduleId, not studentModuleId)
                await updateModuleProgress(moduleId, {
                  categoryId: categoryInfo.id,
                  progress: 100
                });
                
                // Update local state optimistically
                setModules(prevModules =>
                  prevModules.map(m =>
                    m.id === studentModuleId
                      ? { ...m, progress: 100 }
                      : m
                  )
                );
                console.log('✅ Progress updated to 100%');
              } catch (error) {
                console.error('❌ Error updating progress:', error);
              }
            }
          }}
          onStartQuiz={(quiz, moduleId, studentModuleId) => {
            // Open quiz modal with data from lesson
            const quizData = {
              ...quiz,
              moduleId,
              studentModuleId,
            };
            modalManager.openModal(ModalType.QUIZ, quizData);
          }}
          />
        </Suspense>
      )}

      {/* Quiz Viewer Modal - Managed by useModalManager */}
      {modalManager.activeModal === ModalType.QUIZ && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="text-white text-xl">Loading...</div></div>}>
        <QuizViewer
          isOpen={true}
          onClose={() => {
            // Just close modal - module state already updated
            modalManager.closeModal();
          }}
          quiz={modalManager.modalData}
          moduleId={modalManager.modalData?.moduleId}
          studentModuleId={modalManager.modalData?.studentModuleId}
          onQuizComplete={async (result) => {
            console.log('🎯 Quiz completed:', result);
            
            // If passed, complete the module
            if (result.passed) {
              try {
                // Get the module and category info from modalData
                const studentModuleId = modalManager.modalData?.studentModuleId;
                const moduleId = modalManager.modalData?.moduleId;
                
                console.log('🔧 Completing module with:', {
                  studentModuleId,
                  moduleId,
                  categoryId: categoryInfo?.id,
                  quizScore: result.score,
                  quizAttemptId: result.attempt
                });
                
                if (studentModuleId && categoryInfo?.id) {
                  // Complete the module on the server
                  try {
                    const response = await completeModule(studentModuleId, {
                      categoryId: categoryInfo.id,
                      quizScore: result.score,
                      quizAttemptId: result.attempt // Can be null, backend will handle it
                    });
                    
                    console.log('✅ Module completion response:', response);
                    console.log('✅ Response success?', response?.success);
                    console.log('✅ Response data:', response?.data);
                  } catch (completeError) {
                    console.error('❌ Complete module API error:', completeError);
                    console.error('❌ Error response:', completeError.response?.data);
                    // Continue anyway to show congratulations
                  }
                  
                  // DON'T update module state yet - save for after congrats modal
                  const currentModule = modules.find(m => m.id === studentModuleId);
                  const completedCount = modules.filter(m => m.isCompleted).length + 1;
                  
                  // Calculate XP earned
                  const xpEarned = Math.round((result.score / 100) * 500);
                  const currentLevel = progressTracker.level;
                  const newXP = progressTracker.totalXP + xpEarned;
                  const newLevel = Math.floor(newXP / 1000) + 1;
                  const leveledUp = newLevel > currentLevel;

                  // Update module state immediately so card reflects completion
                  console.log('📦 Updating module state immediately for studentModuleId:', studentModuleId);
                  setModules(prevModules => {
                    const updated = prevModules.map(m => 
                      m.id === studentModuleId 
                        ? { 
                            ...m,
                            isCompleted: true,
                            completedAt: new Date().toISOString(),
                            progress: 100,
                            quizScore: result.score,
                            quizPassed: true,
                            quizAttempts: (m.quizAttempts || 0) + 1,
                            lastQuizAttemptId: result.attempt
                          }
                        : m
                    );
                    console.log('✅ Modules updated:', updated.map(m => ({ id: m.id, isCompleted: m.isCompleted })));
                    return updated;
                  });

                  // First close quiz modal, then open congratulations modal
                  modalManager.closeModal();
                  
                  // Use setTimeout to ensure quiz modal closes before congratulations opens
                  setTimeout(() => {
                    modalManager.openModal(ModalType.CONGRATULATIONS, {
                      moduleTitle: currentModule?.module?.title || 'Module',
                      score: result.score,
                      xpEarned,
                      newLevel,
                      leveledUp,
                      completedModulesCount: completedCount,
                      totalModulesCount: modules.length
                    });
                  }, 100);
                } else {
                  console.error('❌ Missing required data:', {
                    studentModuleId,
                    categoryId: categoryInfo?.id
                  });
                }
              } catch (error) {
                console.error('❌ Error completing module:', error);
                alert('Quiz passed but failed to update module. Please refresh the page.');
              }
            } else {
              console.log('⚠️ Quiz not passed, skipping module completion');
            }
          }}
          />
        </Suspense>
      )}

      {/* Congratulations Modal - Managed by useModalManager */}
      {modalManager.activeModal === ModalType.CONGRATULATIONS && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="text-white text-xl">Loading...</div></div>}>
        <CongratulationsModal
          isOpen={true}
          onClose={() => {
            console.log('🎉 Congratulations modal closing...');
            // Just close the modal - module state already updated
            modalManager.closeModal();
          }}
          moduleTitle={modalManager.modalData?.moduleTitle}
          score={modalManager.modalData?.score}
          xpEarned={modalManager.modalData?.xpEarned}
          newLevel={modalManager.modalData?.newLevel}
          leveledUp={modalManager.modalData?.leveledUp}
          completedModulesCount={modalManager.modalData?.completedModulesCount}
          totalModulesCount={modalManager.modalData?.totalModulesCount}
          onContinue={() => {
            // Scroll to next module or finish line
            const nextIncomplete = modules.findIndex(m => !m.isCompleted);
            if (nextIncomplete !== -1) {
              const element = document.querySelector(`[data-module-index="${nextIncomplete}"]`);
              if (element) {
                setTimeout(() => {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
              }
            }
          }}
          />
        </Suspense>
      )}

      {/* Completion Modal - Shows when all modules completed */}
      {showCompletionModal && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="text-white text-xl">Loading...</div></div>}>
          <CompletionModal
            isOpen={showCompletionModal}
            onClose={() => setShowCompletionModal(false)}
            userData={{
              userName: userDetails 
                ? (userDetails.first_name && userDetails.last_name 
                    ? `${userDetails.first_name} ${userDetails.last_name}` 
                    : userDetails.displayName || userDetails.username || userDetails.name || 'Student')
                : (user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user?.displayName || user?.username || user?.name || 'Student'),
              userId: user?.id
            }}
            completionData={{
              courseName: categoryInfo?.name || 'Driver Education Course',
              totalModules: displayModules.length,
              completedModules: completedCount,
              totalQuizzes: displayModules.length,
              passedQuizzes: displayModules.filter(m => m.quizPassed).length,
              averageScore: (() => {
                console.log('📊 Calculating average score from modules:', displayModules.map(m => ({
                  title: m.module?.title || m.title,
                  highestQuizScore: m.highestQuizScore,
                  quizScore: m.quizScore,
                  score: m.score,
                  isCompleted: m.isCompleted,
                  quizPassed: m.quizPassed
                })));
                
                // Try multiple possible score field names
                const modulesWithScores = displayModules.filter(m => 
                  (m.highestQuizScore && m.highestQuizScore > 0) ||
                  (m.quizScore && m.quizScore > 0) ||
                  (m.score && m.score > 0)
                );
                
                if (modulesWithScores.length === 0) {
                  console.log('⚠️ No modules with scores found');
                  return 0;
                }
                
                const totalScore = modulesWithScores.reduce((sum, m) => {
                  const score = m.highestQuizScore || m.quizScore || m.score || 0;
                  return sum + score;
                }, 0);
                
                const avg = Math.round(totalScore / modulesWithScores.length);
                console.log('✅ Average score calculated:', avg, 'from', modulesWithScores.length, 'modules');
                return avg;
              })(),
              totalTimeSpent: 120, // Mock data - calculate from actual time tracking
              completionDate: new Date(),
              certificateId: `CERT-${user?.id || '0000'}-${Date.now()}`
            }}
            leaderboardData={{
              rank: 1, // Mock data - fetch from API
              totalUsers: 100, // Mock data - fetch from API
              topPerformers: [
                { name: 'Top Student 1', score: 98 },
                { name: 'Top Student 2', score: 95 },
                { name: 'Top Student 3', score: 92 },
              ] // Mock data - fetch from API
            }}
          />
        </Suspense>
      )}

      {/* Confirmation Modal - Custom styled confirmation dialog */}
      {confirmationModal.isOpen && (
        <Suspense fallback={null}>
          <ConfirmationModal
            isOpen={confirmationModal.isOpen}
            onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
            onConfirm={confirmationModal.onConfirm}
            title={confirmationModal.title}
            message={confirmationModal.message}
            type={confirmationModal.type}
            confirmText={confirmationModal.confirmText}
            cancelText={confirmationModal.cancelText}
          />
        </Suspense>
      )}
      </div>
    </>
  );
}

// Wrap with FeedbackProvider
const ModulesTestWithFeedback = () => (
  <FeedbackProvider>
    <ModulesTest />
  </FeedbackProvider>
);

export default ModulesTestWithFeedback;
