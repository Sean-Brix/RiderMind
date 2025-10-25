export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Dashboard</h1>
        <p className="text-neutral-600 dark:text-neutral-400">Welcome{user ? `, ${user.name}` : ''}.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-neutral-500 mb-2">Users</div>
          <div className="text-3xl font-semibold">—</div>
        </div>
        <div className="card">
          <div className="text-sm text-neutral-500 mb-2">Active Sessions</div>
          <div className="text-3xl font-semibold">—</div>
        </div>
        <div className="card">
          <div className="text-sm text-neutral-500 mb-2">Errors</div>
          <div className="text-3xl font-semibold">—</div>
        </div>
      </div>
    </div>
  );
}
