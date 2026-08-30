import React, { useState } from 'react';
import { X, Flame, Sparkles, Plus, Minus, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VegBadge } from './VegBadge';
import { MenuItem, MenuItemAddon, MenuItemVariant } from '../../types';

interface FoodDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ item, onClose }) => {
  const { addToCart, t, language, restaurant } = useApp();

  // State for selections - MUST be called before any conditional return
  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | undefined>(
    item?.variants && item.variants.length > 0 ? item.variants[0] : undefined
  );
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Sync state whenever the active item changes or opens
  React.useEffect(() => {
    if (item) {
      setSelectedVariant(item.variants && item.variants.length > 0 ? item.variants[0] : undefined);
      setSelectedAddons([]);
      setSpecialInstructions('');
      setQuantity(1);
    }
  }, [item?.id]);

  if (!item) return null;

  const currency = restaurant?.branding.currencySymbol || '₹';

  const toggleAddon = (addon: MenuItemAddon) => {
    setSelectedAddons(prev => {
      const exists = prev.some(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const basePrice = selectedVariant ? selectedVariant.price : item.price;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    addToCart(item, selectedVariant, selectedAddons, specialInstructions, quantity);
    onClose();
  };

  const spiceLabels = {
    none: 'Mild & Creamy',
    mild: 'Mild',
    medium: 'Medium Spicy',
    spicy: 'Spicy 🔥',
    extra_spicy: 'Extra Hot 🔥🔥'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div
        id="food-detail-modal"
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200"
      >
        {/* Close Button */}
        <button
          id="btn-close-food-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* Header Image */}
          <div className="relative h-60 sm:h-64 w-full bg-stone-100 overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

            {/* Badges on image */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <VegBadge type={item.dietType} size="md" showLabel />
                {item.isChefSpecial && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    {t.chefSpecial}
                  </span>
                )}
                {item.isPopular && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-600 text-white text-xs font-semibold shadow-xs">
                    {t.popular}
                  </span>
                )}
              </div>
              {item.preparationTimeMinutes && (
                <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-xs backdrop-blur-xs font-medium">
                  ⏱️ {item.preparationTimeMinutes} {t.mins}
                </span>
              )}
            </div>
          </div>

          {/* Dish Details */}
          <div className="p-5 space-y-5">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-bold text-stone-900 leading-tight">
                  {language === 'hi' && item.hindiName ? item.hindiName : item.name}
                </h2>
                <div className="text-xl font-extrabold text-stone-900 whitespace-nowrap">
                  {currency}{basePrice}
                </div>
              </div>
              {language !== 'hi' && item.hindiName && (
                <p className="text-xs text-stone-500 font-medium mt-0.5">{item.hindiName}</p>
              )}
              <p className="text-stone-600 text-sm mt-2 leading-relaxed">{item.description}</p>
            </div>

            {/* Spice indicator */}
            {item.spiceLevel && item.spiceLevel !== 'none' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200/60 text-orange-900 text-xs font-medium">
                <Flame className="w-4 h-4 text-orange-600 shrink-0" />
                <span>{t.spiceLevel}: <strong className="font-semibold">{spiceLabels[item.spiceLevel]}</strong></span>
              </div>
            )}

            {/* Variants / Portion Sizes */}
            {item.variants && item.variants.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  {t.selectVariant}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(item.variants || []).map(variant => {
                    const isSelected = selectedVariant?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        id={`variant-${variant.id}`}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                          isSelected
                            ? 'border-rose-600 bg-rose-50/70 text-rose-950 font-semibold ring-1 ring-rose-600'
                            : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-rose-600 bg-rose-600' : 'border-stone-400'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="text-sm">{variant.name}</span>
                        </div>
                        <span className="text-sm font-bold text-stone-900">
                          {currency}{variant.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Addons */}
            {item.addons && item.addons.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  {t.optionalAddons}
                </label>
                <div className="space-y-2">
                  {(item.addons || []).map(addon => {
                    const isChecked = (selectedAddons || []).some(a => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        id={`addon-${addon.id}`}
                        type="button"
                        onClick={() => toggleAddon(addon)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
                          isChecked
                            ? 'border-rose-600 bg-rose-50/50 text-stone-900 font-medium'
                            : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                              isChecked ? 'bg-rose-600 border-rose-600 text-white' : 'border-stone-300'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-sm">{addon.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-stone-900">
                          +{currency}{addon.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {t.specialInstructions}
              </label>
              <textarea
                id="input-special-instructions"
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                placeholder={t.specialInstructionsPlaceholder}
                rows={2}
                maxLength={200}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm text-stone-800 placeholder:text-stone-400 resize-none transition"
              />
            </div>
          </div>
        </div>

        {/* Footer sticky bar */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center bg-white rounded-xl border border-stone-200 shadow-xs px-2 py-1">
            <button
              id="btn-modal-qty-minus"
              type="button"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-2 text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-7 text-center font-bold text-stone-900 text-sm">{quantity}</span>
            <button
              id="btn-modal-qty-plus"
              type="button"
              onClick={() => setQuantity(q => q + 1)}
              className="p-2 text-rose-600 hover:text-rose-700 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            id="btn-modal-add-to-cart"
            type="button"
            onClick={handleAdd}
            className="flex-1 flex items-center justify-between px-5 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold shadow-md shadow-rose-600/25 transition"
          >
            <span>{t.add}</span>
            <span>{currency}{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
