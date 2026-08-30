import React from 'react';
import { Plus, Minus, Sparkles, Flame } from 'lucide-react';
import { MenuItem } from '../../types';
import { VegBadge } from './VegBadge';
import { useApp } from '../../context/AppContext';

interface FoodCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item, onSelect }) => {
  const { cart, addToCart, updateCartQuantity, t, language, restaurant } = useApp();

  const currency = restaurant?.branding.currencySymbol || '₹';

  // Check if any variant of this dish is already in the cart
  const cartItemsForThisDish = cart.filter(c => c.menuItem.id === item.id);
  const totalQtyInCart = cartItemsForThisDish.reduce((sum, c) => sum + c.quantity, 0);

  const hasCustomizations = (item.variants && item.variants.length > 0) || (item.addons && item.addons.length > 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasCustomizations) {
      onSelect(item);
    } else {
      addToCart(item);
    }
  };

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItemsForThisDish.length > 0) {
      updateCartQuantity(cartItemsForThisDish[0].cartItemId, -1);
    }
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasCustomizations) {
      onSelect(item);
    } else if (cartItemsForThisDish.length > 0) {
      updateCartQuantity(cartItemsForThisDish[0].cartItemId, 1);
    } else {
      addToCart(item);
    }
  };

  return (
    <div
      id={`dish-card-${item.id}`}
      onClick={() => onSelect(item)}
      className="group relative flex gap-3.5 sm:gap-4 p-4 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      {/* Left Details Column */}
      <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
        <div>
          {/* Diet & Special Badges */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <VegBadge type={item.dietType} size="sm" />
            {item.isChefSpecial && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/80">
                <Sparkles className="w-2.5 h-2.5" />
                {t.chefSpecial}
              </span>
            )}
            {item.isPopular && (
              <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200/80">
                {t.popular}
              </span>
            )}
            {item.spiceLevel && ['spicy', 'extra_spicy'].includes(item.spiceLevel) && (
              <span className="inline-flex items-center gap-0.5 text-orange-600 text-[11px] font-semibold">
                <Flame className="w-3 h-3 fill-orange-500" />
              </span>
            )}
          </div>

          {/* Dish Name */}
          <h3 className="font-bold text-stone-900 text-base sm:text-lg group-hover:text-rose-600 transition leading-snug line-clamp-1">
            {language === 'hi' && item.hindiName ? item.hindiName : item.name}
          </h3>

          {/* Price */}
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-stone-900">
              {currency}{item.price}
            </span>
            {item.variants && item.variants.length > 0 && (
              <span className="text-[11px] text-stone-500 font-medium">onwards</span>
            )}
          </div>

          {/* Description */}
          <p className="mt-1.5 text-xs text-stone-600 line-clamp-2 leading-relaxed font-normal">
            {item.description}
          </p>
        </div>

        {/* Preparation time & Customization Tag */}
        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-stone-500">
          {item.preparationTimeMinutes && (
            <span>⏱️ ~{item.preparationTimeMinutes}m</span>
          )}
          {hasCustomizations && (
            <span className="text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-sm font-medium">
              {t.customizable}
            </span>
          )}
        </div>
      </div>

      {/* Right Image & Add Button Column */}
      <div className="relative w-28 sm:w-32 h-28 sm:h-32 shrink-0 flex flex-col items-center">
        <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-stone-100 border border-stone-100 shadow-inner">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>

        {/* Add / Qty Button floating at bottom of image */}
        <div className="absolute -bottom-1.5 z-10 w-24 sm:w-26">
          {totalQtyInCart > 0 ? (
            <div className="flex items-center justify-between bg-white text-rose-700 font-extrabold rounded-lg shadow-md border border-rose-300 px-1 py-1 text-xs">
              <button
                id={`btn-minus-${item.id}`}
                type="button"
                onClick={handleMinus}
                className="p-1 hover:bg-rose-50 rounded text-rose-700 transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold">{totalQtyInCart}</span>
              <button
                id={`btn-plus-${item.id}`}
                type="button"
                onClick={handlePlus}
                className="p-1 hover:bg-rose-50 rounded text-rose-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id={`btn-add-${item.id}`}
              type="button"
              onClick={handleQuickAdd}
              className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-rose-50 text-rose-600 font-extrabold text-xs shadow-md border border-rose-200 hover:border-rose-300 transition flex items-center justify-center gap-1 active:scale-95"
            >
              <span>{t.add}</span>
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
