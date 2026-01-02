/**
 * Shared constants for admin features
 */

export const VEHICLE_TYPES = [
  { value: 'MOTORCYCLE', label: 'Motorcycle' },
  { value: 'CAR', label: 'Car' },
  { value: 'TRUCK', label: 'Truck' },
  { value: 'BUS', label: 'Bus' }
];

export const SLIDE_TYPES = [
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'image', label: 'Image', icon: '🖼️' },
  { value: 'lesson', label: 'Lesson', icon: '📖' },
  { value: 'tip', label: 'Tip', icon: '💡' }
];

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 7000
};

export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 50 * 1024 * 1024 // 50MB
};

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg'
];

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  AUTO_SAVE: 30000 // 30 seconds
};

export const SORT_OPTIONS = {
  MODULES: [
    { value: 'position', label: 'Position' },
    { value: 'title', label: 'Title' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Last Updated' }
  ],
  QUIZZES: [
    { value: 'title', label: 'Title' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'attempts', label: 'Most Attempts' }
  ]
};

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' }
];

export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
};

export const KEYBOARD_SHORTCUTS = {
  SAVE: 'Ctrl+S',
  NEW: 'Ctrl+N',
  SEARCH: 'Ctrl+K',
  UNDO: 'Ctrl+Z',
  REDO: 'Ctrl+Y',
  ESCAPE: 'Escape'
};
