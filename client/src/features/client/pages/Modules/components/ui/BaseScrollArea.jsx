import * as ScrollArea from '@radix-ui/react-scroll-area';

/**
 * BaseScrollArea Component
 * 
 * Reusable scroll area wrapper using Radix UI ScrollArea with custom scrollbar styling
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to scroll
 * @param {string} props.className - Additional classes for viewport
 * @param {string} props.type - 'auto', 'always', 'scroll', 'hover' (default: 'auto')
 * @param {string} props.orientation - 'vertical', 'horizontal', 'both' (default: 'vertical')
 * @param {string} props.maxHeight - Max height (e.g., '500px', '80vh')
 */
export function BaseScrollArea({
  children,
  className = '',
  type = 'auto',
  orientation = 'vertical',
  maxHeight,
}) {
  const showVertical = orientation === 'vertical' || orientation === 'both';
  const showHorizontal = orientation === 'horizontal' || orientation === 'both';

  return (
    <ScrollArea.Root
      type={type}
      className="overflow-hidden"
      style={{ maxHeight }}
    >
      <ScrollArea.Viewport className={`w-full h-full ${className}`}>
        {children}
      </ScrollArea.Viewport>

      {/* Vertical Scrollbar */}
      {showVertical && (
        <ScrollArea.Scrollbar
          orientation="vertical"
          className="
            flex select-none touch-none p-0.5 
            bg-gray-100 dark:bg-gray-800 
            transition-colors duration-150 ease-out 
            hover:bg-gray-200 dark:hover:bg-gray-700
            data-[orientation=vertical]:w-2.5
            data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5
          "
        >
          <ScrollArea.Thumb
            className="
              flex-1 bg-gray-400 dark:bg-gray-600 
              rounded-full relative
              before:content-[''] before:absolute 
              before:top-1/2 before:left-1/2 
              before:-translate-x-1/2 before:-translate-y-1/2
              before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]
              hover:bg-gray-500 dark:hover:bg-gray-500
            "
          />
        </ScrollArea.Scrollbar>
      )}

      {/* Horizontal Scrollbar */}
      {showHorizontal && (
        <ScrollArea.Scrollbar
          orientation="horizontal"
          className="
            flex select-none touch-none p-0.5 
            bg-gray-100 dark:bg-gray-800 
            transition-colors duration-150 ease-out 
            hover:bg-gray-200 dark:hover:bg-gray-700
            data-[orientation=vertical]:w-2.5
            data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5
          "
        >
          <ScrollArea.Thumb
            className="
              flex-1 bg-gray-400 dark:bg-gray-600 
              rounded-full relative
              before:content-[''] before:absolute 
              before:top-1/2 before:left-1/2 
              before:-translate-x-1/2 before:-translate-y-1/2
              before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]
              hover:bg-gray-500 dark:hover:bg-gray-500
            "
          />
        </ScrollArea.Scrollbar>
      )}

      <ScrollArea.Corner className="bg-gray-100 dark:bg-gray-800" />
    </ScrollArea.Root>
  );
}

export default BaseScrollArea;
