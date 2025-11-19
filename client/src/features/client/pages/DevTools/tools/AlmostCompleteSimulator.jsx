import { useState } from 'react';
import './animations.css';

export default function AlmostCompleteSimulator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentModule: '' });

  const handleAlmostComplete = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setProgress({ current: 0, total: 0, currentModule: '' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      console.log('🏃 Starting almost complete simulation...');

      // Get user's modules
      const modulesResponse = await fetch('/api/student-modules/my-modules', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!modulesResponse.ok) {
        throw new Error('Failed to fetch modules');
      }

      const modulesData = await modulesResponse.json();
      const allModules = modulesData.data.modules;
      const categoryId = modulesData.data.category.id;

      // Complete all modules EXCEPT the last one
      const modulesToComplete = allModules.slice(0, -1);
      const lastModule = allModules[allModules.length - 1];

      console.log(`📚 Found ${allModules.length} modules. Completing ${modulesToComplete.length}, leaving 1 incomplete`);
      console.log(`⏭️ Skipping: ${lastModule.module.title}`);
      
      // Initialize progress
      setProgress({ current: 0, total: modulesToComplete.length, currentModule: '' });

      let completedCount = 0;
      const errors = [];

      // Complete each module except the last
      for (let i = 0; i < modulesToComplete.length; i++) {
        const studentModule = modulesToComplete[i];
        setProgress({ 
          current: i + 1, 
          total: modulesToComplete.length, 
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
          console.log(`✅ Module ${studentModule.module.id} completed (${completedCount}/${modulesToComplete.length})`);

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
        totalModules: allModules.length,
        completedCount,
        skippedCount: 1,
        skippedModule: lastModule.module.title,
        failedCount: errors.length,
        errors: errors.length > 0 ? errors : null
      });

      console.log(`🏃 Almost Complete finished: ${completedCount}/${modulesToComplete.length} modules completed, 1 left incomplete`);

    } catch (error) {
      console.error('❌ Almost Complete error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Almost Complete
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            Complete all modules except the last one
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
              What This Does
            </h3>
            <ul className="space-y-1 text-sm text-orange-800 dark:text-orange-200">
              <li>• Completes all modules EXCEPT the last one</li>
              <li>• Sets progress to 100% for all but last module</li>
              <li>• Submits all quizzes with perfect scores (except last)</li>
              <li>• Leaves you one module away from completion</li>
              <li>• Perfect for testing the final module experience</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {loading && progress.total > 0 && (
        <div className="mb-6 p-6 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <svg className="animate-spin h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-orange-900 dark:text-orange-100">
                  Processing Modules...
                </span>
                <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-600 transition-all duration-500 ease-out flex items-center justify-end pr-2"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                >
                  <span className="text-xs font-bold text-white">
                    {Math.round((progress.current / progress.total) * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-2 truncate">
                📝 {progress.currentModule}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleAlmostComplete}
        disabled={loading}
        className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-neutral-400 disabled:to-neutral-500 text-white font-bold rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing Modules...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Complete All Except Last</span>
          </>
        )}
      </button>

      {/* Success Result */}
      {result && (
        <div className="mt-6 p-6 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-xl">
          <div className="flex items-start gap-3 mb-4">
            <svg className="w-8 h-8 text-orange-600 dark:text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-3">
                Almost There! 🏃
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-white dark:bg-orange-900/30 rounded-lg">
                  <div className="text-xs text-orange-700 dark:text-orange-300">Completed</div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{result.completedCount}</div>
                </div>
                <div className="p-3 bg-white dark:bg-orange-900/30 rounded-lg">
                  <div className="text-xs text-orange-700 dark:text-orange-300">Remaining</div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{result.skippedCount}</div>
                </div>
                <div className="p-3 bg-white dark:bg-orange-900/30 rounded-lg">
                  <div className="text-xs text-orange-700 dark:text-orange-300">Total</div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{result.totalModules}</div>
                </div>
              </div>
              
              <div className="p-4 bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100 font-semibold mb-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  <span>Last Module Remaining:</span>
                </div>
                <p className="text-sm text-amber-800 dark:text-amber-200 pl-7">
                  {result.skippedModule}
                </p>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <div className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
                    Failed Modules ({result.failedCount}):
                  </div>
                  <div className="space-y-2 text-sm text-red-800 dark:text-red-200">
                    {result.errors.map((err, idx) => (
                      <div key={idx}>
                        <strong>{err.title}:</strong> {err.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all"
              >
                Refresh Page to See Results
              </button>
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
