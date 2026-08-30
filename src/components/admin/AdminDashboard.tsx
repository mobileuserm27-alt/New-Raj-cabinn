import React from 'react';
import {
  ShoppingBag,
  UtensilsCrossed,
  Layers,
  QrCode,
  Receipt,
  TrendingUp,
  Users,
  Store,
  Sparkles,
  Volume2,
  VolumeX,
  ExternalLink,
  ArrowLeft,
  LogOut,
  Radio,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrdersManager } from './OrdersManager';
import { MenuManager } from './MenuManager';
import { CategoryManager } from './CategoryManager';
import { TableManager } from './TableManager';
import { BillingManager } from './BillingManager';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { StaffManager } from './StaffManager';
import { RestaurantProfile } from './RestaurantProfile';
import { OnboardingWizard } from './OnboardingWizard';
import { AdminTab } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    restaurant,
    adminTab,
    setAdminTab,
    orders,
    soundEnabled,
    setSoundEnabled,
    setView,
    openCustomerMenuForTable,
    currentStaff,
    lockAdmin
  } = useApp();

  const pendingOrdersCount = orders.filter(o => o.status === 'received').length;

  const navItems: { id: AdminTab; label: string; icon: any; badge?: number; badgeColor?: string }[] = [
    {
      id: 'orders',
      label: 'Live Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-rose-600 text-white'
    },
    { id: 'billing', label: 'Billing & Invoices', icon: Receipt },
    { id: 'tables', label: 'Tables & QR', icon: QrCode },
    { id: 'menu', label: 'Menu Items', icon: UtensilsCrossed },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'staff', label: 'Staff & Roles', icon: Users },
    { id: 'profile', label: 'Restaurant Settings', icon: Store },
    { id: 'onboarding', label: 'Setup Guide', icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-stone-900 text-white border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand & Restaurant switcher */}
          <div className="flex items-center gap-3">
            <button
              id="btn-admin-home"
              onClick={lockAdmin}
              className="p-1.5 -ml-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
              title="Lock Admin & Return to Dining Screen"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {restaurant?.branding.logoUrl ? (
              <img
                src={restaurant.branding.logoUrl}
                alt={restaurant.name}
                className="w-9 h-9 rounded-xl object-cover border border-stone-700"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center font-black text-sm">
                S&D
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base leading-tight truncate">
                  {restaurant?.name || 'New Raj Cabin'}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  Owner Master Control
                </span>
              </div>
              <p className="text-[11px] text-stone-400 truncate hidden sm:block">
                Counter POS & Kitchen Dispatch • Owner Central Dashboard
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Audio chime toggle */}
            <button
              id="btn-admin-audio-toggle"
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition ${
                soundEnabled
                  ? 'bg-rose-600/20 border-rose-500/40 text-rose-300'
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
              title="Toggle Audio Notifications"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Test Customer Table Menu Button */}
            <button
              id="btn-test-customer-menu"
              type="button"
              onClick={() => openCustomerMenuForTable('12')}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-stone-700 transition cursor-pointer"
              title="Open Customer Dining Menu (Table #12)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table Menu</span>
            </button>

            {/* Secure Lock / Exit Admin Button */}
            <button
              id="btn-lock-admin"
              type="button"
              onClick={lockAdmin}
              className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 hover:border-rose-600 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Lock Admin & Return to Customer Mode (एडमिन लॉक करें)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Admin</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="border-t border-stone-800/80 bg-stone-950/80 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
            {navItems.map(item => {
              const isActive = adminTab === item.id;
              const IconComp = item.icon;

              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  type="button"
                  onClick={() => setAdminTab(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-white text-rose-600' : item.badgeColor || 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Tab View Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {(adminTab === 'orders' || adminTab === 'kds' || adminTab === 'waiter_calls') && <OrdersManager />}
        {adminTab === 'menu' && <MenuManager />}
        {adminTab === 'categories' && <CategoryManager />}
        {adminTab === 'tables' && <TableManager />}
        {adminTab === 'billing' && <BillingManager />}
        {adminTab === 'analytics' && <AnalyticsDashboard />}
        {adminTab === 'staff' && <StaffManager />}
        {adminTab === 'profile' && <RestaurantProfile />}
        {adminTab === 'onboarding' && <OnboardingWizard onFinish={() => setAdminTab('orders')} />}
      </main>
    </div>
  );
};
