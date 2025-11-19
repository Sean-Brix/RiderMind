import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Quiz Simulator Tool
 * Auto-fills quiz up to the last question, then shows correct answer
 */
export default function QuizSimulator() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Get auth config
  const getConfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    };
  };

  const handleSimulateQuiz = async () => {
    setLoading(true);
    setError('');
    setStatus('🔍 Finding current ongoing module...');

    try {
      // Step 1: Get all student modules to find the current one
      const modulesResponse = await axios.get('/api/student-modules/my-modules', getConfig());
      
      if (!modulesResponse.data.success) {
        throw new Error('Failed to fetch student modules');
      }

      // Handle array or object response
      let studentModules = [];
      
      if (Array.isArray(modulesResponse.data.data)) {
        studentModules = modulesResponse.data.data;
      } else if (modulesResponse.data.data?.modules) {
        studentModules = modulesResponse.data.data.modules;
      } else if (modulesResponse.data.modules) {
        studentModules = modulesResponse.data.modules;
      }

      // Find first module that's not completed
      const currentModule = studentModules.find(
        sm => !sm.isCompleted || sm.progress < 100 || sm.completedAt === null
      ) || studentModules[0];

      if (!currentModule) {
        setError(`❌ No modules found.`);
        setLoading(false);
        return;
      }

      const moduleId = currentModule.moduleId || currentModule.id;
      const moduleTitle = currentModule.module?.title || currentModule.title || 'Unknown';
      
      setStatus(`📚 Found module: ${moduleTitle}\n🔍 Fetching quiz answers...`);

      // Step 2: Get the quiz with questions and options to fetch all answers
      const quizResponse = await axios.get(
        `/api/quizzes?moduleId=${moduleId}&includeQuestions=true&includeOptions=true`, 
        getConfig()
      );
      
      if (!quizResponse.data.success || !quizResponse.data.data || quizResponse.data.data.length === 0) {
        throw new Error(`No quiz found for module ${moduleId}`);
      }

      const quiz = Array.isArray(quizResponse.data.data) ? quizResponse.data.data[0] : quizResponse.data.data;
      
      // Log all correct answers to console with prominent styling
      console.log(
        '%c\n' + '═'.repeat(80) + '\n' +
        '🎯 QUIZ ANSWERS - ' + quiz.title.toUpperCase() + '\n' +
        '═'.repeat(80),
        'color: #10b981; font-weight: bold; font-size: 14px;'
      );
      
      if (!quiz.questions || quiz.questions.length === 0) {
        console.log('%c❌ No questions found in quiz!', 'color: #ef4444; font-weight: bold;');
        console.log('Quiz data:', quiz);
      }
      
      quiz.questions?.forEach((question, index) => {
        const correctOption = question.options?.find(opt => opt.isCorrect);
        console.log(
          `%cQ${index + 1}: %c${question.question}`,
          'color: #3b82f6; font-weight: bold; font-size: 13px;',
          'color: #6b7280; font-size: 12px;'
        );
        console.log(
          `%c✅ ANSWER: %c${correctOption?.optionText || 'N/A'}`,
          'color: #10b981; font-weight: bold;',
          'color: #059669; font-size: 13px; font-weight: bold;'
        );
        console.log(''); // Empty line for spacing
      });
      
      console.log(
        '%c' + '═'.repeat(80) + '\n',
        'color: #10b981; font-weight: bold;'
      );
      
      setStatus(`
        ✅ Quiz answers logged to console!
        
        📚 Module: ${moduleTitle}
        📝 Quiz: ${quiz.title}
        🔢 Questions: ${quiz.questions?.length || 0}
        
        🔄 Opening quiz modal...
      `);

      // Redirect to modules page with state to auto-open quiz
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/modules', { 
        state: { 
          openQuiz: true, 
          moduleId: moduleId,
          studentModuleId: currentModule.id
        } 
      });

    } catch (err) {
      console.error('Simulation error:', err);
      setError(`❌ Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
          How it works:
        </h3>
        <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
          <li>Finds your current ongoing module (the one you haven't completed)</li>
          <li>Redirects you to the modules page</li>
          <li>The quiz modal should open automatically based on your progress</li>
          <li>You can then manually test the quiz completion flow</li>
        </ol>
      </div>

      {/* Action Button */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
        <button
          onClick={handleSimulateQuiz}
          disabled={loading}
          className={`
            w-full px-6 py-3 rounded-lg font-semibold text-white
            transition-all transform active:scale-95
            ${loading
              ? 'bg-neutral-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Simulating...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🎮</span>
              <span>Start Quiz Simulation</span>
            </div>
          )}
        </button>
      </div>

      {/* Status Display */}
      {status && (
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
            Status:
          </h3>
          <pre className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap font-mono">
            {status}
          </pre>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">
            Error:
          </h3>
          <p className="text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap">
            {error}
          </p>
        </div>
      )}

      {/* Prerequisites Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">
              Prerequisites
            </h3>
            <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 list-disc list-inside">
              <li>You must be logged in as a student</li>
              <li>You must have an active module (in-progress or not-started)</li>
              <li>The module must have an associated quiz</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
