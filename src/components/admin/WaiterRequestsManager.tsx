import React, { useState } from 'react';
import { Bell, Droplets, Receipt, Sparkles, HelpCircle, CheckCircle2, Clock, Check, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WaiterCallRequest } from '../../types';

export const WaiterRequestsManager: React.FC = () => {
  const { waiterRequests, resolveWaiterCall, clearAllWaiterRequests, showToast } = useApp();
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'all'>('pending');

  const filtered = waiterRequests.filter(req => {
    if (filter === 'pending') return req.status === 'pending';
    if (filter === 'resolved') return req.status === 'resolved';
    return true;
  });

  const handleClearAll = async () => {
    await clearAllWaiterRequests();
    showToast('Cleared', 'All waiter requests have been cleared.', 'info');
  };

  const getRequestBadge = (type: WaiterCallRequest['requestType']) => {
    switch (type) {
      case 'call_waiter':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
            <Bell className="w-3.5 h-3.5" />
            <span>Call Waiter</span>
          </div>
        );
      case 'water':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200">
            <Droplets className="w-3.5 h-3.5" />
            <span>Need Water</span>
          </div>
        );
      case 'bill':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
            <Receipt className="w-3.5 h-3.5" />
            <span>Request Bill</span>
          </div>
        );
      case 'clean_table':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clean Table</span>
          </div>
        );
      case 'help':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help / Inquiries</span>
          </div>
        );
    }
  };

  const handleResolve = async (id: string, tableNumber: string) => {
    await resolveWaiterCall(id);
    showToast('Request Attended', `Table #${tableNumber} service request resolved.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-600 text-white">
            <Bell className="w-6 h-6 animate-swing" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900">Table Service & Waiter Alerts</h2>
            <p className="text-xs text-stone-500">Live requests dispatched by seated customers from their tables</p>
          </div>
        </div>

        {/* Filter buttons & Clear button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl">
            <button
              id="btn-filter-waiter-pending"
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'pending' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              Pending ({waiterRequests.filter(r => r.status === 'pending').length})
            </button>
            <button
              id="btn-filter-waiter-resolved"
              type="button"
              onClick={() => setFilter('resolved')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'resolved' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              Resolved
            </button>
            <button
              id="btn-filter-waiter-all"
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              All
            </button>
          </div>

          {waiterRequests.length > 0 && (
            <button
              id="btn-clear-all-waiter-requests"
              type="button"
              onClick={handleClearAll}
              className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Clear all waiter request logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Requests */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-stone-800 text-base">All Tables Attended</h3>
          <p className="text-xs text-stone-500 mt-1">No pending waiter assistance requests right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(filtered || []).map(req => {
            const isPending = req.status === 'pending';
            const timeAgo = Math.round((Date.now() - new Date(req.createdAt).getTime()) / 60000);

            return (
              <div
                key={req.id}
                id={`waiter-req-card-${req.id}`}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-xs ${
                  isPending
                    ? 'bg-white border-rose-300 ring-2 ring-rose-500/20'
                    : 'bg-stone-50 border-stone-200 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-stone-900 text-white font-black text-sm">
                      TABLE #{req.tableNumber}
                    </span>
                    {getRequestBadge(req.requestType)}
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{timeAgo <= 1 ? 'Just now' : `${timeAgo} minutes ago`}</span>
                  </div>

                  {req.note && (
                    <div className="mt-3 p-3 rounded-2xl bg-stone-100 border border-stone-200/80 text-stone-800 text-xs font-medium italic">
                      &quot;{req.note}&quot;
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100">
                  {isPending ? (
                    <button
                      id={`btn-resolve-waiter-${req.id}`}
                      type="button"
                      onClick={() => handleResolve(req.id, req.tableNumber)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>MARK AS ATTENDED</span>
                    </button>
                  ) : (
                    <div className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1 py-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Attended by Staff</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
