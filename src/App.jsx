import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientManager from './pages/ClientManager';
import LMSTracker from './pages/LMSTracker';
import RevenueManager from './pages/RevenueManager';
import SubjectManagement from './pages/SubjectManagement';
import BulkUpdate from './pages/BulkUpdate';
import GlobalRadar from './pages/GlobalRadar';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import MarksEntry from './pages/MarksEntry';
import TeamManager from './pages/TeamManager';
import StudentLogin from './pages/StudentLogin';
import StudentPortal from './pages/StudentPortal';

// Protected Route for Handlers
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
};

// Placeholder for other pages
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[70vh] glass-card p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="w-20 h-20 bg-primary-600/10 rounded-3xl flex items-center justify-center text-primary-500 mb-6 font-black text-4xl">!</div>
    <h2 className="text-3xl font-bold mb-4">{title}</h2>
    <p className="text-dark-muted max-w-md mx-auto">This elite module is being optimized for production. Check back soon for full integration.</p>
    <button className="btn-primary mt-8 px-10 rounded-2xl">Coming Soon</button>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: { background: '#0a0f1a', color: '#f8fafc', border: '1px solid #1e293b' },
          success: { iconTheme: { primary: '#10b981', secondary: '#0a0f1a' } }
        }}
      />
      <Routes>
        {/* Student Access Points */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/dashboard" element={<StudentPortal />} />

        {/* Handler Access Points */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<ClientManager />} />
          <Route path="team" element={<TeamManager />} />
          <Route path="bulk-update" element={<BulkUpdate />} />
          <Route path="radar" element={<GlobalRadar />} />
          <Route path="tracker" element={<LMSTracker />} />
          <Route path="marks" element={<MarksEntry />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="revenue" element={<RevenueManager />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
