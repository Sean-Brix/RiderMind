import { useState } from 'react';
import LessonModal from '../../../../../components/LessonModal';

/**
 * Lesson Modal Tool - Test Lesson Modal component
 */
function LessonModalTool() {
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonData, setLessonData] = useState({
    id: 'lesson-001',
    title: 'Introduction to Motorcycle Safety',
    description: 'Learn the basics of safe motorcycle operation',
    slides: [
      {
        id: 'slide1',
        type: 'text',
        title: 'Welcome to Motorcycle Safety',
        content: 'This lesson will cover essential safety practices for motorcycle riders.',
        bulletPoints: [
          'Understanding your motorcycle',
          'Protective gear requirements',
          'Basic riding techniques',
          'Road safety awareness'
        ]
      },
      {
        id: 'slide2',
        type: 'image',
        title: 'Protective Gear',
        content: 'Always wear proper protective equipment',
        imageUrl: 'https://via.placeholder.com/800x600?text=Motorcycle+Gear',
        caption: 'Essential motorcycle protective gear'
      },
      {
        id: 'slide3',
        type: 'video',
        title: 'Basic Riding Techniques',
        content: 'Watch this demonstration of proper riding posture',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      }
    ],
    quiz: null
  });

  const handleInputChange = (field, value) => {
    setLessonData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
          Lesson Configuration
        </h3>
        
        {/* Lesson Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Lesson Title
            </label>
            <input
              type="text"
              value={lessonData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter lesson title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Number of Slides
            </label>
            <input
              type="number"
              value={lessonData.slides.length}
              disabled
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Description
            </label>
            <textarea
              value={lessonData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="2"
              placeholder="Enter lesson description"
            />
          </div>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Slide Preview:</h4>
          <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
            <li>• Slide 1: Text - Welcome to Motorcycle Safety</li>
            <li>• Slide 2: Image - Protective Gear</li>
            <li>• Slide 3: Video - Basic Riding Techniques</li>
          </ul>
        </div>

        <button
          onClick={() => setShowLessonModal(true)}
          className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
        >
          Open Lesson Modal
        </button>
      </div>

      {/* Lesson Modal */}
      {showLessonModal && (
        <LessonModal
          isOpen={showLessonModal}
          onClose={() => setShowLessonModal(false)}
          lesson={lessonData}
        />
      )}
    </div>
  );
}

export default LessonModalTool;
