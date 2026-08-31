import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  Download,
  Users,
  UtensilsCrossed,
  ArrowUpRight,
  Flame,
  Calendar,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { AnalyticsSummary } from '../../types';
import { EndOfDayReportModal } from './EndOfDayReportModal';

export const AnalyticsDashboard: React.FC = () => {
  const { restaurant, orders, menuItems } = useApp();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showZReportModal, setShowZReportModal] = useState<boolean>(false);

  const currency = restaurant?.branding.currencySymbol || '₹';

  useEffect(() => {
    if (!restaurant) return;
    api.getAnalytics(restaurant.id)
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [restaurant, orders.length]);

  const exportCSV = () => {
    if (!analytics) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Order Number,Table Number,Items,Grand Total,Status,Payment Mode,Date\n';

    orders.forEach(o => {
      const itemsStr = (o.items || []).map(i => `${i.quantity}x ${i.name}`).join('; ');
      csvContent += `"${o.orderNumber}","Table ${o.tableNumber}","${itemsStr}","${o.grandTotal}","${o.status}","${o.paymentMethod || 'N/A'}","${o.createdAt}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${restaurant?.slug}-sales-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.grandTotal, 0);
  const completedOrders = orders.filter(o => o.status === 'served').length;
  const activeOrders = orders.filter(o => ['received', 'accepted', 'preparing', 'ready'].includes(o.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900">Analytics & Sales Reports</h2>
          <p className="text-xs text-stone-500">
            Real-time business intelligence, daily revenue trends, peak ordering hours, and bestsellers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-open-z-report"
            type="button"
            onClick={() => setShowZReportModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>End-of-Day Z-Report</span>
          </button>

          <button
            id="btn-export-csv"
            type="button"
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-rose-400" />
            <span>Export Sales CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Sales</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">
            {currency}{totalRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% from last week</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Orders</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">
            {orders.length}
          </div>
          <div className="text-[11px] text-stone-500 font-medium">
            {completedOrders} served • {activeOrders} in progress
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Avg Ticket Size</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">
            {currency}{orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0}
          </div>
          <div className="text-[11px] text-stone-500 font-medium">
            Per dining table transaction
          </div>
        </div>

        {/* Table Turnover */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Avg Dining Time</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">
            34 mins
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            ⚡ 25% faster QR table turnaround
          </div>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend Area Chart */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">7-Day Revenue Trend</h3>
                <p className="text-xs text-stone-400">Daily sales breakdown ({currency})</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any) => [`${currency}${value}`, 'Sales']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#e11d48"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak Hourly Ordering Times */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Peak Dine-In Hours</h3>
              <p className="text-xs text-stone-400">Order distribution across lunch & dinner services</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.hourlyPeak} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any) => [`${value} Orders`, 'Volume']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Bar dataKey="orders" fill="#1c1917" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Top Performing Dishes & Category Share */}
      {analytics && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-stone-900 text-sm">Top Selling Dishes This Month</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(analytics?.topItems || []).map((dish, i) => (
              <div
                key={dish.name}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-stone-900 text-white font-extrabold text-xs flex items-center justify-center">
                    #{i + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs">{dish.name}</h4>
                    <p className="text-[11px] text-stone-500">{dish.quantity} orders placed</p>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-stone-900">
                  {currency}{dish.revenue.toLocaleString()}
                </span>
              </div>
            ))}
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
