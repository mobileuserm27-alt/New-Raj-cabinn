import React, { useState } from 'react';
import { UtensilsCrossed, X, User, Phone, CheckCircle2, ArrowRight, Sparkles, ShieldCheck, Lock, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TableInfo } from '../../types';

interface ChangeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeTableModal: React.FC<ChangeTableModalProps> = ({ isOpen, onClose }) => {
  const {
    tables,
    activeTableNumber,
    setActiveTableNumber,
    isTableLockedFromQr,
    setIsTableLockedFromQr,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    language,
    showToast,
    isTableOccupied
  } = useApp();

  const [selectedTable, setSelectedTable] = useState<string>(activeTableNumber || '1');
  const [customTable, setCustomTable] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>(customerName || '');
  const [phoneInput, setPhoneInput] = useState<string>(customerPhone || '');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [allowUnlock, setAllowUnlock] = useState<boolean>(!isTableLockedFromQr);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tableToUse = isCustomMode && customTable.trim() ? customTable.trim() : selectedTable;

    if (!tableToUse) {
      showToast('कृपया टेबल नंबर चुनें', 'Please select a table number', 'warn');
      return;
    }

    setActiveTableNumber(tableToUse, true);
    if (nameInput.trim()) setCustomerName(nameInput.trim());
    if (phoneInput.trim()) setCustomerPhone(phoneInput.trim());

    showToast('टेबल अपडेट हो गया', `Table #${tableToUse} active for your order`, 'success');
    onClose();
  };

  const rawTables = tables.length > 0 ? tables : [
    { id: 't1', restaurantId: 'rest_001', tableNumber: '1', capacity: 2, status: 'available' as const, qrCodeUrl: '' },
    { id: 't2', restaurantId: 'rest_001', tableNumber: '2', capacity: 4, status: 'available' as const, qrCodeUrl: '' },
    { id: 't3', restaurantId: 'rest_001', tableNumber: '3', capacity: 4, status: 'available' as const, qrCodeUrl: '' },
    { id: 't4', restaurantId: 'rest_001', tableNumber: '4', capacity: 6, status: 'available' as const, qrCodeUrl: '' },
    { id: 't5', restaurantId: 'rest_001', tableNumber: '5', capacity: 4, status: 'available' as const, qrCodeUrl: '' },
    { id: 't6', restaurantId: 'rest_001', tableNumber: '6', capacity: 2, status: 'available' as const, qrCodeUrl: '' },
    { id: 't7', restaurantId: 'rest_001', tableNumber: '7', capacity: 4, status: 'available' as const, qrCodeUrl: '' },
    { id: 't8', restaurantId: 'rest_001', tableNumber: '8', capacity: 8, status: 'available' as const, qrCodeUrl: '' },
    { id: 't12', restaurantId: 'rest_001', tableNumber: '12', capacity: 4, status: 'available' as const, qrCodeUrl: '' },
  ];

  const availableTables = Array.from(new Map<string, TableInfo>(rawTables.map(t => [t.id, t])).values());

  return (
    <div
      id="change-table-modal-overlay"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="change-table-modal-card"
        onClick={e => e.stopPropagation()}
        className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl text-stone-100 relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              {language === 'hi' ? 'टेबल व विवरण' : 'Table & Diner Info'}
            </h3>
            <p className="text-xs text-stone-400">
              {language === 'hi' ? `वर्तमान: टेबल #${activeTableNumber}` : `Current: Table #${activeTableNumber}`}
            </p>
          </div>
        </div>

        {/* QR Code Lock Notice */}
        {isTableLockedFromQr && !allowUnlock && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {language === 'hi' ? `टेबल #${activeTableNumber} QR कोड से ऑटो-वेरिफाइड है` : `Table #${activeTableNumber} is Verified via QR Scan`}
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80 leading-relaxed">
              {language === 'hi'
                ? 'गलत टेबल नंबर से बचने के लिए आपका टेबल नंबर ऑटो-डिटेक्ट होकर सुरक्षित लॉक है।'
                : 'To prevent order mistakes, your table number is locked to the scanned table.'}
            </p>
            <button
              type="button"
              onClick={() => setAllowUnlock(true)}
              className="mt-1 text-[11px] font-bold text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>{language === 'hi' ? 'क्या आप दूसरी टेबल पर बैठे हैं? (बदलें)' : 'Switched physical table? (Change table)'}</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Diner Name */}
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-rose-400" />
              <span>{language === 'hi' ? 'आपका नाम (Your Name)' : 'Your Name'}</span>
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-stone-950 border border-stone-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-white rounded-xl px-3.5 py-2.5 text-sm font-medium transition outline-hidden"
            />
          </div>

          {/* Table Choice (Only shown if unlocked or non-QR) */}
          {(allowUnlock || !isTableLockedFromQr) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-300">
                  {language === 'hi' ? 'टेबल नंबर चुनें' : 'Select Table Number'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                >
                  {isCustomMode ? (language === 'hi' ? 'लिस्ट' : 'List') : (language === 'hi' ? '+ अन्य' : '+ Custom')}
                </button>
              </div>

              {isCustomMode ? (
                <input
                  type="text"
                  value={customTable}
                  onChange={e => setCustomTable(e.target.value)}
                  placeholder="Enter Table Number (e.g. 14)"
                  className="w-full bg-stone-950 border border-rose-500 text-white rounded-xl px-3.5 py-2.5 text-sm font-bold transition outline-hidden"
                />
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                  {availableTables.map(tInfo => {
                    const isSelected = selectedTable === tInfo.tableNumber;
                    const isOccupied = isTableOccupied(tInfo.tableNumber);

                    return (
                      <button
                        key={tInfo.id}
                        type="button"
                        onClick={() => setSelectedTable(tInfo.tableNumber)}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer relative ${
                          isSelected
                            ? isOccupied
                              ? 'bg-amber-600 border-amber-500 text-white font-bold shadow-md shadow-amber-600/30'
                              : 'bg-rose-600 border-rose-500 text-white font-bold shadow-md shadow-rose-600/30'
                            : isOccupied
                            ? 'bg-amber-950/30 border-amber-900/60 text-amber-300 hover:bg-amber-900/40'
                            : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          <span className="text-[9px] text-stone-400">{isOccupied ? 'Busy' : 'Free'}</span>
                        </div>
                        <span className="text-base font-black">#{tInfo.tableNumber}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'hi' ? 'सेव करें' : 'Confirm'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-sm transition cursor-pointer"
            >
              {language === 'hi' ? 'रद्द' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
