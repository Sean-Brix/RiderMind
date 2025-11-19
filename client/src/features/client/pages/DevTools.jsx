import { motion } from 'framer-motion';
import {
  StudentModulesTool,
  ModuleManagementTool,
  QuizManagementTool,
  FirebaseStorageTool
} from './DevTools/tools';

/**
 * DevTools Container Page
 * Central hub for all development and testing tools
 * 
 * To add a new tool:
 * 1. Create a new component in DevTools/tools/YourToolName.jsx
 * 2. Export it from DevTools/tools/index.js
 * 3. Import and add it to the tools array below
 */
function DevTools() {
  // Define all available tools here for easy management
  const tools = [
    {
      id: 'student-modules',
      component: StudentModulesTool,
      delay: 0.1,
      category: 'Data Management'
    },
    {
      id: 'module-management',
      component: ModuleManagementTool,
      delay: 0.2,
      category: 'Data Management'
    },
    {
      id: 'quiz-management',
      component: QuizManagementTool,
      delay: 0.25,
      category: 'Data Management'
    },
    {
      id: 'firebase-storage',
      component: FirebaseStorageTool,
      delay: 0.3,
      category: 'Testing & Debugging'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
              🛠️ Developer Tools
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Dangerous operations for development and testing
            </p>
          </div>

          {/* Warning Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="text-red-600 dark:text-red-400 text-3xl">⚠️</div>
              <div>
                <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">
                  Warning: Development Only
                </h3>
                <p className="text-red-700 dark:text-red-300">
                  These tools are for development and testing purposes only. 
                  Actions performed here cannot be undone and may result in data loss.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tools Grid - Dynamically render all registered tools */}
          <div className="grid gap-6">
            {tools.map((tool) => {
              const ToolComponent = tool.component;
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: tool.delay }}
                >
                  <ToolComponent />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default DevTools;
