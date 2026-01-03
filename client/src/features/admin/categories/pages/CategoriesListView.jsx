import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Car, ChevronRight, GripVertical } from 'lucide-react';
import { useCategories, useToast } from '../../shared';
import { LoadingSpinner } from '../../shared';

export default function CategoriesListView() {
  const navigate = useNavigate();
  const { categories, loading, error, fetchCategories } = useCategories();
  const { showToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleManageCategory = (categoryId) => {
    navigate(`/admin/categories/${categoryId}/edit`);
  };

  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType) {
      case 'MOTORCYCLE':
        return <Bike className="w-12 h-12" />;
      case 'CAR':
        return <Car className="w-12 h-12" />;
      default:
        return <GripVertical className="w-12 h-12" />;
    }
  };

  const getVehicleLabel = (vehicleType) => {
    switch (vehicleType) {
      case 'MOTORCYCLE':
        return 'Motorcycle';
      case 'CAR':
        return 'Car';
      case 'TRUCK':
        return 'Truck';
      case 'BUS':
        return 'Bus';
      default:
        return vehicleType;
    }
  };

  if (loading && !categories.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleManageCategory(category.id)}
                className="group bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:bg-gray-900 rounded-lg shadow-sm border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all p-6 text-left backdrop-blur-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-blue-600 dark:text-blue-400">
                    {getVehicleIcon(category.vehicleType)}
                  </div>
                  <div className="flex items-center text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <span className="text-sm mr-1">Manage</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {category.name}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {category.description || 'No description'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {category.moduleCount || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Modules
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    category.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Type:</span> {getVehicleLabel(category.vehicleType)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

