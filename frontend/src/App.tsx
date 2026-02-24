import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar, Navbar } from '@/components/layout';
import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import { Tasks } from '@/pages/Tasks';
import { Analytics } from '@/pages/Analytics';
import { Team } from '@/pages/Team';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { Toaster } from 'sonner';
import { AIAssistant } from '@/components/dashboard/AIAssistant';
import { useAppStore } from '@/store/useAppStore';
import { authService } from '@/services/authService';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, setCurrentUser } = useAppStore();
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchUser = async () => {
      if (token && !currentUser) {
        try {
          const response = await authService.getCurrentUser();
          setCurrentUser(response.user);
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    };
    fetchUser();
  }, [token, currentUser, setCurrentUser]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const isCollapsed = useAppStore(state => state.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'pl-20' : 'pl-64'}`}>
        <Navbar />
        <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
      <AIAssistant />
      <Toaster position="top-right" expand={false} richColors />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Projects />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Tasks />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Analytics />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/team" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Team />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;