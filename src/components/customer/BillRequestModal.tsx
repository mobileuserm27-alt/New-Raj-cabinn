import React, { useState } from 'react';
import { X, Receipt, CreditCard, Banknote, QrCode, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BillRequestModal: React.FC = () => {
  const { isBillRequestOpen, setIsBillRequestOpen, submitWaiterCall, activeTableNumber, restaurant, t, customerOrders } = useApp();

  const [paymentPreference, setPaymentPreference] = useState<'upi' | 'cash' | 'card'>('upi');
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isBillRequestOpen) return null;

  const currency = restaurant?.branding.currencySymbol || '₹';

  // Calculate customer's own order total only (protects privacy so other people's orders or totals are never exposed)
  const tableOrders = customerOrders.filter(o => o.tableNumber === activeTableNumber && o.status !== 'cancelled');
  const currentTotal = tableOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await submitWaiterCall('bill', `Payment preference: ${paymentPreference.toUpperCase()}`);
      setIsSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        id="bill-request-modal"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">{t.requestBill}</h2>
              <p className="text-xs text-stone-500 font-medium">Table #{activeTableNumber}</p>
            </div>
          </div>
          <button
            id="btn-close-bill-modal"
            onClick={() => {
              setIsBillRequestOpen(false);
              setIsSent(false);
            }}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-stone-900">{t.billRequestedSuccess}</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Our staff has been notified for Table #{activeTableNumber} with payment preference ({paymentPreference.toUpperCase()}).
            </p>
            <button
              id="btn-bill-sent-close"
              type="button"
              onClick={() => {
                setIsBillRequestOpen(false);
                setIsSent(false);
              }}
              className="mt-4 px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs"
            >
              {t.close}
            </button>
          </div>
        ) : (
          <>
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2">
              <div className="flex justify-between text-xs text-stone-500">
                <span>Restaurant</span>
                <span className="font-semibold text-stone-800">{restaurant?.name}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-500">
                <span>Table</span>
                <span className="font-bold text-stone-900">#{activeTableNumber}</span>
              </div>
              {currentTotal > 0 && (
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Current Bill Total</span>
                  <span className="text-emerald-700 text-base font-extrabold">{currency}{currentTotal}</span>
                </div>
              )}
            </div>

            {/* Payment method selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Preferred Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="pay-method-upi"
                  type="button"
                  onClick={() => setPaymentPreference('upi')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                    paymentPreference === 'upi'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-600'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  <QrCode className="w-5 h-5 mb-1 text-emerald-600" />
                  <span className="text-xs">UPI / QR</span>
                </button>

                <button
                  id="pay-method-cash"
                  type="button"
                  onClick={() => setPaymentPreference('cash')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                    paymentPreference === 'cash'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-600'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  <Banknote className="w-5 h-5 mb-1 text-emerald-600" />
                  <span className="text-xs">Cash</span>
                </button>

                <button
                  id="pay-method-card"
                  type="button"
                  onClick={() => setPaymentPreference('card')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                    paymentPreference === 'card'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-600'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1 text-emerald-600" />
                  <span className="text-xs">Card / POS</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 text-center">
              Would you like to request the final printed invoice for Table #{activeTableNumber}?
            </p>

            <button
              id="btn-confirm-request-bill"
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition cursor-pointer"
            >
              {isSubmitting ? 'Requesting...' : t.requestBill}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
