import { useState } from 'react';
import './animations.css';

export default function CompleteCategorySimulator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentModule: '' });

  const handleCompleteCategory = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress({ current: 0, total: 0, currentModule: '' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      console.log('🏁 Starting complete category simulation...');

      // Get user's modules
      const modulesResponse = await fetch('/api/student-modules/my-modules', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!modulesResponse.ok) {
        throw new Error('Failed to fetch modules');
      }

      const modulesData = await modulesResponse.json();
      const modules = modulesData.data.modules;
      const categoryId = modulesData.data.category.id;

      console.log(`📚 Found ${modules.length} modules in category ${categoryId}`);
      
      // Initialize progress
      setProgress({ current: 0, total: modules.length, currentModule: '' });

      let completedCount = 0;
      const errors = [];

      // Complete each module in sequence
      for (let i = 0; i < modules.length; i++) {
        const studentModule = modules[i];
        setProgress({ 
          current: i + 1, 
          total: modules.length, 
          currentModule: studentModule.module.title 
        });
        try {
          console.log(`📝 Completing module ${studentModule.module.id}: ${studentModule.module.title}`);

          // 1. Set progress to 100%
          const progressResponse = await fetch(`/api/student-modules/${studentModule.module.id}/progress`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              categoryId: categoryId,
              currentSlideId: studentModule.module.slides[studentModule.module.slides.length - 1]?.id,
              progress: 100
            })
          });

          if (!progressResponse.ok) {
            throw new Error(`Failed to update progress for module ${studentModule.module.id}`);
          }

          // 2. If module has a quiz, submit perfect score
          if (studentModule.module.quizzes && studentModule.module.quizzes.length > 0) {
            const quiz = studentModule.module.quizzes[0];
            console.log(`  📝 Submitting quiz ${quiz.id} with perfect score`);

            // Create perfect answers for all questions
            const answers = quiz.questions.map(question => {
              if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
                const correctOption = question.options.find(opt => opt.isCorrect);
                return {
                  questionId: question.id,
                  selectedOptionId: correctOption?.id
                };
              } else if (question.type === 'MULTIPLE_ANSWER') {
                const correctOptions = question.options.filter(opt => opt.isCorrect);
                return {
                  questionId: question.id,
                  selectedOptionId: correctOptions.map(opt => opt.id)
                };
              } else {
                // For text-based questions, use the correct answer if available
                const correctOption = question.options.find(opt => opt.isCorrect);
                return {
                  questionId: question.id,
                  answerText: correctOption?.optionText || 'Correct answer'
                };
              }
            });

            const quizResponse = await fetch(`/api/student-modules/${studentModule.module.id}/submit-quiz`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                categoryId: categoryId,
                quizId: quiz.id,
                answers: answers,
                timeSpent: 60
              })
            });

            if (!quizResponse.ok) {
              const errorData = await quizResponse.json();
              throw new Error(`Failed to submit quiz: ${errorData.error || 'Unknown error'}`);
            }

            const quizResult = await quizResponse.json();
            console.log(`  ✅ Quiz completed with ${quizResult.data.score}% score`);
          }

          completedCount++;
          console.log(`✅ Module ${studentModule.module.id} completed (${completedCount}/${modules.length})`);

        } catch (error) {
          console.error(`❌ Error completing module ${studentModule.module.id}:`, error);
          errors.push({
            moduleId: studentModule.module.id,
            title: studentModule.module.title,
            error: error.message
          });
        }
      }

      setResult({
        success: true,
        totalModules: modules.length,
        completedCount,
        failedCount: errors.length,
        errors: errors.length > 0 ? errors : null
      });

      console.log(`🏁 Complete Category finished: ${completedCount}/${modules.length} modules completed`);

    } catch (error) {
      console.error('❌ Complete Category error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Complete Category
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Automatically complete all modules in your current category
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              What This Does
            </h3>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• Sets all module progress to 100%</li>
              <li>• Submits all quizzes with perfect scores</li>
              <li>• Marks all modules as completed</li>
              <li>• Unlocks all subsequent modules</li>
              <li>• Takes you to the end of the category</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {loading && progress.total > 0 && (
        <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <svg className="animate-spin h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  Completing Modules...
                </span>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out flex items-center justify-end pr-2"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                >
                  <span className="text-xs font-bold text-white">
                    {Math.round((progress.current / progress.total) * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-2 truncate">
                📝 {progress.currentModule}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleCompleteCategory}
        disabled={loading}
        className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-neutral-400 disabled:to-neutral-500 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Completing All Modules...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Complete All Modules Now</span>
          </>
        )}
      </button>

      {/* Celebration Modal */}
      {result && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
          <div className="relative max-w-2xl w-full">
            {/* Confetti Animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 animate-fall"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}px`,
                    backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              ))}
            </div>

            {/* Modal Content */}
            <div className="bg-gradient-to-br from-white via-green-50 to-emerald-50 dark:from-neutral-800 dark:via-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-2xl p-8 relative overflow-hidden animate-scale-in">
              {/* Finish Line Background */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/10 to-transparent" 
                   style={{
                     backgroundImage: 'repeating-linear-gradient(90deg, #000 0px, #000 40px, #fff 40px, #fff 80px)',
                     backgroundSize: '80px 24px',
                     opacity: 0.1
                   }}
              />

              {/* Trophy Icon */}
              <div className="flex justify-center mb-6 animate-bounce-slow">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <svg className="w-24 h-24 text-yellow-500 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </div>
              </div>

              {/* Congratulations Text */}
              <h2 className="text-4xl font-black text-center mb-2 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent animate-gradient">
                🎉 CONGRATULATIONS! 🎉
              </h2>
              <p className="text-xl text-center text-neutral-700 dark:text-neutral-300 font-semibold mb-6">
                You&apos;ve crossed the finish line!
              </p>

              {/* Finish Line Graphic */}
              <div className="flex justify-center mb-6">
                <div className="relative w-full max-w-md h-4 rounded-full overflow-hidden"
                     style={{
                       backgroundImage: 'repeating-linear-gradient(90deg, #000 0px, #000 20px, #fff 20px, #fff 40px)',
                       boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                     }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 animate-slide-in">
                    <span className="text-3xl">🏁</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white/80 dark:bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                    <div className="text-3xl font-black text-green-700 dark:text-green-300 mb-1">
                      {result.completedCount}
                    </div>
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                      Modules Completed
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg">
                    <div className="text-3xl font-black text-blue-700 dark:text-blue-300 mb-1">
                      {Math.round((result.completedCount / result.totalModules) * 100)}%
                    </div>
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Success Rate
                    </div>
                  </div>
                </div>
              </div>

              {/* Errors if any */}
              {result.errors && result.errors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg">
                  <div className="flex items-center gap-2 text-red-900 dark:text-red-100 font-semibold mb-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    <span>Some modules had issues ({result.failedCount})</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1 text-sm text-red-800 dark:text-red-200">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="pl-2 border-l-2 border-red-300 dark:border-red-700">
                        <strong>{err.title}:</strong> {err.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 px-6 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white font-bold rounded-lg transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  View Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Error</h3>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
