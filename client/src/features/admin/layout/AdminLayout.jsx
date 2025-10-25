import Sidebar from '../components/Sidebar.jsx';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="h-full flex bg-neutral-50 dark:bg-neutral-950">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
