# Quick Reference: Modal State Management

## 🎯 Common Use Cases

### 1. Open a Lesson Modal

```javascript
import { useModalManager, ModalType } from './hooks/useModalManager';
import { createLessonModalData } from './utils/modalHelpers';

function ModuleCard({ module }) {
  const modalManager = useModalManager();

  const handleOpenLesson = () => {
    const lessonData = createLessonModalData(
      module,                        // student module object
      0,                             // start at slide 0
      module.module.slides           // slides array
    );
    
    modalManager.openModal(ModalType.LESSON, lessonData);
  };

  return (
    <button onClick={handleOpenLesson}>
      Start Lesson
    </button>
  );
}
```

---

### 2. Transition from Lesson to Quiz

```javascript
import { useModalManager, ModalType } from './hooks/useModalManager';
import { createQuizModalData } from './utils/modalHelpers';

function LessonViewer() {
  const modalManager = useModalManager();
  const { data } = modalManager.useModal(ModalType.LESSON);

  const handleTakeQuiz = () => {
    const quiz = data.module.module.quizzes[0];
    const quizData = createQuizModalData(
      quiz,
      data.module.id,
      data.module.id
    );
    
    // Smooth transition with 300ms delay
    modalManager.transitionModal(ModalType.QUIZ, quizData, 300);
  };

  return (
    <button onClick={handleTakeQuiz}>
      Take Quiz
    </button>
  );
}
```

---

### 3. Submit Quiz and Show Results

```javascript
import { useQuiz } from './hooks/useQuiz';
import { useModalManager, ModalType } from './hooks/useModalManager';
import { createQuizResultsModalData } from './utils/modalHelpers';

function QuizViewer() {
  const modalManager = useModalManager();
  const quiz = useQuiz({
    onQuizComplete: (result) => {
      // Show results modal
      const resultsData = createQuizResultsModalData(
        quiz.currentQuiz,
        result.score,
        result.passed,
        result.feedback,
        result.attempt
      );
      
      modalManager.transitionModal(
        ModalType.QUIZ_RESULTS, 
        resultsData, 
        500
      );
    },
  });

  const handleSubmit = async () => {
    await quiz.submitQuiz();
    // onQuizComplete callback handles modal transition
  };

  return (
    <button onClick={handleSubmit} disabled={!quiz.canSubmit}>
      Submit Quiz
    </button>
  );
}
```

---

### 4. Track Progress and XP

```javascript
import { useProgress } from './hooks/useProgress';

function ProgressBar({ modules }) {
  const progress = useProgress(modules);

  return (
    <div>
      <h2>Level {progress.level}</h2>
      <p>{progress.totalXP} / {progress.xpForNextLevel} XP</p>
      <div className="progress-bar">
        <div 
          style={{ width: `${progress.xpProgress}%` }}
          className="progress-fill"
        />
      </div>
      <p>{progress.completionPercentage}% Complete</p>
      <p>{progress.completedCount} / {progress.stats.totalModules} Modules</p>
    </div>
  );
}
```

---

### 5. Check Module Unlock Status

```javascript
import { useProgress } from './hooks/useProgress';

function ModuleCard({ module, moduleIndex, modules }) {
  const progress = useProgress(modules);
  const status = progress.getModuleStatus(moduleIndex);

  if (status === 'locked') {
    return <div>🔒 Locked - Complete previous module first</div>;
  }

  if (status === 'completed') {
    return <div>✅ Completed</div>;
  }

  if (status === 'in-progress') {
    return <div>📖 In Progress ({module.progress}%)</div>;
  }

  return <div>🆕 Available</div>;
}
```

---

### 6. Check Quiz Availability

```javascript
import { useProgress } from './hooks/useProgress';

function QuizButton({ moduleIndex, modules }) {
  const progress = useProgress(modules);
  const isAvailable = progress.isQuizAvailable(moduleIndex);

  if (!isAvailable) {
    const module = modules[moduleIndex];
    const remaining = 90 - module.progress;
    
    return (
      <button disabled>
        Complete {Math.ceil(remaining)}% more to unlock quiz
      </button>
    );
  }

  return (
    <button onClick={handleOpenQuiz}>
      Take Quiz
    </button>
  );
}
```

---

### 7. Handle Quiz Answers

```javascript
import { useQuiz } from './hooks/useQuiz';

function QuizQuestion({ question }) {
  const quiz = useQuiz();

  const handleAnswerSelect = (optionIndex) => {
    quiz.setAnswer(question.id, optionIndex);
  };

  const selectedAnswer = quiz.getAnswer(question.id);

  return (
    <div>
      <h3>{question.questionText}</h3>
      {question.options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleAnswerSelect(index)}
          className={selectedAnswer === index ? 'selected' : ''}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
```

---

### 8. Register Modal Cleanup

```javascript
import { useModalManager, ModalType } from './hooks/useModalManager';
import { useEffect, useRef } from 'react';

function LessonViewer() {
  const modalManager = useModalManager();
  const videoRef = useRef(null);

  useEffect(() => {
    // Register cleanup to pause video when modal closes
    modalManager.registerCleanup(ModalType.LESSON, () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      console.log('Lesson modal cleaned up');
    });
  }, [modalManager]);

  return (
    <video ref={videoRef} src="..." />
  );
}
```

---

### 9. Use Modal State in Component

```javascript
import { useModalManager, ModalType } from './hooks/useModalManager';

function LessonModal() {
  const modalManager = useModalManager();
  const { isOpen, data, close } = modalManager.useModal(ModalType.LESSON);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={close}>✕</button>
        <h2>{data.module.module.title}</h2>
        <p>Slide {data.currentSlideIndex + 1} of {data.slides.length}</p>
      </div>
    </div>
  );
}
```

---

### 10. Calculate and Display Quiz Score

```javascript
import { useQuiz } from './hooks/useQuiz';
import { getQuizGrade, getPerformanceLevel } from './utils/quizHelpers';

function QuizResults() {
  const quiz = useQuiz();
  const grade = getQuizGrade(quiz.score);
  const performance = getPerformanceLevel(quiz.score);

  return (
    <div>
      <h2>Quiz Results</h2>
      <div className={`score ${performance.color}`}>
        {performance.emoji} {quiz.score}%
      </div>
      <p>Grade: {grade}</p>
      <p>{performance.message}</p>
      <p>
        {quiz.feedback.filter(f => f.isCorrect).length} / {quiz.feedback.length} correct
      </p>
    </div>
  );
}
```

---

## 🔧 Utility Functions Quick Reference

### Modal Helpers

```javascript
import {
  createLessonModalData,
  createQuizModalData,
  createQuizResultsModalData,
  createCongratulationsModalData,
  validateModalData,
} from './utils/modalHelpers';

// Create modal data
const lessonData = createLessonModalData(module, slideIndex, slides);
const quizData = createQuizModalData(quiz, moduleId, studentModuleId);

// Validate modal data
const { valid, missing } = validateModalData(lessonData, ['module', 'slides']);
```

### Progress Helpers

```javascript
import {
  calculateLevel,
  calculateTotalXP,
  formatXP,
  getLevelTier,
  calculateQuizReadiness,
} from './utils/progressCalculator';

const level = calculateLevel(1250); // 13
const xp = calculateTotalXP(modules); // 1250
const formatted = formatXP(1250); // "1.3k"
const tier = getLevelTier(13); // { tier: 'Advanced', color: 'blue' }

const quizReady = calculateQuizReadiness(module);
// { ready: true/false, reason: "...", canRetake: true/false }
```

### Quiz Helpers

```javascript
import {
  calculateQuizScore,
  isQuizPassed,
  generateQuizFeedback,
  getQuizGrade,
  canRetakeQuiz,
} from './utils/quizHelpers';

const { score, correctCount } = calculateQuizScore(answers, quiz);
const passed = isQuizPassed(score, 70); // true if score >= 70
const feedback = generateQuizFeedback(answers, quiz);
const grade = getQuizGrade(score); // "A", "B", "C", etc.
const canRetake = canRetakeQuiz(attempts, 3); // true if attempts < 3
```

---

## 🎨 ModalType Enum

```javascript
import { ModalType } from './hooks/useModalManager';

ModalType.NONE               // No modal open
ModalType.LESSON             // Lesson/slide viewer
ModalType.QUIZ               // Quiz viewer
ModalType.QUIZ_RESULTS       // Quiz results
ModalType.CONGRATULATIONS    // Module completion
```

---

## 📚 Full Examples

See `hooks/modalExamples.test.js` for complete working examples including:
- Basic modal opening
- Modal with cleanup
- Lesson to quiz transition
- Complete flow (lesson → quiz → results → congratulations)
- Modal state checking
- Component integration patterns

---

## 🐛 Common Pitfalls

### ❌ Don't: Open multiple modals directly
```javascript
modalManager.openModal(ModalType.LESSON, lessonData);
modalManager.openModal(ModalType.QUIZ, quizData); // WRONG - will close lesson
```

### ✅ Do: Use transitionModal for sequences
```javascript
modalManager.openModal(ModalType.LESSON, lessonData);
// Later...
modalManager.transitionModal(ModalType.QUIZ, quizData, 300);
```

---

### ❌ Don't: Forget to initialize quiz
```javascript
quiz.setAnswer(question.id, 0); // WRONG - quiz not initialized
```

### ✅ Do: Initialize before using
```javascript
quiz.initializeQuiz(quizData, moduleId, studentModuleId);
quiz.setAnswer(question.id, 0); // CORRECT
```

---

### ❌ Don't: Mutate state directly
```javascript
progress.stats.totalXP = 500; // WRONG - state mutation
```

### ✅ Do: Use provided setters
```javascript
progress.updateLocalProgress(moduleId, 50); // CORRECT
```

---

## 📖 Further Reading

- **Full Architecture**: `Documentation/Module_Phase2_Complete.md`
- **Hook Documentation**: See JSDoc comments in each hook file
- **Test Examples**: `hooks/modalExamples.test.js`
- **Utility Documentation**: See JSDoc comments in utility files
