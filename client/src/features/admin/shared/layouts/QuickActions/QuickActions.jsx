import React from 'react';

const QuickActions = ({ actions = [] }) => {
  if (actions.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          disabled={action.disabled}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            flex items-center gap-2
            ${
              action.variant === 'primary'
                ? 'bg-brand-600 hover:bg-brand-700 text-white'
                : action.variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : action.variant === 'outline'
                ? 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title={action.tooltip}
        >
          {action.icon && <span>{action.icon}</span>}
          <span>{action.label}</span>
          {action.shortcut && (
            <span className="text-xs opacity-70">({action.shortcut})</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
