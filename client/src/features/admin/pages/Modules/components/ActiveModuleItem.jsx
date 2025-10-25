import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function ActiveModuleItem({ module, index, isEditMode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative"
    >
      <div
        {...attributes}
        {...(isEditMode ? listeners : {})}
        className={`bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition-all overflow-hidden ${
          isEditMode ? 'cursor-move' : ''
        }`}
      >
        {/* Module Content */}
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Module Number Badge */}
            <div className="flex-shrink-0 w-10 h-10 bg-brand-500 dark:bg-brand-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
              {index + 1}
            </div>
            
            {/* Module Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base flex text-neutral-900 dark:text-white truncate mb-2">
                    {module.title}
                </h3>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Active
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Position {index + 1}
                    </span>
                </div>
            </div>
            {isEditMode && (
              <div className="flex-shrink-0 text-neutral-400 dark:text-neutral-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Border Accent */}
        <div className="h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>
      </div>
    </div>
  );
}
