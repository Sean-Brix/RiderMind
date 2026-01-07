import { motion } from 'framer-motion';
import { BaseModal } from './BaseModal';
import { AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

/**
 * EnrollmentErrorModal - Custom error modal for course enrollment failures
 * 
 * Features:
 * - Graceful error display with custom design
 * - Different error types (no modules, server error, etc.)
 * - Action buttons (retry, go back)
 */
export function EnrollmentErrorModal({ 
  isOpen, 
  onClose, 
  errorType = 'no_modules',
  categoryName = 'this category',
  onRetry 
}) {
  const errorConfig = {
    no_modules: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      bgColor: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
      title: 'No Modules Available',
      message: `We're sorry, but there are currently no learning modules assigned to ${categoryName}. Please check back later or contact your administrator.`,
      suggestions: [
        'Try selecting a different vehicle type',
        'Contact your administrator to request modules',
        'Check back later for new content'
      ]
    },
    server_error: {
      icon: XCircle,
      iconColor: 'text-red-500',
      bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
      title: 'Enrollment Failed',
      message: 'We encountered an error while trying to enroll you. Please try again or contact support if the problem persists.',
      suggestions: [
        'Check your internet connection',
        'Try again in a few moments',
        'Contact support if the issue continues'
      ]
    }
  };

  const config = errorConfig[errorType] || errorConfig.server_error;
  const Icon = config.icon;

  return (
    <BaseModal open={isOpen} onClose={onClose} size="md" showClose={false}>
      <div className={`bg-gradient-to-br ${config.bgColor} rounded-2xl p-8`}>
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`absolute inset-0 ${config.iconColor} opacity-20 blur-xl`}
            />
            <Icon className={`relative w-20 h-20 ${config.iconColor}`} />
          </div>
        </motion.div>

        {/* Title */}
        <h2 className="text-3xl font-black text-neutral-800 dark:text-white text-center mb-4">
          {config.title}
        </h2>

        {/* Message */}
        <p className="text-neutral-600 dark:text-neutral-300 text-center mb-6 leading-relaxed">
          {config.message}
        </p>

        {/* Suggestions */}
        <div className="bg-white/50 dark:bg-neutral-800/50 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
            <span className="text-lg">💡</span>
            What you can do:
          </h3>
          <ul className="space-y-2">
            {config.suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
              >
                <span className="text-brand-500 mt-0.5">•</span>
                <span>{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onClose();
                onRetry();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className={`${onRetry ? 'flex-1' : 'w-full'} px-6 py-3 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 text-neutral-700 dark:text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all`}
          >
            {onRetry ? 'Go Back' : 'Close'}
          </motion.button>
        </div>
      </div>
    </BaseModal>
  );
}

export default EnrollmentErrorModal;
