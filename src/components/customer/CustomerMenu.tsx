import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  Bell,
  Star,
  MapPin,
  Clock,
  Sparkles,
  UtensilsCrossed,
  SlidersHorizontal,
  ChevronRight,
  ArrowLeft,
  X,
  Languages,
  Layers,
  Lock,
  Droplets,
  Plus,
  ShieldCheck,
  Maximize2,
  Receipt
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FoodCard } from './FoodCard';
import { FoodDetailModal } from './FoodDetailModal';
import { CartDrawer } from './CartDrawer';
import { OrderStatusModal } from './OrderStatusModal';
import { BillRequestModal } from './BillRequestModal';
import { CallWaiterModal } from './CallWaiterModal';
import { ChangeTableModal } from './ChangeTableModal';
import { QuickWaterBottleModal } from './QuickWaterBottleModal';
import { VegBadge } from './VegBadge';
import { APP_IMAGES } from '../../assets/images';

export const CustomerMenu: React.FC = () => {
  const {
    restaurant,
    categories,
    tables,
    menuItems,
    activeTableNumber,
    isTableLockedFromQr,
    customerName,
    cartCount,
    cartGrandTotal,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    activeOrderModal,
    setActiveOrderModal,
    selectedFoodDetail,
    setSelectedFoodDetail,
    setIsCallWaiterOpen,
    setIsBillRequestOpen,
    language,
    setLanguage,
    t,
    searchQuery,
    setSearchQuery,
    dietFilter,
    setDietFilter,
    selectedCategoryId,
    setSelectedCategoryId,
    customerOrders,
    setView,
    openSecretAdminModal
  } = useApp();

  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isChangeTableOpen, setIsChangeTableOpen] = useState(false);
  const [isQuickWaterOpen, setIsQuickWaterOpen] = useState(false);
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);
  const currency = restaurant?.branding.currencySymbol || '₹';

  // Find water bottle item from menu
  const waterBottleItem = useMemo(() => {
    return menuItems.find(m => m.id === 'item_rc_27' || m.name.toLowerCase().includes('water bottle') || m.name.toLowerCase().includes('bisleri'));
  }, [menuItems]);

  // Secret 4-Tap Admin Trigger on Restaurant Logo
  const logoTapCountRef = useRef<number>(0);
  const logoTapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleRestaurantLogoClick = () => {
    logoTapCountRef.current += 1;

    if (logoTapTimerRef.current) {
      clearTimeout(logoTapTimerRef.current);
    }

    if (logoTapCountRef.current >= 4) {
      logoTapCountRef.current = 0;
      openSecretAdminModal();
      return;
    }

    logoTapTimerRef.current = setTimeout(() => {
      logoTapCountRef.current = 0;
    }, 2200);
  };

  // Filter dishes
  const filteredDishes = useMemo(() => {
    return menuItems.filter(item => {
      // Category filter
      if (selectedCategoryId !== 'all' && item.categoryId !== selectedCategoryId) {
        return false;
      }
      // Diet filter
      if (dietFilter === 'veg' && item.dietType !== 'veg' && item.dietType !== 'vegan') {
        return false;
      }
      if (dietFilter === 'non_veg' && item.dietType !== 'non_veg' && item.dietType !== 'egg') {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesHindi = item.hindiName?.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesHindi && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [menuItems, selectedCategoryId, dietFilter, searchQuery]);

  // Group dishes by active category for organized layout
  const groupedCategories = useMemo(() => {
    const activeCats = categories && categories.length > 0 ? categories : [];
    if (selectedCategoryId !== 'all') {
      const cat = activeCats.find(c => c.id === selectedCategoryId);
      if (!cat) {
        return [{ category: { id: selectedCategoryId, restaurantId: 'rest_raj_001', name: 'Menu Items', hindiName: 'मेन्यू', sortOrder: 1, isActive: true }, dishes: filteredDishes || [] }];
      }
      return [{ category: cat, dishes: filteredDishes || [] }];
    }

    const groups = activeCats
      .map(cat => ({
        category: cat,
        dishes: (filteredDishes || []).filter(d => d.categoryId === cat.id)
      }))
      .filter(group => group.dishes.length > 0);

    // If any dishes didn't match known category IDs, add them in an extra section so no item is ever hidden
    const categorizedDishIds = new Set(groups.flatMap(g => g.dishes.map(d => d.id)));
    const uncategorizedDishes = (filteredDishes || []).filter(d => !categorizedDishIds.has(d.id));
    if (uncategorizedDishes.length > 0) {
      groups.push({
        category: { id: 'cat_more', restaurantId: 'rest_raj_001', name: 'More Specialties', hindiName: 'अन्य व्यंजन', sortOrder: 99, isActive: true },
        dishes: uncategorizedDishes
      });
    }

    // Ultimate fallback if no categories exist but dishes exist
    if (groups.length === 0 && (filteredDishes || []).length > 0) {
      return [{
        category: { id: 'cat_all', restaurantId: 'rest_raj_001', name: 'All Dishes', hindiName: 'सभी व्यंजन', sortOrder: 1, isActive: true },
        dishes: filteredDishes || []
      }];
    }

    return groups;
  }, [categories, filteredDishes, selectedCategoryId]);

  const activeOrder = customerOrders.find(o => o.status !== 'cancelled') || customerOrders[0] || null;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-28">
      {/* Top Mobile-First App Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo & Restaurant Brand (4 taps on logo unlocks Admin with secret password) */}
          <div
            id="brand-header-trigger"
            onClick={handleRestaurantLogoClick}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer select-none group"
            title="Restaurant Menu"
          >
            {restaurant?.branding.logoUrl ? (
              <img
                src={restaurant.branding.logoUrl}
                alt={restaurant.name}
                className="w-9 h-9 rounded-xl object-cover border border-stone-200 shrink-0 group-active:scale-95 transition-transform"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0 group-active:scale-95 transition-transform">
                {restaurant?.name?.slice(0, 2).toUpperCase() || 'SD'}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="font-extrabold text-stone-900 text-sm sm:text-base leading-tight truncate group-hover:text-rose-600 transition-colors">
                {restaurant?.name || 'Scan & Dine'}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
                <button
                  type="button"
                  id="btn-header-change-table"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsChangeTableOpen(true);
                  }}
                  className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg text-[11px] transition cursor-pointer ${
                    isTableLockedFromQr
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 shadow-xs'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60'
                  }`}
                  title={isTableLockedFromQr ? 'Table verified & locked via scanned QR' : 'Click to select table'}
                >
                  {isTableLockedFromQr ? (
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  ) : null}
                  <span>{t.table} #{activeTableNumber}</span>
                  {isTableLockedFromQr && (
                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-200/70 px-1 rounded">QR Lock</span>
                  )}
                </button>
                {customerName && (
                  <>
                    <span>•</span>
                    <span className="text-stone-700 font-semibold truncate max-w-[90px]">
                      {customerName}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t.open}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Call Waiter Button */}
            <button
              id="btn-header-call-waiter"
              type="button"
              onClick={() => setIsCallWaiterOpen(true)}
              className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title={language === 'hi' ? 'बैरा बुलाएं' : 'Call Waiter'}
            >
              <Bell className="w-3.5 h-3.5 text-rose-600 animate-swing" />
              <span>{language === 'hi' ? 'बैरा' : 'Waiter'}</span>
            </button>

            {/* Language Switch */}
            <button
              id="btn-switch-lang"
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="px-2 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-bold text-stone-700 hover:bg-stone-100 transition flex items-center gap-1"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-rose-600" />
              <span>{language === 'en' ? 'हिन्दी' : 'ENG'}</span>
            </button>

            {/* Search Trigger */}
            <button
              id="btn-search-toggle"
              type="button"
              onClick={() => setShowSearchInput(prev => !prev)}
              className={`p-2 rounded-xl border transition ${
                showSearchInput || searchQuery
                  ? 'border-rose-600 bg-rose-50 text-rose-600'
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
              }`}
              title="Search Dishes"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Cart Button */}
            <button
              id="btn-header-cart"
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-stone-900 hover:bg-black text-white transition shadow-xs cursor-pointer"
              title="Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center ring-2 ring-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Search bar */}
        {(showSearchInput || searchQuery) && (
          <div className="max-w-2xl mx-auto px-4 pb-3 animate-in slide-in-from-top-2 duration-150">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="search-menu-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t.searchDishes}
                autoFocus
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
              />
              {searchQuery && (
                <button
                  id="btn-clear-search"
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Restaurant Cover Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-sm bg-white border border-stone-200/80 group">
          <div
            className="h-44 sm:h-52 w-full relative bg-stone-800 cursor-pointer overflow-hidden"
            onClick={() => setIsPhotoExpanded(true)}
            title="Click to view full photo"
          >
            <img
              src={restaurant?.branding.coverImageUrl || APP_IMAGES.rajCabinBuilding}
              alt={restaurant?.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

            {/* Quick badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md text-xs font-semibold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{restaurant?.rating || 4.8}</span>
                <span className="text-stone-300">({restaurant?.reviewCount || '2.4k'})</span>
              </span>
              <button
                type="button"
                id="btn-menu-expand-photo"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPhotoExpanded(true);
                }}
                className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md text-xs font-semibold flex items-center gap-1 transition"
              >
                <Maximize2 className="w-3 h-3 text-rose-400" />
                <span>{language === 'hi' ? 'फोटो' : 'Photo'}</span>
              </button>
            </div>

            {/* Active Table Badge Top Right */}
            <div className="absolute top-3 right-3">
              <div className={`px-3 py-1 rounded-full font-extrabold text-xs shadow-md backdrop-blur-xs flex items-center gap-1.5 ${
                isTableLockedFromQr
                  ? 'bg-emerald-600/95 text-white ring-2 ring-emerald-400/40'
                  : 'bg-rose-600 text-white'
              }`}>
                {isTableLockedFromQr && <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />}
                <span>{t.table}</span>
                <span className={`px-1.5 py-0.2 rounded-md font-mono ${
                  isTableLockedFromQr ? 'bg-emerald-800 text-white' : 'bg-rose-800/80 text-white'
                }`}>
                  #{activeTableNumber}
                </span>
                {isTableLockedFromQr && (
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-200 px-1.5 py-0.2 rounded font-bold">
                    QR Locked
                  </span>
                )}
              </div>
            </div>

            {/* Title & Info on Cover */}
            <div className="absolute bottom-3.5 left-4 right-4 text-white">
              <h2 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-xs">
                {restaurant?.name}
              </h2>
              <p className="text-xs text-stone-200 mt-1 line-clamp-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{restaurant?.address}, {restaurant?.city}</span>
              </p>
            </div>
          </div>

          {/* Cuisines & Timing strip */}
          <div className="p-3 bg-white flex items-center justify-between gap-2 text-xs text-stone-600 border-t border-stone-100 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(restaurant?.cuisineTypes || []).map(c => (
                <span key={c} className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium text-[11px]">
                  {c}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1 text-stone-500 font-medium text-[11px]">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{restaurant?.openingHours}</span>
            </div>
          </div>
        </div>

        {/* Table Quick Service Bar: Call Waiter & Request Bill */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            id="btn-customer-call-waiter"
            onClick={() => setIsCallWaiterOpen(true)}
            className="p-2.5 rounded-2xl bg-white hover:bg-rose-50 border border-stone-200 hover:border-rose-300 text-stone-800 hover:text-rose-700 shadow-xs flex items-center gap-2.5 transition active:scale-[0.99] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-black truncate">{t.callWaiter}</div>
              <div className="text-[10px] text-stone-500 truncate">Water • Help • Table Clean</div>
            </div>
          </button>

          <button
            type="button"
            id="btn-customer-request-bill"
            onClick={() => setIsBillRequestOpen(true)}
            className="p-2.5 rounded-2xl bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-stone-800 hover:text-emerald-700 shadow-xs flex items-center gap-2.5 transition active:scale-[0.99] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-black truncate">{t.requestBill}</div>
              <div className="text-[10px] text-stone-500 truncate">Cash • UPI QR • Card</div>
            </div>
          </button>
        </div>

        {/* Customer Active Order Alert Banner if table placed an order */}
        {activeOrder && (
          <div
            id="banner-active-order"
            onClick={() => setActiveOrderModal(activeOrder)}
            className={`p-3.5 rounded-2xl text-white shadow-md flex items-center justify-between cursor-pointer hover:shadow-lg transition ${
              activeOrder.status === 'cancelled'
                ? 'bg-gradient-to-r from-stone-900 to-rose-950 border border-rose-900/60'
                : 'bg-gradient-to-r from-stone-900 to-stone-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
                  activeOrder.status === 'cancelled' ? 'bg-rose-700' : 'bg-rose-600 animate-pulse'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">
                    {activeOrder.status === 'cancelled'
                      ? (language === 'hi' ? 'कैंसिल हुआ ऑर्डर' : 'Cancelled Order')
                      : t.trackOrder}: {activeOrder.orderNumber}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      activeOrder.status === 'cancelled'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-500/30 text-rose-300'
                    }`}
                  >
                    {activeOrder.status}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 mt-0.5">
                  {activeOrder.status === 'cancelled'
                    ? (language === 'hi'
                        ? `टेबल #${activeOrder.tableNumber} • ऑर्डर रद्द हो चुका है • देखने के लिए टैप करें`
                        : `Table #${activeOrder.tableNumber} • Order was cancelled • Tap to view`)
                    : `Table #${activeOrder.tableNumber} • ${activeOrder.items.length} items • Click to track status live`}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400" />
          </div>
        )}

        {/* Quick Water Bottle Request Card */}
        {waterBottleItem && (
          <div className="bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 border border-sky-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-14 rounded-xl bg-white border border-sky-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src="/images/bisleri-water-bottle.jpg"
                  alt="Bisleri Bottle"
                  className="w-full h-full object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-xs sm:text-sm text-sky-950 truncate">
                    Bisleri Water Bottle (1L)
                  </h4>
                  <span className="px-1.5 py-0.2 rounded bg-sky-200/70 text-sky-900 font-black text-[10px]">
                    1 Litre
                  </span>
                </div>
                <p className="text-[11px] text-sky-700 font-medium truncate mt-0.5">
                  Packaged Drinking Mineral Water (Chilled / Normal)
                </p>
                <div className="text-xs font-black text-sky-900 mt-0.5 flex items-center gap-1.5">
                  <span>Price: {currency}{waterBottleItem.price}</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-1 rounded">Sealed Pack</span>
                </div>
              </div>
            </div>

            <button
              id="btn-quick-add-water"
              type="button"
              onClick={() => setIsQuickWaterOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-extrabold text-xs shrink-0 shadow-xs flex items-center gap-1.5 cursor-pointer transition"
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-200" />
              <span>ORDER {currency}{waterBottleItem.price}</span>
            </button>
          </div>
        )}

        {/* Dietary Filters & Quick Chips */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 shrink-0">
            {/* All */}
            <button
              id="filter-diet-all"
              type="button"
              onClick={() => setDietFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                dietFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span>{t.all}</span>
            </button>

            {/* Veg Only */}
            <button
              id="filter-diet-veg"
              type="button"
              onClick={() => setDietFilter(dietFilter === 'veg' ? 'all' : 'veg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                dietFilter === 'veg'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-emerald-300'
              }`}
            >
              <VegBadge type="veg" size="sm" />
              <span>{t.vegOnly}</span>
            </button>

            {/* Non-Veg */}
            <button
              id="filter-diet-non-veg"
              type="button"
              onClick={() => setDietFilter(dietFilter === 'non_veg' ? 'all' : 'non_veg')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                dietFilter === 'non_veg'
                  ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-rose-300'
              }`}
            >
              <VegBadge type="non_veg" size="sm" />
              <span>{t.nonVegOnly}</span>
            </button>
          </div>

          <div className="text-xs text-stone-500 font-semibold shrink-0">
            {filteredDishes.length} dishes
          </div>
        </div>

        {/* Horizontal Category Navigation */}
        <div className="sticky top-[57px] z-20 -mx-4 px-4 py-2.5 bg-stone-100/90 backdrop-blur-md border-y border-stone-200/60 overflow-x-auto no-scrollbar flex items-center gap-2">
          <button
            id="cat-pill-all"
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shrink-0 ${
              selectedCategoryId === 'all'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-300'
            }`}
          >
            {t.allCategories}
          </button>

          {(categories || []).map(cat => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-pill-${cat.id}`}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shrink-0 ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-300'
                }`}
              >
                {language === 'hi' && cat.hindiName ? cat.hindiName : cat.name}
              </button>
            );
          })}
        </div>

        {/* Food Dishes Sections */}
        {(groupedCategories || []).length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/80 p-8 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-3">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-stone-800 text-base">{t.noDishesFound}</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">{t.tryAdjustingFilters}</p>
            {(dietFilter !== 'all' || searchQuery || selectedCategoryId !== 'all') && (
              <button
                id="btn-reset-filters"
                type="button"
                onClick={() => {
                  setDietFilter('all');
                  setSearchQuery('');
                  setSelectedCategoryId('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-black"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {(groupedCategories || []).map(group => (
              <section key={group.category.id} id={`category-sec-${group.category.id}`} className="space-y-3">
                <div className="flex items-center justify-between pt-2">
                  <h3 className="font-extrabold text-stone-900 text-lg flex items-center gap-2">
                    <span>{language === 'hi' && group.category.hindiName ? group.category.hindiName : group.category.name}</span>
                    <span className="text-xs font-semibold text-stone-400">({(group.dishes || []).length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {(group.dishes || []).map(dish => (
                    <FoodCard
                      key={dish.id}
                      item={dish}
                      onSelect={item => setSelectedFoodDetail(item)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Sticky Bottom Cart Bar when items exist */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 shadow-2xl animate-in slide-in-from-bottom-6 duration-200">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                {cartCount} {t.items}
              </div>
              <div className="text-lg font-black text-stone-900">
                {currency}{cartGrandTotal}
              </div>
            </div>

            <button
              id="btn-sticky-view-cart"
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex-1 max-w-xs flex items-center justify-between px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-rose-600/30 transition cursor-pointer"
            >
              <span>{t.viewCart}</span>
              <div className="flex items-center gap-1 font-extrabold">
                <span>{currency}{cartGrandTotal}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <FoodDetailModal
        item={selectedFoodDetail}
        onClose={() => setSelectedFoodDetail(null)}
      />

      <QuickWaterBottleModal
        isOpen={isQuickWaterOpen}
        onClose={() => setIsQuickWaterOpen(false)}
        waterItem={waterBottleItem}
      />

      <CartDrawer />

      <OrderStatusModal
        order={activeOrderModal}
        onClose={() => setActiveOrderModal(null)}
      />

      <BillRequestModal />
      <CallWaiterModal />
      <ChangeTableModal
        isOpen={isChangeTableOpen}
        onClose={() => setIsChangeTableOpen(false)}
      />

      {/* Expanded Restaurant Photo Lightbox Modal */}
      {isPhotoExpanded && (
        <div
          id="modal-menu-expanded-facade"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsPhotoExpanded(false)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              id="btn-close-menu-expanded-facade"
              onClick={() => setIsPhotoExpanded(false)}
              className="absolute -top-12 right-0 p-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-white transition cursor-pointer shadow-lg z-10"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="rounded-3xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-950 flex flex-col max-h-[80vh]">
              <img
                src={restaurant?.branding.coverImageUrl || APP_IMAGES.rajCabinBuilding}
                alt={restaurant?.name || 'Restaurant Cover Banner'}
                className="w-full h-full object-contain max-h-[70vh] select-none"
                referrerPolicy="no-referrer"
              />
              <div className="p-4 bg-stone-900/90 border-t border-stone-800 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-white text-base">{restaurant?.name || 'New Raj Cabin'}</h3>
                  <p className="text-xs text-stone-400">
                    {restaurant?.branding.tagline || (restaurant?.address ? `${restaurant.address}, ${restaurant.city}` : 'Multi-Cuisine Restaurant & Rooftop Dining')}
                  </p>
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
    </div>
  );
};
