import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Module Management Tool
 * Generate sample modules or clear all existing modules
 */
function ModuleManagementTool() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleGenerateModules = async () => {
    if (!confirm('Generate 10 sample modules with images and videos? This will upload media to Firebase Storage.')) {
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dev/generate-modules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Successfully generated ${data.data.count} modules with slides and media`);
        setError('');
      } else {
        setError(data.error || 'Failed to generate modules');
        setMessage('');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleClearModules = async () => {
    if (!confirm('Are you sure you want to delete ALL modules? This will delete all slides, objectives, and related data. This cannot be undone!')) {
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dev/clear-modules', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Successfully cleared all modules');
        setError('');
      } else {
        setError(data.error || 'Failed to clear modules');
        setMessage('');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Module Management
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Generate sample modules or clear all existing modules from the database.
          </p>
        </div>
        <div className="text-4xl">🏍️</div>
      </div>

      {/* Messages */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6"
        >
          <p className="text-green-800 dark:text-green-200">{message}</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
        >
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </motion.div>
      )}

      <div className="space-y-4">
        {/* Generate Modules */}
        <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4">
          <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
            Generate Sample Modules
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Creates 10 training modules with slides, images, and videos using Firebase Storage.
          </p>
          <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            <li>✓ 10 diverse motorcycle training modules</li>
            <li>✓ 4 slides per module (intro, lesson, practice, summary)</li>
            <li>✓ Images and videos from sample media</li>
            <li>✓ Uploaded to Firebase Storage</li>
          </ul>
          <button
            onClick={handleGenerateModules}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all ${
              loading
                ? 'bg-neutral-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating (this may take a minute)...
              </span>
            ) : (
              '✨ Generate 10 Sample Modules'
            )}
          </button>
        </div>

        {/* Clear Modules */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">
            Clear All Modules
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            Permanently deletes all modules, slides, objectives, and student progress. Cannot be undone!
          </p>
          <button
            onClick={handleClearModules}
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all ${
              loading
                ? 'bg-neutral-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:scale-95'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Clearing...
              </span>
            ) : (
              '🗑️ Clear All Modules'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModuleManagementTool;
