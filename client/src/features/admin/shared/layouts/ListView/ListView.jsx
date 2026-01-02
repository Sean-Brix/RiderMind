import React from 'react';
import { Grid, List } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

const ListView = ({
  title,
  viewMode = 'grid',
  onViewModeChange,
  actions,
  searchBar,
  filters,
  children,
  loading = false,
  emptyState
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Search Bar */}
      {searchBar && <div>{searchBar}</div>}

      {/* Filters */}
      {filters && <div>{filters}</div>}

      {/* View Mode Toggle */}
      {onViewModeChange && (
        <div className="flex justify-end">
          <div className="inline-flex rounded-lg border border-gray-300 p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSpinner size="large" />
      ) : React.Children.count(children) > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {children}
        </div>
      ) : (
        emptyState || (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found</p>
          </div>
        )
      )}
    </div>
  );
};

export default ListView;
