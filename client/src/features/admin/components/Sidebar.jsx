import { NavLink } from 'react-router-dom';

const linkBase = 'block px-3 py-2 rounded-md text-sm font-medium hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-neutral-800';
const linkActive = 'bg-brand-100 text-brand-800 dark:bg-neutral-700 dark:text-white';

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="text-xl font-semibold text-brand-700">RiderMind Admin</div>
      </div>
      <nav className="p-3 space-y-1">
        <NavLink to="/admin" end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
          Dashboard
        </NavLink>
        <div className="mt-2 text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 px-3">Accounts</div>
        <NavLink to="/admin/accounts" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
          Account List
        </NavLink>
        <NavLink to="/admin/accounts/new" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
          Create Account
        </NavLink>
      </nav>
    </aside>
  );
}
