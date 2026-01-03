import { useState } from 'react';
import {
  LoadingSpinner,
  ToastContainer,
  ErrorBoundary,
  ConfirmDialog,
  MediaUploader,
  SearchBar,
} from '../shared/components';
import {
  ListView,
  EditorView,
  NavigationHeader,
  QuickActions,
} from '../shared/layouts';
import { useToast, useConfirm, useDebounce, useAPI } from '../shared/hooks';
import { useModules } from '../shared/contexts/ModulesContext';
import { useQuizzes } from '../shared/contexts/QuizzesContext';
import {
  validateModule,
  validateQuiz,
  formatDate,
  formatFileSize,
  formatDuration,
  truncateText,
  generateId,
  capitalize,
} from '../shared/utils';

export default function TestPhase1() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Phase 1 Component Testing
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Test all foundation components and verify expected behavior
        </p>
      </header>

      {/* Context Providers Test */}
      <TestSection
        title="1. Context Providers"
        description="Tests ToastContext, ModulesContext, and QuizzesContext"
      >
        <ContextProvidersTest />
      </TestSection>

      {/* Custom Hooks Test */}
      <TestSection
        title="2. Custom Hooks"
        description="Tests useToast, useConfirm, useDebounce, and useAPI"
      >
        <CustomHooksTest />
      </TestSection>

      {/* Utility Functions Test */}
      <TestSection
        title="3. Utility Functions"
        description="Tests validators, formatters, and helper functions"
      >
        <UtilityFunctionsTest />
      </TestSection>

      {/* LoadingSpinner Test */}
      <TestSection
        title="4. LoadingSpinner Component"
        description="Tests spinner with different sizes and full-page overlay"
      >
        <LoadingSpinnerTest />
      </TestSection>

      {/* Toast System Test */}
      <TestSection
        title="5. Toast Notification System"
        description="Tests toast variants, auto-dismiss, and action buttons"
      >
        <ToastSystemTest />
      </TestSection>

      {/* ConfirmDialog Test */}
      <TestSection
        title="6. ConfirmDialog Component"
        description="Tests confirmation dialogs with default and danger variants"
      >
        <ConfirmDialogTest />
      </TestSection>

      {/* ErrorBoundary Test */}
      <TestSection
        title="7. ErrorBoundary Component"
        description="Tests error boundary catch and display"
      >
        <ErrorBoundaryTest />
      </TestSection>

      {/* MediaUploader Test */}
      <TestSection
        title="8. MediaUploader Component"
        description="Tests file upload, drag-drop, paste, preview, and validation"
      >
        <MediaUploaderTest />
      </TestSection>

      {/* SearchBar Test */}
      <TestSection
        title="9. SearchBar Component"
        description="Tests debounced search, filters, and clear functionality"
      >
        <SearchBarTest />
      </TestSection>

      {/* ListView Layout Test */}
      <TestSection
        title="10. ListView Layout"
        description="Tests list view with grid/list toggle, search, and empty state"
      >
        <ListViewTest />
      </TestSection>

      {/* EditorView Layout Test */}
      <TestSection
        title="11. EditorView Layout"
        description="Tests editor with split panel, save/cancel, and unsaved warning"
      >
        <EditorViewTest />
      </TestSection>

      {/* NavigationHeader Test */}
      <TestSection
        title="12. NavigationHeader Layout"
        description="Tests breadcrumb navigation and action buttons"
      >
        <NavigationHeaderTest />
      </TestSection>

      {/* QuickActions Test */}
      <TestSection
        title="13. QuickActions Component"
        description="Tests action buttons with variants and keyboard shortcuts"
      >
        <QuickActionsTest />
      </TestSection>
    </div>
  );
}

// Test Section Wrapper
function TestSection({ title, description, children }) {
  return (
    <section className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 bg-white dark:bg-neutral-900">
      <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        {description}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// 1. Context Providers Test
function ContextProvidersTest() {
  const { modules, loading: modulesLoading, error: modulesError, fetchModules } = useModules();
  const { quizzes, loading: quizzesLoading, error: quizzesError, fetchQuizzes } = useQuizzes();
  const { showToast } = useToast();

  const handleFetchModules = async () => {
    console.log('Fetching modules...');
    try {
      await fetchModules();
      console.log('Modules fetched:', modules);
      showToast({ type: 'success', message: 'Modules loaded successfully!' });
    } catch (err) {
      console.error('Error fetching modules:', err);
      showToast({ type: 'error', message: 'Failed to load modules' });
    }
  };

  const handleFetchQuizzes = async () => {
    console.log('Fetching quizzes...');
    try {
      await fetchQuizzes();
      console.log('Quizzes fetched:', quizzes);
      showToast({ type: 'success', message: 'Quizzes loaded successfully!' });
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      showToast({ type: 'error', message: 'Failed to load quizzes' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>• Click "Fetch Modules" → Should load modules and show count</li>
          <li>• Click "Fetch Quizzes" → Should load quizzes and show count</li>
          <li>• Loading states should appear while fetching</li>
          <li>• Toast notifications should appear on success/error</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleFetchModules}
          disabled={modulesLoading}
          className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-50"
        >
          {modulesLoading ? 'Loading...' : 'Fetch Modules'}
        </button>
        <button
          onClick={handleFetchQuizzes}
          disabled={quizzesLoading}
          className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 disabled:opacity-50"
        >
          {quizzesLoading ? 'Loading...' : 'Fetch Quizzes'}
        </button>
      </div>

      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        <p className="font-semibold mb-2">Results:</p>
        <p>Modules loaded: {modules?.length || 0}</p>
        <p>Quizzes loaded: {quizzes?.length || 0}</p>
        {modulesError && <p className="text-red-600">Modules error: {modulesError}</p>}
        {quizzesError && <p className="text-red-600">Quizzes error: {quizzesError}</p>}
        {modules?.length > 0 && (
          <div className="mt-2">
            <p className="font-semibold">First module:</p>
            <pre className="text-xs bg-neutral-100 dark:bg-neutral-900 p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify(modules[0], null, 2)}
            </pre>
          </div>
        )}
        {quizzes?.length > 0 && (
          <div className="mt-2">
            <p className="font-semibold">First quiz:</p>
            <pre className="text-xs bg-neutral-100 dark:bg-neutral-900 p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify(quizzes[0], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// 2. Custom Hooks Test
function CustomHooksTest() {
  const { showToast } = useToast();
  const { confirm, isOpen, confirmData, closeConfirm } = useConfirm();
  const [inputValue, setInputValue] = useState('');
  const debouncedValue = useDebounce(inputValue, 500);

  const handleConfirm = async () => {
    const result = await confirm({
      title: 'Test Confirmation',
      message: 'Do you want to proceed with this test action?',
      variant: 'default',
    });
    showToast({
      type: result ? 'success' : 'info',
      message: result ? 'Confirmed!' : 'Cancelled',
    });
  };

  const handleDangerConfirm = async () => {
    const result = await confirm({
      title: 'Danger Action',
      message: 'This is a destructive action. Are you sure?',
      variant: 'danger',
      confirmText: 'Delete',
      cancelText: 'Keep',
    });
    showToast({
      type: result ? 'error' : 'info',
      message: result ? 'Deleted!' : 'Cancelled',
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>• useConfirm: Dialogs should appear and return true/false</li>
          <li>• useDebounce: Debounced value updates 500ms after typing stops</li>
          <li>• useToast: Toasts appear in top-right corner</li>
          <li>• Press Escape to cancel confirm dialogs</li>
        </ul>
      </div>

      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test useConfirm (Default)
          </button>
          <button
            onClick={handleDangerConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Test useConfirm (Danger)
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Test useDebounce (type to see delay):
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded w-full max-w-md"
            placeholder="Type something..."
          />
          <p className="text-sm mt-2 text-neutral-600 dark:text-neutral-400">
            Immediate value: "{inputValue}"
          </p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Debounced value (500ms): "{debouncedValue}"
          </p>
        </div>
      </div>

      {/* Render the ConfirmDialog */}
      {isOpen && (
        <ConfirmDialog
          isOpen={isOpen}
          title={confirmData.title}
          message={confirmData.message}
          confirmText={confirmData.confirmText}
          cancelText={confirmData.cancelText}
          variant={confirmData.variant}
          onConfirm={confirmData.onConfirm}
          onCancel={confirmData.onCancel}
        />
      )}
    </div>
  );
}

// 3. Utility Functions Test
function UtilityFunctionsTest() {
  const [validationResults, setValidationResults] = useState(null);

  const testValidation = () => {
    const moduleValid = validateModule({
      title: 'Test Module',
      description: 'This is a test description with enough characters',
      duration: 30,
    });

    const quizValid = validateQuiz({
      title: 'Test Quiz',
      moduleId: '123',
      questions: [{ question: 'Test?' }],
      passingScore: 70,
    });

    setValidationResults({ moduleValid, quizValid });
  };

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>• Validators return true for valid data</li>
          <li>• Formatters display correct formats</li>
          <li>• Helpers perform expected operations</li>
          <li>• ID generation creates unique IDs</li>
        </ul>
      </div>

      <button
        onClick={testValidation}
        className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
      >
        Test Validators
      </button>

      {validationResults && (
        <div className="text-sm space-y-1">
          <p>Module validation: {validationResults.moduleValid ? '✅ Valid' : '❌ Invalid'}</p>
          <p>Quiz validation: {validationResults.quizValid ? '✅ Valid' : '❌ Invalid'}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-semibold mb-2">Formatters:</h4>
          <p>Date: {formatDate(new Date())}</p>
          <p>File size: {formatFileSize(1234567)}</p>
          <p>Duration: {formatDuration(125)}</p>
          <p>Truncate: {truncateText('This is a very long text that should be truncated', 20)}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Helpers:</h4>
          <p>Generated ID: {generateId()}</p>
          <p>Capitalize: {capitalize('hello world')}</p>
        </div>
      </div>
    </div>
  );
}

// 4. LoadingSpinner Test
function LoadingSpinnerTest() {
  const [showFullPage, setShowFullPage] = useState(false);

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>• Small, medium, large spinners display correctly</li>
          <li>• Full-page spinner covers entire screen with backdrop</li>
          <li>• Spinners rotate smoothly</li>
        </ul>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-center">
          <LoadingSpinner size="sm" />
          <p className="text-xs mt-2">Small</p>
        </div>
        <div className="text-center">
          <LoadingSpinner size="md" />
          <p className="text-xs mt-2">Medium</p>
        </div>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-xs mt-2">Large</p>
        </div>
      </div>

      <button
        onClick={() => {
          setShowFullPage(true);
          setTimeout(() => setShowFullPage(false), 2000);
        }}
        className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
      >
        Test Full-Page Spinner (2s)
      </button>

      {showFullPage && <LoadingSpinner fullPage message="Loading full page..." />}
    </div>
  );
}

// 5. Toast System Test
function ToastSystemTest() {
  const { showToast } = useToast();

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>• Toasts slide in from the right</li>
          <li>• Auto-dismiss after specified duration</li>
          <li>• Click X to dismiss manually</li>
          <li>• Action buttons trigger callbacks</li>
          <li>• Multiple toasts stack vertically</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => showToast({ type: 'success', message: 'Operation completed successfully!' })}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Success Toast
        </button>
        <button
          onClick={() => showToast({ type: 'error', message: 'An error occurred!' })}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Error Toast
        </button>
        <button
          onClick={() => showToast({ type: 'warning', message: 'Please review your changes' })}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Warning Toast
        </button>
        <button
          onClick={() => showToast({ type: 'info', message: 'New feature available!' })}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Info Toast
        </button>
        <button
          onClick={() =>
            showToast({
              type: 'success',
              message: 'Item deleted',
              action: { label: 'Undo', onClick: () => alert('Undo clicked!') },
            })
          }
          className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
        >
          Toast with Action
        </button>
      </div>
    </div>
  );
}

// 6. ConfirmDialog Test (covered in Custom Hooks Test)
function ConfirmDialogTest() {
  return (
    <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        ℹ️ ConfirmDialog is tested in the "Custom Hooks" section above using useConfirm.
      </p>
    </div>
  );
}

// 7. ErrorBoundary Test
function ErrorBoundaryTest() {
  const [shouldError, setShouldError] = useState(false);

  const BuggyComponent = () => {
    if (shouldError) {
      throw new Error('Test error boundary!');
    }
    return <p className="text-green-600">✅ Component rendering normally</p>;
  };

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>• Click button to trigger error</li>
          <li>• Error boundary catches and displays error UI</li>
          <li>• Refresh button resets error state</li>
          <li>• Dev mode shows error stack trace</li>
        </ul>
      </div>

      <button
        onClick={() => setShouldError(!shouldError)}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        {shouldError ? 'Reset Error' : 'Trigger Error'}
      </button>

      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    </div>
  );
}

// 8. MediaUploader Test
function MediaUploaderTest() {
  const [uploadedFile, setUploadedFile] = useState(null);

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>• Click to browse files or drag-drop files</li>
          <li>• Paste images with Ctrl+V</li>
          <li>• Preview appears after upload</li>
          <li>• Progress bar animates during upload</li>
          <li>• File validation shows errors for invalid files</li>
          <li>• Remove button clears uploaded file</li>
        </ul>
      </div>

      <MediaUploader
        accept="image/*,video/*"
        onUpload={setUploadedFile}
        maxSize={5 * 1024 * 1024}
      />

      {uploadedFile && (
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          <p>Uploaded: {uploadedFile.name}</p>
          <p>Size: {formatFileSize(uploadedFile.size)}</p>
          <p>Type: {uploadedFile.type}</p>
        </div>
      )}
    </div>
  );
}

// 9. SearchBar Test
function SearchBarTest() {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});

  const availableFilters = [
    { name: 'status', label: 'Status', type: 'select', options: ['All', 'Active', 'Draft'] },
    { name: 'category', label: 'Category', type: 'select', options: ['Motorcycle', 'Car', 'Truck'] },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>• Search input debounces after 300ms</li>
          <li>• Filter button shows/hides filter panel</li>
          <li>• Active filter indicator (blue dot) appears when filters applied</li>
          <li>• Clear button resets search</li>
          <li>• Clear all filters button resets filters</li>
        </ul>
      </div>

      <SearchBar
        value={searchValue}
        onChange={setSearchValue}
        filters={filters}
        onFilterChange={setFilters}
        availableFilters={availableFilters}
        placeholder="Search modules..."
      />

      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        <p>Search value: "{searchValue}"</p>
        <p>Active filters: {JSON.stringify(filters)}</p>
      </div>
    </div>
  );
}

// 10. ListView Test
function ListViewTest() {
  const [viewMode, setViewMode] = useState('grid');
  const items = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
  }));

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>• Toggle between grid and list view</li>
          <li>• Items rearrange based on view mode</li>
          <li>• Action button appears in header</li>
          <li>• Responsive grid (1/2/3 columns)</li>
        </ul>
      </div>

      <ListView
        title="Test Items"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        actions={
          <button className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700">
            Add Item
          </button>
        }
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 border border-neutral-200 dark:border-neutral-700 rounded bg-white dark:bg-gray-900"
          >
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">ID: {item.id}</p>
          </div>
        ))}
      </ListView>
    </div>
  );
}

// 11. EditorView Test
function EditorViewTest() {
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
      alert('Saved!');
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>• Split panel layout (form left, preview right)</li>
          <li>• Unsaved changes indicator appears after editing</li>
          <li>• Save button disabled while saving</li>
          <li>• Browser warns before leaving with unsaved changes</li>
          <li>• Auto-save indicator can be shown</li>
        </ul>
      </div>

      <EditorView
        title="Edit Item"
        hasUnsavedChanges={hasChanges}
        isSaving={isSaving}
        onSave={handleSave}
        onCancel={() => {
          setHasChanges(false);
          setFormData({ title: '', description: '' });
        }}
        onDelete={() => alert('Delete clicked')}
        leftPanel={
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setHasChanges(true);
                }}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded"
                rows={4}
              />
            </div>
          </div>
        }
        rightPanel={
          <div className="space-y-2">
            <h3 className="font-semibold">Preview</h3>
            <div className="p-4 bg-neutral-50 dark:bg-gray-900 rounded">
              <p className="font-semibold">{formData.title || 'No title'}</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {formData.description || 'No description'}
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}

// 12. NavigationHeader Test
function NavigationHeaderTest() {
  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>• Breadcrumbs show navigation path</li>
          <li>• Back button navigates back</li>
          <li>• Action buttons appear on the right</li>
          <li>• Breadcrumb items are clickable</li>
        </ul>
      </div>

      <NavigationHeader
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Modules', path: '/admin/modules' },
          { label: 'Edit', path: null },
        ]}
        title="Edit Module"
        subtitle="Make changes to your module"
        onBack={() => alert('Back clicked')}
        actions={
          <button className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700">
            Save
          </button>
        }
      />
    </div>
  );
}

// 13. QuickActions Test
function QuickActionsTest() {
  const actions = [
    {
      label: 'Save',
      icon: 'Save',
      onClick: () => alert('Save clicked'),
      variant: 'primary',
      shortcut: 'Ctrl+S',
    },
    {
      label: 'Delete',
      icon: 'Trash2',
      onClick: () => alert('Delete clicked'),
      variant: 'danger',
    },
    {
      label: 'Cancel',
      icon: 'X',
      onClick: () => alert('Cancel clicked'),
      variant: 'outline',
    },
    {
      label: 'Disabled',
      icon: 'Lock',
      onClick: () => {},
      disabled: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-gray-900 p-4 rounded">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="text-sm space-y-1 text-neutral-600 dark:text-neutral-400">
          <li>• Buttons display with correct variant colors</li>
          <li>• Icons appear with labels</li>
          <li>• Keyboard shortcuts show when provided</li>
          <li>• Disabled state prevents clicks and shows opacity</li>
          <li>• Hover effects work on enabled buttons</li>
        </ul>
      </div>

      <QuickActions actions={actions} />
    </div>
  );
}

