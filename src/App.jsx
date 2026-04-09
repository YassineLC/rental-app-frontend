import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import TenantDashboardPage from './pages/TenantDashboardPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import AddPropertyPage from './pages/AddPropertyPage';
import MyBookingsPage from './pages/MyBookingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />

          <Route
            path="/dashboard/tenant"
            element={
              <ProtectedRoute roles={['TENANT']}>
                <TenantDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tenant/bookings"
            element={
              <ProtectedRoute roles={['TENANT']}>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/owner"
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN']}>
                <OwnerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/owner/add-property"
            element={
              <ProtectedRoute roles={['OWNER', 'ADMIN']}>
                <AddPropertyPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
