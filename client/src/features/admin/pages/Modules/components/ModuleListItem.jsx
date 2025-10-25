import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function ModuleListItem({ module, isEditMode }) {
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
      {...attributes}
      {...(isEditMode ? listeners : {})}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-md transition-all duration-200 ${
        isEditMode ? 'cursor-move' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-medium flex text-neutral-900 dark:text-neutral-100 text-sm truncate">
          {module.title}
        </h3>
      </div>
      <svg className="w-5 h-5 text-neutral-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </div>
  );
}
