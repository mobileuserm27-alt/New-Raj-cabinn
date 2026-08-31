import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  QrCode,
  Download,
  Printer,
  CheckCircle2,
  Share2,
  ShoppingBag,
  Flame,
  Award,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';

export const EndOfDayReportModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { orders, restaurant, showToast } = useApp();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const currency = restaurant?.branding.currencySymbol || '₹';

  // Filter orders for selected date
  const dayOrders = orders.filter(o => {
    if (!o.createdAt) return false;
    const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
    return orderDate === selectedDate;
  });

  const validOrders = dayOrders.filter(o => o.status !== 'cancelled');
  const cancelledOrders = dayOrders.filter(o => o.status === 'cancelled');

  // Revenue totals
  const totalSales = validOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalDiscount = validOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const totalTax = validOrders.reduce((sum, o) => sum + (o.taxAmount || 0), 0);
  const subtotal = validOrders.reduce((sum, o) => sum + (o.subtotal || o.grandTotal), 0);

  // Payment Breakdown
  const cashSales = validOrders
    .filter(o => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const upiSales = validOrders
    .filter(o => o.paymentMethod === 'upi')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const cardSales = validOrders
    .filter(o => o.paymentMethod === 'card')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const unpaidSales = validOrders
    .filter(o => o.paymentStatus !== 'paid')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  // Top Sold Dishes
  const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();
  validOrders.forEach(o => {
    (o.items || []).forEach(it => {
      const curr = itemMap.get(it.name) || { name: it.name, quantity: 0, revenue: 0 };
      curr.quantity += it.quantity;
      curr.revenue += it.totalPrice;
      itemMap.set(it.name, curr);
    });
  });

  const topItems = Array.from(itemMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const avgTicketSize = validOrders.length > 0 ? Math.round(totalSales / validOrders.length) : 0;

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // WhatsApp Share Handler
  const handleShareWhatsApp = () => {
    const formattedDate = new Date(selectedDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    let text = `📊 *Daily Z-Report / End-of-Day Summary*\n`;
    text += `🏬 *${restaurant?.name || 'New Raj Cabin'}*\n`;
    text += `📅 *Date:* ${formattedDate}\n\n`;
    text += `💰 *Total Sales:* ${currency}${totalSales.toLocaleString()}\n`;
    text += `📦 *Total Orders:* ${validOrders.length} served (${cancelledOrders.length} cancelled)\n`;
    text += `🎯 *Avg Order Value:* ${currency}${avgTicketSize}\n\n`;
    text += `💳 *Payment Breakdown:*\n`;
    text += `  • UPI / QR: ${currency}${upiSales.toLocaleString()}\n`;
    text += `  • Cash: ${currency}${cashSales.toLocaleString()}\n`;
    text += `  • Card POS: ${currency}${cardSales.toLocaleString()}\n`;
    if (unpaidSales > 0) {
      text += `  • ⚠️ Uncollected / Pending: ${currency}${unpaidSales.toLocaleString()}\n`;
    }
    text += `\n🔥 *Top Selling Dishes:*\n`;
    topItems.forEach((it, idx) => {
      text += `  ${idx + 1}. ${it.name} (${it.quantity}x) - ${currency}${it.revenue}\n`;
    });
    text += `\n_Generated via S&D Smart Restaurant POS_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    showToast('WhatsApp Summary', 'Opening WhatsApp to share daily summary!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6 border border-stone-200 my-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-black text-stone-900 text-lg sm:text-xl">
                End-of-Day Sales Report (Z-Report)
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Daily revenue closure, payment settlement & bestselling dishes breakdown
            </p>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 bg-stone-50 focus:bg-white focus:outline-rose-500"
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Big Highlights Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-rose-50/70 border border-rose-200/80 p-3.5 rounded-2xl">
            <div className="text-[10px] font-extrabold uppercase text-rose-700 tracking-wider">
              Total Day Revenue
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-900 mt-1">
              {currency}{totalSales.toLocaleString()}
            </div>
            <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
              Net settlement
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-2xl">
            <div className="text-[10px] font-extrabold uppercase text-stone-500 tracking-wider">
              Completed Orders
            </div>
            <div className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
              {validOrders.length}
            </div>
            <div className="text-[10px] text-stone-500 font-medium mt-0.5">
              {cancelledOrders.length} cancelled
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-2xl">
            <div className="text-[10px] font-extrabold uppercase text-stone-500 tracking-wider">
              Avg Ticket Size
            </div>
            <div className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
              {currency}{avgTicketSize}
            </div>
            <div className="text-[10px] text-stone-500 font-medium mt-0.5">
              Per order average
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl">
            <div className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">
              GST Collected
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-1">
              {currency}{Math.round(totalTax).toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
              Tax liability
            </div>
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 space-y-3">
          <h4 className="font-extrabold text-xs text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-stone-500" />
            <span>Payment Mode Breakdown (Cash vs UPI vs Card)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">UPI / QR</div>
                  <div className="text-[10px] text-stone-500">GPay, PhonePe, Paytm</div>
                </div>
              </div>
              <div className="font-black text-stone-900 text-sm">
                {currency}{upiSales.toLocaleString()}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <Banknote className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">Cash Counter</div>
                  <div className="text-[10px] text-stone-500">Physical Cash Drawer</div>
                </div>
              </div>
              <div className="font-black text-stone-900 text-sm">
                {currency}{cashSales.toLocaleString()}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-stone-900">Card POS</div>
                  <div className="text-[10px] text-stone-500">Debit / Credit Machine</div>
                </div>
              </div>
              <div className="font-black text-stone-900 text-sm">
                {currency}{cardSales.toLocaleString()}
              </div>
            </div>
          </div>

          {unpaidSales > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-800">
              <span className="font-semibold">⚠️ Pending / Unsettled Active Tables:</span>
              <span className="font-black text-sm">{currency}{unpaidSales.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Top Selling Items of the Day */}
        <div className="space-y-2.5">
          <h4 className="font-extrabold text-xs text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Top 5 Best-Selling Dishes Today</span>
          </h4>

          {topItems.length === 0 ? (
            <p className="text-xs text-stone-400 italic py-2">No orders recorded for this date.</p>
          ) : (
            <div className="space-y-1.5">
              {topItems.map((it, idx) => (
                <div
                  key={it.name}
                  className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-black text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-stone-900">{it.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-stone-500 font-medium">{it.quantity} sold</span>
                    <span className="font-extrabold text-stone-900">{currency}{it.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons: Print & WhatsApp */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-stone-100">
          <button
            id="btn-print-day-report"
            type="button"
            onClick={handlePrint}
            className="w-full sm:flex-1 py-3 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-black shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-rose-400" />
            <span>Print End-of-Day Z-Report</span>
          </button>

          <button
            id="btn-whatsapp-day-report"
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full sm:flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Summary on WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Printable Z-Report Sheet */}
      <div className="hidden print:block fixed inset-0 bg-white p-8 text-black font-mono text-xs">
        <div className="text-center pb-3 border-b border-black">
          <h1 className="text-lg font-black">{restaurant?.name || 'NEW RAJ CABIN'}</h1>
          <p className="text-[10px]">{restaurant?.address}, {restaurant?.city}</p>
          <p className="text-[10px]">GSTIN: {restaurant?.branding.gstNumber || 'N/A'}</p>
          <h2 className="text-sm font-black mt-2">END-OF-DAY CLOSING REPORT (Z-REPORT)</h2>
          <p className="text-[10px]">Date: {selectedDate} | Time: {new Date().toLocaleTimeString()}</p>
        </div>

        <div className="py-2 border-b border-black space-y-1">
          <div className="flex justify-between font-bold">
            <span>TOTAL NET SALES:</span>
            <span>{currency}{totalSales.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Total Orders Served:</span>
            <span>{validOrders.length}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Average Order Value:</span>
            <span>{currency}{avgTicketSize}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>GST Tax Liability (5%):</span>
            <span>{currency}{Math.round(totalTax).toLocaleString()}</span>
          </div>
        </div>

        <div className="py-2 border-b border-black space-y-1">
          <div className="font-bold">PAYMENT SETTLEMENT:</div>
          <div className="flex justify-between text-[11px]">
            <span>UPI / Digital QR:</span>
            <span>{currency}{upiSales.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Cash Drawer:</span>
            <span>{currency}{cashSales.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Card Machine POS:</span>
            <span>{currency}{cardSales.toLocaleString()}</span>
          </div>
        </div>

        <div className="py-2 border-b border-black space-y-1">
          <div className="font-bold">TOP 5 DISHES:</div>
          {topItems.map((it, idx) => (
            <div key={it.name} className="flex justify-between text-[10px]">
              <span>{idx + 1}. {it.name} ({it.quantity}x)</span>
              <span>{currency}{it.revenue}</span>
            </div>
          ))}
        </div>

        <div className="text-center pt-4 text-[10px]">
          <p>*** END OF DAY SUMMARY CLOSED ***</p>
          <p>Generated by S&D Restaurant Intelligence POS</p>
        </div>
      </div>
    </div>
  );
};
