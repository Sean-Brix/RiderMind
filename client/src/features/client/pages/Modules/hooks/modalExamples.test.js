/**
 * Modal State Management - Test & Example
 * 
 * This file demonstrates how to use the modal management system
 * and tests various modal transition scenarios
 */

import { useModalManager, ModalType } from './useModalManager';
import { 
  createLessonModalData, 
  createQuizModalData, 
  createQuizResultsModalData,
  createCongratulationsModalData,
  createLessonToQuizTransition,
  createQuizToResultsTransition,
} from '../utils/modalHelpers';

// ============================================================
// EXAMPLE 1: Basic Modal Opening
// ============================================================

function ExampleBasicModal() {
  const modalManager = useModalManager();

  const openLessonModal = () => {
    const lessonData = createLessonModalData(
      mockModule,         // module object
      0,                  // current slide index
      mockModule.module.slides // slides array
    );

    modalManager.openModal(ModalType.LESSON, lessonData);
  };

  return (
    <button onClick={openLessonModal}>
      Open Lesson
    </button>
  );
}

// ============================================================
// EXAMPLE 2: Modal with Cleanup
// ============================================================

function ExampleModalWithCleanup() {
  const modalManager = useModalManager();

  const openLessonWithCleanup = () => {
    // Register cleanup callback
    modalManager.registerCleanup(ModalType.LESSON, () => {
      console.log('Lesson modal closed - cleaning up...');
      // Stop video, reset state, etc.
    });

    const lessonData = createLessonModalData(mockModule, 0, mockModule.module.slides);
    modalManager.openModal(ModalType.LESSON, lessonData);
  };

  return (
    <button onClick={openLessonWithCleanup}>
      Open Lesson with Cleanup
    </button>
  );
}

// ============================================================
// EXAMPLE 3: Modal Transition (Lesson -> Quiz)
// ============================================================

function ExampleLessonToQuiz() {
  const modalManager = useModalManager();

  const startLesson = () => {
    // 1. Register transition from LESSON to QUIZ
    const transitionCallback = createLessonToQuizTransition(
      mockModule,
      mockQuiz,
      (quizData) => {
        console.log('Transitioning to quiz...', quizData);
      }
    );

    modalManager.registerTransition(
      ModalType.LESSON, 
      ModalType.QUIZ, 
      transitionCallback
    );

    // 2. Open lesson modal
    const lessonData = createLessonModalData(mockModule, 0, mockModule.module.slides);
    modalManager.openModal(ModalType.LESSON, lessonData);
  };

  const triggerQuizTransition = () => {
    // 3. Transition from lesson to quiz (this would be called from LessonViewer)
    const quizData = createQuizModalData(mockQuiz, mockModule.id, mockModule.id);
    
    modalManager.transitionModal(
      ModalType.QUIZ,
      quizData,
      300 // 300ms delay for smooth animation
    );
  };

  return (
    <div>
      <button onClick={startLesson}>Start Lesson</button>
      <button onClick={triggerQuizTransition}>Take Quiz</button>
    </div>
  );
}

// ============================================================
// EXAMPLE 4: Complete Flow (Lesson -> Quiz -> Results -> Congratulations)
// ============================================================

function ExampleCompleteFlow() {
  const modalManager = useModalManager();

  const startCompleteFlow = () => {
    // Register all transitions
    
    // Lesson -> Quiz
    modalManager.registerTransition(
      ModalType.LESSON,
      ModalType.QUIZ,
      createLessonToQuizTransition(mockModule, mockQuiz, () => {
        console.log('Opened quiz from lesson');
      })
    );

    // Quiz -> Results
    modalManager.registerTransition(
      ModalType.QUIZ,
      ModalType.QUIZ_RESULTS,
      createQuizToResultsTransition(mockModule, mockQuizResult, () => {
        console.log('Showing quiz results');
      })
    );

    // Results -> Congratulations (if passed and module completed)
    modalManager.registerTransition(
      ModalType.QUIZ_RESULTS,
      ModalType.CONGRATULATIONS,
      (resultData) => {
        if (resultData.passed && resultData.completedModule) {
          return createCongratulationsModalData(
            mockModule,
            mockQuizResult.score,
            100, // XP earned
            5    // New level
          );
        }
        return null; // Don't transition if not passed
      }
    );

    // Start with lesson
    const lessonData = createLessonModalData(mockModule, 0, mockModule.module.slides);
    modalManager.openModal(ModalType.LESSON, lessonData);
  };

  return (
    <button onClick={startCompleteFlow}>
      Start Complete Journey
    </button>
  );
}

// ============================================================
// EXAMPLE 5: Checking Modal State
// ============================================================

function ExampleModalStateChecks() {
  const modalManager = useModalManager();

  const checkState = () => {
    console.log('Is lesson open?', modalManager.isModalOpen(ModalType.LESSON));
    console.log('Is quiz open?', modalManager.isModalOpen(ModalType.QUIZ));
    console.log('Is any modal open?', modalManager.isAnyModalOpen());
    console.log('Active modal:', modalManager.activeModal);
    console.log('Modal data:', modalManager.modalData);
  };

  return (
    <button onClick={checkState}>
      Check Modal State
    </button>
  );
}

// ============================================================
// EXAMPLE 6: Modal Component Integration
// ============================================================

function LessonModalComponent() {
  const modalManager = useModalManager();
  const { isOpen, data, close } = modalManager.useModal(ModalType.LESSON);

  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>{data?.module?.module?.title}</h2>
      <p>Slide {data?.currentSlideIndex + 1} of {data?.slides?.length}</p>
      
      <button onClick={close}>Close</button>
      
      <button onClick={() => {
        // Transition to quiz when lesson complete
        const quizData = createQuizModalData(
          data.module.module.quizzes[0],
          data.module.id,
          data.module.id
        );
        modalManager.transitionModal(ModalType.QUIZ, quizData);
      }}>
        Take Quiz
      </button>
    </div>
  );
}

function QuizModalComponent() {
  const modalManager = useModalManager();
  const { isOpen, data, close } = modalManager.useModal(ModalType.QUIZ);

  if (!isOpen) return null;

  const handleQuizSubmit = (score, passed) => {
    // Transition to results
    const resultsData = createQuizResultsModalData(
      data.quiz,
      score,
      passed,
      [], // feedback
      1   // attempt
    );
    
    modalManager.transitionModal(ModalType.QUIZ_RESULTS, resultsData, 500);
  };

  return (
    <div className="modal">
      <h2>Quiz: {data?.quiz?.title}</h2>
      <button onClick={() => handleQuizSubmit(85, true)}>
        Submit Quiz (Simulated)
      </button>
      <button onClick={close}>Cancel</button>
    </div>
  );
}

// ============================================================
// TEST SCENARIOS
// ============================================================

export const testScenarios = {
  // Test 1: Prevent duplicate modal opens
  testPreventDuplicates: (modalManager) => {
    const lessonData = createLessonModalData(mockModule, 0, mockModule.module.slides);
    
    modalManager.openModal(ModalType.LESSON, lessonData);
    console.assert(
      modalManager.isModalOpen(ModalType.LESSON),
      'Lesson modal should be open'
    );
    
    // Try to open quiz while lesson is open
    const quizData = createQuizModalData(mockQuiz, mockModule.id, mockModule.id);
    modalManager.openModal(ModalType.QUIZ, quizData);
    
    // Lesson should be closed, quiz should be open
    console.assert(
      !modalManager.isModalOpen(ModalType.LESSON),
      'Lesson modal should be closed'
    );
    console.assert(
      modalManager.isModalOpen(ModalType.QUIZ),
      'Quiz modal should be open'
    );
  },

  // Test 2: Cleanup callbacks execute
  testCleanupExecution: (modalManager) => {
    let cleanupExecuted = false;
    
    modalManager.registerCleanup(ModalType.LESSON, () => {
      cleanupExecuted = true;
    });
    
    const lessonData = createLessonModalData(mockModule, 0, mockModule.module.slides);
    modalManager.openModal(ModalType.LESSON, lessonData);
    modalManager.closeModal();
    
    console.assert(cleanupExecuted, 'Cleanup callback should execute');
  },

  // Test 3: Transition callbacks execute
  testTransitionExecution: (modalManager) => {
    let transitionExecuted = false;
    
    modalManager.registerTransition(ModalType.LESSON, ModalType.QUIZ, () => {
      transitionExecuted = true;
      return createQuizModalData(mockQuiz, mockModule.id, mockModule.id);
    });
    
    const lessonData = createLessonModalData(mockModule, 0, mockModule.module.slides);
    modalManager.openModal(ModalType.LESSON, lessonData);
    
    const quizData = createQuizModalData(mockQuiz, mockModule.id, mockModule.id);
    modalManager.transitionModal(ModalType.QUIZ, quizData);
    
    console.assert(transitionExecuted, 'Transition callback should execute');
  },

  // Test 4: Multiple transitions in sequence
  testSequentialTransitions: async (modalManager) => {
    const sequence = [];
    
    // Lesson -> Quiz
    modalManager.registerTransition(ModalType.LESSON, ModalType.QUIZ, () => {
      sequence.push('lesson-to-quiz');
      return createQuizModalData(mockQuiz, mockModule.id, mockModule.id);
    });
    
    // Quiz -> Results
    modalManager.registerTransition(ModalType.QUIZ, ModalType.QUIZ_RESULTS, () => {
      sequence.push('quiz-to-results');
      return createQuizResultsModalData(mockQuiz, 90, true, [], 1);
    });
    
    // Start with lesson
    modalManager.openModal(
      ModalType.LESSON, 
      createLessonModalData(mockModule, 0, mockModule.module.slides)
    );
    
    // Transition to quiz
    await modalManager.transitionModal(
      ModalType.QUIZ,
      createQuizModalData(mockQuiz, mockModule.id, mockModule.id),
      100
    );
    
    // Transition to results
    await modalManager.transitionModal(
      ModalType.QUIZ_RESULTS,
      createQuizResultsModalData(mockQuiz, 90, true, [], 1),
      100
    );
    
    console.assert(
      sequence.length === 2,
      'Both transitions should execute'
    );
    console.assert(
      sequence[0] === 'lesson-to-quiz',
      'First transition should be lesson-to-quiz'
    );
    console.assert(
      sequence[1] === 'quiz-to-results',
      'Second transition should be quiz-to-results'
    );
  },
};

// ============================================================
// MOCK DATA
// ============================================================

const mockModule = {
  id: 'sm-1',
  moduleId: 'm-1',
  progress: 45,
  isCompleted: false,
  module: {
    id: 'm-1',
    title: 'Road Signs and Markings',
    description: 'Learn about various road signs',
    slides: [
      { id: 's-1', type: 'text', title: 'Introduction', content: 'Welcome!' },
      { id: 's-2', type: 'image', title: 'Stop Sign', imageUrl: '/images/stop.jpg' },
      { id: 's-3', type: 'video', title: 'Road Rules', videoUrl: '/videos/rules.mp4' },
    ],
    quizzes: [
      {
        id: 'q-1',
        title: 'Road Signs Quiz',
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            questionText: 'What does a red octagon sign mean?',
            options: ['Stop', 'Yield', 'Caution', 'Go'],
            correctAnswer: 0,
          },
        ],
      },
    ],
  },
};

const mockQuiz = {
  id: 'q-1',
  title: 'Road Signs Quiz',
  passingScore: 70,
  questions: [
    {
      id: 'q1',
      questionText: 'What does a red octagon sign mean?',
      options: ['Stop', 'Yield', 'Caution', 'Go'],
      correctAnswer: 0,
    },
  ],
};

const mockQuizResult = {
  score: 90,
  passed: true,
  correctCount: 9,
  totalQuestions: 10,
  feedback: [],
  attempt: 1,
  completedModule: true,
};

export default {
  ExampleBasicModal,
  ExampleModalWithCleanup,
  ExampleLessonToQuiz,
  ExampleCompleteFlow,
  ExampleModalStateChecks,
  LessonModalComponent,
  QuizModalComponent,
  testScenarios,
};
