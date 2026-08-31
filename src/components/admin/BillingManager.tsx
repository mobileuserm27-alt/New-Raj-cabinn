import React, { useState } from 'react';
import { Receipt, CreditCard, Banknote, QrCode, CheckCircle2, Printer, Search, ArrowRight, DollarSign, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { EndOfDayReportModal } from './EndOfDayReportModal';

export const BillingManager: React.FC = () => {
  const { orders, updateOrderPayment, restaurant, showToast } = useApp();

  const [filter, setFilter] = useState<'pending' | 'paid' | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [showZReportModal, setShowZReportModal] = useState<boolean>(false);

  const currency = restaurant?.branding.currencySymbol || '₹';

  const nonCancelledOrders = orders.filter(o => o.status !== 'cancelled');

  const filtered = nonCancelledOrders.filter(order => {
    if (filter === 'pending' && order.paymentStatus === 'paid') return false;
    if (filter === 'paid' && order.paymentStatus !== 'paid') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchTable = `table ${order.tableNumber}`.toLowerCase().includes(q) || order.tableNumber.includes(q);
      if (!matchNum && !matchTable) return false;
    }
    return true;
  });

  const handleSettle = async (orderId: string, method: 'cash' | 'upi' | 'card') => {
    await updateOrderPayment(orderId, 'paid', method);
    showToast('Bill Settled', `Payment recorded via ${method.toUpperCase()}`, 'success');
  };

  const handlePrint = (order: Order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-stone-900">Billing & Settlements</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs">
              {nonCancelledOrders.filter(o => o.paymentStatus !== 'paid').length} Unpaid Tables
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Collect payment via UPI, Cash, or Card and print thermal bill receipts
          </p>
        </div>

        {/* Actions & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-billing-z-report"
            type="button"
            onClick={() => setShowZReportModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-rose-400" />
            <span>End-of-Day Z-Report</span>
          </button>

          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl">
            <button
              id="billing-filter-pending"
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'pending' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              Pending ({nonCancelledOrders.filter(o => o.paymentStatus !== 'paid').length})
            </button>
            <button
              id="billing-filter-paid"
              type="button"
              onClick={() => setFilter('paid')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'paid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              Settled ({nonCancelledOrders.filter(o => o.paymentStatus === 'paid').length})
            </button>
            <button
              id="billing-filter-all"
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(order => {
          const isPaid = order.paymentStatus === 'paid';

          return (
            <div
              key={order.id}
              id={`billing-card-${order.id}`}
              className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-xs ${
                isPaid ? 'border-stone-200 opacity-80' : 'border-rose-200 ring-2 ring-rose-500/10'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div>
                    <span className="px-2.5 py-1 rounded-xl bg-stone-900 text-white font-black text-xs">
                      TABLE #{order.tableNumber}
                    </span>
                    <span className="ml-2 font-mono text-xs font-bold text-stone-600">
                      {order.orderNumber}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}
                  >
                    {isPaid ? `PAID (${order.paymentMethod?.toUpperCase()})` : 'UNPAID'}
                  </span>
                </div>

                {/* Items preview */}
                <div className="py-3 space-y-1 text-xs">
                  {(order.items || []).map(it => (
                    <div key={it.id} className="flex justify-between text-stone-700">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-semibold">{currency}{it.totalPrice}</span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-2 border-t border-stone-100 space-y-1 text-xs">
                  <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-1">
                    <span>Bill Total</span>
                    <span className="text-rose-600">{currency}{order.grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-stone-100 space-y-2">
                {!isPaid ? (
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      id={`btn-pay-upi-${order.id}`}
                      type="button"
                      onClick={() => handleSettle(order.id, 'upi')}
                      className="py-2 px-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex flex-col items-center justify-center transition"
                    >
                      <QrCode className="w-3.5 h-3.5 mb-0.5 text-emerald-600" />
                      <span>UPI / QR</span>
                    </button>
                    <button
                      id={`btn-pay-cash-${order.id}`}
                      type="button"
                      onClick={() => handleSettle(order.id, 'cash')}
                      className="py-2 px-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex flex-col items-center justify-center transition"
                    >
                      <Banknote className="w-3.5 h-3.5 mb-0.5 text-emerald-600" />
                      <span>Cash</span>
                    </button>
                    <button
                      id={`btn-pay-card-${order.id}`}
                      type="button"
                      onClick={() => handleSettle(order.id, 'card')}
                      className="py-2 px-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex flex-col items-center justify-center transition"
                    >
                      <CreditCard className="w-3.5 h-3.5 mb-0.5 text-emerald-600" />
                      <span>Card POS</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Settled</span>
                    </span>
                    <button
                      id={`btn-print-invoice-${order.id}`}
                      type="button"
                      onClick={() => handlePrint(order)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-stone-500" />
                      <span>Print Bill</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden printable receipt */}
      {printingOrder && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 text-black font-mono text-sm">
          <div className="text-center pb-4 border-b border-black">
            <h1 className="text-xl font-bold">{restaurant?.name}</h1>
            <p className="text-xs">{restaurant?.address}, {restaurant?.city}</p>
            <p className="text-xs">Phone: {restaurant?.phone}</p>
            <h2 className="text-base font-black mt-2">BILL RECEIPT</h2>
          </div>

          <div className="py-2 border-b border-black flex justify-between text-xs">
            <span>BILL: #{printingOrder.orderNumber}</span>
            <span>TABLE: #{printingOrder.tableNumber}</span>
          </div>

          <div className="py-2 text-xs flex justify-between">
            <span>Date: {new Date(printingOrder.createdAt).toLocaleDateString()}</span>
            <span>Time: {new Date(printingOrder.createdAt).toLocaleTimeString()}</span>
          </div>

          <div className="py-3 border-y border-black">
            {(printingOrder?.items || []).map(it => (
              <div key={it.id} className="flex justify-between py-1 text-xs">
                <span>{it.quantity}x {it.name}</span>
                <span>{currency}{it.totalPrice}</span>
              </div>
            ))}
          </div>

          <div className="py-2 text-right space-y-1 text-xs">
            <div className="text-base font-bold pt-1 border-t border-black">
              TOTAL PAID: {currency}{printingOrder.grandTotal}
            </div>
            <div className="text-[10px] text-stone-600">
              Payment Mode: {printingOrder.paymentMethod?.toUpperCase() || 'PAID'}
            </div>
          </div>

          <div className="text-center pt-6 text-xs">
            <p>Thank you for dining with {restaurant?.name}!</p>
            <p>Have a Wonderful Day</p>
          </div>
        </div>
      )}

      {/* End of Day Z-Report Modal */}
      <EndOfDayReportModal
        isOpen={showZReportModal}
        onClose={() => setShowZReportModal(false)}
      />
    </div>
  );
};
