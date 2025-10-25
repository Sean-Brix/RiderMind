import { Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import './App.css'
import Login from './features/auth/pages/Login.jsx';
import Landing from './features/client/pages/Landing.jsx';
import AdminLayout from './features/admin/layout/AdminLayout.jsx';
import Dashboard from './features/admin/pages/Dashboard.jsx';
import AccountList from './features/admin/features/account-management/pages/AccountList.jsx';
import CreateAccount from './features/admin/features/account-management/pages/CreateAccount.jsx';

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}

function Protected({ role, children }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace />;
  return children;
}

function App() {
  const user = getUser();
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  function toggleDark() {
    const el = document.documentElement;
    const isDark = el.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
  // Initialize theme from localStorage
  if (typeof document !== 'undefined') {
    const pref = localStorage.getItem('theme');
    if (pref === 'dark') document.documentElement.classList.add('dark');
  }
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-brand-700 font-semibold">RiderMind</Link>
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary" onClick={toggleDark}>Toggle Theme</button>
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-neutral-600 dark:text-neutral-300">{user.name} ({user.role})</span>
                <button className="btn btn-primary" onClick={logout}>Logout</button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary">Login</Link>
            )}
          </div>
        </div>
      </header>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected><Landing /></Protected>} />
        <Route path="/admin" element={<Protected role="ADMIN"><AdminLayout /></Protected>}>
          <Route index element={<Dashboard />} />
          <Route path="accounts" element={<AccountList />} />
          <Route path="accounts/new" element={<CreateAccount />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/') : '/login'} replace />} />
      </Routes>
    </>
  )
}

export default App
