import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Printer, QrCode, Sparkles, X, ExternalLink, Copy, Check, ShieldCheck, RefreshCw } from 'lucide-react';
import { Restaurant, TableInfo } from '../../types';

interface QRSheetGeneratorProps {
  restaurant: Restaurant;
  tables: TableInfo[];
  onClose: () => void;
}

export const QRSheetGenerator: React.FC<QRSheetGeneratorProps> = ({ restaurant, tables, onClose }) => {
  const [qrImages, setQrImages] = useState<{ [tableNumber: string]: string }>({});
  const [copiedTable, setCopiedTable] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const baseUrl = window.location.origin;

  useEffect(() => {
    const generateAllQrs = async () => {
      const qrs: { [tableNumber: string]: string } = {};
      for (const table of tables) {
        // Build resilient URL that works with any scanner / browser:
        const targetUrl = `${baseUrl}/?restaurant=${restaurant.slug}&table=${table.tableNumber}`;
        try {
          const dataUrl = await QRCode.toDataURL(targetUrl, {
            width: 400,
            margin: 2,
            errorCorrectionLevel: 'H',
            color: {
              dark: '#0c0a09',
              light: '#ffffff'
            }
          });
          qrs[table.tableNumber] = dataUrl;
        } catch (e) {
          console.error(e);
        }
      }
      setQrImages(qrs);
    };

    generateAllQrs();
  }, [restaurant.slug, tables, baseUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = (tableNumber: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedTable(tableNumber);
    setTimeout(() => setCopiedTable(null), 2500);
  };

  const downloadSingleQR = (tableNumber: string) => {
    const dataUrl = qrImages[tableNumber];
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `${restaurant.slug}-table-${tableNumber}-qr.png`;
    link.href = dataUrl;
    link.click();
  };

  const uniqueTables = Array.from(new Map<string, TableInfo>((tables || []).map(t => [t.id, t])).values());

  const displayedTables = selectedFilter === 'all' 
    ? uniqueTables 
    : uniqueTables.filter(t => t.tableNumber === selectedFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div
        id="qr-sheet-modal"
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:w-full print:rounded-none border border-stone-800/30"
      >
        {/* Modal Header (Hidden on print) */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-md shadow-rose-600/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-white">Live Table QR Codes & Scanner Test</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Auto Table Lock
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Scan with any phone camera or tap to test direct table routing for {restaurant.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter */}
            <select
              value={selectedFilter}
              onChange={e => setSelectedFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-xs font-bold text-stone-200 outline-none cursor-pointer"
            >
              <option value="all">View All ({(tables || []).length} Tables)</option>
              {(tables || []).map(t => (
                <option key={t.id} value={t.tableNumber}>
                  Table #{t.tableNumber} QR
                </option>
              ))}
            </select>

            <button
              id="btn-print-qr-sheet"
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer text-white"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>
            <button
              id="btn-close-qr-sheet"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Banner on top of modal */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-800 print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">
              <strong>Testing Guide:</strong> Point your phone's camera at any QR below. When scanned, it will automatically open this app with that exact table locked and ready to order!
            </span>
          </div>
        </div>

        {/* Printable Grid */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-stone-100/90 print:bg-white print:p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-8">
            {(displayedTables || []).map(table => {
              const qrUrl = qrImages[table.tableNumber];
              const menuUrl = `${baseUrl}/?restaurant=${restaurant.slug}&table=${table.tableNumber}`;
              const isCopied = copiedTable === table.tableNumber;

              return (
                <div
                  key={table.id}
                  id={`printable-card-table-${table.tableNumber}`}
                  className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center space-y-3.5 print:border-2 print:border-black print:shadow-none print:break-inside-avoid relative"
                >
                  {/* Restaurant Brand */}
                  <div className="flex flex-col items-center space-y-1">
                    {restaurant.branding.logoUrl ? (
                      <img
                        src={restaurant.branding.logoUrl}
                        alt={restaurant.name}
                        className="w-11 h-11 rounded-xl object-cover border border-stone-200 shadow-2xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-rose-600 text-white font-black text-base flex items-center justify-center">
                        {restaurant.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <h3 className="font-black text-stone-900 text-sm sm:text-base leading-tight">
                      {restaurant.name}
                    </h3>
                    <p className="text-[10px] text-stone-500 font-medium">
                      {restaurant.branding.tagline || 'Scan to View Menu & Place Order'}
                    </p>
                  </div>

                  {/* Table Badge */}
                  <div className="px-5 py-1.5 rounded-full bg-gradient-to-r from-stone-900 to-stone-800 text-white text-xs font-black tracking-wider uppercase shadow-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>TABLE #{table.tableNumber}</span>
                  </div>

                  {/* QR Image Box */}
                  <div className="p-3.5 bg-white rounded-2xl border-2 border-stone-200/90 shadow-inner flex flex-col items-center justify-center">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt={`QR Code for Table ${table.tableNumber}`}
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 flex flex-col items-center justify-center text-xs text-stone-400 gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-rose-500" />
                        <span>Generating Table #{table.tableNumber} QR...</span>
                      </div>
                    )}
                  </div>

                  {/* Instructions & Link */}
                  <div className="space-y-1 w-full">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold text-stone-800">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Scan with Phone Camera</span>
                    </div>
                    <p className="text-[10px] text-stone-500 font-mono break-all px-1">
                      ?restaurant={restaurant.slug}&table={table.tableNumber}
                    </p>
                  </div>

                  {/* Action Buttons (Download, Copy Link, Test Open) */}
                  <div className="pt-2 print:hidden w-full flex flex-col gap-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        id={`btn-copy-link-table-${table.tableNumber}`}
                        onClick={() => handleCopyLink(table.tableNumber, menuUrl)}
                        className="py-2 px-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                        title="Copy QR Link"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-500" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      <a
                        href={menuUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-[11px] font-bold flex items-center justify-center gap-1 transition shadow-xs cursor-pointer text-center"
                        title="Test Table in New Tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                        <span>Test Tab</span>
                      </a>
                    </div>

                    <button
                      id={`btn-download-qr-${table.tableNumber}`}
                      type="button"
                      onClick={() => downloadSingleQR(table.tableNumber)}
                      className="w-full py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-600 text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-stone-400" />
                      <span>Download PNG Sticker</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

