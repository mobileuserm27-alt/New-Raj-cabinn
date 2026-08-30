import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, Check, Bell, Flame, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { VegBadge } from '../customer/VegBadge';

export const KitchenDisplay: React.FC = () => {
  const { orders, updateOrderStatus, restaurant, showToast } = useApp();
  const [completedItems, setCompletedItems] = useState<{ [itemId: string]: boolean }>({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const toggleItemDone = (itemId: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const newOrders = orders.filter(o => o.status === 'received' || o.status === 'accepted');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  const renderKitchenOrderCard = (order: Order, stage: 'new' | 'prep' | 'ready') => {
    const elapsedMinutes = Math.floor((currentTime - new Date(order.createdAt).getTime()) / 60000);
    const isUrgent = elapsedMinutes > 15;

    return (
      <div
        key={order.id}
        id={`kds-card-${order.id}`}
        className={`bg-stone-900 text-white rounded-3xl p-5 border-2 transition-all flex flex-col justify-between shadow-xl ${
          isUrgent
            ? 'border-rose-500 ring-2 ring-rose-500/30'
            : stage === 'new'
            ? 'border-amber-500/80'
            : stage === 'prep'
            ? 'border-purple-500/80'
            : 'border-emerald-500/80'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-white text-stone-900 font-black text-sm">
                TABLE #{order.tableNumber}
              </span>
              <span className="font-mono text-xs text-stone-400 font-bold">{order.orderNumber}</span>
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                isUrgent ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-stone-800 text-stone-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{elapsedMinutes}m ago</span>
            </div>
          </div>

          {/* Cooking notes alert if any */}
          {order.specialNotes && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Chef Note: {order.specialNotes}</span>
            </div>
          )}

          {/* Dish items checklist */}
          <div className="mt-4 space-y-2.5">
            {(order.items || []).map(item => {
              const isChecked = completedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItemDone(item.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                    isChecked
                      ? 'bg-stone-950/80 border-stone-800 opacity-40 line-through'
                      : 'bg-stone-800/80 border-stone-700 hover:bg-stone-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-500'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <VegBadge type={item.dietType} size="sm" />
                      <span className="font-extrabold text-sm text-white">
                        {item.quantity}x {item.name}
                      </span>
                    </div>
                    {item.selectedVariantName && (
                      <div className="text-xs text-stone-400 pl-4">{item.selectedVariantName}</div>
                    )}
                    {item.selectedAddonNames && item.selectedAddonNames.length > 0 && (
                      <div className="text-[11px] text-amber-300 pl-4">
                        + {item.selectedAddonNames.join(', ')}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <div className="text-[11px] text-rose-300 pl-4 font-mono">
                        &quot;{item.specialInstructions}&quot;
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-3 border-t border-stone-800">
          {stage === 'new' && (
            <button
              id={`kds-btn-start-${order.id}`}
              type="button"
              onClick={() => {
                updateOrderStatus(order.id, 'preparing');
                showToast('Kitchen Started', `Table ${order.tableNumber} in progress`, 'info');
              }}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-stone-950 font-black text-sm flex items-center justify-center gap-2 transition"
            >
              <ChefHat className="w-4 h-4" />
              <span>START COOKING</span>
            </button>
          )}

          {stage === 'prep' && (
            <button
              id={`kds-btn-ready-${order.id}`}
              type="button"
              onClick={() => {
                updateOrderStatus(order.id, 'ready');
                showToast('Dish Ready!', `Table ${order.tableNumber} ready to plate`, 'success');
              }}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-stone-950 font-black text-sm flex items-center justify-center gap-2 transition"
            >
              <Bell className="w-4 h-4" />
              <span>MARK ALL READY</span>
            </button>
          )}

          {stage === 'ready' && (
            <button
              id={`kds-btn-serve-${order.id}`}
              type="button"
              onClick={() => {
                updateOrderStatus(order.id, 'served');
                showToast('Order Served', `Table ${order.tableNumber} delivered`, 'info');
              }}
              className="w-full py-3 rounded-2xl bg-stone-700 hover:bg-stone-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>DISPATCHED / SERVED</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-600 text-white">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black">Kitchen Display System (KDS)</h2>
            <p className="text-xs text-stone-400">Live Touch-Screen Ticket Queue for Kitchen & Chefs</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-stone-800 text-xs font-bold text-stone-300">
            {newOrders.length + preparingOrders.length} Active Tickets
          </span>
        </div>
      </div>

      {/* 3-Column Kitchen Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Col 1: New / Accepted */}
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>1. QUEUE / NEW ORDERS</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-900 font-extrabold text-xs">
              {newOrders.length}
            </span>
          </div>

          <div className="space-y-4">
            {newOrders.length === 0 ? (
              <div className="p-8 text-center text-stone-400 bg-white rounded-2xl border border-stone-200 text-xs">
                No tickets waiting in queue
              </div>
            ) : (
              newOrders.map(o => renderKitchenOrderCard(o, 'new'))
            )}
          </div>
        </div>

        {/* Col 2: Preparing */}
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-purple-900 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              <span>2. IN PREPARATION / ON RANGE</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-extrabold text-xs">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-4">
            {preparingOrders.length === 0 ? (
              <div className="p-8 text-center text-stone-400 bg-white rounded-2xl border border-stone-200 text-xs">
                No orders currently on stove
              </div>
            ) : (
              preparingOrders.map(o => renderKitchenOrderCard(o, 'prep'))
            )}
          </div>
        </div>

        {/* Col 3: Ready to Serve */}
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>3. PLATED & READY FOR RUNNER</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-xs">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-4">
            {readyOrders.length === 0 ? (
              <div className="p-8 text-center text-stone-400 bg-white rounded-2xl border border-stone-200 text-xs">
                No dishes waiting for pickup
              </div>
            ) : (
              readyOrders.map(o => renderKitchenOrderCard(o, 'ready'))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
