import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function toggleDark() {
  const el = document.documentElement;
  const isDark = el.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  
  // Check if we're in the admin panel
  const isAdminPanel = location.pathname.startsWith('/admin');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className={isAdminPanel ? "flex items-center justify-between h-16" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
        <div className="flex items-center justify-between h-16 flex-1">
          {/* Logo/Brand */}
          <div className={`flex items-center ${isAdminPanel ? 'w-64 px-4 border-r border-neutral-200 dark:border-neutral-800' : ''}`}>
            <Link to="/" className="text-xl font-bold text-brand-700 dark:text-brand-400">
              RiderMind
            </Link>
          </div>

          {/* Center Navigation */}
          {!isAdminPanel && (
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === '/' 
                    ? 'text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30' 
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === '/about' 
                    ? 'text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30' 
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                About
              </Link>
              <Link
                to="/modules"
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === '/modules' 
                    ? 'text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30' 
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                Modules
              </Link>
              <Link
                to="/progress"
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === '/progress' 
                    ? 'text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30' 
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                Progress
              </Link>
              <Link
                to="/leaderboard"
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === '/leaderboard' 
                    ? 'text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30' 
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                Leaderboard
              </Link>
            </div>
          )}

          {/* Profile Dropdown */}
          <div className={`flex items-center gap-3 ${isAdminPanel ? 'px-4' : ''}`}>
            <button
              onClick={toggleDark}
              className="p-2 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Toggle theme"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            {!user && !isAdminPanel && (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 rounded-lg transition-colors"
              >
                Login
              </Link>
            )}

            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 font-semibold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">Profile</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {user.displayName || 'User'}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {user.email}
                        </p>
                        <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-1">
                          {user.role}
                        </p>
                      </div>

                      {/* Dropdown Items */}
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Account
                        </div>
                      </Link>

                      {user.role === 'USER' && (
                        <Link
                          to="/progress"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Progress
                          </div>
                        </Link>
                      )}

                      {user.role === 'ADMIN' && (
                        <Link
                          to={isAdminPanel ? "/" : "/admin"}
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {isAdminPanel ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              ) : (
                                <>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </>
                              )}
                            </svg>
                            {isAdminPanel ? 'Landing Page' : 'Admin Panel'}
                          </div>
                        </Link>
                      )}

                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          Settings
                        </div>
                      </Link>

                      <div className="border-t border-neutral-200 dark:border-neutral-700 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
