/**
 * FeedbackPanel Component
 * 
 * Main feedback interface using BaseModal + BaseTabs.
 * Provides My Feedback form, Community list, and Statistics.
 */

import { useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { BaseModal } from '../Modals/BaseModal';
import { BaseTabs } from '../ui/BaseTabs';
import { useFeedback } from '../../contexts/FeedbackContext';
import FeedbackForm from './FeedbackForm';
import FeedbackList from './FeedbackList';
import FeedbackStats from './FeedbackStats';

const FeedbackPanel = ({ moduleId, moduleName, isOpen, onClose }) => {
  const { loadAllFeedbackData, clearFeedback, error } = useFeedback();
  
  // Load feedback data when panel opens
  useEffect(() => {
    if (isOpen && moduleId) {
      loadAllFeedbackData(moduleId);
    }
  }, [isOpen, moduleId, loadAllFeedbackData]);
  
  // Clear feedback when panel closes
  useEffect(() => {
    if (!isOpen) {
      clearFeedback();
    }
  }, [isOpen, clearFeedback]);
  
  const handleSuccess = () => {
    // Optionally show a toast notification here
    console.log('Feedback submitted successfully!');
  };
  
  return (
    <BaseModal
      open={isOpen}
      onClose={onClose}
      size="xl"
      title="Feedback"
    >
      {/* Custom Header with Module Info */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-100">
            Feedback
          </h2>
          <p className="text-sm text-gray-400">
            {moduleName}
          </p>
        </div>
      </div>
      {/* Global error message */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400"
        >
          {error}
        </div>
      )}
      
      {/* Tabs */}
      <BaseTabs
        defaultValue="my-feedback"
        tabs={[
          {
            value: 'my-feedback',
            label: 'My Feedback',
            icon: '📝',
            content: (
              <div className="py-4">
                <FeedbackForm
                  moduleId={moduleId}
                  onSuccess={handleSuccess}
                />
              </div>
            ),
          },
          {
            value: 'community',
            label: 'Community',
            icon: '👥',
            content: (
              <div className="py-4">
                <FeedbackList moduleId={moduleId} />
              </div>
            ),
          },
          {
            value: 'stats',
            label: 'Statistics',
            icon: '📊',
            content: (
              <div className="py-4">
                <FeedbackStats />
              </div>
            ),
          },
        ]}
      />
    </BaseModal>
  );
};

export default FeedbackPanel;
