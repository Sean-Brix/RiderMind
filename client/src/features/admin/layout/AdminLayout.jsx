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
              <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
                <Navbar />
                <div className="flex flex-1">
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
