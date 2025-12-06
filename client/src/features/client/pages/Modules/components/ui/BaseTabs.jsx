import * as Tabs from '@radix-ui/react-tabs';

/**
 * BaseTabs Component
 * 
 * Reusable tabs wrapper using Radix UI Tabs with Tailwind styling
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects: [{ value: 'tab1', label: 'Tab 1', content: <Component /> }]
 * @param {string} props.defaultValue - Default active tab value
 * @param {Function} props.onValueChange - Callback when tab changes
 * @param {string} props.className - Additional classes for root
 * @param {string} props.orientation - 'horizontal' or 'vertical' (default: 'horizontal')
 */
export function BaseTabs({
  tabs = [],
  defaultValue,
  onValueChange,
  className = '',
  orientation = 'horizontal',
}) {
  const isVertical = orientation === 'vertical';

  return (
    <Tabs.Root
      defaultValue={defaultValue || tabs[0]?.value}
      onValueChange={onValueChange}
      orientation={orientation}
      className={`flex ${isVertical ? 'flex-row' : 'flex-col'} h-full ${className}`}
    >
      {/* Tab List */}
      <Tabs.List
        className={`
          flex 
          ${isVertical ? 'flex-col border-r' : 'flex-row border-b'}
          border-gray-200 dark:border-gray-800
          ${isVertical ? 'min-w-[200px]' : 'w-full'}
        `}
        aria-label="Tabs"
      >
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className={`
              px-4 py-3 text-sm font-medium
              text-gray-600 dark:text-gray-200
              hover:text-gray-900 dark:hover:text-white
              hover:bg-gray-50 dark:hover:bg-gray-800
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
              data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-300
              data-[state=active]:border-b-2 data-[state=active]:border-blue-600
              dark:data-[state=active]:border-blue-400
              ${isVertical ? 'text-left border-r-2 border-transparent data-[state=active]:border-r-2' : ''}
            `}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Tab Content */}
      {tabs.map((tab) => (
        <Tabs.Content
          key={tab.value}
          value={tab.value}
          className={`
            flex-1 overflow-hidden
            focus:outline-none focus:ring-2 focus:ring-blue-500
            data-[state=inactive]:hidden
          `}
        >
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}

export default BaseTabs;
