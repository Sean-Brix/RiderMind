import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../../../components/Navbar.jsx';
import { Outlet } from 'react-router-dom';
import { ToastProvider } from '../shared/contexts/ToastContext';
import { ModulesProvider } from '../shared/contexts/ModulesContext';
import { QuizzesProvider } from '../shared/contexts/QuizzesContext';
import { CategoriesProvider } from '../shared/contexts/CategoriesContext';
import { ToastContainer, ErrorBoundary } from '../shared/components';

export default function AdminLayout() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ModulesProvider>
          <QuizzesProvider>
            <CategoriesProvider>
              <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gray-900">
                <Navbar />
                <div className="flex flex-1 mt-16">
                  <Sidebar />
                  <main className="flex-1">
                    <Outlet />
                  </main>
                </div>
                <ToastContainer />
              </div>
            </CategoriesProvider>
          </QuizzesProvider>
        </ModulesProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
