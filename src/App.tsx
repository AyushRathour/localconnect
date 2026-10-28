import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts & Guards
import { MainLayout } from './components/layout/MainLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { ProviderProfilePage } from './pages/ProviderProfilePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProviderRegisterPage } from './pages/ProviderRegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { PrivacyPage, TermsPage, NotFoundPage } from './pages/StaticPages';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { CustomerBookingsPage } from './pages/customer/CustomerBookingsPage';
import { BookingDetailPage } from './pages/customer/BookingDetailPage';
import {
  CustomerAddressesPage,
  CustomerReviewsPage,
  CustomerNotificationsPage,
  CustomerProfilePage,
} from './pages/customer/CustomerPages';

// Provider Pages
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { ProviderVerificationPage } from './pages/provider/ProviderVerificationPage';
import { ProviderBookingsPage } from './pages/provider/ProviderBookingsPage';
import { ProviderServicesPage } from './pages/provider/ProviderServicesPage';
import {
  ProviderAvailabilityPage,
  ProviderReviewsPage,
  ProviderProfileEditPage,
  ProviderNotificationsPage,
} from './pages/provider/ProviderSubPages';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import {
  AdminVerificationsPage,
  AdminUsersPage,
  AdminServicesPage,
  AdminCategoriesPage,
  AdminBookingsPage,
  AdminReviewsPage,
  AdminAuditLogsPage,
} from './pages/admin/AdminPages';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Storefront Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/providers/:id" element={<ProviderProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/provider/register" element={<ProviderRegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Route>

          {/* Customer Dashboard Routes */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/customer/dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="bookings" element={<CustomerBookingsPage />} />
            <Route path="bookings/:id" element={<BookingDetailPage />} />
            <Route path="addresses" element={<CustomerAddressesPage />} />
            <Route path="reviews" element={<CustomerReviewsPage />} />
            <Route path="notifications" element={<CustomerNotificationsPage />} />
            <Route path="profile" element={<CustomerProfilePage />} />
          </Route>

          {/* Provider Dashboard Routes */}
          <Route
            path="/provider"
            element={
              <ProtectedRoute allowedRoles={['provider']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/provider/dashboard" replace />} />
            <Route path="dashboard" element={<ProviderDashboard />} />
            <Route path="verification" element={<ProviderVerificationPage />} />
            <Route path="bookings" element={<ProviderBookingsPage />} />
            <Route path="services" element={<ProviderServicesPage />} />
            <Route path="availability" element={<ProviderAvailabilityPage />} />
            <Route path="reviews" element={<ProviderReviewsPage />} />
            <Route path="profile" element={<ProviderProfileEditPage />} />
            <Route path="notifications" element={<ProviderNotificationsPage />} />
          </Route>

          {/* Administrator Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="verifications" element={<AdminVerificationsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route element={<MainLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
