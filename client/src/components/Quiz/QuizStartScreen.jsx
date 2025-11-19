import React from 'react';

export default function QuizStartScreen({ quiz, onStart, onClose }) {
  return (
    <div className="p-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 mb-4">
          {quiz.title}
        </h2>
        {quiz.description && (
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            {quiz.description}
          </p>
        )}
      </div>

      {/* Quiz Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-2 border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Questions</span>
          </div>
          <div className="text-3xl font-black text-blue-700 dark:text-blue-300">
            {quiz.questions?.length || 0}
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border-2 border-green-200 dark:border-green-700">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Passing Score</span>
          </div>
          <div className="text-3xl font-black text-green-700 dark:text-green-300">
            {quiz.passingScore}%
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border-2 border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Time Limit</span>
          </div>
          <div className="text-3xl font-black text-purple-700 dark:text-purple-300">
            {quiz.timeLimit ? `${Math.floor(quiz.timeLimit / 60)} min` : 'None'}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-10 p-6 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-700 rounded-xl">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-300 mb-2">
              Before You Begin
            </h3>
            <ul className="space-y-2 text-amber-800 dark:text-amber-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-500 mt-0.5">•</span>
                <span>Answer all questions to the best of your ability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-500 mt-0.5">•</span>
                <span>You can navigate between questions using the navigation buttons</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-500 mt-0.5">•</span>
                <span>Make sure to review your answers before submitting</span>
              </li>
              {quiz.timeLimit && (
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-500 mt-0.5">•</span>
                  <span className="font-semibold">Time will start as soon as you begin the quiz</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onClose}
          className="px-8 py-4 text-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Cancel
        </button>
        <button
          onClick={onStart}
          className="px-12 py-4 text-lg bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}
