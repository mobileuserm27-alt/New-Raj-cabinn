import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Layers, Check, X, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuCategory } from '../../types';

export const CategoryManager: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, menuItems, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<MenuCategory | null>(null);
  const [catToDelete, setCatToDelete] = useState<MenuCategory | null>(null);
  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');

  const openCreate = () => {
    setEditingCat(null);
    setName('');
    setHindiName('');
    setIsModalOpen(true);
  };

  const openEdit = (cat: MenuCategory) => {
    setEditingCat(cat);
    setName(cat.name);
    setHindiName(cat.hindiName || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCat) {
      await updateCategory(editingCat.id, {
        name: name.trim(),
        hindiName: hindiName.trim() || undefined
      });
      showToast('Category Updated', `${name} updated successfully`, 'success');
    } else {
      await addCategory({
        name: name.trim(),
        hindiName: hindiName.trim() || undefined,
        sortOrder: categories.length + 1
      });
      showToast('Category Created', `${name} added to menu`, 'success');
    }

    setIsModalOpen(false);
    setName('');
    setHindiName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900">Menu Categories</h2>
          <p className="text-xs text-stone-500">
            Organize dishes into clean menu sections (e.g. Starters, Main Course, Breads, Beverages, Desserts)
          </p>
        </div>

        <button
          id="btn-add-category"
          type="button"
          onClick={openCreate}
          className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-600/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(categories || []).map((cat, idx) => {
          const itemCount = menuItems.filter(m => m.categoryId === cat.id).length;

          return (
            <div
              key={cat.id}
              id={`category-card-${cat.id}`}
              className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex items-center justify-between hover:border-stone-300 transition"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 font-extrabold text-sm flex items-center justify-center">
                  #{idx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">{cat.name}</h3>
                  {cat.hindiName && (
                    <p className="text-xs text-stone-400 font-medium">{cat.hindiName}</p>
                  )}
                  <span className="text-[11px] text-stone-500 mt-1 inline-block">
                    {itemCount} {itemCount === 1 ? 'dish' : 'dishes'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  id={`btn-edit-category-${cat.id}`}
                  type="button"
                  onClick={() => openEdit(cat)}
                  className="p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition"
                  title="Edit Category"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  id={`btn-delete-category-${cat.id}`}
                  type="button"
                  onClick={() => {
                    if (itemCount > 0) {
                      showToast('Cannot Delete', `Move or remove the ${itemCount} dishes in this category first`, 'warn');
                      return;
                    }
                    setCatToDelete(cat);
                  }}
                  className="p-2 rounded-xl bg-rose-50/60 hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Category Confirmation Modal */}
      {catToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            id="delete-category-confirm-modal"
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200 border border-stone-200"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-stone-900">
                Delete Category "{catToDelete.name}"?
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                This category will be removed from your customer menu sections.
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setCatToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteCategory(catToDelete.id);
                  showToast('Category Deleted', `${catToDelete.name} removed`, 'info');
                  setCatToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            id="category-form-modal"
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-stone-900">
                {editingCat ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                id="btn-close-cat-modal"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-stone-500">
                  Category Name (English) *
                </label>
                <input
                  id="input-cat-name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Starters & Appetizers"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-stone-500">
                  Hindi Name (Optional)
                </label>
                <input
                  id="input-cat-hindi"
                  type="text"
                  value={hindiName}
                  onChange={e => setHindiName(e.target.value)}
                  placeholder="e.g. स्टार्टर्स"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-category"
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/25"
                >
                  {editingCat ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
