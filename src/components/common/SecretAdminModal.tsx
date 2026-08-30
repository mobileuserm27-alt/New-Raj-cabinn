import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, X, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SecretAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecretAdminModal: React.FC<SecretAdminModalProps> = ({ isOpen, onClose }) => {
  const { unlockAdminWithPassword, setView, showToast } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(null);
      setIsShaking(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('कृपया एडमिन पासवर्ड दर्ज करें (Please enter admin password)');
      return;
    }

    const success = unlockAdminWithPassword(password.trim());
    if (success) {
      showToast('सफल लॉगिन (Admin Unlocked)', 'Welcome Vikram Sharma (Restaurant Admin)', 'success');
      onClose();
      setView('admin');
    } else {
      setError('गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें। (Incorrect password)');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div
      id="secret-admin-modal-overlay"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="secret-admin-modal-card"
        onClick={e => e.stopPropagation()}
        className={`bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl text-stone-100 relative overflow-hidden transition-transform ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Top Glow & Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600" />

        {/* Close Button */}
        <button
          id="btn-close-secret-admin"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-100 rounded-xl hover:bg-stone-800 transition cursor-pointer"
          title="Close / बंद करें"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-600/30 mb-3.5">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Admin Access</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            एडमिन पैनल अनलॉक करें
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xs">
            Enter master restaurant administrator password to unlock management dashboard.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1.5 uppercase tracking-wider">
              Admin Master Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                ref={inputRef}
                id="input-secret-admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter password..."
                className="w-full bg-stone-950 border border-stone-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 text-white rounded-2xl pl-10 pr-12 py-3.5 text-sm font-medium transition placeholder:text-stone-600 outline-hidden"
              />
              <button
                type="button"
                id="btn-toggle-show-password"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-200 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="font-semibold">{error}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              id="btn-submit-secret-admin"
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>प्रवेश करें / Unlock Dashboard</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-semibold hover:bg-stone-800/50 transition cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-5 pt-4 border-t border-stone-800/80 text-center">
          <p className="text-[11px] text-stone-500 leading-relaxed">
            🔒 This secret door is strictly protected for authorized restaurant managers and staff.
          </p>
        </div>
      </div>
    </div>
  );
};
