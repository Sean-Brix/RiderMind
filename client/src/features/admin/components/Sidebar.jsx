import { NavLink } from 'react-router-dom';

const linkBase = 'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-neutral-800 dark:hover:text-brand-400';
const linkActive = 'bg-brand-100 text-brand-800 dark:bg-neutral-800 dark:text-brand-400';

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 h-full">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="text-lg font-bold text-brand-700 dark:text-brand-400">Dashboard</div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Manage your system</p>
      </div>
      <nav className="p-3 space-y-1">
        <NavLink to="/admin/analytics" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Analytics
        </NavLink>

        <NavLink to="/admin/accounts" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Account Management
        </NavLink>

        <NavLink to="/admin/modules" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Modules
        </NavLink>

        <NavLink to="/admin/quizes" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Quizes
        </NavLink>

        <NavLink to="/admin/faqs" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          FAQs
        </NavLink>

        <NavLink to="/admin/feedback" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Feedback
        </NavLink>
      </nav>
    </aside>
  );
}
