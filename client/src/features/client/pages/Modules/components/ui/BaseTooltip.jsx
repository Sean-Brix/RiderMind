import * as Tooltip from '@radix-ui/react-tooltip';

/**
 * BaseTooltip Component
 * 
 * Reusable tooltip wrapper using Radix UI Tooltip
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Trigger element
 * @param {string|React.ReactNode} props.content - Tooltip content
 * @param {string} props.side - 'top', 'right', 'bottom', 'left' (default: 'top')
 * @param {number} props.delayDuration - Delay before showing (ms, default: 200)
 * @param {boolean} props.arrow - Show arrow (default: true)
 */
export function BaseTooltip({
  children,
  content,
  side = 'top',
  delayDuration = 200,
  arrow = true,
}) {
  return (
    <Tooltip.Provider delayDuration={delayDuration}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {children}
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            className="
              z-50 px-3 py-2 
              text-sm text-white
              bg-gray-900 dark:bg-gray-700
              rounded-lg shadow-lg
              max-w-xs
              animate-in fade-in-0 zoom-in-95
              data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
              data-[side=top]:slide-in-from-bottom-2
              data-[side=bottom]:slide-in-from-top-2
              data-[side=left]:slide-in-from-right-2
              data-[side=right]:slide-in-from-left-2
            "
            sideOffset={5}
          >
            {content}
            {arrow && (
              <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
            )}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export default BaseTooltip;
