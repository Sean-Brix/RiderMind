import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Login from './features/auth/pages/Login.jsx';
import Landing from './features/client/pages/Landing.jsx';
import Settings from './features/client/pages/Settings';
import Profile from './features/client/pages/Profile';
import About from './features/client/pages/About';
import ModulesPage from './features/client/pages/Modules';
import Progress from './features/client/pages/Progress';
import Leaderboard from './features/client/pages/Leaderboard';
import AdminLayout from './features/admin/layout/AdminLayout.jsx';
import Analytics from './features/admin/pages/Analytics';
import Modules from './features/admin/pages/Modules';
import Quizes from './features/admin/pages/Quizes';
import FAQs from './features/admin/pages/FAQs/FAQs';
import AccountList from './features/admin/features/account-management/pages/AccountList.jsx';
import EditAccount from './features/admin/features/account-management/pages/EditAccount.jsx';
import Register from './features/auth/pages/Register.jsx';
import DevTools from './features/client/pages/DevTools.jsx';

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
  
  // Initialize theme from localStorage
  if (typeof document !== 'undefined') {
    const pref = localStorage.getItem('theme');
    if (pref === 'dark') document.documentElement.classList.add('dark');
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Protected><Landing /></Protected>} />
      <Route path="/about" element={<Protected><About /></Protected>} />
      <Route path="/modules" element={<Protected><ModulesPage /></Protected>} />
      <Route path="/progress" element={<Protected><Progress /></Protected>} />
      <Route path="/leaderboard" element={<Protected><Leaderboard /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="/dev" element={<Protected><DevTools /></Protected>} />
      <Route path="/admin" element={<Protected role="ADMIN"><AdminLayout /></Protected>}>
        <Route index element={<Navigate to="/admin/analytics" replace />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="accounts" element={<AccountList />} />
        <Route path="accounts/:id/edit" element={<EditAccount />} />
        <Route path="modules" element={<Modules />} />
        <Route path="quizes" element={<Quizes />} />
        <Route path="faqs" element={<FAQs />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/') : '/login'} replace />} />
    </Routes>
  )
}

export default App
