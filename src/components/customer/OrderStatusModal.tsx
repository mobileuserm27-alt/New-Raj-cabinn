import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Clock, ChefHat, Bell, Receipt, Sparkles, AlertCircle, XCircle, AlertTriangle, UtensilsCrossed } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';

interface OrderStatusModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({ order, onClose }) => {
  const { restaurant, t, setIsBillRequestOpen, cancelCustomerOrder, setIsCallWaiterOpen, language } = useApp();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('Placed by mistake');
  const [isCancelling, setIsCancelling] = useState(false);

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

  const isCancelled = order.status === 'cancelled';
  const canCancel = !isCancelled && ['received', 'accepted', 'preparing'].includes(order.status) && order.paymentStatus !== 'paid';

  const cancellationReasons = language === 'hi'
    ? [
        'गलती से ऑर्डर हो गया',
        'आइटम बदलना चाहते हैं',
        'बहुत देर हो रही है',
        'टेबल बदलना है',
        'अन्य कारण'
      ]
    : [
        'Placed by mistake',
        'Want to change items',
        'Waiting too long',
        'Changing table',
        'Other reason'
      ];

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelCustomerOrder(order.id, selectedReason);
      setShowCancelConfirm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCancelling(false);
    }
  };

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
        <div
          className={`p-6 text-white text-center relative ${
            isCancelled
              ? 'bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900'
              : 'bg-gradient-to-r from-rose-600 to-rose-700'
          }`}
        >
          <button
            id="btn-close-status-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
            <span>{restaurant?.name}</span>
            <span>•</span>
            <span>{t.table} #{order.tableNumber}</span>
          </div>

          {isCancelled ? (
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/80 text-white text-xs font-extrabold uppercase tracking-wider mb-2 animate-pulse">
                <XCircle className="w-4 h-4" />
                <span>{t.orderCancelled}</span>
              </div>
              <h2 className="text-2xl font-black">{t.orderCancelled}</h2>
              <p className="text-xs text-stone-300 mt-1">
                {t.orderId}: <strong className="text-white font-mono">{order.orderNumber}</strong>
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-black">{t.orderSuccess}</h2>
              <div className="flex items-center justify-center gap-3 mt-2 text-sm text-rose-100 font-mono">
                <span>{t.orderId}: <strong className="text-white">{order.orderNumber}</strong></span>
                <span>•</span>
                <span>⏱️ {order.estimatedPrepTimeMinutes || 20} {t.mins}</span>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal Overlay for Cancellation */}
        {showCancelConfirm ? (
          <div className="p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-stone-900">
                {t.cancelOrderConfirmTitle}
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                {t.cancelOrderConfirmDesc}
              </p>
            </div>

            {/* Quick Reasons Chips */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                {language === 'hi' ? 'कैंसिल करने का कारण:' : 'Reason for cancellation:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {cancellationReasons.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedReason(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      selectedReason === r
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirmation actions */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <button
                id="btn-confirm-cancel-order"
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? (
                  <span>{language === 'hi' ? 'कैंसिल किया जा रहा है...' : 'Cancelling Order...'}</span>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>{language === 'hi' ? 'हाँ, आर्डर कैंसिल करें' : 'Yes, Cancel This Order'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setShowCancelConfirm(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
              >
                {language === 'hi' ? 'नहीं, ऑर्डर रहने दें' : 'No, Keep My Order'}
              </button>
            </div>
          </div>
        ) : (
          /* Normal Timeline & Summary Body */
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {isCancelled ? (
              /* Cancelled Information Banner */
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-rose-900">
                      {t.orderCancelled}
                    </h4>
                    <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                      {t.orderCancelledNotice}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Status Timeline */
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
            )}

            {/* Ordered items overview */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold text-stone-600 border-b border-stone-200 pb-2">
                <span>{isCancelled ? 'Cancelled Items' : 'Order Summary'}</span>
                <span className={isCancelled ? 'line-through text-stone-400' : ''}>
                  Total: {currency}{order.grandTotal}
                </span>
              </div>
              <div className="divide-y divide-stone-200/60 text-xs">
                {(order.items || []).map(item => (
                  <div key={item.id} className="py-1.5 flex justify-between">
                    <span className={`font-medium ${isCancelled ? 'text-stone-500 line-through' : 'text-stone-800'}`}>
                      {item.quantity}x {item.name}
                    </span>
                    <span className={`font-semibold ${isCancelled ? 'text-stone-400 line-through' : 'text-stone-700'}`}>
                      {currency}{item.totalPrice}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Cancel Order Prompt if cancellable */}
            {canCancel && (
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-stone-800">
                    {language === 'hi' ? 'गलत ऑर्डर हो गया?' : 'Ordered by mistake?'}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {language === 'hi' ? 'तैयार होने से पहले आप इसे कैंसिल कर सकते हैं' : 'You can cancel before food is served'}
                  </p>
                </div>

                <button
                  id="btn-open-cancel-confirm"
                  type="button"
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0 shadow-xs"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.cancelOrder}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick action footer */}
        {!showCancelConfirm && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-2.5">
            {isCancelled ? (
              <>
                <button
                  id="btn-status-reorder"
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 transition active:scale-[0.99] cursor-pointer"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>{t.orderAgain}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCallWaiterOpen(true)}
                  className="py-3 px-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-[0.99] cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-stone-600" />
                  <span>{t.callWaiter}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  id="btn-status-close-menu"
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-3 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-[0.99] cursor-pointer"
                >
                  <span>✕ {t.close} & Order More</span>
                </button>

                <button
                  id="btn-status-request-bill"
                  type="button"
                  onClick={() => setIsBillRequestOpen(true)}
                  className="flex-1 py-3 px-3 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer"
                >
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>{t.requestBill}</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

