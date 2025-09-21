import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ViolationLog } from './components/ViolationLog';
import { VideoProcessing } from './components/VideoProcessing';
import { Messages } from './components/Messages';
import { Upload } from './components/upload';
import { FolderStatusPage } from './components/FolderStatusPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = { user: { id: '123', name: 'Demo User' } };
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <LoginPage />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/processing"
          element={
            <ProtectedRoute>
              <Layout>
                <VideoProcessing />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/violations"
          element={
            <ProtectedRoute>
              <Layout>
                <ViolationLog />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Layout>
                <Messages />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Generic upload page */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Layout>
                <Upload />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Upload page for specific folder */}
        <Route
          path="/upload/:folderName"
          element={
            <ProtectedRoute>
              <Layout>
                <Upload />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/folderstatus"
          element={
            <ProtectedRoute>
              <Layout>
                <FolderStatusPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>

    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;