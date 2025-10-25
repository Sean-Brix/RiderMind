export default function Modules() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Modules</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Manage learning modules and content</p>
        </div>
        <button className="btn btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Module
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700">
        <div className="p-6">
          <p className="text-neutral-600 dark:text-neutral-400 text-center py-12">
            No modules created yet. Click "Add Module" to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
