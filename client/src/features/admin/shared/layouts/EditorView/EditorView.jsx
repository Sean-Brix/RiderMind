import React, { useEffect } from 'react';
import { Save, X, Trash2 } from 'lucide-react';

const EditorView = ({
  title,
  onSave,
  onCancel,
  onDelete,
  isSaving = false,
  hasUnsavedChanges = false,
  showAutoSaveIndicator = false,
  leftPanel,
  rightPanel,
  actions
}) => {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {showAutoSaveIndicator && (
              <span className="text-sm text-gray-500 animate-pulse">
                Auto-saving...
              </span>
            )}
            {hasUnsavedChanges && !showAutoSaveIndicator && (
              <span className="text-sm text-amber-600">• Unsaved changes</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {actions}
            
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}

            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}

            {onSave && (
              <button
                onClick={onSave}
                disabled={isSaving}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content - Split Panel */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left Panel */}
          <div className="h-full overflow-y-auto bg-white border-r border-gray-200 p-6">
            {leftPanel}
          </div>

          {/* Right Panel */}
          {rightPanel && (
            <div className="h-full overflow-y-auto bg-gray-50 p-6">
              <div className="sticky top-0 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
              </div>
              {rightPanel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorView;
