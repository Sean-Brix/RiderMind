import React, { createContext, useState, useCallback, useContext } from 'react';
import * as quizService from '../../../../services/quizService';

const QuizzesContext = createContext();

export const useQuizzes = () => {
  const context = useContext(QuizzesContext);
  if (!context) {
    throw new Error('useQuizzes must be used within a QuizzesProvider');
  }
  return context;
};

export const QuizzesProvider = ({ children }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const fetchQuizzes = useCallback(async (filters = {}) => {
    console.log('🔄 QuizzesContext: Fetching quizzes with filters:', filters);
    setLoading(true);
    setError(null);
    try {
      const data = await quizService.getAllQuizzes(filters);
      console.log('📥 QuizzesContext: Received data:', data);
      console.log('📊 QuizzesContext: Data type:', typeof data);
      console.log('📊 QuizzesContext: Is array?', Array.isArray(data));
      
      // Handle both array response and object with data property
      const quizzesArray = Array.isArray(data) ? data : (data?.data || []);
      console.log('✅ QuizzesContext: Setting quizzes count:', quizzesArray.length);
      if (quizzesArray.length > 0) {
        console.log('📝 First quiz:', quizzesArray[0]);
        console.log('📊 First quiz question count:', quizzesArray[0]._count?.questions);
      }
      
      setQuizzes(quizzesArray);
      return quizzesArray;
    } catch (err) {
      setError(err.message || 'Failed to fetch quizzes');
      console.error('Error fetching quizzes:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuizById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quizService.getQuizById(id, {
        includeQuestions: true,
        includeOptions: true
      });
      const quiz = response.data || response;
      console.log('📥 fetchQuizById response:', { response, quiz, hasQuestions: !!quiz.questions });
      setSelectedQuiz(quiz);
      return quiz;
    } catch (err) {
      setError(err.message || 'Failed to fetch quiz');
      console.error('Error fetching quiz:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createQuiz = useCallback(async (quizData) => {
    setLoading(true);
    setError(null);
    try {
      const newQuiz = await quizService.createQuiz(quizData);
      setQuizzes(prev => [newQuiz, ...prev]);
      return newQuiz;
    } catch (err) {
      setError(err.message || 'Failed to create quiz');
      console.error('Error creating quiz:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuiz = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await quizService.updateQuiz(id, updates);
      setQuizzes(prev => prev.map(q => q.id === id ? updated : q));
      if (selectedQuiz?.id === id) {
        setSelectedQuiz(updated);
      }
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update quiz');
      console.error('Error updating quiz:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedQuiz]);

  const deleteQuiz = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await quizService.deleteQuiz(id);
      setQuizzes(prev => prev.filter(q => q.id !== id));
      if (selectedQuiz?.id === id) {
        setSelectedQuiz(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete quiz');
      console.error('Error deleting quiz:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedQuiz]);

  const value = {
    quizzes,
    loading,
    error,
    selectedQuiz,
    setSelectedQuiz,
    fetchQuizzes,
    fetchQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz
  };

  return (
    <QuizzesContext.Provider value={value}>
      {children}
    </QuizzesContext.Provider>
  );
};

export const useQuizzesContext = () => {
  const context = useContext(QuizzesContext);
  if (!context) {
    throw new Error('useQuizzesContext must be used within QuizzesProvider');
  }
  return context;
};

export { QuizzesContext };
