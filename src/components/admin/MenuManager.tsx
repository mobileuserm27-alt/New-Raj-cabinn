import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Check, X, Sparkles, Image as ImageIcon, ToggleLeft, ToggleRight, Layers, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuItem, MenuItemAddon, MenuItemVariant, FoodDietType, SpiceLevel } from '../../types';
import { VegBadge } from '../customer/VegBadge';

export const MenuManager: React.FC = () => {
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem, restaurant, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number>(200);
  const [description, setDescription] = useState('');
  const [dietType, setDietType] = useState<FoodDietType>('veg');
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>('medium');
  const [imageUrl, setImageUrl] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isChefSpecial, setIsChefSpecial] = useState(false);
  const [prepTime, setPrepTime] = useState(15);

  // Variants and Addons inside form
  const [variants, setVariants] = useState<MenuItemVariant[]>([]);
  const [addons, setAddons] = useState<MenuItemAddon[]>([]);

  // Temp variant input
  const [newVarName, setNewVarName] = useState('');
  const [newVarPrice, setNewVarPrice] = useState<number>(0);

  // Temp addon input
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState<number>(0);

  const currency = restaurant?.branding.currencySymbol || '₹';

  const resetForm = () => {
    setName('');
    setHindiName('');
    setCategoryId(categories[0]?.id || '');
    setPrice(200);
    setDescription('');
    setDietType('veg');
    setSpiceLevel('medium');
    setImageUrl('https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop');
    setIsPopular(false);
    setIsChefSpecial(false);
    setPrepTime(15);
    setVariants([]);
    setAddons([]);
    setEditingItem(null);
  };

  const openCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setHindiName(item.hindiName || '');
    setCategoryId(item.categoryId);
    setPrice(item.price);
    setDescription(item.description);
    setDietType(item.dietType);
    setSpiceLevel(item.spiceLevel || 'none');
    setImageUrl(item.imageUrl);
    setIsPopular(!!item.isPopular);
    setIsChefSpecial(!!item.isChefSpecial);
    setPrepTime(item.preparationTimeMinutes || 15);
    setVariants(item.variants || []);
    setAddons(item.addons || []);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Validation Error', 'Dish name is required', 'warn');
      return;
    }

    const payload = {
      name: name.trim(),
      hindiName: hindiName.trim() || undefined,
      categoryId: categoryId || (categories[0]?.id ?? 'cat_1'),
      price: Number(price),
      description: description.trim(),
      dietType,
      spiceLevel,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop',
      isAvailable: editingItem ? editingItem.isAvailable : true,
      isPopular,
      isChefSpecial,
      preparationTimeMinutes: Number(prepTime),
      variants: variants.length > 0 ? variants : undefined,
      addons: addons.length > 0 ? addons : undefined
    };

    if (editingItem) {
      await updateMenuItem(editingItem.id, payload);
      showToast('Dish Updated', `${name} updated successfully!`, 'success');
    } else {
      await addMenuItem(payload);
      showToast('Dish Created', `${name} added to menu!`, 'success');
    }

    setIsFormOpen(false);
    resetForm();
  };

  const toggleAvailability = async (item: MenuItem) => {
    await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
    showToast(
      item.isAvailable ? 'Marked Sold Out' : 'Marked In Stock',
      `${item.name} is now ${item.isAvailable ? 'unavailable' : 'available'} for diners`,
      'info'
    );
  };

  const filteredItems = menuItems.filter(item => {
    if (selectedCat !== 'all' && item.categoryId !== selectedCat) return false;
    if (dietFilter === 'veg' && item.dietType !== 'veg' && item.dietType !== 'vegan') return false;
    if (dietFilter === 'non_veg' && item.dietType !== 'non_veg' && item.dietType !== 'egg') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  // Preset sample images for fast photo assignment
  const sampleImages = [
    { label: 'Paneer / Curry', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop' },
    { label: 'Biryani / Rice', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop' },
    { label: 'Tandoori / Kebab', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop' },
    { label: 'Butter Naan / Roti', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop' },
    { label: 'Mocktail / Drink', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop' },
    { label: 'Gulab Jamun / Sweet', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900">Menu Management</h2>
          <p className="text-xs text-stone-500">
            Add food items, upload photos, set dietary tags, prices, variants, and toggle stock in real-time
          </p>
        </div>

        <button
          id="btn-add-food-item"
          type="button"
          onClick={openCreate}
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-600/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Food Dish</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <select
            id="select-menu-category-filter"
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Categories ({(menuItems || []).length})</option>
            {(categories || []).map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            <button
              id="filter-admin-all"
              type="button"
              onClick={() => setDietFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                dietFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              All
            </button>
            <button
              id="filter-admin-veg"
              type="button"
              onClick={() => setDietFilter('veg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                dietFilter === 'veg' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600'
              }`}
            >
              Veg
            </button>
            <button
              id="filter-admin-nonveg"
              type="button"
              onClick={() => setDietFilter('non_veg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                dietFilter === 'non_veg' ? 'bg-rose-600 text-white shadow-xs' : 'text-stone-600'
              }`}
            >
              Non-Veg
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            id="input-search-menu-items"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search dish name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
          />
        </div>
      </div>

      {/* Menu Dishes Table / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(filteredItems || []).map(item => {
          const categoryObj = categories.find(c => c.id === item.categoryId);

          return (
            <div
              key={item.id}
              id={`admin-dish-row-${item.id}`}
              className={`bg-white rounded-3xl p-4 border transition-all flex flex-col justify-between shadow-xs ${
                item.isAvailable ? 'border-stone-200 hover:border-stone-300' : 'border-stone-200 bg-stone-50/70 opacity-60'
              }`}
            >
              <div className="flex gap-3.5">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-stone-100 shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <VegBadge type={item.dietType} size="sm" />
                    <span className="text-[10px] font-bold uppercase text-stone-400">
                      {categoryObj?.name || 'Category'}
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-900 text-sm truncate mt-0.5">{item.name}</h3>
                  {item.hindiName && (
                    <p className="text-[11px] text-stone-500">{item.hindiName}</p>
                  )}

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm font-extrabold text-stone-900">
                      {currency}{item.price}
                    </span>
                    {item.variants && item.variants.length > 0 && (
                      <span className="text-[10px] text-stone-400">({item.variants.length} sizes)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges and Stock Toggle */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  id={`btn-toggle-stock-${item.id}`}
                  type="button"
                  onClick={() => toggleAvailability(item)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    item.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span>{item.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    id={`btn-edit-dish-${item.id}`}
                    type="button"
                    onClick={() => openEdit(item)}
                    className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition"
                    title="Edit Dish"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-delete-dish-${item.id}`}
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-2 rounded-xl bg-rose-50/60 hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                    title="Delete Dish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Dish Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            id="delete-dish-confirm-modal"
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200 border border-stone-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-stone-900">
                Delete "{itemToDelete.name}"?
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                This dish will be permanently removed from your digital menu and cannot be ordered by guests.
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span className="font-semibold">Price:</span>
              <span className="font-bold text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                {currency}{itemToDelete.price}
              </span>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setIsDeleting(true);
                    await deleteMenuItem(itemToDelete.id);
                    showToast('Dish Removed', `${itemToDelete.name} deleted`, 'info');
                    setItemToDelete(null);
                  } catch (err) {
                    showToast('Error', 'Failed to delete dish', 'error');
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Dish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div
            id="dish-form-modal"
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-5 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg">
                  {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
                </h3>
                <p className="text-xs text-stone-400">Configure dish details, dietary type, photos, variants & add-ons</p>
              </div>
              <button
                id="btn-close-dish-form"
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dish Name */}
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-stone-500">Dish Name (English) *</label>
                  <input
                    id="form-dish-name"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Paneer Butter Masala"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Hindi Name */}
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-stone-500">Hindi Name (Optional)</label>
                  <input
                    id="form-dish-hindi"
                    type="text"
                    value={hindiName}
                    onChange={e => setHindiName(e.target.value)}
                    placeholder="e.g. पनीर बटर मसाला"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-stone-500">Menu Category *</label>
                  <select
                    id="form-dish-category"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Base Price */}
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-stone-500">Base Price ({currency}) *</label>
                  <input
                    id="form-dish-price"
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Diet Type */}
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-stone-500">Dietary Class</label>
                  <select
                    id="form-dish-diet"
                    value={dietType}
                    onChange={e => setDietType(e.target.value as FoodDietType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="veg">🟢 Vegetarian</option>
                    <option value="non_veg">🔴 Non-Vegetarian</option>
                    <option value="egg">🟡 Contains Egg</option>
                    <option value="vegan">🌱 Vegan</option>
                  </select>
                </div>

                {/* Spice Level */}
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-stone-500">Spice Level</label>
                  <select
                    id="form-dish-spice"
                    value={spiceLevel}
                    onChange={e => setSpiceLevel(e.target.value as SpiceLevel)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="none">Mild & Creamy (No spice)</option>
                    <option value="mild">Mild</option>
                    <option value="medium">Medium Spicy</option>
                    <option value="spicy">Spicy 🔥</option>
                    <option value="extra_spicy">Extra Hot 🔥🔥</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-stone-500">Description & Ingredients</label>
                <textarea
                  id="form-dish-description"
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe flavors, ingredients, serving size..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Image URL & Preset Picker */}
              <div className="space-y-2">
                <label className="font-bold uppercase tracking-wider text-stone-500">Dish Photo Image URL</label>
                <input
                  id="form-dish-image"
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-stone-400">Quick Presets:</span>
                  {sampleImages.map(img => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setImageUrl(img.url)}
                      className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold"
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes / Variants (Half/Full) */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-stone-600">Portion Sizes / Variants (Optional)</span>
                  <span className="text-[10px] text-stone-400">e.g. Half / Full / Regular / Large</span>
                </div>

                <div className="flex gap-2">
                  <input
                    id="input-variant-name"
                    type="text"
                    placeholder="Size name (e.g. Full)"
                    value={newVarName}
                    onChange={e => setNewVarName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs"
                  />
                  <input
                    id="input-variant-price"
                    type="number"
                    placeholder={`Price (${currency})`}
                    value={newVarPrice || ''}
                    onChange={e => setNewVarPrice(Number(e.target.value))}
                    className="w-28 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs"
                  />
                  <button
                    id="btn-add-variant-item"
                    type="button"
                    onClick={() => {
                      if (!newVarName.trim() || newVarPrice <= 0) return;
                      setVariants(prev => [
                        ...prev,
                        { id: `var_${Date.now()}`, name: newVarName.trim(), price: newVarPrice }
                      ]);
                      setNewVarName('');
                      setNewVarPrice(0);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-black"
                  >
                    + Add
                  </button>
                </div>

                {variants.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {variants.map(v => (
                      <span
                        key={v.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-stone-200 text-stone-800 font-medium text-xs shadow-xs"
                      >
                        <span>{v.name}: {currency}{v.price}</span>
                        <button
                          type="button"
                          onClick={() => setVariants(prev => prev.filter(x => x.id !== v.id))}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Addons (Extra Cheese, etc.) */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-stone-600">Custom Add-ons (Optional)</span>
                  <span className="text-[10px] text-stone-400">e.g. Extra Cheese, Extra Dip, Extra Paneer</span>
                </div>

                <div className="flex gap-2">
                  <input
                    id="input-addon-name"
                    type="text"
                    placeholder="Addon name (e.g. Extra Cheese)"
                    value={newAddonName}
                    onChange={e => setNewAddonName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs"
                  />
                  <input
                    id="input-addon-price"
                    type="number"
                    placeholder={`Price (${currency})`}
                    value={newAddonPrice || ''}
                    onChange={e => setNewAddonPrice(Number(e.target.value))}
                    className="w-28 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs"
                  />
                  <button
                    id="btn-add-addon-item"
                    type="button"
                    onClick={() => {
                      if (!newAddonName.trim() || newAddonPrice < 0) return;
                      setAddons(prev => [
                        ...prev,
                        { id: `add_${Date.now()}`, name: newAddonName.trim(), price: newAddonPrice }
                      ]);
                      setNewAddonName('');
                      setNewAddonPrice(0);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-black"
                  >
                    + Add
                  </button>
                </div>

                {addons.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {addons.map(a => (
                      <span
                        key={a.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-stone-200 text-stone-800 font-medium text-xs shadow-xs"
                      >
                        <span>{a.name}: +{currency}{a.price}</span>
                        <button
                          type="button"
                          onClick={() => setAddons(prev => prev.filter(x => x.id !== a.id))}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Flags & Prep Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                  <input
                    id="checkbox-popular"
                    type="checkbox"
                    checked={isPopular}
                    onChange={e => setIsPopular(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="font-bold text-stone-800">🔥 Bestseller / Popular</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                  <input
                    id="checkbox-chef-special"
                    type="checkbox"
                    checked={isChefSpecial}
                    onChange={e => setIsChefSpecial(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-bold text-stone-800">✨ Chef&apos;s Special</span>
                </label>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider text-stone-500">Prep Time (mins)</label>
                  <input
                    id="input-prep-time"
                    type="number"
                    min={5}
                    max={120}
                    value={prepTime}
                    onChange={e => setPrepTime(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
                <button
                  id="btn-cancel-dish-form"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-dish-form"
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/25"
                >
                  {editingItem ? 'Save Changes' : 'Create Food Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
