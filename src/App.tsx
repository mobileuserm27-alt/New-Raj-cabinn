/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CustomerMenu } from './components/customer/CustomerMenu';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LandingPage } from './components/LandingPage';
import { SecretAdminModal } from './components/common/SecretAdminModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainRouter: React.FC = () => {
  const { view, toast, closeToast, isSecretAdminOpen, closeSecretAdminModal } = useApp();

  const isCustomerView = view === 'customer' || view === 'customer_menu';
  const isAdminView = view === 'admin' || view === 'restaurant_admin' || view === 'kitchen_display' || view === 'super_admin' || view === 'onboarding';

  return (
    <div className="relative min-h-screen bg-stone-100 font-sans antialiased text-stone-900 selection:bg-rose-600 selection:text-white">
      {/* Secret Master Admin Password Modal */}
      <SecretAdminModal isOpen={isSecretAdminOpen} onClose={closeSecretAdminModal} />

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-200">
          <div
            id="app-toast-alert"
            className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md flex items-start justify-between gap-3 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-700 text-white'
                : toast.type === 'warn'
                ? 'bg-amber-950/90 border-amber-700 text-white'
                : 'bg-stone-900/90 border-stone-700 text-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {toast.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : toast.type === 'warn' ? (
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                ) : (
                  <Info className="w-5 h-5 text-rose-400" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">{toast.title}</h4>
                {(toast.message || toast.desc) && (
                  <p className="text-xs text-stone-300 mt-0.5 leading-snug">{toast.message || toast.desc}</p>
                )}
              </div>
            </div>

            <button
              id="btn-close-toast"
              type="button"
              onClick={closeToast}
              className="p-1 rounded-lg text-stone-400 hover:text-white transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      {isCustomerView && <CustomerMenu />}
      {isAdminView && <AdminDashboard />}
      {!isCustomerView && !isAdminView && <LandingPage />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
