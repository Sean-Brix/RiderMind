import { BaseModal } from '../components/Modals/BaseModal';
import { useModalManager, ModalType } from '../hooks/useModalManager';
import { createLessonModalData } from '../utils/modalHelpers';

/**
 * Test: BaseModal Integration with useModalManager
 * 
 * This component tests that BaseModal properly integrates with
 * the modal management system from Phase 2
 */
export function ModalIntegrationTest() {
  const modalManager = useModalManager();

  // Test data
  const mockModule = {
    id: 'sm-1',
    module: {
      id: 'm-1',
      title: 'Road Signs and Markings',
      description: 'Learn about road signs',
      slides: [
        { id: 's-1', type: 'text', title: 'Intro', content: 'Welcome!' },
      ],
    },
  };

  const handleOpenLesson = () => {
    const lessonData = createLessonModalData(mockModule, 0, mockModule.module.slides);
    modalManager.openModal(ModalType.LESSON, lessonData);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">BaseModal Integration Test</h1>

      {/* Test Controls */}
      <div className="space-y-4">
        <button
          onClick={handleOpenLesson}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Test: Open Lesson Modal
        </button>

        <div className="text-sm text-gray-600">
          <p>Active Modal: {modalManager.activeModal}</p>
          <p>Any Modal Open: {String(modalManager.isAnyModalOpen())}</p>
        </div>
      </div>

      {/* Lesson Modal */}
      <LessonModalTest />
    </div>
  );
}

/**
 * Test lesson modal component
 */
function LessonModalTest() {
  const modalManager = useModalManager();
  const { isOpen, data, close } = modalManager.useModal(ModalType.LESSON);

  if (!isOpen) return null;

  return (
    <BaseModal
      open={isOpen}
      onClose={close}
      title={data?.module?.module?.title}
      description={data?.module?.module?.description}
      size="lg"
    >
      <div className="p-6">
        <h3 className="font-semibold mb-2">Current Slide</h3>
        <p>Slide {data?.currentSlideIndex + 1} of {data?.slides?.length}</p>
        
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            Slide Title: {data?.slides?.[data?.currentSlideIndex]?.title}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Content: {data?.slides?.[data?.currentSlideIndex]?.content}
          </p>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={close}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={() => {
              console.log('Quiz button clicked');
              // This would transition to quiz in real implementation
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Take Quiz
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

export default ModalIntegrationTest;
