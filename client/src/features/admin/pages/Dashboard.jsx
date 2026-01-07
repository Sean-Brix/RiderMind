import { LayoutDashboard } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description={`Welcome${user ? `, ${user.name}` : ''}.`}
      />
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
