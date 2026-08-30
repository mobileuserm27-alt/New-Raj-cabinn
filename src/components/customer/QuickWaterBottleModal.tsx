import React, { useState } from 'react';
import { X, Droplets, Check, Sparkles, Plus, Minus, Send, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuItem, MenuItemVariant } from '../../types';

interface QuickWaterBottleModalProps {
  isOpen: boolean;
  onClose: () => void;
  waterItem?: MenuItem;
}

export const QuickWaterBottleModal: React.FC<QuickWaterBottleModalProps> = ({
  isOpen,
  onClose,
  waterItem
}) => {
  const {
    restaurant,
    activeTableNumber,
    customerName,
    customerPhone,
    addToCart,
    placeCustomerOrder,
    showToast,
    playNotificationChime
  } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('v_wb_chilled');
  const [isOrdering, setIsOrdering] = useState(false);

  if (!isOpen) return null;

  const currency = restaurant?.branding.currencySymbol || '₹';

  const defaultVariants: MenuItemVariant[] = waterItem?.variants && waterItem.variants.length > 0
    ? waterItem.variants
    : [
        { id: 'v_wb_chilled', name: '1 Litre Chilled Bisleri', price: 20 },
        { id: 'v_wb_normal', name: '1 Litre Normal Temp Bisleri', price: 20 },
        { id: 'v_wb_500ml', name: '500ml Mini Bisleri', price: 10 }
      ];

  const currentVariant = defaultVariants.find(v => v.id === selectedVariantId) || defaultVariants[0];
  const unitPrice = currentVariant ? currentVariant.price : (waterItem?.price || 20);
  const totalPrice = unitPrice * quantity;

  // Direct Instant Order to Table
  const handleInstantOrder = async () => {
    setIsOrdering(true);
    try {
      if (!waterItem) {
        showToast('Error', 'Water bottle item not found in menu', 'error');
        return;
      }

      // Add to cart and immediately place order
      addToCart(waterItem, currentVariant, [], 'Quick Water Bottle Order', quantity);
      
      // Small timeout to allow state sync or directly invoke place order
      setTimeout(async () => {
        try {
          await placeCustomerOrder(customerName, customerPhone, `Quick Water Request: ${currentVariant.name} x${quantity}`);
          playNotificationChime('success');
          showToast(
            'Order Placed!',
            `${quantity}x ${currentVariant.name} will be served at Table #${activeTableNumber}`,
            'success'
          );
          onClose();
        } catch (e) {
          console.error(e);
        } finally {
          setIsOrdering(false);
        }
      }, 100);
    } catch (err) {
      console.error(err);
      setIsOrdering(false);
    }
  };

  const handleAddToCart = () => {
    if (waterItem) {
      addToCart(waterItem, currentVariant, [], '', quantity);
      showToast('Added to Cart', `${quantity}x ${currentVariant.name} added`, 'success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        id="quick-water-bottle-modal"
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-8 duration-200"
      >
        {/* Header with Close */}
        <div className="relative bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700 text-white p-5 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md p-1.5 flex items-center justify-center shadow-inner shrink-0">
              <img
                src="/images/bisleri-water-bottle.jpg"
                alt="Bisleri Water Bottle"
                className="w-full h-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/25 text-white text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <Droplets className="w-3 h-3 text-cyan-200" />
                Table #{activeTableNumber} Quick Order
              </div>
              <h3 className="text-lg font-black leading-tight">
                Bisleri Mineral Water Bottle
              </h3>
              <p className="text-xs text-sky-100 font-medium mt-0.5">
                बिसलेरी मिनरल वाटर बॉटल (Sealed Packaged)
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 bg-stone-50/50">
          {/* Bottle Product Banner Card */}
          <div className="bg-white border border-sky-100 rounded-2xl p-3.5 flex items-center gap-4 shadow-xs">
            <img
              src="/images/bisleri-water-bottle.jpg"
              alt="Bisleri 1 Litre Bottle"
              className="w-16 h-20 object-contain rounded-xl bg-sky-50/60 p-1 border border-sky-100 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-sm text-stone-900">
                Bisleri 1 Litre Sealed Bottle
              </h4>
              <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">
                Pure, safe & hygienic mineral water for your meal at Table #{activeTableNumber}.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-base font-black text-rose-600">
                  {currency}{unitPrice}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Instant Table Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Temperature / Size Options */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <span>Select Water Temperature / Type:</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {defaultVariants.map(variant => {
                const isSelected = variant.id === currentVariant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/70 text-sky-950 ring-2 ring-sky-500/20 font-bold'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-sky-600 bg-sky-600 text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold">{variant.name}</div>
                        <div className="text-[10px] text-stone-500">
                          {variant.name.includes('Chilled') ? '❄️ Cold & Refreshing' : '💧 Normal Room Temp'}
                        </div>
                      </div>
                    </div>
                    <span className="font-extrabold text-xs text-stone-900">
                      {currency}{variant.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="bg-white border border-stone-200 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-extrabold text-stone-800 block">Quantity</span>
              <span className="text-[10px] text-stone-500">How many bottles?</span>
            </div>
            <div className="flex items-center gap-3 bg-stone-100 rounded-xl p-1 border border-stone-200">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-lg bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 flex items-center justify-center font-bold shadow-xs transition cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center font-black text-sm text-stone-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(q => Math.min(10, q + 1))}
                className="w-8 h-8 rounded-lg bg-white text-stone-700 hover:bg-stone-50 flex items-center justify-center font-bold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-stone-200 space-y-2">
          {/* Primary Quick Instant Order */}
          <button
            id="btn-confirm-water-order"
            type="button"
            disabled={isOrdering}
            onClick={handleInstantOrder}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 active:scale-[0.98] text-white font-extrabold text-sm shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {isOrdering ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending Order to Counter...
              </span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Order Now to Table #{activeTableNumber} • {currency}{totalPrice}</span>
              </>
            )}
          </button>

          {/* Secondary: Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-stone-500" />
            <span>Add to Cart ({currency}{totalPrice})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
