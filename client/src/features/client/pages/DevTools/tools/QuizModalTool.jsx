import { useState } from 'react';
import QuizModalNew from '../../../../../components/QuizModalNew';

/**
 * Quiz Modal Tool - Test Quiz Modal component
 */
function QuizModalTool() {
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizData, setQuizData] = useState({
    id: 'quiz-001',
    title: 'Road Safety Quiz',
    description: 'Test your knowledge on basic road safety rules',
    timeLimit: 300, // 5 minutes in seconds
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        text: 'What is the maximum speed limit in residential areas?',
        type: 'multiple-choice',
        options: [
          { id: 'a', text: '20 km/h' },
          { id: 'b', text: '30 km/h' },
          { id: 'c', text: '40 km/h' },
          { id: 'd', text: '50 km/h' }
        ],
        correctAnswer: 'b'
      },
      {
        id: 'q2',
        text: 'When should you use your turn signal?',
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Only when turning left' },
          { id: 'b', text: 'Only when turning right' },
          { id: 'c', text: 'Before any turn or lane change' },
          { id: 'd', text: 'Only on highways' }
        ],
        correctAnswer: 'c'
      },
      {
        id: 'q3',
        text: 'What should you do at a stop sign?',
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Slow down and proceed' },
          { id: 'b', text: 'Come to a complete stop' },
          { id: 'c', text: 'Honk and go' },
          { id: 'd', text: 'Only stop if cars are present' }
        ],
        correctAnswer: 'b'
      }
    ]
  });

  const handleInputChange = (field, value) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuizSubmit = (result) => {
    console.log('Quiz submitted:', result);
    alert(`Quiz completed! Score: ${result.score}%`);
  };

  const handleQuizComplete = (result) => {
    console.log('Quiz completed:', result);
    setShowQuizModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
          Quiz Configuration
        </h3>
        
        {/* Quiz Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              value={quizData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter quiz title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Time Limit (seconds)
            </label>
            <input
              type="number"
              value={quizData.timeLimit}
              onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., 300"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              value={quizData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="2"
              placeholder="Enter quiz description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Passing Score (%)
            </label>
            <input
              type="number"
              value={quizData.passingScore}
              onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., 70"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Number of Questions
            </label>
            <input
              type="number"
              value={quizData.questions.length}
              disabled
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400"
            />
          </div>
        </div>

        <button
          onClick={() => setShowQuizModal(true)}
          className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
        >
          Open Quiz Modal
        </button>
      </div>

      {/* Quiz Modal */}
      {showQuizModal && (
        <QuizModalNew
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          quiz={quizData}
          onSubmit={handleQuizSubmit}
          onQuizComplete={handleQuizComplete}
        />
      )}
    </div>
  );
}

export default QuizModalTool;
