import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function ModuleListItem({ module, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
        isSelected
          ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 shadow-md'
          : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-md'
      }`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
        <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">
          {module.title}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
          {module.description || 'No description'}
        </p>
      </div>
      {module.quizzes && module.quizzes.length > 0 && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
    </button>
  );
}

export function SortableQuestionItem({ question, index, isEditing, onEdit, onDelete, onMoveUp, onMoveDown, totalQuestions }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `question-${index}`, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const getQuestionTypeIcon = (type) => {
    switch(type) {
      case 'MULTIPLE_CHOICE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'TRUE_FALSE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'ESSAY':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'MULTIPLE_ANSWER':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getQuestionTypeLabel = (type) => {
    const labels = {
      'MULTIPLE_CHOICE': 'Multiple Choice',
      'TRUE_FALSE': 'True/False',
      'IDENTIFICATION': 'Identification',
      'ESSAY': 'Essay',
      'MULTIPLE_ANSWER': 'Multiple Answer',
      'MATCHING': 'Matching',
      'FILL_BLANK': 'Fill in the Blank'
    };
    return labels[type] || type;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 ${
        isDragging 
          ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-500 shadow-xl scale-105' 
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600'
      }`}
    >
      {isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-brand-100 dark:hover:bg-brand-900/30 rounded transition-colors flex-shrink-0"
          title="Drag to reorder"
        >
          <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      )}
      
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold text-sm">
        {index + 1}
      </div>
      
      <div className="flex-shrink-0 text-neutral-600 dark:text-neutral-400">
        {getQuestionTypeIcon(question.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate mb-1">
          {question.question}
        </h4>
        <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="capitalize">{getQuestionTypeLabel(question.type)}</span>
          <span>•</span>
          <span>{question.points} {question.points === 1 ? 'point' : 'points'}</span>
          {question.options && question.options.length > 0 && (
            <>
              <span>•</span>
              <span>{question.options.length} options</span>
            </>
          )}
        </div>
      </div>
      
      {isEditing && (
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            title="Edit question"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete question"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export function QuestionTypeSelector({ value, onChange, disabled = false }) {
  const questionTypes = [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: '○' },
    { value: 'TRUE_FALSE', label: 'True/False', icon: '✓✗' },
    { value: 'MULTIPLE_ANSWER', label: 'Multiple Answer', icon: '☑' },
    { value: 'IDENTIFICATION', label: 'Identification', icon: 'Aa' },
    { value: 'FILL_BLANK', label: 'Fill in the Blank', icon: '___' },
    { value: 'ESSAY', label: 'Essay', icon: '📝' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {questionTypes.map((type) => (
        <button
          key={type.value}
          type="button"
          onClick={() => onChange(type.value)}
          disabled={disabled}
          className={`p-4 rounded-lg border-2 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed ${
            value === type.value
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
              : 'border-neutral-200 dark:border-neutral-700 hover:border-brand-300 dark:hover:border-brand-600'
          }`}
        >
          <div className="text-2xl mb-2">{type.icon}</div>
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {type.label}
          </div>
        </button>
      ))}
    </div>
  );
}

export function FileUpload({ type, file, onChange, onRemove }) {
  const accept = type === 'image' ? 'image/*' : 'video/*';
  
  return (
    <div>
      {file ? (
        <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {file.name}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <label className="block">
          <input
            type="file"
            accept={accept}
            onChange={(e) => onChange(e.target.files[0])}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg cursor-pointer hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all">
            <svg className="w-12 h-12 text-neutral-400 dark:text-neutral-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Click to upload {type}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {type === 'image' ? 'PNG, JPG, GIF up to 10MB' : 'MP4, MOV up to 100MB'}
            </p>
          </div>
        </label>
      )}
    </div>
  );
}

export { ModuleListItem as default };
