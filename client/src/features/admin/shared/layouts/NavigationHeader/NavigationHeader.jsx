import React from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NavigationHeader = ({
  breadcrumbs = [],
  title,
  subtitle,
  backButton = false,
  backTo,
  actions
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm mb-2">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
              {crumb.href ? (
                <button
                  onClick={() => navigate(crumb.href)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backButton && (
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default NavigationHeader;
