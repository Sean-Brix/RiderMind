import React, { createContext, useState, useCallback, useContext } from 'react';
import * as moduleService from '../../../../services/moduleService';

const ModulesContext = createContext();

export const useModules = () => {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModules must be used within a ModulesProvider');
  }
  return context;
};

export const ModulesProvider = ({ children }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  const fetchModules = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await moduleService.getAllModules(filters);
      console.log('ModulesContext: Received data:', data);
      console.log('ModulesContext: Data type:', typeof data);
      console.log('ModulesContext: Is array?', Array.isArray(data));
      
      // Handle both array response and object with data property
      const modulesArray = Array.isArray(data) ? data : (data?.data || []);
      console.log('ModulesContext: Setting modules:', modulesArray);
      
      setModules(modulesArray);
      return modulesArray;
    } catch (err) {
      setError(err.message || 'Failed to fetch modules');
      console.error('Error fetching modules:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModuleById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await moduleService.getModuleById(id, {
        includeObjectives: true,
        includeSlides: true
      });
      setSelectedModule(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch module');
      console.error('Error fetching module:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createModule = useCallback(async (moduleData) => {
    setLoading(true);
    setError(null);
    try {
      const newModule = await moduleService.createModule(moduleData);
      setModules(prev => [newModule, ...prev]);
      return newModule;
    } catch (err) {
      setError(err.message || 'Failed to create module');
      console.error('Error creating module:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateModule = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await moduleService.updateModule(id, updates);
      setModules(prev => prev.map(m => m.id === id ? updated : m));
      if (selectedModule?.id === id) {
        setSelectedModule(updated);
      }
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update module');
      console.error('Error updating module:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedModule]);

  const deleteModule = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await moduleService.deleteModule(id);
      setModules(prev => prev.filter(m => m.id !== id));
      if (selectedModule?.id === id) {
        setSelectedModule(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete module');
      console.error('Error deleting module:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedModule]);

  const value = {
    modules,
    loading,
    error,
    selectedModule,
    setSelectedModule,
    fetchModules,
    fetchModuleById,
    createModule,
    updateModule,
    deleteModule
  };

  return (
    <ModulesContext.Provider value={value}>
      {children}
    </ModulesContext.Provider>
  );
};

export const useModulesContext = () => {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModulesContext must be used within ModulesProvider');
  }
  return context;
};

export { ModulesContext };
