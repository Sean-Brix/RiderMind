import { useState, useEffect } from 'react';
import Navbar from '../../../../components/Navbar';
import LessonModal from '../../../../components/LessonModal';
import { getMyModules, updateModuleProgress } from '../../../../services/studentModuleService';

export default function Modules() {
  const [modules, setModules] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [progress, setProgress] = useState({ total: 0, completed: 0, completionPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  
  // Calculate XP and level
  const totalXP = modules.reduce((sum, m) => sum + (m.isCompleted ? 100 : Math.floor(m.progress)), 0);
  const level = Math.floor(totalXP / 200) + 1;
  const xpForNextLevel = level * 200;
  const xpProgress = ((totalXP % 200) / 200) * 100;

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      const response = await getMyModules();
      if (response.success) {
        setModules(response.data.modules);
        setCategoryInfo(response.data.category);
        setProgress(response.data.progress);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (studentModule, isUnlocked) => {
    if (!isUnlocked) return;
    
    const lessonData = {
      moduleId: studentModule.module.id,
      studentModuleId: studentModule.id,
      categoryId: studentModule.categoryId,
      title: studentModule.module.title,
      description: studentModule.module.description,
      objectives: studentModule.module.objectives.map(obj => obj.objective),
      slides: studentModule.module.slides.map(slide => {
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
      }),
      quiz: studentModule.module.quizzes?.[0] || null,
      progress: studentModule.progress,
      onProgressUpdate: async (moduleId, slideId, progressPercent) => {
        const sm = modules.find(m => m.module.id === moduleId);
        if (!sm) return;
        await updateModuleProgress(moduleId, {
          categoryId: sm.categoryId,
          currentSlideId: slideId,
          progress: progressPercent,
        });
        setModules(prev => prev.map(m => 
          m.module.id === moduleId ? { ...m, progress: progressPercent } : m
        ));
      },
      onQuizComplete: async (passed) => {
        await loadModules();
        setIsLessonOpen(false);
        
        if (passed) {
          // Find the next module
          setTimeout(() => {
            const currentIndex = modules.findIndex(m => m.module.id === studentModule.module.id);
            const nextModule = modules[currentIndex + 1];
            
            if (nextModule) {
              // Find the next module card element and scroll to it
              const moduleElements = document.querySelectorAll('[data-module-id]');
              const nextElement = Array.from(moduleElements).find(
                el => el.getAttribute('data-module-id') === nextModule.id.toString()
              );
              
              if (nextElement) {
                nextElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center' 
                });
                
                // Add a brief animation/flash to highlight the unlocked module
                nextElement.classList.add('animate-pulse');
                setTimeout(() => {
                  nextElement.classList.remove('animate-pulse');
                }, 2000);
              }
            }
          }, 500);
        }
      },
    };

    setCurrentLesson(lessonData);
    setIsLessonOpen(true);
  };

  const handleStopSignClick = (lastCompletedModule) => {
    if (!lastCompletedModule) return;
    
    // Open quiz directly for the last completed module
    const lessonData = {
      moduleId: lastCompletedModule.module.id,
      studentModuleId: lastCompletedModule.id,
      categoryId: lastCompletedModule.categoryId,
      title: lastCompletedModule.module.title,
      description: lastCompletedModule.module.description,
      objectives: lastCompletedModule.module.objectives.map(obj => obj.objective),
      slides: [], // No slides, go straight to quiz
      quiz: lastCompletedModule.module.quizzes?.[0] || null,
      progress: 100,
      startAtQuiz: true, // Flag to start at quiz
      onProgressUpdate: async () => {},
      onQuizComplete: async (passed) => {
        await loadModules();
        setIsLessonOpen(false);
        
        if (passed) {
          // Find the next module
          setTimeout(() => {
            const currentIndex = modules.findIndex(m => m.module.id === lastCompletedModule.module.id);
            const nextModule = modules[currentIndex + 1];
            
            if (nextModule) {
              // Find the next module card element and scroll to it
              const moduleElements = document.querySelectorAll('[data-module-id]');
              const nextElement = Array.from(moduleElements).find(
                el => el.getAttribute('data-module-id') === nextModule.id.toString()
              );
              
              if (nextElement) {
                nextElement.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center' 
                });
                
                // Add a brief animation/flash to highlight the unlocked module
                nextElement.classList.add('animate-pulse');
                setTimeout(() => {
                  nextElement.classList.remove('animate-pulse');
                }, 2000);
              }
            }
          }, 500);
        }
      },
    };

    setCurrentLesson(lessonData);
    setIsLessonOpen(true);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={loadModules} className="px-6 py-2 bg-brand-600 text-white rounded-lg">
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        {/* Road Journey Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 to-brand-800 text-white">
          {/* Road Lines Animation */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute left-1/2 top-0 w-1 h-full bg-white transform -translate-x-1/2 animate-pulse"></div>
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-12">
            {/* Driver Level Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-2xl border-4 border-white/30">
                  <div className="text-center">
                    <div className="text-xs font-bold text-amber-900">LEVEL</div>
                    <div className="text-4xl font-black text-white">{level}</div>
                  </div>
                </div>
                {/* Car Icon */}
                <div className="absolute -top-2 -right-2 text-3xl">🚗</div>
                <div className="absolute -bottom-2 -left-2 text-3xl">�</div>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="max-w-2xl mx-auto text-center mb-6">
              <h1 className="text-5xl font-black mb-2">
                {categoryInfo?.name || 'Road Safety Journey'}
              </h1>
              <p className="text-xl text-brand-100 mb-4">Keep driving toward your goals! 🚗💨</p>
              
              {/* Distance Progress Bar (styled like odometer) */}
              <div className="bg-neutral-900/30 backdrop-blur-sm rounded-lg p-3 mb-2 border-2 border-white/20">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="font-bold">Distance Traveled</span>
                  <span className="text-yellow-300">{totalXP % 200} / 200 km</span>
                </div>
                <div className="relative h-6 bg-neutral-800/50 rounded-full overflow-hidden border-2 border-white/10">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 transition-all duration-500 flex items-center justify-end px-3"
                    style={{ width: `${xpProgress}%` }}
                  >
                    <span className="text-xs font-bold text-neutral-900">🚗</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-brand-100">
                {xpForNextLevel - totalXP} km to Level {level + 1}
              </p>
            </div>

            {/* Journey Stats Dashboard */}
            <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border-2 border-white/20 hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <div className="text-3xl font-black text-yellow-300">{progress.completed}</div>
                  <div className="text-sm text-brand-100">Routes Mastered</div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border-2 border-white/20 hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="text-4xl mb-2">📍</div>
                  <div className="text-3xl font-black text-amber-300">{totalXP} km</div>
                  <div className="text-sm text-brand-100">Total Distance</div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border-2 border-white/20 hover:scale-105 transition-transform">
                <div className="text-center">
                  <div className="text-4xl mb-2">⚡</div>
                  <div className="text-3xl font-black text-green-300">{progress.completionPercentage}%</div>
                  <div className="text-sm text-brand-100">Journey Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Road Map */}
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-black text-center mb-8 text-neutral-800 dark:text-white flex items-center justify-center gap-3">
            <span>�️</span>
            <span>Your Learning Road</span>
            <span>🚦</span>
          </h2>

          <div className="relative">
            {/* Straight Road Path - Vertical road with dashed lines */}
            <div className="absolute left-1/2 top-0 bottom-0 w-24 bg-neutral-700 dark:bg-neutral-600 transform -translate-x-1/2 z-0">
              {/* Road markings */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 border-l-4 border-dashed border-yellow-400 transform -translate-x-1/2"></div>
            </div>

            {modules.map((studentModule, index) => {
              const module = studentModule.module;
              const isUnlocked = index === 0 || modules[index - 1]?.isCompleted;
              const status = studentModule.isCompleted ? 'completed' : (isUnlocked ? 'unlocked' : 'locked');
              const isLeft = index % 2 === 0;
              
              // Find last completed module for stop sign
              const lastCompletedIndex = modules.findIndex((m, i) => i < index && m.isCompleted && !modules[i + 1]?.isCompleted);
              const lastCompletedModule = lastCompletedIndex >= 0 ? modules[lastCompletedIndex] : null;
              
              return (
                <div key={studentModule.id} className="relative mb-20">
                  {/* Stop Sign between every module (except before first) */}
                  {index > 0 && (
                    <div 
                      className="absolute left-1/2 -top-12 transform -translate-x-1/2 z-20 cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => {
                        // Find the last completed module before this one
                        const prevCompleted = modules.slice(0, index).reverse().find(m => m.isCompleted);
                        if (prevCompleted) {
                          handleStopSignClick(prevCompleted);
                        }
                      }}
                    >
                      <div className="relative">
                        {/* Stop sign octagon */}
                        <div className="w-16 h-16 bg-red-600 border-4 border-white shadow-2xl flex items-center justify-center" 
                             style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}>
                          <span className="text-white font-black text-xs">STOP</span>
                        </div>
                        {/* Sign post */}
                        <div className="absolute left-1/2 top-full w-2 h-8 bg-neutral-500 transform -translate-x-1/2"></div>
                      </div>
                    </div>
                  )}

                  {/* Road Sign/Checkpoint - centered on road */}
                  <div className="absolute left-1/2 top-8 transform -translate-x-1/2 z-10">
                    <div className={`w-20 h-20 rounded-lg rotate-45 border-4 flex items-center justify-center font-black text-2xl shadow-2xl transition-transform hover:scale-110 ${
                      status === 'completed' 
                        ? 'bg-green-500 border-green-700 text-white' 
                        : isUnlocked
                        ? 'bg-brand-500 border-brand-700 text-white'
                        : 'bg-neutral-400 dark:bg-neutral-600 border-neutral-500 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}>
                      <div className="-rotate-45">
                        {status === 'completed' ? (
                          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Module Card - positioned on alternating sides */}
                  <div
                    data-module-id={studentModule.id}
                    onClick={() => handleModuleClick(studentModule, isUnlocked)}
                    className={`relative bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border-l-8 transition-all w-5/12 ${
                      status === 'completed'
                        ? 'border-green-500 hover:shadow-xl hover:-translate-y-1'
                        : isUnlocked
                        ? 'border-brand-600 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                        : 'border-neutral-300 dark:border-neutral-700 opacity-70'
                    } ${isLeft ? 'mr-auto' : 'ml-auto'}`}
                  >
                    {/* Distance Badge */}
                    <div className="absolute -top-3 -right-3 bg-gradient-to-br from-amber-500 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                      <span>📍</span>
                      <span>{status === 'completed' ? '+100 km' : '100 km'}</span>
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-black shadow-md ${
                        status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' 
                        : isUnlocked ? 'bg-brand-100 dark:bg-brand-900/30'
                        : 'bg-neutral-200 dark:bg-neutral-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-1">
                          {module.title}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {module.objectives?.length || 0} Learning Points • {module.slides?.length || 0} Lessons
                        </p>
                      </div>
                    </div>

                    <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                      {module.description}
                    </p>

                    {isUnlocked && !studentModule.isCompleted && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-neutral-700 dark:text-neutral-300">Route Progress</span>
                          <span className="text-brand-600 dark:text-brand-400">
                            {Math.round(studentModule.progress)}%
                          </span>
                        </div>
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-600">
                          <div
                            className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                            style={{ width: `${studentModule.progress}%` }}
                          />
                        </div>
                        
                        {/* Show quiz attempts */}
                        {studentModule.quizAttempts > 0 && (
                          <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Quiz Attempts: {studentModule.quizAttempts}</span>
                            {studentModule.quizScore && (
                              <span className="ml-2 font-bold text-brand-600 dark:text-brand-400">
                                Best Score: {Math.round(studentModule.quizScore)}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {status === 'completed' && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Route Complete! Score: {studentModule.quizScore ? `${Math.round(studentModule.quizScore)}%` : '100%'}</span>
                      </div>
                    )}

                    {isUnlocked && !studentModule.isCompleted && (
                      <div className="mt-4 space-y-2">
                        <button 
                          onClick={() => handleModuleClick(studentModule, isUnlocked)}
                          className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                          <span>{studentModule.progress > 0 ? '🚗 Continue Driving' : '🚦 Start Route'}</span>
                        </button>
                        
                        {/* Show "Take Quiz" button if all slides viewed (90% progress) */}
                        {studentModule.progress >= 90 && module.quizzes?.[0] && (
                          <button 
                            onClick={() => {
                              // Open lesson modal directly to quiz
                              const lessonData = {
                                moduleId: studentModule.module.id,
                                studentModuleId: studentModule.id,
                                categoryId: studentModule.categoryId,
                                title: studentModule.module.title,
                                description: studentModule.module.description,
                                objectives: studentModule.module.objectives.map(obj => obj.objective),
                                slides: [],
                                quiz: studentModule.module.quizzes?.[0] || null,
                                progress: studentModule.progress,
                                onProgressUpdate: async () => {},
                                onQuizComplete: async (passed) => {
                                  await loadModules();
                                  setIsLessonOpen(false);
                                },
                                skipToQuiz: true
                              };
                              setCurrentLesson(lessonData);
                              setIsLessonOpen(true);
                            }}
                            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>📝 Take Quiz Now</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Achievement Banner */}
          {progress.completed > 0 && (
            <div className="mt-16 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl p-8 text-center shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10"></div>
              <div className="relative">
                <div className="text-6xl mb-4">🏆�</div>
                <h3 className="text-3xl font-black text-white mb-2">Great Driving!</h3>
                <p className="text-xl text-green-50">You've mastered {progress.completed} route{progress.completed !== 1 ? 's' : ''}! Keep up the safe driving! 🚗�</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <LessonModal 
        isOpen={isLessonOpen} 
        onClose={() => setIsLessonOpen(false)} 
        lesson={currentLesson} 
      />
    </>
  );
}

