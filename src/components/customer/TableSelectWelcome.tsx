import React, { useState, useRef } from 'react';
import {
  UtensilsCrossed,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  Languages,
  Clock,
  Receipt,
  Maximize2,
  X,
  MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VegBadge } from './VegBadge';
import { TableInfo } from '../../types';

export const TableSelectWelcome: React.FC = () => {
  const {
    restaurant,
    tables,
    activeTableNumber,
    setActiveTableNumber,
    isTableLockedFromQr,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    language,
    setLanguage,
    t,
    openCustomerMenuForTable,
    openSecretAdminModal,
    showToast
  } = useApp();

  const [selectedTable, setSelectedTable] = useState<string>(activeTableNumber || '1');
  const [customTable, setCustomTable] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>(customerName || '');
  const [phoneInput, setPhoneInput] = useState<string>(customerPhone || '');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isPhotoExpanded, setIsPhotoExpanded] = useState<boolean>(false);

  // Auto-redirect to dining menu if already arrived with scanned QR code table
  React.useEffect(() => {
    if (isTableLockedFromQr && activeTableNumber) {
      openCustomerMenuForTable(activeTableNumber);
    }
  }, [isTableLockedFromQr, activeTableNumber, openCustomerMenuForTable]);

  // Secret 4-Tap Admin Trigger on Restaurant Logo
  const logoTapCountRef = useRef<number>(0);
  const logoTapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoTap = () => {
    logoTapCountRef.current += 1;
    if (logoTapTimerRef.current) clearTimeout(logoTapTimerRef.current);
    if (logoTapCountRef.current >= 4) {
      logoTapCountRef.current = 0;
      openSecretAdminModal();
      return;
    }
    logoTapTimerRef.current = setTimeout(() => {
      logoTapCountRef.current = 0;
    }, 2200);
  };

  const handleStartDining = (e: React.FormEvent) => {
    e.preventDefault();

    const tableToUse = isCustomMode && customTable.trim() ? customTable.trim() : selectedTable;

    if (!tableToUse) {
      showToast('कृपया टेबल नंबर चुनें', 'Please select or enter your table number', 'warn');
      return;
    }

    if (nameInput.trim()) {
      setCustomerName(nameInput.trim());
    }
    if (phoneInput.trim()) {
      setCustomerPhone(phoneInput.trim());
    }

    openCustomerMenuForTable(tableToUse);
  };

  // Fallback sample tables if none loaded
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
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-rose-600 selection:text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-rose-600/15 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-lg mx-auto w-full px-4 pt-4 pb-2 flex items-center justify-between">
        {/* Restaurant Logo with secret 4-tap trigger */}
        <div
          id="welcome-restaurant-brand-trigger"
          onClick={handleLogoTap}
          className="flex items-center gap-3 cursor-pointer select-none group"
          title="Restaurant Dine-In (Tap 4 times to unlock Admin)"
        >
          {restaurant?.branding.logoUrl ? (
            <img
              src={restaurant.branding.logoUrl}
              alt={restaurant.name}
              className="w-11 h-11 rounded-2xl object-cover border border-stone-800 shadow-md group-active:scale-95 transition-transform"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-rose-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-rose-600/30 group-active:scale-95 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="font-extrabold text-white text-base leading-tight tracking-tight group-hover:text-rose-400 transition-colors">
              {restaurant?.name || 'New Raj Cabin'}
            </h1>
            <p className="text-xs text-stone-400 font-medium">
              {restaurant?.city ? `${restaurant.city}, ${restaurant.state}` : (restaurant?.address || 'Contactless Digital Dining')}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Language switch */}
          <button
            id="btn-welcome-switch-lang"
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-xs font-bold text-stone-300 hover:text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-rose-500" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Main Welcoming & Table Selection Form */}
      <main className="relative z-10 max-w-lg mx-auto w-full px-4 py-3 flex-1 flex flex-col justify-center">
        {/* Restaurant Grand Building Hero Card */}
        <div className="mb-3.5 rounded-3xl overflow-hidden border border-stone-800/80 bg-stone-900/80 shadow-2xl relative group">
          <div className="h-44 sm:h-52 w-full relative bg-stone-900 overflow-hidden cursor-pointer" onClick={() => setIsPhotoExpanded(true)}>
            <img
              src="/images/raj-cabin-exterior.jpg"
              alt="New Raj Cabin Grand Restaurant Building"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
            
            {/* Expand Photo Badge */}
            <div className="absolute top-3 right-3">
              <button
                type="button"
                id="btn-expand-welcome-photo"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPhotoExpanded(true);
                }}
                className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition cursor-pointer shadow-md"
              >
                <Maximize2 className="w-3.5 h-3.5 text-rose-400" />
                <span>{language === 'hi' ? 'फोटो बड़ा देखें' : 'View Full Photo'}</span>
              </button>
            </div>

            {/* Building Info on Photo */}
            <div className="absolute bottom-3 left-3.5 right-3.5">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[10px] font-black uppercase tracking-wide">
                  Multi-Cuisine & Rooftop
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-stone-950 text-[10px] font-black uppercase tracking-wide">
                  Banquet Hall & Cafe
                </span>
              </div>
              <p className="text-xs text-stone-300 font-medium line-clamp-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Opp. Naihati Railway Station, Natun Bazar</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-stone-900/90 border border-stone-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md">
          {/* Greeting Banner */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'डिजिटल डाइनिंग मेनू' : 'Instant Table Dining Menu'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {language === 'hi' ? 'स्वागत है! कृपया टेबल चुनें' : 'Welcome! Select Your Table'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xs mx-auto leading-relaxed">
              {language === 'hi'
                ? 'अपने फोन से सीधा किचन में ताजा और स्वादिष्ट आर्डर दें।'
                : 'Browse our fresh menu and place orders directly to the kitchen from your phone.'}
            </p>
          </div>

          <form onSubmit={handleStartDining} className="space-y-4">
            {/* Step 1: Customer Name */}
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'hi' ? 'आपका नाम (Your Name)' : 'Your Name'}</span>
                </span>
                <span className="text-[11px] text-stone-400 font-normal">
                  {language === 'hi' ? 'बिल व आर्डर के लिए' : 'For order & bill'}
                </span>
              </label>
              <div className="relative">
                <input
                  id="input-welcome-customer-name"
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder={language === 'hi' ? 'उदा. राहुल शर्मा / प्रिया सिंह' : 'e.g. Rahul Sharma / Sarah...'}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-white rounded-2xl px-4 py-3 text-sm font-medium transition placeholder:text-stone-600 outline-hidden"
                />
              </div>
            </div>

            {/* Step 2: Select Table Number */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'hi' ? 'टेबल नंबर चुनें (Select Table)' : 'Select Table Number'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer"
                >
                  {isCustomMode ? (language === 'hi' ? 'लिस्ट से चुनें' : 'Pick from list') : (language === 'hi' ? '+ अन्य टेबल' : '+ Enter custom')}
                </button>
              </div>

              {isCustomMode ? (
                <div>
                  <input
                    id="input-custom-table-number"
                    type="text"
                    value={customTable}
                    onChange={e => setCustomTable(e.target.value)}
                    placeholder={language === 'hi' ? 'टेबल नंबर डालें (उदा. 15, T-2, Outdoor)' : 'Type table number (e.g. 15, T-2, Garden)'}
                    className="w-full bg-stone-950 border border-rose-500/80 focus:ring-2 focus:ring-rose-500/20 text-white rounded-2xl px-4 py-3 text-sm font-bold transition placeholder:text-stone-600 outline-hidden"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {availableTables.map(tInfo => {
                    const isSelected = selectedTable === tInfo.tableNumber;
                    return (
                      <button
                        key={tInfo.id}
                        type="button"
                        id={`btn-table-choice-${tInfo.tableNumber}`}
                        onClick={() => setSelectedTable(tInfo.tableNumber)}
                        className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-br from-rose-600 to-rose-700 border-rose-500 text-white shadow-lg shadow-rose-600/30 scale-[1.02]'
                            : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-900'
                        }`}
                      >
                        <span className="text-xs font-medium text-stone-300">
                          {language === 'hi' ? 'टेबल' : 'Table'}
                        </span>
                        <span className="text-lg font-black tracking-tight">#{tInfo.tableNumber}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Optional Phone */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-stone-400" />
                <span>{language === 'hi' ? 'मोबाइल नंबर (ऐच्छिक - ई-बिल हेतु)' : 'Mobile Number (Optional - for instant e-bill)'}</span>
              </label>
              <input
                id="input-welcome-customer-phone"
                type="tel"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                placeholder={language === 'hi' ? 'उदा. 9876543210' : 'e.g. 9876543210'}
                className="w-full bg-stone-950 border border-stone-800/80 focus:border-stone-700 text-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-medium transition placeholder:text-stone-700 outline-hidden"
              />
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                id="btn-welcome-start-dining"
                type="submit"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 active:scale-[0.99] text-white font-extrabold text-base shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2.5 transition cursor-pointer"
              >
                <UtensilsCrossed className="w-5 h-5" />
                <span>
                  {language === 'hi'
                    ? `टेबल #${isCustomMode && customTable ? customTable : selectedTable} का मेनू देखें`
                    : `View Menu for Table #${isCustomMode && customTable ? customTable : selectedTable}`}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Feature Highlights */}
          <div className="mt-5 pt-4 border-t border-stone-800/80 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-stone-950/60 border border-stone-800/60">
              <VegBadge type="veg" size="sm" className="mx-auto mb-1" />
              <p className="text-[11px] font-bold text-stone-300">{language === 'hi' ? 'शाकाहारी / मांसाहारी' : 'Veg & Non-Veg'}</p>
            </div>
            <div className="p-2 rounded-xl bg-stone-950/60 border border-stone-800/60">
              <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-stone-300">{language === 'hi' ? 'फास्ट किचन आर्डर' : 'Live Kitchen'}</p>
            </div>
            <div className="p-2 rounded-xl bg-stone-950/60 border border-stone-800/60">
              <Receipt className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-stone-300">{language === 'hi' ? 'ई-बिलिंग' : 'Digital Bill'}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Expanded Full Photo Lightbox Modal */}
      {isPhotoExpanded && (
        <div
          id="modal-expanded-facade"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsPhotoExpanded(false)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              id="btn-close-expanded-facade"
              onClick={() => setIsPhotoExpanded(false)}
              className="absolute -top-12 right-0 p-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white transition cursor-pointer shadow-lg z-10"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="rounded-3xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-950 flex flex-col max-h-[80vh]">
              <img
                src="/images/raj-cabin-exterior.jpg"
                alt="New Raj Cabin Grand Restaurant Building"
                className="w-full h-full object-contain max-h-[70vh] select-none"
                referrerPolicy="no-referrer"
              />
              <div className="p-4 bg-stone-900/90 border-t border-stone-800 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-white text-base">New Raj Cabin</h3>
                  <p className="text-xs text-stone-400">Multi-Cuisine Restaurant, Rooftop Dining & Banquet Hall • Naihati</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhotoExpanded(false)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clean Footer */}
      <footer className="relative z-10 max-w-lg mx-auto w-full px-4 py-3 text-center text-xs text-stone-400">
        <p>✨ Contactless Table Ordering • Powered by {restaurant?.name || 'Smart Dining'}</p>
      </footer>
    </div>
  );
};
