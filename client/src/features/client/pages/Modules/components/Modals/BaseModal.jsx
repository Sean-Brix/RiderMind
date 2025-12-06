import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react'; // Assuming lucide-react is available, or use a simple X SVG

/**
 * BaseModal Component
 * 
 * Reusable modal wrapper using Radix UI Dialog with:
 * - Smooth animations via framer-motion
 * - Backdrop click to close
 * - ESC key to close
 * - Focus trap
 * - Customizable sizes
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.title - Modal title (optional)
 * @param {string} props.description - Modal description for accessibility (optional)
 * @param {string} props.size - Modal size: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} props.showClose - Show close button (default: true)
 * @param {boolean} props.closeOnBackdrop - Close on backdrop click (default: true)
 * @param {boolean} props.closeOnEsc - Close on ESC key (default: true)
 * @param {string} props.className - Additional classes for content
 */
export function BaseModal({
  open,
  onClose,
  children,
  title,
  description,
  size = 'md',
  showClose = true,
  closeOnBackdrop = true,
  closeOnEsc = true,
  className = '',
}) {
  // Size variants
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[85vw]',
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen && onClose) {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <Dialog.Root 
      open={open} 
      onOpenChange={handleOpenChange}
      modal={true}
    >
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Backdrop */}
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleBackdropClick}
              />
            </Dialog.Overlay>

            {/* Content */}
            <Dialog.Content
              asChild
              onEscapeKeyDown={(e) => {
                if (!closeOnEsc) {
                  e.preventDefault();
                }
              }}
            >
              <motion.div
                className={`
                  fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                  z-50 w-full ${sizeClasses[size]}
                  bg-white dark:bg-gray-900 
                  rounded-lg shadow-2xl
                  max-h-[95vh] overflow-hidden
                  focus:outline-none
                  ${className}
                `}
                initial={{ opacity: 0, scale: 0.95, y: '-48%', x: '-50%' }}
                animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
                exit={{ opacity: 0, scale: 0.95, y: '-48%', x: '-50%' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {/* Accessibility: Always provide DialogTitle and DialogDescription */}
                {!title && (
                  <VisuallyHidden.Root>
                    <Dialog.Title>Modal</Dialog.Title>
                  </VisuallyHidden.Root>
                )}
                {!description && (
                  <VisuallyHidden.Root>
                    <Dialog.Description>Modal content</Dialog.Description>
                  </VisuallyHidden.Root>
                )}

                {/* Header */}
                {(title || showClose) && (
                  <div className="flex items-center justify-between px-4 py-0 border-b border-gray-200 dark:border-gray-800">
                    <div>
                      {title && (
                        <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>

                    {showClose && (
                      <Dialog.Close asChild>
                        <button
                          className="
                            p-2 rounded-lg
                            text-gray-500 hover:text-gray-700
                            dark:text-gray-400 dark:hover:text-gray-200
                            hover:bg-gray-100 dark:hover:bg-gray-800
                            transition-colors
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                          "
                          aria-label="Close modal"
                        >
                          <X size={20} />
                        </button>
                      </Dialog.Close>
                    )}
                  </div>
                )}

                {/* Body */}
                <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
                  {children}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export default BaseModal;
