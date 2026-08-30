import React, { useState } from 'react';
import { Store, Save, Sparkles, MapPin, Phone, Clock, Image as ImageIcon, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RestaurantProfile: React.FC = () => {
  const { restaurant, updateRestaurantBranding, showToast } = useApp();

  const [name, setName] = useState(restaurant?.name || '');
  const [tagline, setTagline] = useState(restaurant?.branding.tagline || '');
  const [phone, setPhone] = useState(restaurant?.phone || '');
  const [address, setAddress] = useState(restaurant?.address || '');
  const [city, setCity] = useState(restaurant?.city || '');
  const [openingHours, setOpeningHours] = useState(restaurant?.openingHours || '');
  const [logoUrl, setLogoUrl] = useState(restaurant?.branding.logoUrl || '');
  const [coverImageUrl, setCoverImageUrl] = useState(restaurant?.branding.coverImageUrl || '');
  const [primaryColor, setPrimaryColor] = useState(restaurant?.branding.primaryColor || '#e11d48');
  const [cuisines, setCuisines] = useState(
    restaurant?.cuisineTypes ? restaurant.cuisineTypes.join(', ') : 'North Indian, Mughlai, Tandoor'
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    await updateRestaurantBranding({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      openingHours: openingHours.trim(),
      cuisineTypes: cuisines.split(',').map(s => s.trim()).filter(Boolean),
      branding: {
        ...restaurant.branding,
        tagline: tagline.trim(),
        logoUrl: logoUrl.trim(),
        coverImageUrl: coverImageUrl.trim(),
        primaryColor,
        gstNumber: '',
        taxPercentage: 0
      }
    });

    showToast('Restaurant Updated', 'Brand styling and settings saved successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900">Restaurant Profile & Branding</h2>
          <p className="text-xs text-stone-500">
            Customize your digital QR menu appearance, logo, cover banners, and contact info
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100 font-bold text-stone-800 text-sm">
            <Store className="w-4 h-4 text-rose-600" />
            <span>Basic Restaurant Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-500">Restaurant Name *</label>
              <input
                id="input-res-name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-500">Tagline / Slogan</label>
              <input
                id="input-res-tagline"
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="e.g. Authentic Flavors Since 1994"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-500">Phone Number</label>
              <input
                id="input-res-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-500">Cuisine Tags (Comma Separated)</label>
              <input
                id="input-res-cuisines"
                type="text"
                value={cuisines}
                onChange={e => setCuisines(e.target.value)}
                placeholder="e.g. North Indian, Biryani, Mughlai"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-500">Address Location</label>
              <input
                id="input-res-address"
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-500">City / State</label>
              <input
                id="input-res-city"
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold uppercase tracking-wider text-stone-500">Opening Hours & Days</label>
              <input
                id="input-res-hours"
                type="text"
                value={openingHours}
                onChange={e => setOpeningHours(e.target.value)}
                placeholder="e.g. 11:30 AM - 11:00 PM (Daily)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Visual Brand Styling */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100 font-bold text-stone-800 text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Visual Branding & Theme Assets</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-500">Square Logo Image URL</label>
              <input
                id="input-res-logo"
                type="url"
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-500">Cover Banner Image URL</label>
              <input
                id="input-res-cover"
                type="url"
                value={coverImageUrl}
                onChange={e => setCoverImageUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-500">Primary Brand Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  id="input-res-color"
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 rounded-xl border border-stone-200 cursor-pointer"
                />
                <span className="font-mono text-xs text-stone-700 font-bold">{primaryColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            id="btn-save-restaurant-profile"
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Branding</span>
          </button>
        </div>
      </form>
    </div>
  );
};
