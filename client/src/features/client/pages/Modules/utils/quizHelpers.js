/**
 * Quiz Utilities
 * Helper functions for quiz validation, scoring, and formatting
 */

/**
 * Validate quiz data structure
 */
export function validateQuizData(quiz) {
  const errors = [];

  if (!quiz) {
    errors.push('Quiz data is null or undefined');
    return { valid: false, errors };
  }

  if (!quiz.id) {
    errors.push('Quiz ID is missing');
  }

  if (!quiz.questions || !Array.isArray(quiz.questions)) {
    errors.push('Quiz questions array is missing or invalid');
  } else if (quiz.questions.length === 0) {
    errors.push('Quiz has no questions');
  } else {
    // Validate each question
    quiz.questions.forEach((question, index) => {
      if (!question.id) {
        errors.push(`Question ${index + 1} is missing an ID`);
      }
      if (!question.questionText) {
        errors.push(`Question ${index + 1} is missing question text`);
      }
      if (!question.options || !Array.isArray(question.options)) {
        errors.push(`Question ${index + 1} is missing options array`);
      }
      if (question.correctAnswer === undefined || question.correctAnswer === null) {
        errors.push(`Question ${index + 1} is missing correct answer`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate quiz answers
 */
export function validateAnswers(answers, quiz) {
  if (!quiz || !quiz.questions) {
    return { valid: false, message: 'Invalid quiz data' };
  }

  const questionIds = quiz.questions.map(q => q.id);
  const answeredIds = Object.keys(answers);

  // Check if all questions are answered
  const unanswered = questionIds.filter(id => !answeredIds.includes(String(id)));

  if (unanswered.length > 0) {
    return {
      valid: false,
      message: `${unanswered.length} question(s) unanswered`,
      unansweredIds: unanswered,
    };
  }

  return { valid: true };
}

/**
 * Calculate quiz score
 */
export function calculateQuizScore(answers, quiz) {
  if (!quiz || !quiz.questions) {
    return { score: 0, correctCount: 0, totalQuestions: 0 };
  }

  let correctCount = 0;
  const totalQuestions = quiz.questions.length;

  quiz.questions.forEach(question => {
    const userAnswer = answers[question.id];
    const correctAnswer = question.correctAnswer;

    if (userAnswer !== undefined && userAnswer === correctAnswer) {
      correctCount++;
    }
  });

  const score = totalQuestions > 0 
    ? Math.round((correctCount / totalQuestions) * 100) 
    : 0;

  return {
    score,
    correctCount,
    totalQuestions,
    percentage: score,
  };
}

/**
 * Check if quiz is passed
 */
export function isQuizPassed(score, passingScore = 70) {
  return score >= passingScore;
}

/**
 * Generate quiz feedback
 */
export function generateQuizFeedback(answers, quiz) {
  if (!quiz || !quiz.questions) {
    return [];
  }

  return quiz.questions.map(question => {
    const userAnswer = answers[question.id];
    const correctAnswer = question.correctAnswer;
    const isCorrect = userAnswer !== undefined && userAnswer === correctAnswer;

    return {
      questionId: question.id,
      questionText: question.questionText,
      userAnswer,
      correctAnswer,
      isCorrect,
      explanation: question.explanation || null,
      options: question.options || [],
      userAnswerText: question.options?.[userAnswer] || 'Not answered',
      correctAnswerText: question.options?.[correctAnswer] || 'Unknown',
    };
  });
}

/**
 * Get quiz statistics
 */
export function getQuizStatistics(feedback) {
  const total = feedback.length;
  const correct = feedback.filter(f => f.isCorrect).length;
  const incorrect = total - correct;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    total,
    correct,
    incorrect,
    percentage,
  };
}

/**
 * Format quiz time
 */
export function formatQuizTime(seconds) {
  if (seconds < 60) {
    return `${seconds} sec`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get quiz grade letter
 */
export function getQuizGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Get quiz performance level
 */
export function getPerformanceLevel(score) {
  if (score >= 90) {
    return {
      level: 'Excellent',
      color: 'green',
      emoji: '🌟',
      message: 'Outstanding performance!',
    };
  }
  if (score >= 80) {
    return {
      level: 'Great',
      color: 'blue',
      emoji: '👍',
      message: 'Great job!',
    };
  }
  if (score >= 70) {
    return {
      level: 'Good',
      color: 'yellow',
      emoji: '✓',
      message: 'You passed!',
    };
  }
  if (score >= 60) {
    return {
      level: 'Fair',
      color: 'orange',
      emoji: '⚠',
      message: 'Almost there, try again!',
    };
  }
  return {
    level: 'Needs Improvement',
    color: 'red',
    emoji: '✗',
    message: 'Review the material and try again.',
  };
}

/**
 * Sort questions by difficulty
 */
export function sortQuestionsByDifficulty(questions) {
  const difficultyOrder = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  return [...questions].sort((a, b) => {
    const aDiff = difficultyOrder[a.difficulty?.toLowerCase()] || 2;
    const bDiff = difficultyOrder[b.difficulty?.toLowerCase()] || 2;
    return aDiff - bDiff;
  });
}

/**
 * Shuffle quiz questions
 */
export function shuffleQuestions(questions) {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Shuffle answer options
 */
export function shuffleOptions(options) {
  if (!Array.isArray(options)) return options;
  
  const indexed = options.map((option, index) => ({ option, index }));
  
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  
  return {
    shuffledOptions: indexed.map(item => item.option),
    indexMap: indexed.map(item => item.index),
  };
}

/**
 * Get incorrect questions for review
 */
export function getIncorrectQuestions(feedback) {
  return feedback.filter(f => !f.isCorrect);
}

/**
 * Calculate time per question
 */
export function calculateTimePerQuestion(totalTime, questionCount) {
  if (questionCount === 0) return 0;
  return Math.round(totalTime / questionCount);
}

/**
 * Check if quiz can be retaken
 */
export function canRetakeQuiz(attempts, maxAttempts = 3) {
  if (maxAttempts === -1) return true; // Unlimited attempts
  return attempts < maxAttempts;
}

/**
 * Get remaining attempts
 */
export function getRemainingAttempts(attempts, maxAttempts = 3) {
  if (maxAttempts === -1) return 'Unlimited';
  const remaining = maxAttempts - attempts;
  return Math.max(0, remaining);
}

/**
 * Format quiz result summary
 */
export function formatQuizResultSummary(result) {
  const { score, correctCount, totalQuestions, passed, attempt } = result;
  const performance = getPerformanceLevel(score);
  const grade = getQuizGrade(score);

  return {
    score,
    grade,
    correctCount,
    totalQuestions,
    passed,
    attempt,
    performance,
    summary: `You scored ${score}% (${correctCount}/${totalQuestions} correct)`,
  };
}

/**
 * Prepare quiz submission data
 */
export function prepareSubmissionData(quiz, answers, studentModuleId) {
  const { score, correctCount, totalQuestions } = calculateQuizScore(answers, quiz);
  const feedback = generateQuizFeedback(answers, quiz);

  return {
    quizId: quiz.id,
    studentModuleId,
    answers,
    score,
    correctCount,
    totalQuestions,
    feedback,
    submittedAt: new Date().toISOString(),
  };
}

export default {
  validateQuizData,
  validateAnswers,
  calculateQuizScore,
  isQuizPassed,
  generateQuizFeedback,
  getQuizStatistics,
  formatQuizTime,
  getQuizGrade,
  getPerformanceLevel,
  sortQuestionsByDifficulty,
  shuffleQuestions,
  shuffleOptions,
  getIncorrectQuestions,
  calculateTimePerQuestion,
  canRetakeQuiz,
  getRemainingAttempts,
  formatQuizResultSummary,
  prepareSubmissionData,
};
