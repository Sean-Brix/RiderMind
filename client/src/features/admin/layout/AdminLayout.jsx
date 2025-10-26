import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../../../components/Navbar.jsx';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
