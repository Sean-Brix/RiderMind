import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Student Modules Tool
 * Clears all student module progress and enrollment data
 */
function StudentModulesTool() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleDeleteStudentModules = async () => {
    if (!confirm('Are you sure you want to delete ALL student modules? This cannot be undone!')) {
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dev/clear-student-modules', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Successfully deleted ${data.deletedCount} student modules`);
        setError('');
      } else {
        setError(data.error || 'Failed to delete student modules');
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
            Clear Student Modules
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Delete all student module progress and enrollment data. This will reset all user progress.
          </p>
        </div>
        <div className="text-4xl">🗑️</div>
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

      <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
          This will delete:
        </h3>
        <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>✓ All student module enrollments</li>
          <li>✓ All module progress tracking</li>
          <li>✓ All quiz scores and attempts</li>
          <li>✓ Current slide positions</li>
        </ul>
      </div>

      <button
        onClick={handleDeleteStudentModules}
        disabled={loading}
        className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all ${
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
            Deleting...
          </span>
        ) : (
          '🗑️ Delete All Student Modules'
        )}
      </button>
    </div>
  );
}

export default StudentModulesTool;
