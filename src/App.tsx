/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import AppShell from './AppShell';
import LandingPage from './components/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import ecomflowLogo from './images/EcomFlow.png';

function FullScreenSplash() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0b0c0a] text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-dz-emerald/[0.06] rounded-full blur-[130px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-dz-gold/[0.05] rounded-full blur-[130px]" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <img src={ecomflowLogo} alt="EcomFlow AI" className="w-16 h-16 rounded-full object-cover shadow-[0_0_30px_rgba(212,164,76,0.2)]" />
        <Loader2 className="w-6 h-6 text-dz-emerald animate-spin" />
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-white/35">EcomFlow AI</p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  // Loading the session (checking the cookie) → branded splash.
  if (loading) return <FullScreenSplash />;

  // Admin dashboard — accessible regardless of auth state (page handles its own auth)
  if (window.location.pathname === '/admin') {
    return <AdminDashboard />;
  }

  // Authenticated → the full app shell.
  if (user) return <AppShell />;

  // Public auth flow.
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/app" element={<LandingPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}
