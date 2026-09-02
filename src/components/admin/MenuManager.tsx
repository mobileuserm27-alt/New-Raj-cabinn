import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Check,
  X,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Camera,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Star
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuItem, MenuItemAddon, MenuItemVariant, FoodDietType, SpiceLevel } from '../../types';
import { VegBadge } from '../customer/VegBadge';
import { getSmartDishDetails, compressImageFile } from '../../lib/culinarySmartAssist';

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

  // Image Upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setPrice(180);
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
    setShowAdvancedOptions(false);
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
    setShowAdvancedOptions((item.variants && item.variants.length > 0) || (item.addons && item.addons.length > 0) || !!item.isChefSpecial || !!item.isPopular);
    setIsFormOpen(true);
  };

  // 🪄 Smart Auto-Fill Handler when Dish Name is entered
  const handleDishNameChange = (newName: string) => {
    setName(newName);

    // If user has not manually customized a detailed description yet (or it is empty/short), auto-fill smart details
    if (newName.trim().length >= 3) {
      const smart = getSmartDishDetails(newName);
      
      // Auto fill description if blank or default
      if (!description || description.length < 15 || description.includes('prepared')) {
        setDescription(smart.description);
      }

      // Auto fill Hindi transliteration if blank
      if (!hindiName || hindiName.trim() === '') {
        setHindiName(smart.hindiName);
      }

      // Auto-suggest category if not editing
      if (!editingItem && smart.categoryKeyword) {
        const matchedCat = categories.find(c =>
          c.name.toLowerCase().includes(smart.categoryKeyword!) ||
          c.id.toLowerCase().includes(smart.categoryKeyword!)
        );
        if (matchedCat) {
          setCategoryId(matchedCat.id);
        }
      }

      // Auto select diet type if creating new dish
      if (!editingItem) {
        setDietType(smart.dietType);
        setSpiceLevel(smart.spiceLevel);
        if (smart.suggestedPrepTime) setPrepTime(smart.suggestedPrepTime);
      }
    }
  };

  // Manual Magic Regenerate Description Button
  const handleRegenerateDescription = () => {
    if (!name.trim()) {
      showToast('Enter Dish Name', 'Please type a dish name first', 'warn');
      return;
    }
    const smart = getSmartDishDetails(name);
    setDescription(smart.description);
    if (!hindiName) setHindiName(smart.hindiName);
    setDietType(smart.dietType);
    setSpiceLevel(smart.spiceLevel);
    showToast('✨ Auto-Generated', 'Appetizing description & Hindi name generated!', 'success');
  };

  // 📸 Direct Photo Upload Handler (Gallery / Camera / Files)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      showToast('Processing Image', 'Compressing photo for fast loading...', 'info');
      const base64Url = await compressImageFile(file, 800, 800, 0.82);
      setImageUrl(base64Url);
      showToast('Photo Uploaded!', 'Dish photo ready and saved.', 'success');
    } catch (err: any) {
      showToast('Upload Failed', err?.message || 'Could not process image', 'error');
    } finally {
      setIsUploadingImage(false);
      // Reset input value so same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
      description: description.trim() || `Freshly prepared delicious ${name.trim()} served hot with authentic spices.`,
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

  // Preset sample images for 1-click fallback
  const sampleImages = [
    { label: 'Paneer / Curry', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop' },
    { label: 'Biryani / Rice', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop' },
    { label: 'Tandoori / Kebab', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop' },
    { label: 'Butter Naan / Roti', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop' },
    { label: 'Mocktail / Drink', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop' },
    { label: 'Sweet / Dessert', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900">Menu Management</h2>
          <p className="text-xs text-stone-500">
            Upload dish photos from your gallery, auto-generate descriptions, set prices & manage stock in real-time
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
                  className="w-20 h-20 rounded-2xl object-cover border border-stone-100 shrink-0 bg-stone-100"
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
                Delete &quot;{itemToDelete.name}&quot;?
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

      {/* Add / Edit Dish Modal - Super Simple & Clean */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div
            id="dish-form-modal"
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 border border-stone-100"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 to-stone-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">
                    {editingItem ? 'Edit Dish' : 'Add New Food Dish'}
                  </h3>
                  <p className="text-[11px] text-stone-300">
                    Type dish name for auto-description & upload photo from gallery
                  </p>
                </div>
              </div>
              <button
                id="btn-close-dish-form"
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5 text-xs">
              
              {/* Section 1: Core Details */}
              <div className="space-y-3.5 bg-stone-50/80 p-4 sm:p-5 rounded-2xl border border-stone-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    1. Basic Dish Details
                  </span>
                  <span className="text-[10px] text-stone-400">✨ Auto-fills details as you type</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Dish Name Input */}
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700 flex items-center gap-1">
                      <span>Dish Name (English) *</span>
                      <span className="text-rose-600 text-xs">*</span>
                    </label>
                    <input
                      id="form-dish-name"
                      type="text"
                      required
                      value={name}
                      onChange={e => handleDishNameChange(e.target.value)}
                      placeholder="e.g. Chicken Biryani, Paneer Butter Masala..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none shadow-2xs"
                    />
                  </div>

                  {/* Hindi Name (Auto-Generated) */}
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700 flex items-center justify-between">
                      <span>Hindi Name</span>
                      <span className="text-[10px] font-normal text-emerald-600">Auto Generated</span>
                    </label>
                    <input
                      id="form-dish-hindi"
                      type="text"
                      value={hindiName}
                      onChange={e => setHindiName(e.target.value)}
                      placeholder="e.g. चिकन बिरयानी / पनीर बटर मसाला"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-2xs"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Category *</label>
                    <select
                      id="form-dish-category"
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-2xs cursor-pointer"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="font-bold text-stone-700">Price ({currency}) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-400">
                        {currency}
                      </span>
                      <input
                        id="form-dish-price"
                        type="number"
                        required
                        min={0}
                        value={price}
                        onChange={e => setPrice(Number(e.target.value))}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Diet Type (Veg / Non-Veg / Egg) */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-stone-700">Dietary Classification</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setDietType('veg')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          dietType === 'veg'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <VegBadge type="veg" size="sm" />
                        <span>Vegetarian</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDietType('non_veg')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          dietType === 'non_veg'
                            ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <VegBadge type="non_veg" size="sm" />
                        <span>Non-Veg</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDietType('egg')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          dietType === 'egg'
                            ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <VegBadge type="egg" size="sm" />
                        <span>Contains Egg</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDietType('vegan')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          dietType === 'vegan'
                            ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <VegBadge type="vegan" size="sm" />
                        <span>Vegan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Upload Dish Photo (Gallery / Camera / Files) */}
              <div className="space-y-3 bg-stone-50/80 p-4 sm:p-5 rounded-2xl border border-stone-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    2. Upload Dish Photo (From Mobile / PC)
                  </span>
                  <span className="text-[10px] text-stone-400">JPG, PNG, WebP</span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  id="input-dish-photo-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview Thumbnail */}
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-dashed border-stone-300 bg-white shadow-xs shrink-0 flex items-center justify-center">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Dish Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center p-2 text-stone-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                        <span className="text-[10px]">No Photo</span>
                      </div>
                    )}

                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Upload Action Buttons */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        id="btn-upload-dish-photo"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{imageUrl ? 'Change Photo from Gallery' : 'Upload Photo from Gallery'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                        title="Open Camera"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="hidden sm:inline">Camera</span>
                      </button>

                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition cursor-pointer"
                          title="Remove Photo"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-stone-500">
                      💡 Click <strong>Upload Photo</strong> to choose any picture from your mobile phone or camera. It will be compressed automatically.
                    </p>

                    {/* Quick Preset Photos */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-stone-400">Or Quick Preset:</span>
                      {sampleImages.map(img => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() => setImageUrl(img.url)}
                          className="px-2 py-0.5 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-[10px] font-semibold transition"
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Automatic Description */}
              <div className="space-y-2 bg-stone-50/80 p-4 sm:p-5 rounded-2xl border border-stone-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    3. Description & Flavor Notes
                  </label>
                  <button
                    id="btn-magic-generate-desc"
                    type="button"
                    onClick={handleRegenerateDescription}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 text-[10px] font-bold flex items-center gap-1 border border-amber-400/40 transition cursor-pointer"
                    title="Generate AI Description from Dish Name"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Regenerate AI Text</span>
                  </button>
                </div>

                <textarea
                  id="form-dish-description"
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Appetizing description of dish flavors, ingredients, and spices (automatically generated)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-2xs leading-relaxed"
                />
                <p className="text-[10px] text-stone-400">
                  ✨ Description generates automatically when you type the dish name. You can also edit it directly.
                </p>
              </div>

              {/* Section 4: Advanced Options (Collapsible for cleanliness) */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="w-full px-4 py-3 bg-stone-100/70 hover:bg-stone-100 flex items-center justify-between text-stone-700 transition cursor-pointer"
                >
                  <span className="text-xs font-bold flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-stone-500" />
                    <span>Optional Extras (Portion Sizes / Bestseller Tag / Spice Level)</span>
                  </span>
                  {showAdvancedOptions ? (
                    <ChevronUp className="w-4 h-4 text-stone-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500" />
                  )}
                </button>

                {showAdvancedOptions && (
                  <div className="p-4 sm:p-5 bg-white space-y-4 border-t border-stone-200 animate-in fade-in duration-150">
                    {/* Flags & Spice Level */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Spice Level */}
                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-rose-500" />
                          <span>Spice Level</span>
                        </label>
                        <select
                          id="form-dish-spice"
                          value={spiceLevel}
                          onChange={e => setSpiceLevel(e.target.value as SpiceLevel)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold"
                        >
                          <option value="none">Mild & Creamy (No spice)</option>
                          <option value="mild">Mild</option>
                          <option value="medium">Medium Spicy</option>
                          <option value="spicy">Spicy 🔥</option>
                          <option value="extra_spicy">Extra Hot 🔥🔥</option>
                        </select>
                      </div>

                      {/* Prep Time */}
                      <div className="space-y-1">
                        <label className="font-bold text-stone-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                          <span>Prep Time (mins)</span>
                        </label>
                        <input
                          id="input-prep-time"
                          type="number"
                          min={2}
                          max={120}
                          value={prepTime}
                          onChange={e => setPrepTime(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-bold"
                        />
                      </div>

                      {/* Bestseller Checkbox */}
                      <div className="space-y-1 flex flex-col justify-end">
                        <label className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                          <input
                            id="checkbox-popular"
                            type="checkbox"
                            checked={isPopular}
                            onChange={e => setIsPopular(e.target.checked)}
                            className="w-4 h-4 text-rose-600 rounded"
                          />
                          <span className="font-bold text-stone-800 text-[11px] flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>Bestseller Dish</span>
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Sizes / Variants (Half/Full) */}
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-700">Portion Sizes (e.g. Half / Full)</span>
                        <span className="text-[10px] text-stone-400">Optional</span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          id="input-variant-name"
                          type="text"
                          placeholder="Size (e.g. Half / Full)"
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
                                className="text-rose-500 hover:text-rose-700 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Custom Add-ons (Extra Cheese, etc.) */}
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-700">Custom Add-ons (Optional)</span>
                        <span className="text-[10px] text-stone-400">e.g. Extra Cheese, Dip</span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          id="input-addon-name"
                          type="text"
                          placeholder="Addon (e.g. Extra Cheese)"
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
                                className="text-rose-500 hover:text-rose-700 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA Bar */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  id="btn-cancel-dish-form"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-dish-form"
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Save Changes' : 'Create Food Dish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
