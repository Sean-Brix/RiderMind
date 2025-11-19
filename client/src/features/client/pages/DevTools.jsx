import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import {
  StudentModulesTool,
  ModuleManagementTool,
  QuizManagementTool,
  FirebaseStorageTool,
  QuizSimulator,
  CompleteCategorySimulator,
  AlmostCompleteSimulator
} from './DevTools/tools';

/**
 * DevTools Container Page
 * Central hub for all development and testing tools with tabbed interface
 * 
 * To add a new tool:
 * 1. Create a new component in DevTools/tools/YourToolName.jsx
 * 2. Export it from DevTools/tools/index.js
 * 3. Add it to the appropriate category in the tabs configuration below
 */
function DevTools() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('devtools-active-tab') || 'sample-data';
  });
  const [activeTool, setActiveTool] = useState(() => {
    return localStorage.getItem('devtools-active-tool') || 'module-management';
  });

  // Save to localStorage whenever tab or tool changes
  useEffect(() => {
    localStorage.setItem('devtools-active-tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('devtools-active-tool', activeTool);
  }, [activeTool]);

  // Define tabs and their tools
  const tabs = [
    {
      id: 'sample-data',
      label: 'Sample Data',
      icon: '📦',
      tools: [
        {
          id: 'module-management',
          label: 'Module Management',
          icon: '🏍️',
          component: ModuleManagementTool,
          description: 'Generate and clear sample modules'
        },
        {
          id: 'quiz-management',
          label: 'Quiz Management',
          icon: '📝',
          component: QuizManagementTool,
          description: 'Generate and clear sample quizzes'
        },
        {
          id: 'student-modules',
          label: 'Student Modules',
          icon: '👥',
          component: StudentModulesTool,
          description: 'Clear student progress data'
        }
      ]
    },
    {
      id: 'reset',
      label: 'Reset',
      icon: '🔄',
      tools: [
        {
          id: 'student-modules-reset',
          label: 'Student Progress',
          icon: '📊',
          component: StudentModulesTool,
          description: 'Reset all student module progress'
        }
      ]
    },
    {
      id: 'testing',
      label: 'Testing',
      icon: '🧪',
      tools: [
        {
          id: 'firebase-storage',
          label: 'Firebase Storage',
          icon: '☁️',
          component: FirebaseStorageTool,
          description: 'Test Firebase storage operations'
        }
      ]
    },
    {
      id: 'simulate',
      label: 'Simulate',
      icon: '🎮',
      tools: [
        {
          id: 'quiz-simulator',
          label: 'Quiz Bypass',
          icon: '📝',
          component: QuizSimulator,
          description: 'Auto-complete current ongoing module quiz'
        }
      ]
    },
    {
      id: 'complete',
      label: 'Complete',
      icon: '✅',
      tools: [
        {
          id: 'complete-category',
          label: 'Complete Category',
          icon: '🏁',
          component: CompleteCategorySimulator,
          description: 'Automatically complete all modules in current category'
        },
        {
          id: 'almost-complete',
          label: 'Almost Complete',
          icon: '⏱️',
          component: AlmostCompleteSimulator,
          description: 'Complete all modules except the last one'
        }
      ]
    }
  ];

  // Get current active tab data
  const currentTab = tabs.find(tab => tab.id === activeTab);
  const currentTool = currentTab?.tools.find(tool => tool.id === activeTool);
  const ToolComponent = currentTool?.component;

  // Auto-select first tool when switching tabs
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const newTab = tabs.find(tab => tab.id === tabId);
    if (newTab?.tools.length > 0) {
      setActiveTool(newTab.tools[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <Navbar />
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                🛠️ Developer Tools
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Development and testing utilities
              </p>
            </div>
            
            {/* Warning Badge */}
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2">
              <span className="text-red-600 dark:text-red-400 text-lg">⚠️</span>
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                Development Only
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-primary-600 shadow-lg shadow-primary-500/30'
                    : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className={activeTab === tab.id ? 'text-white' : 'text-neutral-700 dark:text-neutral-200'}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-80 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto"
          >
            <div className="p-4">
              <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
                Available Tools
              </h2>
              <div className="space-y-2">
                {currentTab?.tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`
                      w-full text-left p-4 rounded-lg transition-all
                      ${activeTool === tool.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500 shadow-sm'
                        : 'bg-neutral-50 dark:bg-neutral-700/50 border-2 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{tool.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className={`
                          font-semibold mb-1
                          ${activeTool === tool.id
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-neutral-900 dark:text-white'
                          }
                        `}>
                          {tool.label}
                        </h3>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Section */}
          <div className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-900">
            <div className="p-6">
              <AnimatePresence mode="wait">
                {ToolComponent && (
                  <motion.div
                    key={activeTool}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Tool Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">{currentTool.icon}</span>
                        <div>
                          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {currentTool.label}
                          </h2>
                          <p className="text-neutral-600 dark:text-neutral-400">
                            {currentTool.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tool Component */}
                    <ToolComponent />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DevTools;
