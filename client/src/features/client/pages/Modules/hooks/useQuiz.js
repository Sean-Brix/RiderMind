import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

/**
 * useQuiz Hook
 * 
 * Manages quiz state, submission, and result processing.
 * Handles API integration with quiz endpoints.
 * 
 * Features:
 * - Quiz attempt tracking
 * - Answer selection and validation
 * - Score calculation
 * - Result processing
 * - API integration for submissions
 * - Error handling
 * 
 * @param {Object} options - Hook configuration
 * @returns {Object} Quiz manager interface
 */
export function useQuiz(options = {}) {
  const {
    onQuizComplete,
    onError,
    autoSubmit = false,
  } = options;

  // Quiz state
  const [quizState, setQuizState] = useState({
    isLoading: false,
    isSubmitting: false,
    currentQuiz: null,
    answers: {},
    score: null,
    passed: null,
    feedback: [],
    attempt: 0,
  });

  // Track submission to prevent duplicates
  const submissionInProgress = useRef(false);

  /**
   * Initialize quiz
   */
  const initializeQuiz = useCallback((quiz, moduleId, studentModuleId) => {
    setQuizState(prev => ({
      ...prev,
      currentQuiz: quiz,
      moduleId,
      studentModuleId,
      answers: {},
      score: null,
      passed: null,
      feedback: [],
      isLoading: false,
    }));
    
    submissionInProgress.current = false;
  }, []);

  /**
   * Update answer for a question
   */
  const setAnswer = useCallback((questionId, answer) => {
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer,
      },
    }));
  }, []);

  /**
   * Clear answer for a question
   */
  const clearAnswer = useCallback((questionId) => {
    setQuizState(prev => {
      const newAnswers = { ...prev.answers };
      delete newAnswers[questionId];
      return {
        ...prev,
        answers: newAnswers,
      };
    });
  }, []);

  /**
   * Clear all answers
   */
  const clearAllAnswers = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      answers: {},
    }));
  }, []);

  /**
   * Check if all questions are answered
   */
  const isQuizComplete = useCallback(() => {
    if (!quizState.currentQuiz || !quizState.currentQuiz.questions) {
      return false;
    }
    
    const questionIds = quizState.currentQuiz.questions.map(q => q.id);
    return questionIds.every(id => quizState.answers[id] !== undefined);
  }, [quizState.currentQuiz, quizState.answers]);

  /**
   * Calculate score locally (for immediate feedback)
   */
  const calculateScore = useCallback(() => {
    if (!quizState.currentQuiz || !quizState.currentQuiz.questions) {
      return { score: 0, totalQuestions: 0, correctCount: 0 };
    }

    const questions = quizState.currentQuiz.questions;
    let correctCount = 0;

    questions.forEach(question => {
      const userAnswer = quizState.answers[question.id];
      // Find the correct answer from options
      const correctOption = question.options?.find(opt => opt.isCorrect);
      const correctAnswer = correctOption?.id;

      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);

    return {
      score,
      totalQuestions: questions.length,
      correctCount,
    };
  }, [quizState.currentQuiz, quizState.answers]);

  /**
   * Generate detailed feedback for each question
   */
  const generateFeedback = useCallback(() => {
    if (!quizState.currentQuiz || !quizState.currentQuiz.questions) {
      return [];
    }

    return quizState.currentQuiz.questions.map(question => {
      const userAnswer = quizState.answers[question.id];
      // Find the correct answer from options
      const correctOption = question.options?.find(opt => opt.isCorrect);
      const correctAnswer = correctOption?.id;
      const isCorrect = userAnswer === correctAnswer;

      return {
        questionId: question.id,
        question: question.question,
        questionText: question.question, // Alias for compatibility
        userAnswer,
        correctAnswer,
        isCorrect,
        explanation: question.explanation || null,
        options: question.options || null,
      };
    });
  }, [quizState.currentQuiz, quizState.answers]);

  /**
   * Submit quiz to backend API
   */
  const submitQuiz = useCallback(async () => {
    // Prevent duplicate submissions
    if (submissionInProgress.current) {
      console.warn('Quiz submission already in progress');
      return null;
    }

    // Validate quiz is complete
    if (!isQuizComplete()) {
      const error = new Error('Please answer all questions before submitting');
      onError?.(error);
      return null;
    }

    // Validate required data
    if (!quizState.currentQuiz || !quizState.studentModuleId) {
      const error = new Error('Quiz data is incomplete');
      onError?.(error);
      return null;
    }

    submissionInProgress.current = true;
    setQuizState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Calculate score
      const { score, correctCount, totalQuestions } = calculateScore();
      
      // Generate feedback
      const feedback = generateFeedback();

      // Convert answers object to array format expected by server
      const answersArray = Object.entries(quizState.answers).map(([questionId, answer]) => {
        const question = quizState.currentQuiz.questions.find(q => q.id === parseInt(questionId));
        
        if (question?.type === 'IDENTIFICATION' || question?.type === 'FILL_BLANK') {
          // For text-based questions, send answerText
          return {
            questionId: parseInt(questionId),
            answerText: answer
          };
        } else {
          // For multiple choice/true-false, send selectedOptionId
          return {
            questionId: parseInt(questionId),
            selectedOptionId: answer
          };
        }
      });

      // Prepare submission data
      const submissionData = {
        answers: answersArray,
        timeSpent: 0 // Could track this in the future
      };

      // Submit to API
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/quizzes/${quizState.currentQuiz.id}/submit`,
        submissionData,
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract result data from response
      const result = {
        score: response.data.score,
        passed: response.data.passed,
        feedback: response.data.feedback,
        correctCount: response.data.correctCount,
        totalQuestions: response.data.totalQuestions,
        attempt: response.data.attempt,
        completedModule: response.data.completedModule,
      };

      // Update state with results
      setQuizState(prev => ({
        ...prev,
        score: result.score,
        passed: result.passed,
        feedback: result.feedback,
        attempt: result.attempt,
        isSubmitting: false,
      }));

      submissionInProgress.current = false;

      // Trigger completion callback
      onQuizComplete?.(result);

      return result;

    } catch (error) {
      console.error('Quiz submission failed:', error);
      
      setQuizState(prev => ({
        ...prev,
        isSubmitting: false,
      }));
      
      submissionInProgress.current = false;
      
      onError?.(error);
      
      return null;
    }
  }, [
    quizState.currentQuiz,
    quizState.studentModuleId,
    quizState.answers,
    quizState.attempt,
    isQuizComplete,
    calculateScore,
    generateFeedback,
    onQuizComplete,
    onError,
  ]);

  /**
   * Record quiz attempt (for analytics)
   */
  const recordAttempt = useCallback(async (quizId, moduleId) => {
    try {
      await axios.post(
        `/api/quizzes/${quizId}/record-attempt`,
        { moduleId },
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Failed to record quiz attempt:', error);
      // Non-critical, don't throw
    }
  }, []);

  /**
   * Reset quiz state
   */
  const resetQuiz = useCallback(() => {
    setQuizState({
      isLoading: false,
      isSubmitting: false,
      currentQuiz: null,
      answers: {},
      score: null,
      passed: null,
      feedback: [],
      attempt: 0,
    });
    
    submissionInProgress.current = false;
  }, []);

  /**
   * Get quiz progress (how many questions answered)
   */
  const getProgress = useCallback(() => {
    if (!quizState.currentQuiz || !quizState.currentQuiz.questions) {
      return { answered: 0, total: 0, percentage: 0 };
    }

    const total = quizState.currentQuiz.questions.length;
    const answered = Object.keys(quizState.answers).length;
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;

    return { answered, total, percentage };
  }, [quizState.currentQuiz, quizState.answers]);

  /**
   * Check if quiz can be submitted
   */
  const canSubmit = useCallback(() => {
    return (
      !quizState.isSubmitting &&
      !submissionInProgress.current &&
      isQuizComplete()
    );
  }, [quizState.isSubmitting, isQuizComplete]);

  /**
   * Get answer for a specific question
   */
  const getAnswer = useCallback((questionId) => {
    return quizState.answers[questionId];
  }, [quizState.answers]);

  /**
   * Check if a question has been answered
   */
  const isQuestionAnswered = useCallback((questionId) => {
    return quizState.answers[questionId] !== undefined;
  }, [quizState.answers]);

  return {
    // State
    ...quizState,
    
    // Quiz Management
    initializeQuiz,
    resetQuiz,
    
    // Answer Management
    setAnswer,
    clearAnswer,
    clearAllAnswers,
    getAnswer,
    
    // Status Checks
    isQuizComplete: isQuizComplete(),
    canSubmit: canSubmit(),
    isQuestionAnswered,
    
    // Progress
    progress: getProgress(),
    
    // Submission
    submitQuiz,
    recordAttempt,
    
    // Results
    calculateScore,
    generateFeedback,
  };
}

export default useQuiz;
