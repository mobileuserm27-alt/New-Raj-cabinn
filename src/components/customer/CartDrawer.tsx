import React, { useState, useMemo } from 'react';
import { X, Trash2, Plus, Minus, UtensilsCrossed, ShieldCheck, Sparkles, ArrowRight, Droplets, Check, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VegBadge } from './VegBadge';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    menuItems,
    cartSubtotal,
    cartTaxAmount,
    cartGrandTotal,
    activeTableNumber,
    isTableLockedFromQr,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    restaurant,
    placeCustomerOrder,
    t,
    showToast
  } = useApp();

  const [cookingNotes, setCookingNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find Bisleri water bottle item from menu
  const waterBottleItem = useMemo(() => {
    return menuItems.find(m => m.id === 'item_rc_27' || m.name.toLowerCase().includes('bisleri') || m.name.toLowerCase().includes('water bottle'));
  }, [menuItems]);

  // Check if water bottle is already added in the current cart
  const waterInCart = useMemo(() => {
    return cart.find(ci => ci.menuItem.id === waterBottleItem?.id || ci.menuItem.name.toLowerCase().includes('bisleri') || ci.menuItem.name.toLowerCase().includes('water bottle'));
  }, [cart, waterBottleItem]);

  if (!isCartOpen) return null;

  const currency = restaurant?.branding.currencySymbol || '₹';

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      setIsSubmitting(true);
      await placeCustomerOrder(customerName, customerPhone, cookingNotes);
      // Clean fields
      setCookingNotes('');
    } catch (e: any) {
      showToast('Error Placing Order', e.message || 'Something went wrong', 'warn');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="cart-drawer-panel"
        className="w-full max-w-md bg-stone-50 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-4 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">{t.yourOrder}</h2>
              <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                <span className="truncate max-w-[140px]">{restaurant?.name}</span>
                <span>•</span>
                <span className="px-1.5 py-0.5 rounded-md bg-stone-100 font-bold text-stone-800">
                  {t.table} #{activeTableNumber}
                </span>
              </div>
            </div>
          </div>

          <button
            id="btn-close-cart"
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
              <div className="w-16 h-16 rounded-full bg-stone-200/70 flex items-center justify-center text-stone-400 mb-3">
                <UtensilsCrossed className="w-8 h-8" />
              </div>
              <p className="font-bold text-stone-700 text-base">{t.emptyCart}</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Explore the delicious dishes in our menu and add items to place your table order.
              </p>
            </div>
          ) : (
            <>
              {/* Itemized list */}
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    {cart.length} {t.items}
                  </span>
                  <button
                    id="btn-clear-cart"
                    onClick={clearCart}
                    className="text-xs text-stone-400 hover:text-rose-600 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>

                <div className="divide-y divide-stone-100">
                  {(cart || []).map(item => (
                    <div key={item.cartItemId} className="py-2.5 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <VegBadge type={item.menuItem.dietType} size="sm" />
                          <span className="font-semibold text-stone-900 text-sm leading-snug">
                            {item.menuItem.name}
                          </span>
                        </div>

                        {/* Variant and Addons subtitle */}
                        {(item.selectedVariant || (item.selectedAddons && item.selectedAddons.length > 0)) && (
                          <div className="text-[11px] text-stone-500 mt-0.5 pl-4">
                            {item.selectedVariant && <span>{item.selectedVariant.name}</span>}
                            {item.selectedAddons && item.selectedAddons.length > 0 && (
                              <span>
                                {item.selectedVariant ? ' • ' : ''}
                                {(item.selectedAddons || []).map(a => a.name).join(', ')}
                              </span>
                            )}
                          </div>
                        )}

                        {item.specialInstructions && (
                          <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 font-mono italic">
                            &quot;{item.specialInstructions}&quot;
                          </p>
                        )}

                        <div className="text-xs font-bold text-stone-800 mt-1 pl-4">
                          {currency}{item.itemPrice * item.quantity}
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                        <button
                          id={`btn-cart-minus-${item.cartItemId}`}
                          type="button"
                          onClick={() => updateCartQuantity(item.cartItemId, -1)}
                          className="p-1 hover:bg-white rounded text-stone-600 transition"
                        >
                          {item.quantity === 1 ? (
                            <Trash2 className="w-3 h-3 text-rose-600" />
                          ) : (
                            <Minus className="w-3 h-3" />
                          )}
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-stone-900">
                          {item.quantity}
                        </span>
                        <button
                          id={`btn-cart-plus-${item.cartItemId}`}
                          type="button"
                          onClick={() => updateCartQuantity(item.cartItemId, 1)}
                          className="p-1 hover:bg-white rounded text-stone-600 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Cooking Request */}
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  {t.specialInstructions}
                </label>
                <textarea
                  id="cart-cooking-notes"
                  value={cookingNotes}
                  onChange={e => setCookingNotes(e.target.value)}
                  placeholder={t.specialInstructionsPlaceholder}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs text-stone-800 placeholder:text-stone-400 resize-none"
                />
              </div>

              {/* Guest Details & Table Delivery Confirmation */}
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Table & Guest Information
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 border border-emerald-300/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Serving to Table #{activeTableNumber}</span>
                  </span>
                </div>

                {/* Clear Delivery Table Highlight */}
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium text-stone-600">Order Delivery Destination:</span>
                  </div>
                  <span className="font-black text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200 shadow-2xs">
                    Table #{activeTableNumber} {isTableLockedFromQr ? '🔒 (QR Verified)' : ''}
                  </span>
                </div>

                <input
                  id="input-guest-name"
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder={t.guestNameOptional}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs text-stone-800"
                />
                <input
                  id="input-guest-phone"
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder={t.phoneNumberOptional}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs text-stone-800"
                />
              </div>

              {/* Quick Bisleri Water Bottle Add Button (Exact spot marked by yellow circle) */}
              {waterBottleItem && (
                <div className="bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 border-2 border-sky-300/80 rounded-2xl p-3.5 shadow-xs transition">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-14 rounded-xl bg-white border border-sky-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                        <img
                          src="/images/bisleri-water-bottle.jpg"
                          alt="Bisleri 1L Bottle"
                          className="w-full h-full object-contain rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-sky-950 truncate">
                            Bisleri Water Bottle (1L)
                          </span>
                          <span className="text-[10px] font-black text-sky-800 bg-sky-200/70 px-1.5 py-0.2 rounded">
                            {currency}{waterBottleItem.price}
                          </span>
                        </div>
                        <p className="text-[11px] text-sky-700 font-medium truncate mt-0.5">
                          1 Litre Sealed Packaged Mineral Water
                        </p>
                        <div className="text-[10px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                          <span>💧 Chilled / Normal</span>
                          <span>•</span>
                          <span>Instant Serve</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick 1-Tap Add or Quantity Controls */}
                    {waterInCart ? (
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1.5 bg-white rounded-xl p-1 border-2 border-sky-400 shadow-xs">
                          <button
                            id="btn-cart-water-minus"
                            type="button"
                            onClick={() => updateCartQuantity(waterInCart.cartItemId, -1)}
                            className="p-1 hover:bg-sky-50 rounded text-stone-700 active:scale-95 transition cursor-pointer"
                          >
                            {waterInCart.quantity === 1 ? (
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            ) : (
                              <Minus className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className="w-6 text-center text-xs font-black text-sky-950">
                            {waterInCart.quantity}
                          </span>
                          <button
                            id="btn-cart-water-plus"
                            type="button"
                            onClick={() => updateCartQuantity(waterInCart.cartItemId, 1)}
                            className="p-1 hover:bg-sky-50 rounded text-stone-700 active:scale-95 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-sky-700" />
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Added ({currency}{waterInCart.finalPrice * waterInCart.quantity})
                        </span>
                      </div>
                    ) : (
                      <button
                        id="btn-quick-add-bisleri-cart"
                        type="button"
                        onClick={() => {
                          if (waterBottleItem) {
                            addToCart(waterBottleItem, waterBottleItem.variants?.[0], [], '', 1);
                            showToast('Added!', 'Bisleri Water Bottle added to order', 'success');
                          }
                        }}
                        className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 active:scale-95 text-white font-extrabold text-xs shrink-0 shadow-md shadow-sky-600/25 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Add {currency}{waterBottleItem.price}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-2">
                <div className="flex justify-between text-xs text-stone-600">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-stone-800">{currency}{cartSubtotal}</span>
                </div>
                <div className="border-t border-stone-100 pt-2 flex justify-between text-sm font-bold text-stone-900">
                  <span>Total Bill Amount</span>
                  <span className="text-base text-rose-600 font-extrabold">{currency}{cartGrandTotal}</span>
                </div>
              </div>

              {/* Safe dining assurance */}
              <div className="flex items-center gap-2 text-stone-500 text-[11px] px-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Contactless dining • Direct kitchen order routing</span>
              </div>
            </>
          )}
        </div>

        {/* Bottom CTA */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t border-stone-200">
            <button
              id="btn-place-order"
              type="button"
              disabled={isSubmitting}
              onClick={handleCheckout}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold shadow-lg shadow-rose-600/25 transition cursor-pointer"
            >
              <div className="text-left">
                <div className="text-xs uppercase tracking-wider text-rose-200">
                  {t.table} #{activeTableNumber}
                </div>
                <div className="text-sm font-bold">
                  {isSubmitting ? t.placingOrder : t.placeOrder}
                </div>
              </div>
              <div className="flex items-center gap-2 font-extrabold text-base">
                <span>{currency}{cartGrandTotal}</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
