import React, { createContext, useState, useCallback, useContext } from 'react';
import * as categoryService from '../../../../services/categoryService';

const CategoriesContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getAllCategories(filters);
      const categoriesArray = Array.isArray(response) ? response : (response?.data || []);
      console.log('CategoriesContext: fetchCategories response:', response);
      console.log('CategoriesContext: Extracted categories:', categoriesArray);
      setCategories(categoriesArray);
      return categoriesArray;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoryById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getCategoryById(id);
      const categoryData = response?.data || response;
      console.log('CategoriesContext: fetchCategoryById response:', response);
      console.log('CategoriesContext: Extracted category data:', categoryData);
      setSelectedCategory(categoryData);
      return categoryData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategoryModules = useCallback(async (categoryId, modules) => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.updateCategoryModules(categoryId, modules);
      // Refresh the selected category
      if (selectedCategory?.id === categoryId) {
        await fetchCategoryById(categoryId);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, fetchCategoryById]);

  const reorderCategoryModules = useCallback(async (categoryId, modulePositions) => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.reorderCategoryModules(categoryId, modulePositions);
      // Refresh the selected category
      if (selectedCategory?.id === categoryId) {
        await fetchCategoryById(categoryId);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, fetchCategoryById]);

  const addModuleToCategory = useCallback(async (categoryId, moduleId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.addModuleToCategory(categoryId, moduleId);
      // Refresh the selected category
      if (selectedCategory?.id === categoryId) {
        await fetchCategoryById(categoryId);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, fetchCategoryById]);

  const removeModuleFromCategory = useCallback(async (categoryId, moduleId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.removeModuleFromCategory(categoryId, moduleId);
      // Refresh the selected category
      if (selectedCategory?.id === categoryId) {
        await fetchCategoryById(categoryId);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, fetchCategoryById]);

  const value = {
    categories,
    loading,
    error,
    selectedCategory,
    fetchCategories,
    fetchCategoryById,
    updateCategoryModules,
    reorderCategoryModules,
    addModuleToCategory,
    removeModuleFromCategory,
    setSelectedCategory,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategoriesContext = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategoriesContext must be used within CategoriesProvider');
  }
  return context;
};

export { CategoriesContext };
