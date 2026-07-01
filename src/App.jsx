import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import RegisterPage from './pages/RegisterPage';
import VerificationPage from './pages/VerificationPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import SuccessPage from './pages/SuccessPage';
import DashboardPage from './pages/DashboardPage';
import AppointmentPage from './pages/AppointmentPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/verificacion" element={<VerificationPage />} />
        <Route path="/verify" element={<VerifyEmailPage />} />
        <Route path="/exito" element={<SuccessPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/citas" element={
          <ProtectedRoute>
            <AppointmentPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;