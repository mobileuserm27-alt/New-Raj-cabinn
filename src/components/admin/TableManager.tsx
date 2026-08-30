import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Plus, QrCode, Printer, Users, Trash2, ExternalLink, Download, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TableInfo } from '../../types';
import { QRSheetGenerator } from './QRSheetGenerator';

export const TableManager: React.FC = () => {
  const { tables, addTable, deleteTable, restaurant, orders, waiterRequests, openCustomerMenuForTable, showToast } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [newCapacity, setNewCapacity] = useState<number>(4);
  const [isQrSheetOpen, setIsQrSheetOpen] = useState(false);
  const [singleTableQrPreview, setSingleTableQrPreview] = useState<{ table: TableInfo; qrUrl: string } | null>(null);
  const [tableToDelete, setTableToDelete] = useState<TableInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const baseUrl = window.location.origin;

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum.trim()) return;

    // Clean prefix if user typed "Table 15" -> "15" or keep clean format
    const cleanedTableNum = newTableNum.trim().replace(/^table\s+/i, '');

    if (tables.some(t => t.tableNumber.toLowerCase() === cleanedTableNum.toLowerCase() || t.tableNumber.toLowerCase() === newTableNum.trim().toLowerCase())) {
      showToast('Duplicate Table', `Table #${cleanedTableNum} already exists`, 'warn');
      return;
    }

    await addTable({
      tableNumber: cleanedTableNum,
      capacity: Number(newCapacity) || 4,
      status: 'available'
    });

    showToast('Table Added', `Table #${cleanedTableNum} created with unique QR`, 'success');
    setNewTableNum('');
    setIsAddOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!tableToDelete) return;
    try {
      setIsDeleting(true);
      await deleteTable(tableToDelete.id);
      showToast('Table Removed', `Table #${tableToDelete.tableNumber} deleted successfully`, 'success');
      setTableToDelete(null);
    } catch (err) {
      showToast('Error', 'Failed to delete table. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePreviewQR = async (table: TableInfo) => {
    if (!restaurant) return;
    const targetUrl = `${baseUrl}/?restaurant=${restaurant.slug}&table=${table.tableNumber}`;
    const qrUrl = await QRCode.toDataURL(targetUrl, { width: 350, margin: 2, errorCorrectionLevel: 'H' });
    setSingleTableQrPreview({ table, qrUrl });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-stone-900">Tables & QR Code System</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-stone-100 font-extrabold text-xs text-stone-700">
              {tables.length} Tables Configured
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Every table has a dedicated QR code URL mapped directly to its table number
          </p>
        </div>

        <div className="flex items-center gap-2">
          {restaurant && (
            <button
              id="btn-open-printable-qrs"
              type="button"
              onClick={() => setIsQrSheetOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-xs transition"
            >
              <Printer className="w-4 h-4 text-rose-400" />
              <span>Print A4 QR Standees</span>
            </button>
          )}

          <button
            id="btn-add-table"
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-rose-600/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Table</span>
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from(new Map<string, TableInfo>((tables || []).map(t => [t.id, t])).values()).map(table => {
          // Check live table status based on orders
          const tableOrders = orders.filter(
            o => o.tableNumber === table.tableNumber && ['received', 'accepted', 'preparing', 'ready'].includes(o.status)
          );
          const hasPendingWaiter = waiterRequests.some(
            w => w.tableNumber === table.tableNumber && w.status === 'pending'
          );

          const isOccupied = tableOrders.length > 0;

          const displayTableTitle = table.tableNumber.toLowerCase().startsWith('table')
            ? table.tableNumber
            : `Table ${table.tableNumber}`;
          const displayBadgeNum = table.tableNumber.replace(/^table\s*/i, '');

          return (
            <div
              key={table.id}
              id={`table-card-${table.tableNumber}`}
              className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-xs ${
                hasPendingWaiter
                  ? 'border-rose-400 ring-2 ring-rose-500/20'
                  : isOccupied
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div>
                {/* Table Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white font-black text-sm flex items-center justify-center">
                      #{displayBadgeNum}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">{displayTableTitle}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-stone-500">
                        <Users className="w-3 h-3" />
                        <span>{table.capacity} Seats</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      hasPendingWaiter
                        ? 'bg-rose-100 text-rose-700 animate-pulse'
                        : isOccupied
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {hasPendingWaiter ? 'Service Alert' : isOccupied ? 'Occupied' : 'Available'}
                  </span>
                </div>

                {/* Table Live stats */}
                <div className="mt-4 pt-3 border-t border-stone-100 space-y-1 text-xs">
                  {isOccupied ? (
                    <div className="text-amber-800 font-medium">
                      🍽️ {tableOrders.length} active order(s) in progress
                    </div>
                  ) : (
                    <div className="text-stone-400">Ready for next dining guest</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  id={`btn-view-qr-${table.tableNumber}`}
                  type="button"
                  onClick={() => handlePreviewQR(table)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-stone-600" />
                  <span>View QR</span>
                </button>

                <button
                  id={`btn-open-menu-table-${table.tableNumber}`}
                  type="button"
                  onClick={() => openCustomerMenuForTable(table.tableNumber)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                  title="Simulate Guest Scanning This Table"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  id={`btn-delete-table-${table.tableNumber}`}
                  type="button"
                  onClick={() => setTableToDelete(table)}
                  className="p-2 rounded-xl bg-rose-50/60 hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                  title="Delete Table"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Table QR Preview Modal */}
      {singleTableQrPreview && restaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            id="single-qr-preview-modal"
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-stone-900 text-base">
                Table #{singleTableQrPreview.table.tableNumber} QR Standee
              </span>
              <button
                type="button"
                onClick={() => setSingleTableQrPreview(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col items-center">
              <h4 className="font-bold text-stone-900 text-sm">{restaurant.name}</h4>
              <span className="px-3 py-0.5 rounded-full bg-stone-900 text-white font-black text-xs my-2 uppercase">
                TABLE #{singleTableQrPreview.table.tableNumber}
              </span>
              <img
                src={singleTableQrPreview.qrUrl}
                alt="Table QR"
                className="w-48 h-48 rounded-xl shadow-xs"
              />
              <p className="text-[10px] text-stone-500 font-mono mt-2 break-all">
                {`${baseUrl}/menu/${restaurant.slug}/table/${singleTableQrPreview.table.tableNumber}`}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `${restaurant.slug}-table-${singleTableQrPreview.table.tableNumber}.png`;
                  link.href = singleTableQrPreview.qrUrl;
                  link.click();
                }}
                className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
              <button
                type="button"
                onClick={() => openCustomerMenuForTable(singleTableQrPreview.table.tableNumber)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1"
              >
                <span>Test Menu</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            id="add-table-modal"
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-stone-900">Add New Dining Table</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-stone-500">
                  Table Number / Identifier *
                </label>
                <input
                  id="input-table-number"
                  type="text"
                  required
                  placeholder="e.g. 15 or T-12 or Rooftop-4"
                  value={newTableNum}
                  onChange={e => setNewTableNum(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-stone-500">
                  Seating Capacity (Guests)
                </label>
                <input
                  id="input-table-capacity"
                  type="number"
                  min={1}
                  max={50}
                  value={newCapacity}
                  onChange={e => setNewCapacity(Number(e.target.value))}
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
                  id="btn-save-new-table"
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/25"
                >
                  Create Table & QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full A4 QR Sheet Generator */}
      {isQrSheetOpen && restaurant && (
        <QRSheetGenerator
          restaurant={restaurant}
          tables={tables}
          onClose={() => setIsQrSheetOpen(false)}
        />
      )}

      {/* Delete Table Confirmation Modal */}
      {tableToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            id="delete-table-confirm-modal"
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200 border border-stone-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-stone-900">
                Delete Table #{tableToDelete.tableNumber}?
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Are you sure you want to delete this table? Its QR code and table slot will be permanently removed.
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span className="font-semibold">Table Identifier:</span>
              <span className="font-bold text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                #{tableToDelete.tableNumber} ({tableToDelete.capacity} Seats)
              </span>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                id="btn-cancel-delete-table"
                type="button"
                onClick={() => setTableToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-table"
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Table'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
