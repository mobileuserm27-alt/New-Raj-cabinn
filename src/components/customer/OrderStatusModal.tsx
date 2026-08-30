import React, { useEffect } from 'react';
import { X, CheckCircle2, Clock, ChefHat, Bell, Receipt, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';

interface OrderStatusModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({ order, onClose }) => {
  const { restaurant, t, setIsBillRequestOpen } = useApp();

  useEffect(() => {
    if (order && order.status === 'received') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
  }, [order?.id]);

  if (!order) return null;

  const currency = restaurant?.branding.currencySymbol || '₹';

  const steps: { status: OrderStatus; label: string; icon: any; desc: string }[] = [
    {
      status: 'received',
      label: t.orderReceived,
      icon: Clock,
      desc: 'Sent to restaurant dashboard'
    },
    {
      status: 'accepted',
      label: t.accepted,
      icon: CheckCircle2,
      desc: 'Manager confirmed your order'
    },
    {
      status: 'preparing',
      label: t.preparing,
      icon: ChefHat,
      desc: 'Chef is cooking your dishes'
    },
    {
      status: 'ready',
      label: t.ready,
      icon: Bell,
      desc: 'Freshly plated & ready to serve'
    },
    {
      status: 'served',
      label: t.served,
      icon: Sparkles,
      desc: 'Delivered to your table'
    }
  ];

  const statusOrder: OrderStatus[] = ['received', 'accepted', 'preparing', 'ready', 'served'];
  const currentIndex = statusOrder.indexOf(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="order-status-modal"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-6 text-white text-center relative">
          <button
            id="btn-close-status-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
            <span>{restaurant?.name}</span>
            <span>•</span>
            <span>{t.table} #{order.tableNumber}</span>
          </div>

          <h2 className="text-2xl font-black">{t.orderSuccess}</h2>
          <div className="flex items-center justify-center gap-3 mt-2 text-sm text-rose-100 font-mono">
            <span>{t.orderId}: <strong className="text-white">{order.orderNumber}</strong></span>
            <span>•</span>
            <span>⏱️ {order.estimatedPrepTimeMinutes || 20} {t.mins}</span>
          </div>
        </div>

        {/* Timeline body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Status Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
              {t.orderStatus} (Real-time Live)
            </h3>

            <div className="space-y-4 relative">
              {steps.map((step, idx) => {
                const isPassed = currentIndex >= idx;
                const isCurrent = currentIndex === idx;
                const IconComponent = step.icon;

                return (
                  <div key={step.status} className="flex items-start gap-4 relative">
                    {/* Vertical line connector */}
                    {idx < steps.length - 1 && (
                      <div
                        className={`absolute left-4 top-8 w-0.5 h-8 -ml-[1px] transition-colors ${
                          currentIndex > idx ? 'bg-emerald-500' : 'bg-stone-200'
                        }`}
                      />
                    )}

                    {/* Step Icon */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all z-10 ${
                        isCurrent
                          ? 'bg-rose-600 text-white ring-4 ring-rose-100 scale-110 animate-pulse'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Step Info */}
                    <div className="flex-1 pb-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${
                            isCurrent ? 'text-rose-600' : isPassed ? 'text-stone-900' : 'text-stone-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-extrabold uppercase animate-pulse">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered items overview */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold text-stone-600 border-b border-stone-200 pb-2">
              <span>Order Summary</span>
              <span>Total: {currency}{order.grandTotal}</span>
            </div>
            <div className="divide-y divide-stone-200/60 text-xs">
              {(order.items || []).map(item => (
                <div key={item.id} className="py-1.5 flex justify-between">
                  <span className="text-stone-800 font-medium">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-semibold text-stone-700">
                    {currency}{item.totalPrice}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick action footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-2">
          <button
            id="btn-status-request-bill"
            type="button"
            onClick={() => setIsBillRequestOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>{t.requestBill}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
