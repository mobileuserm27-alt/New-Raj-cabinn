import React, { useState } from 'react';
import {
  Clock,
  ChefHat,
  Bell,
  Sparkles,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Volume2,
  VolumeX,
  Printer,
  Receipt,
  Trash2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { VegBadge } from '../customer/VegBadge';

export const OrdersManager: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    updateOrderPayment,
    deleteOrder,
    clearAllOrders,
    clearAllWaiterRequests,
    restaurant,
    soundEnabled,
    setSoundEnabled,
    showToast,
    refreshData
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrderForKOT, setSelectedOrderForKOT] = useState<Order | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const currency = restaurant?.branding.currencySymbol || '₹';

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesNum = order.orderNumber.toLowerCase().includes(q);
      const matchesTable = `table ${order.tableNumber}`.toLowerCase().includes(q) || order.tableNumber.includes(q);
      const matchesGuest = order.customerName?.toLowerCase().includes(q);
      if (!matchesNum && !matchesTable && !matchesGuest) return false;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold animate-pulse">NEW ORDER</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold">ACCEPTED</span>;
      case 'preparing':
        return <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold">PREPARING 🍳</span>;
      case 'ready':
        return <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">READY TO SERVE 🔔</span>;
      case 'served':
        return <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-bold">SERVED</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold">CANCELLED</span>;
    }
  };

  const handlePrintKOT = (order: Order) => {
    setSelectedOrderForKOT(order);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDeleteSingleOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOrder(orderToDelete.id);
      showToast('Order Deleted', `Order ${orderToDelete.orderNumber} (Table ${orderToDelete.tableNumber}) has been deleted.`, 'info');
      setOrderToDelete(null);
    } catch (e) {
      showToast('Error', 'Failed to delete order.', 'warn');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAllOrders = async () => {
    setIsDeleting(true);
    try {
      await clearAllOrders();
      await clearAllWaiterRequests();
      showToast('Order History Cleared', 'All orders & requests have been successfully deleted and tables reset to available.', 'success');
      setShowClearAllModal(false);
    } catch (e) {
      showToast('Error', 'Failed to clear order history.', 'warn');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-stone-900">Live Orders & History</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-extrabold text-xs">
              {orders.filter(o => ['received', 'accepted', 'preparing', 'ready'].includes(o.status)).length} Active
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time incoming orders from QR tables • Manage, serve, or delete order records
          </p>
        </div>

        {/* Action icons & Clear History Button */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Refresh data button */}
          <button
            id="btn-refresh-orders"
            type="button"
            onClick={() => {
              refreshData();
              showToast('Refreshed', 'Orders and table status updated', 'info');
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition flex items-center gap-1.5 cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Audio chime toggle */}
          <button
            id="btn-toggle-sound"
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-stone-50 border-stone-200 text-stone-500'
            }`}
            title="Toggle Order Sound Chime"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>Sound {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Delete / Clear All Orders Button */}
          {orders.length > 0 && (
            <button
              id="btn-clear-all-orders"
              type="button"
              onClick={() => setShowClearAllModal(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Delete all order history and reset tables"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Delete History ({orders.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-stone-200/60 rounded-2xl">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'received', label: 'Pending', count: orders.filter(o => o.status === 'received').length },
            { id: 'accepted', label: 'Accepted', count: orders.filter(o => o.status === 'accepted').length },
            { id: 'preparing', label: 'In Kitchen', count: orders.filter(o => o.status === 'preparing').length },
            { id: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
            { id: 'served', label: 'Served', count: orders.filter(o => o.status === 'served').length }
          ].map(tab => (
            <button
              key={tab.id}
              id={`filter-order-${tab.id}`}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === tab.id ? 'bg-stone-100 text-stone-800' : 'bg-stone-300 text-stone-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            id="input-search-orders"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search order #, table..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
          />
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-bold text-stone-800 text-base">No Orders in Queue</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {orders.length === 0
              ? 'Order history is clean. New customer orders placed via QR codes will appear here in real-time.'
              : 'There are no orders matching this filter criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map(order => {
            const timeAgo = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);

            return (
              <div
                key={order.id}
                id={`admin-order-card-${order.id}`}
                className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  order.status === 'received'
                    ? 'border-amber-400 ring-2 ring-amber-400/30'
                    : order.status === 'ready'
                    ? 'border-emerald-400 ring-2 ring-emerald-400/20'
                    : 'border-stone-200'
                }`}
              >
                {/* Card Top Strip */}
                <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-stone-900 text-white font-extrabold text-xs">
                      Table #{order.tableNumber}
                    </span>
                    <span className="font-mono font-bold text-xs text-stone-600">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo <= 1 ? 'Just now' : `${timeAgo}m ago`}
                    </span>
                    {getStatusBadge(order.status)}

                    {/* Single Order Delete Action Button */}
                    <button
                      id={`btn-delete-order-${order.id}`}
                      type="button"
                      onClick={() => setOrderToDelete(order)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete this order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Customer Details & Special Instructions */}
                <div className="p-4 flex-1 space-y-3">
                  {order.customerName && order.customerName !== 'Dine-in Guest' && (
                    <div className="text-xs text-stone-600 font-medium">
                      Guest: <strong className="text-stone-900">{order.customerName}</strong>
                      {order.customerPhone && <span className="text-stone-400"> ({order.customerPhone})</span>}
                    </div>
                  )}

                  {/* Items List */}
                  <div className="space-y-2 border-t border-stone-100 pt-2">
                    {(order.items || []).map(item => (
                      <div key={item.id} className="flex items-start justify-between gap-2 text-xs">
                        <div className="flex items-start gap-1.5 flex-1">
                          <div className="mt-0.5">
                            <VegBadge type={item.dietType} size="sm" />
                          </div>
                          <div>
                            <span className="font-bold text-stone-900">
                              {item.quantity}x {item.name}
                            </span>
                            {(item.selectedVariantName || (item.selectedAddonNames && item.selectedAddonNames.length > 0)) && (
                              <div className="text-[10px] text-stone-500">
                                {item.selectedVariantName && <span>{item.selectedVariantName}</span>}
                                {item.selectedAddonNames && item.selectedAddonNames.length > 0 && (
                                  <span> • {item.selectedAddonNames.join(', ')}</span>
                                )}
                              </div>
                            )}
                            {item.specialInstructions && (
                              <p className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 italic">
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold text-stone-700 whitespace-nowrap">
                          {currency}{item.totalPrice}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.specialNotes && (
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                      <strong>Chef Note:</strong> {order.specialNotes}
                    </div>
                  )}
                </div>

                {/* Card Total & Status Actions Footer */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-medium">Order Total</span>
                    <span className="font-extrabold text-stone-900 text-sm">
                      {currency}{order.grandTotal}
                    </span>
                  </div>

                  {/* Progressive action buttons */}
                  <div className="flex items-center gap-2">
                    {order.status === 'received' && (
                      <>
                        <button
                          id={`btn-accept-order-${order.id}`}
                          type="button"
                          onClick={() => {
                            updateOrderStatus(order.id, 'accepted');
                            showToast('Order Accepted', `${order.orderNumber} accepted for Table ${order.tableNumber}`, 'success');
                          }}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          ACCEPT ORDER
                        </button>
                        <button
                          id={`btn-reject-order-${order.id}`}
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-rose-50 hover:text-rose-700 text-stone-600 text-xs font-bold transition cursor-pointer"
                        >
                          REJECT
                        </button>
                      </>
                    )}

                    {order.status === 'accepted' && (
                      <button
                        id={`btn-start-prep-${order.id}`}
                        type="button"
                        onClick={() => {
                          updateOrderStatus(order.id, 'preparing');
                          showToast('Sent to Kitchen', `${order.orderNumber} is now preparing`, 'info');
                        }}
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>START PREPARING</span>
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        id={`btn-mark-ready-${order.id}`}
                        type="button"
                        onClick={() => {
                          updateOrderStatus(order.id, 'ready');
                          showToast('Order Ready!', `${order.orderNumber} is ready to serve`, 'success');
                        }}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Bell className="w-4 h-4" />
                        <span>MARK READY TO SERVE</span>
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        id={`btn-mark-served-${order.id}`}
                        type="button"
                        onClick={() => {
                          updateOrderStatus(order.id, 'served');
                          showToast('Order Served', `Delivered to Table ${order.tableNumber}`, 'info');
                        }}
                        className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>MARK AS SERVED</span>
                      </button>
                    )}

                    {(order.status === 'served' || order.status === 'cancelled') && (
                      <div className="w-full flex items-center justify-between gap-2">
                        <span className={`text-xs font-semibold flex items-center gap-1 ${order.status === 'served' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {order.status === 'served' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span>{order.status === 'served' ? 'Served' : 'Cancelled'}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            id={`btn-print-kot-${order.id}`}
                            type="button"
                            onClick={() => handlePrintKOT(order)}
                            className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                          <button
                            id={`btn-delete-card-order-${order.id}`}
                            type="button"
                            onClick={() => setOrderToDelete(order)}
                            className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Delete this order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Confirm Delete Single Order */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-stone-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-stone-900 text-base">Delete Order?</h3>
              <p className="text-xs text-stone-600">
                Are you sure you want to permanently delete order <strong className="text-stone-900">{orderToDelete.orderNumber}</strong> for Table #{orderToDelete.tableNumber} ({currency}{orderToDelete.grandTotal})?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-single-order"
                type="button"
                onClick={handleDeleteSingleOrder}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Clear All Orders */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-black text-stone-900 text-lg">Clear All Order History?</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                This action will delete <strong>all {orders.length} orders</strong> and pending waiter requests from the system and set all dining tables back to <strong className="text-emerald-700">Available</strong> status.
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 rounded-xl p-2 font-medium">
                ⚠️ All test orders will be removed so you can start fresh with real restaurant operations.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-clear-all-orders"
                type="button"
                onClick={handleClearAllOrders}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? 'Deleting All...' : 'Yes, Delete All Orders'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden printable KOT / Receipt modal */}
      {selectedOrderForKOT && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 text-black font-mono text-sm">
          <div className="text-center pb-4 border-b border-black">
            <h1 className="text-xl font-bold">{restaurant?.name}</h1>
            <p className="text-xs">{restaurant?.address}</p>
            <h2 className="text-base font-black mt-2">KITCHEN ORDER TICKET (KOT)</h2>
          </div>

          <div className="py-2 border-b border-black flex justify-between text-xs">
            <span>ORDER: {selectedOrderForKOT.orderNumber}</span>
            <span>TABLE: #{selectedOrderForKOT.tableNumber}</span>
          </div>

          <div className="py-2 text-xs">
            <span>Date: {new Date(selectedOrderForKOT.createdAt).toLocaleString()}</span>
          </div>

          <div className="py-3 border-y border-black">
            {(selectedOrderForKOT?.items || []).map(it => (
              <div key={it.id} className="flex justify-between py-1 text-sm">
                <span>{it.quantity}x {it.name} {it.selectedVariantName ? `(${it.selectedVariantName})` : ''}</span>
                <span>{currency}{it.totalPrice}</span>
              </div>
            ))}
          </div>

          <div className="py-2 text-right space-y-1 text-xs">
            <div className="text-sm font-bold pt-1">
              TOTAL BILL: {currency}{selectedOrderForKOT.grandTotal}
            </div>
          </div>

          <div className="text-center pt-6 text-xs">
            <p>Thank you for dining with {restaurant?.name}!</p>
            <p>New Raj Cabin Digital Ordering</p>
          </div>
        </div>
      )}
    </div>
  );
};
