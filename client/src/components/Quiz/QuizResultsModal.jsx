import React from 'react';

export default function QuizResultsModal({ 
  result, 
  quiz, 
  onContinue, 
  onRetake 
}) {
  if (!result) return null;

  const handleContinue = () => {
    console.log('📤 Continuing from results...');
    onContinue(result.passed);
  };

  const handleRetake = () => {
    console.log('🔄 Retaking quiz...');
    onRetake();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute inset-0 ${result.passed ? 'bg-gradient-to-br from-green-400 to-emerald-600' : 'bg-gradient-to-br from-red-400 to-rose-600'}`}></div>
        </div>

        {/* Content */}
        <div className="relative p-12 text-center">
          {/* Animated Icon */}
          <div className={`w-40 h-40 mx-auto mb-8 rounded-full flex items-center justify-center transform transition-all duration-700 ${
            result.passed 
              ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30' 
              : 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30'
          } animate-bounce-in`}>
            {result.passed ? (
              <svg className="w-20 h-20 text-green-600 dark:text-green-400 animate-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-20 h-20 text-red-600 dark:text-red-400 animate-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          {/* Title */}
          <h3 className={`text-5xl font-black mb-6 animate-slide-up ${
            result.passed 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {result.passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}
          </h3>

          {/* Status Message */}
          <p className="text-2xl text-neutral-600 dark:text-neutral-400 mb-10 animate-slide-up animation-delay-100">
            {result.passed 
              ? 'You passed the quiz!' 
              : `You need ${quiz.passingScore}% to pass. Try again!`}
          </p>

          {/* Score Display */}
          <div className="mb-10 p-8 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl animate-slide-up animation-delay-200">
            <div className="text-7xl font-black mb-3 bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent animate-number-count">
              {Math.round(result.score)}%
            </div>
            <div className="text-lg text-neutral-500 dark:text-neutral-400 mb-6">
              Your Score
            </div>
            
            {/* Progress Bar */}
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  result.passed 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-r from-red-500 to-rose-500'
                }`}
                style={{ width: `${result.score}%` }}
              ></div>
            </div>

            {/* Stats Grid */}
            <div className="mt-6 grid grid-cols-3 gap-6 text-sm">
              <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg">
                <div className="text-neutral-500 dark:text-neutral-400 mb-1">Correct</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.correctAnswers}/{result.totalQuestions}
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg">
                <div className="text-neutral-500 dark:text-neutral-400 mb-1">Passing</div>
                <div className="text-2xl font-bold text-neutral-700 dark:text-neutral-300">
                  {quiz.passingScore}%
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg">
                <div className="text-neutral-500 dark:text-neutral-400 mb-1">Points</div>
                <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                  {result.pointsEarned}/{result.totalPoints}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-300">
            {result.passed ? (
              <button
                onClick={handleContinue}
                className="px-10 py-5 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Continue Learning
              </button>
            ) : (
              <>
                {result.canRetake && (
                  <button
                    onClick={handleRetake}
                    className="px-10 py-5 text-lg bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Retake Quiz
                  </button>
                )}
                <button
                  onClick={handleContinue}
                  className="px-10 py-5 text-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Review Module
                </button>
              </>
            )}
          </div>
        </div>

        {/* Animations */}
        <style jsx>{`
          @keyframes bounce-in {
            0% { transform: scale(0) rotate(-180deg); opacity: 0; }
            50% { transform: scale(1.1) rotate(10deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes slide-up {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes check {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes x {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes number-count {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-bounce-in {
            animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          .animate-slide-up {
            animation: slide-up 0.5s ease-out forwards;
          }
          .animation-delay-100 {
            animation-delay: 0.1s;
            opacity: 0;
          }
          .animation-delay-200 {
            animation-delay: 0.2s;
            opacity: 0;
          }
          .animation-delay-300 {
            animation-delay: 0.3s;
            opacity: 0;
          }
          .animate-check {
            stroke-dasharray: 100;
            animation: check 0.6s ease-out 0.3s forwards;
          }
          .animate-x {
            stroke-dasharray: 100;
            animation: x 0.6s ease-out 0.3s forwards;
          }
          .animate-number-count {
            animation: number-count 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.4s forwards;
          }
        `}</style>
      </div>
    </div>
  );
}
