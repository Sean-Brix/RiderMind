import React, { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useDebounce } from '../../hooks';

const SearchBar = ({
  placeholder = 'Search...',
  filters = [],
  onSearch,
  onFilterChange,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    if (onSearch) {
      onSearch(debouncedQuery, selectedFilters);
    }
  }, [debouncedQuery, selectedFilters, onSearch]);

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...selectedFilters, [filterKey]: value };
    setSelectedFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSelectedFilters({});
    if (onSearch) {
      onSearch('', {});
    }
  };

  const hasActiveFilters = Object.values(selectedFilters).some(v => v && v !== 'all');

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-brand-50 border-brand-500 text-brand-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-brand-600 rounded-full" />
            )}
          </button>
        )}
      </div>

      {showFilters && filters.length > 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Filters</h4>
            {hasActiveFilters && (
              <button
                onClick={handleClear}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                {filter.type === 'select' ? (
                  <select
                    value={selectedFilters[filter.key] || 'all'}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={filter.type || 'text'}
                    value={selectedFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
