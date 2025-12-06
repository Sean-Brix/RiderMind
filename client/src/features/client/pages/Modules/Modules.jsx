import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { RoadTimeline } from './components/RoadTimeline';
import { FeedbackProvider } from './contexts/FeedbackContext';
import Navbar from '../../../../components/Navbar';
import HeaderJourney from './components/HeaderJourney';
import CourseSelection from './CourseSelection';
import { getMyModules, completeModule, updateModuleProgress } from '../../../../services/studentModuleService';
import { useModalManager, ModalType } from './hooks/useModalManager';
import { useProgress } from './hooks/useProgress';
import { Zap, ArrowUp } from 'lucide-react';

// Lazy load modal components for better performance
const LessonViewer = lazy(() => import('./components/LessonViewer').then(module => ({ default: module.LessonViewer })));
const QuizViewer = lazy(() => import('./components/QuizViewer').then(module => ({ default: module.QuizViewer })));
const CongratulationsModal = lazy(() => import('./components/Modals/CongratulationsModal').then(module => ({ default: module.CongratulationsModal })));
const CompletionModal = lazy(() => import('./components/Modals/CompletionModal').then(module => ({ default: module.CompletionModal })));
const ConfirmationModal = lazy(() => import('./components/Modals/ConfirmationModal').then(module => ({ default: module.ConfirmationModal })));

/**
 * Modules Component
 * Main module learning page with course enrollment and progress tracking
 */
function Modules() {
  // Modal Management
  const modalManager = useModalManager();

  // Real database data
  const [modules, setModules] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Course selection state
  const [showCourseSelection, setShowCourseSelection] = useState(false);
  
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
  
  // Scroll to top button state
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Progress Tracking
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

  // Scroll detection for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled down more than 300px (navbar typically out of view)
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        } else {
          // No modules found - show course selection
          setShowCourseSelection(true);
        }
      } else {
        // Error or no enrollment - show course selection
        setShowCourseSelection(true);
      }
    } catch (err) {
      console.error('Error loading modules:', err);
      // On error, show course selection to allow enrollment
      setShowCourseSelection(true);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to finish line when all modules completed
  useEffect(() => {
    if (modules.length > 0 && modules.every(m => m.isCompleted)) {
      setTimeout(() => {
        const finishLine = document.getElementById('finish-line');
        if (finishLine) {
          finishLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 1000);
    }
  }, [modules]);

  const handleModuleClick = (studentModule) => {
    console.log('Module clicked:', studentModule.module.title);
    
    let currentSlideIndex = 0;
    if (studentModule.currentSlideId && studentModule.module.slides) {
      const slideIndex = studentModule.module.slides.findIndex(s => s.id === studentModule.currentSlideId);
      if (slideIndex !== -1) {
        currentSlideIndex = slideIndex;
      }
    }
    
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
    modalManager.openModal(ModalType.LESSON, lessonData);
  };

  const handleQuizClick = (studentModule) => {
    console.log('🎯 Quiz clicked:', studentModule.module.title);
    
    const quiz = studentModule.module.quizzes?.[0];
    const quizData = {
      id: quiz?.id,
      title: quiz?.title || `${studentModule.module.title} Quiz`,
      description: quiz?.description,
      questions: quiz?.questions || [],
      moduleId: studentModule.module.id,
      studentModuleId: studentModule.id,
    };

    console.log('📝 Quiz data:', quizData);
    modalManager.openModal(ModalType.QUIZ, quizData);
  };

  const handleStopSignClick = (previousModule) => {
    console.log('Stop sign clicked:', previousModule.module.title);
    alert(`Viewing feedback for: ${previousModule.module.title}`);
  };

  const handleShowCompletionModal = () => {
    setShowCompletionModal(true);
  };

  const handleCourseEnrollment = async () => {
    // Reload modules after enrollment
    await loadModules();
    setShowCourseSelection(false);
  };

  // Get stats from useProgress hook
  const { totalXP, level, xpProgress, xpForNextLevel } = progressTracker;
  
  const completedCount = useMemo(() => 
    modules.filter(m => m.isCompleted).length, 
    [modules]
  );
  
  const overallProgress = useMemo(() => 
    modules.length > 0 ? (completedCount / modules.length) * 100 : 0,
    [modules.length, completedCount]
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

  // Show course selection if no modules
  if (showCourseSelection) {
    return (
      <>
        <Navbar />
        <CourseSelection onComplete={handleCourseEnrollment} />
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
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
        <HeaderJourney
          progress={overallProgress}
          level={level}
          xp={totalXP}
          routesCompleted={{ completed: completedCount, total: modules.length }}
        />

        <main id="main-content" role="main">
          <RoadTimeline
            modules={modules}
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
              <p>✅ Total Modules: {modules.length}</p>
              <p>✅ Completed: {completedCount}</p>
              <p>✅ Course: {categoryInfo?.name || 'N/A'}</p>
            </div>

            {/* Super Admin Dev Button */}
            {(user?.role === 'super_admin' || user?.role === 'admin' || import.meta.env.DEV) && modules.length > 0 && (
              <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={async () => {
                    setConfirmationModal({
                      isOpen: true,
                      title: '🔧 DEV MODE',
                      message: `Auto-complete all modules except the last one?\n\nThis will mark ${modules.length - 1} modules as completed with 100% score.`,
                      type: 'dev',
                      confirmText: 'Auto-Complete',
                      cancelText: 'Cancel',
                      onConfirm: async () => {
                        try {
                          setLoading(true);
                          for (let i = 0; i < modules.length - 1; i++) {
                            await completeModule(modules[i].id, {
                              categoryId: categoryInfo?.id || modules[i].categoryId,
                              quizScore: 100,
                              quizPassed: true
                            });
                          }
                          await loadModules();
                          setConfirmationModal({
                            isOpen: true,
                            title: '✅ Success',
                            message: `Auto-completed ${modules.length - 1} modules!`,
                            type: 'dev',
                            confirmText: 'Got it!',
                            onConfirm: () => {}
                          });
                        } catch (error) {
                          console.error('Error auto-completing modules:', error);
                        } finally {
                          setLoading(false);
                        }
                      }
                    });
                  }}
                  disabled={loading}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>🔧 DEV: Auto-Complete All Modules (Except Last)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Viewer Modal */}
        {modalManager.activeModal === ModalType.LESSON && (
          <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="text-white text-xl">Loading...</div></div>}>
            <LessonViewer
              isOpen={true}
              onClose={modalManager.closeModal}
              lesson={modalManager.modalData}
              initialSlide={modalManager.modalData?.currentSlideIndex || 0}
              onSlideChange={async (slideIndex) => {
                const moduleId = modalManager.modalData?.moduleId;
                const studentModuleId = modalManager.modalData?.studentModuleId;
                const totalSlides = modalManager.modalData?.slides?.length || 1;
                const progressPercentage = ((slideIndex + 1) / totalSlides) * 100;
                
                if (moduleId && categoryInfo?.id) {
                  try {
                    await updateModuleProgress(moduleId, {
                      categoryId: categoryInfo.id,
                      progress: progressPercentage,
                      currentSlideId: modalManager.modalData?.slides?.[slideIndex]?.id
                    });
                    
                    setModules(prevModules =>
                      prevModules.map(m =>
                        m.id === studentModuleId
                          ? { ...m, progress: progressPercentage }
                          : m
                      )
                    );
                  } catch (error) {
                    console.error('❌ Error updating progress:', error);
                  }
                }
              }}
              onComplete={async (lessonId) => {
                const studentModuleId = modalManager.modalData?.studentModuleId;
                const moduleId = modalManager.modalData?.moduleId;
                
                if (moduleId && categoryInfo?.id) {
                  try {
                    await updateModuleProgress(moduleId, {
                      categoryId: categoryInfo.id,
                      progress: 100
                    });
                    
                    setModules(prevModules =>
                      prevModules.map(m =>
                        m.id === studentModuleId
                          ? { ...m, progress: 100 }
                          : m
                      )
                    );
                  } catch (error) {
                    console.error('❌ Error updating progress:', error);
                  }
                }
              }}
              onStartQuiz={(quiz, moduleId, studentModuleId) => {
                const quizData = { ...quiz, moduleId, studentModuleId };
                modalManager.openModal(ModalType.QUIZ, quizData);
              }}
            />
          </Suspense>
        )}

        {/* Quiz Viewer Modal */}
        {modalManager.activeModal === ModalType.QUIZ && (
          <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="text-white text-xl">Loading...</div></div>}>
            <QuizViewer
              isOpen={true}
              onClose={modalManager.closeModal}
              quiz={modalManager.modalData}
              moduleId={modalManager.modalData?.moduleId}
              studentModuleId={modalManager.modalData?.studentModuleId}
              onQuizComplete={async (result) => {
                if (result.passed) {
                  try {
                    const studentModuleId = modalManager.modalData?.studentModuleId;
                    
                    if (studentModuleId && categoryInfo?.id) {
                      await completeModule(studentModuleId, {
                        categoryId: categoryInfo.id,
                        quizScore: result.score,
                        quizAttemptId: result.attempt
                      });
                      
                      const currentModule = modules.find(m => m.id === studentModuleId);
                      const completedCount = modules.filter(m => m.isCompleted).length + 1;
                      
                      const xpEarned = Math.round((result.score / 100) * 500);
                      const currentLevel = progressTracker.level;
                      const newXP = progressTracker.totalXP + xpEarned;
                      const newLevel = Math.floor(newXP / 1000) + 1;
                      const leveledUp = newLevel > currentLevel;

                      setModules(prevModules =>
                        prevModules.map(m => 
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
                        )
                      );

                      modalManager.closeModal();
                      
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
                    }
                  } catch (error) {
                    console.error('❌ Error completing module:', error);
                  }
                }
              }}
            />
          </Suspense>
        )}

        {/* Congratulations Modal */}
        {modalManager.activeModal === ModalType.CONGRATULATIONS && (
          <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="text-white text-xl">Loading...</div></div>}>
            <CongratulationsModal
              isOpen={true}
              onClose={modalManager.closeModal}
              moduleTitle={modalManager.modalData?.moduleTitle}
              score={modalManager.modalData?.score}
              xpEarned={modalManager.modalData?.xpEarned}
              newLevel={modalManager.modalData?.newLevel}
              leveledUp={modalManager.modalData?.leveledUp}
              completedModulesCount={modalManager.modalData?.completedModulesCount}
              totalModulesCount={modalManager.modalData?.totalModulesCount}
              onContinue={() => {
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

        {/* Completion Modal */}
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
                totalModules: modules.length,
                completedModules: completedCount,
                totalQuizzes: modules.length,
                passedQuizzes: modules.filter(m => m.quizPassed).length,
                averageScore: (() => {
                  const modulesWithScores = modules.filter(m => 
                    (m.highestQuizScore && m.highestQuizScore > 0) ||
                    (m.quizScore && m.quizScore > 0) ||
                    (m.score && m.score > 0)
                  );
                  
                  if (modulesWithScores.length === 0) return 0;
                  
                  const totalScore = modulesWithScores.reduce((sum, m) => {
                    const score = m.highestQuizScore || m.quizScore || m.score || 0;
                    return sum + score;
                  }, 0);
                  
                  return Math.round(totalScore / modulesWithScores.length);
                })(),
                totalTimeSpent: 120,
                completionDate: new Date(),
                certificateId: `CERT-${user?.id || '0000'}-${Date.now()}`
              }}
              leaderboardData={{
                rank: 1,
                totalUsers: 100,
                topPerformers: [
                  { name: 'Top Student 1', score: 98 },
                  { name: 'Top Student 2', score: 95 },
                  { name: 'Top Student 3', score: 92 },
                ]
              }}
            />
          </Suspense>
        )}

        {/* Confirmation Modal */}
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

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 bg-brand-600/30 hover:bg-brand-600/50 backdrop-blur-sm text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 group animate-in fade-in slide-in-from-bottom-4"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-6 h-6 group-hover:animate-bounce" />
          </button>
        )}
      </div>
    </>
  );
}

// Wrap with FeedbackProvider
const ModulesWithFeedback = () => (
  <FeedbackProvider>
    <Modules />
  </FeedbackProvider>
);

export default ModulesWithFeedback;
