import { useState } from 'react';
import Certificate from '../../../../../components/Certificate';
import Modal from '../../../../../components/Modal';
import QuizModalNew from '../../../../../components/QuizModalNew';
import LessonModal from '../../../../../components/LessonModal';

/**
 * Modal Tool - Test various modal components
 * Including Certificate, Quiz Modal, and Lesson Modal
 */
function ModalTool() {
  // Certificate state
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState({
    fullName: 'Juan Dela Cruz',
    vehicleCategory: 'Motorcycle - Class A',
    accountId: 'ACC-2024-001',
    dateIssued: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    certificateTitle: 'Certificate of Completion',
    issuerName: 'RiderMind'
  });

  // Quiz Modal state
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
      }
    ]
  });

  // Lesson Modal state
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

  const handleCertificateInputChange = (field, value) => {
    setCertificateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuizInputChange = (field, value) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLessonInputChange = (field, value) => {
    setLessonData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrintCertificate = () => {
    window.print();
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
      {/* Certificate Modal Section */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🎓</span>
          Certificate Modal
        </h3>
        
        {/* Certificate Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={certificateData.fullName}
              onChange={(e) => handleCertificateInputChange('fullName', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Vehicle Category
            </label>
            <input
              type="text"
              value={certificateData.vehicleCategory}
              onChange={(e) => handleCertificateInputChange('vehicleCategory', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Motorcycle - Class A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Account ID
            </label>
            <input
              type="text"
              value={certificateData.accountId}
              onChange={(e) => handleCertificateInputChange('accountId', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., ACC-2024-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Date Issued
            </label>
            <input
              type="text"
              value={certificateData.dateIssued}
              onChange={(e) => handleCertificateInputChange('dateIssued', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., November 21, 2025"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Certificate Title
            </label>
            <input
              type="text"
              value={certificateData.certificateTitle}
              onChange={(e) => handleCertificateInputChange('certificateTitle', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Certificate of Completion"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Issuer Name
            </label>
            <input
              type="text"
              value={certificateData.issuerName}
              onChange={(e) => handleCertificateInputChange('issuerName', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., RiderMind"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowCertificate(true)}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            Show Certificate
          </button>
          <button
            onClick={handlePrintCertificate}
            className="px-6 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
          >
            Print Preview
          </button>
        </div>
      </div>

      {/* Quiz Modal Section */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <span>📝</span>
          Quiz Modal
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
              onChange={(e) => handleQuizInputChange('title', e.target.value)}
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
              onChange={(e) => handleQuizInputChange('timeLimit', parseInt(e.target.value))}
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
              onChange={(e) => handleQuizInputChange('description', e.target.value)}
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
              onChange={(e) => handleQuizInputChange('passingScore', parseInt(e.target.value))}
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
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          Show Quiz Modal
        </button>
      </div>

      {/* Lesson Modal Section */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <span>📚</span>
          Lesson Modal
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
              onChange={(e) => handleLessonInputChange('title', e.target.value)}
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
              onChange={(e) => handleLessonInputChange('description', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="2"
              placeholder="Enter lesson description"
            />
          </div>
        </div>

        <button
          onClick={() => setShowLessonModal(true)}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          Show Lesson Modal
        </button>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <Modal isOpen={showCertificate} onClose={() => setShowCertificate(false)} size="max">
          <div className="p-8">
            <Certificate
              fullName={certificateData.fullName}
              vehicleCategory={certificateData.vehicleCategory}
              accountId={certificateData.accountId}
              dateIssued={certificateData.dateIssued}
              certificateTitle={certificateData.certificateTitle}
              issuerName={certificateData.issuerName}
            />
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handlePrintCertificate}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                🖨️ Print Certificate
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="px-6 py-3 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

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

      {/* Lesson Modal */}
      {showLessonModal && (
        <LessonModal
          isOpen={showLessonModal}
          onClose={() => setShowLessonModal(false)}
          lesson={lessonData}
        />
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-container,
          .certificate-container * {
            visibility: visible;
          }
          .certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default ModalTool;
