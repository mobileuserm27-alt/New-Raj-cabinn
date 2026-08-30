import React, { useState } from 'react';
import { Users, Plus, Shield, Check, Trash2, Key, UserCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StaffMember, StaffRole } from '../../types';

export const StaffManager: React.FC = () => {
  const { staffList, addStaffMember, currentStaff, showToast } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('waiter');
  const [pin, setPin] = useState('1234');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    await addStaffMember({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      role,
      pin: pin.trim() || '1234',
      isActive: true
    });

    showToast('Staff Member Added', `${name} invited as ${role.toUpperCase()}`, 'success');
    setName('');
    setEmail('');
    setPhone('');
    setIsAddOpen(false);
  };

  const getRoleBadge = (r: StaffRole) => {
    switch (r) {
      case 'owner':
        return <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold">OWNER (Full Access)</span>;
      case 'manager':
        return <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 text-xs font-bold">MANAGER (Orders & Menu)</span>;
      case 'waiter':
        return <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">WAITER (Service Hub)</span>;
      case 'kitchen':
        return <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold">KITCHEN (KDS View)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900">Staff & Role-Based Access</h2>
          <p className="text-xs text-stone-500">
            Control permissions for Managers, Waiters, Kitchen Chefs, and Billing Cashiers
          </p>
        </div>

        <button
          id="btn-add-staff"
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-600/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Staff Member</span>
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(staffList || []).map(staff => (
          <div
            key={staff.id}
            id={`staff-card-${staff.id}`}
            className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between hover:border-stone-300 transition"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white font-extrabold text-sm flex items-center justify-center">
                  {staff.name.charAt(0).toUpperCase()}
                </div>
                {getRoleBadge(staff.role)}
              </div>

              <div className="mt-3 space-y-1">
                <h3 className="font-bold text-stone-900 text-sm">{staff.name}</h3>
                <p className="text-xs text-stone-500">{staff.email}</p>
                {staff.phone && (
                  <p className="text-[11px] text-stone-400">📞 {staff.phone}</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-stone-400" />
                <span>PIN: ••••</span>
              </span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Active</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            id="add-staff-modal"
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-stone-900">Add Staff Account</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-stone-500">Full Name *</label>
                <input
                  id="input-staff-name"
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-stone-500">Email Address *</label>
                <input
                  id="input-staff-email"
                  type="email"
                  required
                  placeholder="e.g. ramesh@restaurant.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-stone-500">Phone Number (Optional)</label>
                <input
                  id="input-staff-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-stone-500">Staff Role & Access *</label>
                <select
                  id="select-staff-role"
                  value={role}
                  onChange={e => setRole(e.target.value as StaffRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
                >
                  <option value="waiter">🧑‍🍳 Waiter (Orders & Table Alerts)</option>
                  <option value="kitchen">🍳 Kitchen Chef (KDS Only)</option>
                  <option value="manager">📋 Manager (Orders, Menu & Reports)</option>
                  <option value="owner">👑 Owner (Full Unlimited Access)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-stone-500">Fast POS Login PIN (4 Digits)</label>
                <input
                  id="input-staff-pin"
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-staff"
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/25"
                >
                  Add Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
