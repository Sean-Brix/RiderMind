import PropTypes from 'prop-types';

/**
 * Standardized Page Header Component for Admin Panel
 * Provides consistent header styling across all admin pages
 */
export default function PageHeader({ 
  title, 
  description, 
  icon: Icon,
  action
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2.5 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
              <Icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-black text-neutral-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  action: PropTypes.node
};
