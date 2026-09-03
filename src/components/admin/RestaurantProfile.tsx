import React, { useState, useRef } from 'react';
import {
  Store,
  Save,
  Sparkles,
  MapPin,
  Phone,
  Clock,
  Image as ImageIcon,
  Check,
  Upload,
  Camera,
  RefreshCw,
  QrCode,
  Palette,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { compressImageFile } from '../../lib/culinarySmartAssist';

export const RestaurantProfile: React.FC = () => {
  const { restaurant, updateRestaurantBranding, showToast } = useApp();

  const [name, setName] = useState(restaurant?.name || '');
  const [tagline, setTagline] = useState(restaurant?.branding.tagline || '');
  const [phone, setPhone] = useState(restaurant?.phone || '');
  const [address, setAddress] = useState(restaurant?.address || '');
  const [city, setCity] = useState(restaurant?.city || '');
  const [openingHours, setOpeningHours] = useState(restaurant?.openingHours || '');
  const [logoUrl, setLogoUrl] = useState(restaurant?.branding.logoUrl || '/images/raj-cabin-logo.jpg');
  const [coverImageUrl, setCoverImageUrl] = useState(restaurant?.branding.coverImageUrl || '/images/raj-cabin-grand-facade.jpg');
  const [upiId, setUpiId] = useState(restaurant?.branding.upiId || '');
  const [upiQrImageUrl, setUpiQrImageUrl] = useState(restaurant?.branding.upiQrImageUrl || '');
  const [primaryColor, setPrimaryColor] = useState(restaurant?.branding.primaryColor || '#e11d48');
  const [cuisines, setCuisines] = useState(
    restaurant?.cuisineTypes ? restaurant.cuisineTypes.join(', ') : 'Biryani & Mughlai, Bengali Delicacies, Tandoor & Starters, Chinese'
  );

  // Upload loaders & refs
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingUpiQr, setIsUploadingUpiQr] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const upiQrInputRef = useRef<HTMLInputElement>(null);

  // Preset Logo Options
  const presetLogos = [
    { label: 'Royal Raj Cabin Gold', url: '/images/raj-cabin-logo.jpg' },
    { label: 'Royal Crest Gold', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop' },
    { label: 'Modern Gourmet', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&auto=format&fit=crop' },
    { label: 'Authentic Tandoor', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop' }
  ];

  // Preset Cover Banner Options
  const presetBanners = [
    { label: 'Heritage Building & Rooftop', url: '/images/raj-cabin-grand-facade.jpg' },
    { label: 'Luxury Dining Hall', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop' },
    { label: 'Rooftop Ambient Night', url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&auto=format&fit=crop' },
    { label: 'Royal Mughal Banquet', url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&auto=format&fit=crop' },
    { label: 'Warm Family Dining', url: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200&auto=format&fit=crop' }
  ];

  // Color Theme Presets
  const themePresets = [
    { name: 'Royal Crimson', hex: '#e11d48', bg: 'bg-rose-600' },
    { name: 'Amber Gold', hex: '#d97706', bg: 'bg-amber-600' },
    { name: 'Emerald Luxe', hex: '#059669', bg: 'bg-emerald-600' },
    { name: 'Sapphire Blue', hex: '#2563eb', bg: 'bg-blue-600' },
    { name: 'Midnight Violet', hex: '#7c3aed', bg: 'bg-violet-600' },
    { name: 'Charcoal Black', hex: '#1c1917', bg: 'bg-stone-900' }
  ];

  // Image Upload Handlers
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingLogo(true);
      showToast('Processing Logo', 'Optimizing logo for fast customer display...', 'info');
      const base64Url = await compressImageFile(file, 400, 400, 0.85);
      setLogoUrl(base64Url);
      showToast('Logo Updated!', 'Restaurant logo saved.', 'success');
    } catch (err: any) {
      showToast('Upload Failed', err?.message || 'Could not process logo', 'error');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingCover(true);
      showToast('Processing Cover Banner', 'Optimizing banner photo for header...', 'info');
      const base64Url = await compressImageFile(file, 1200, 600, 0.82);
      setCoverImageUrl(base64Url);
      showToast('Cover Banner Updated!', 'New banner photo set.', 'success');
    } catch (err: any) {
      showToast('Upload Failed', err?.message || 'Could not process banner', 'error');
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleUpiQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingUpiQr(true);
      showToast('Processing UPI QR', 'Saving payment QR code...', 'info');
      const base64Url = await compressImageFile(file, 600, 600, 0.9);
      setUpiQrImageUrl(base64Url);
      showToast('UPI QR Saved!', 'Customers can now scan your payment QR at bill time.', 'success');
    } catch (err: any) {
      showToast('Upload Failed', err?.message || 'Could not process QR photo', 'error');
    } finally {
      setIsUploadingUpiQr(false);
      if (upiQrInputRef.current) upiQrInputRef.current.value = '';
    }
  };

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
        upiId: upiId.trim(),
        upiQrImageUrl: upiQrImageUrl.trim(),
        primaryColor,
        gstNumber: restaurant.branding.gstNumber || '',
        taxPercentage: restaurant.branding.taxPercentage || 0
      }
    });

    showToast('Restaurant Updated', 'Brand styling and settings saved successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900">Restaurant Profile & Settings</h2>
          <p className="text-xs text-stone-500">
            Upload your restaurant logo, cover banner, UPI payment QR code, and contact information
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Section 1: Visual Branding & Photo Uploads (Super Simple) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>1. Visual Branding Photos (Gallery & Camera)</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              ✓ Direct Photo Upload Enabled
            </span>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={logoInputRef}
            id="input-file-restaurant-logo"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <input
            ref={coverInputRef}
            id="input-file-restaurant-cover"
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
          <input
            ref={upiQrInputRef}
            id="input-file-restaurant-upiqr"
            type="file"
            accept="image/*"
            onChange={handleUpiQrUpload}
            className="hidden"
          />

          {/* Item 1: Restaurant Logo */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-rose-600" />
                <span>Restaurant Logo</span>
              </label>
              <span className="text-[10px] text-stone-400">Displayed on QR standees & menu header</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Logo Preview Avatar */}
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-stone-300 bg-white shadow-xs shrink-0 flex items-center justify-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center p-2 text-stone-400">
                    <ImageIcon className="w-6 h-6 mx-auto mb-0.5 opacity-50" />
                    <span className="text-[9px]">No Logo</span>
                  </div>
                )}

                {isUploadingLogo && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    id="btn-upload-logo-gallery"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo from Gallery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3.5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    title="Take Photo with Camera"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="hidden sm:inline">Camera</span>
                  </button>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition cursor-pointer"
                      title="Remove Logo"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-stone-400">Sample Presets:</span>
                  {presetLogos.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setLogoUrl(p.url)}
                      className="px-2 py-0.5 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-[10px] font-semibold transition"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Item 2: Cover Banner Photo */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                <span>Cover Banner Photo (Rooftop / Exterior / Interior)</span>
              </label>
              <span className="text-[10px] text-stone-400">Header photo on customer phone</span>
            </div>

            <div className="space-y-3">
              {/* Banner Panoramic Preview */}
              <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-stone-300 bg-stone-900 shadow-xs flex items-center justify-center">
                {coverImageUrl ? (
                  <>
                    <img
                      src={coverImageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-3">
                      <span className="text-white font-bold text-xs drop-shadow-md">
                        {name || 'Restaurant Name'} Live Banner Preview
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-3 text-stone-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-xs">No Cover Banner Selected</span>
                  </div>
                )}

                {isUploadingCover && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload CTA and Presets */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    id="btn-upload-cover-gallery"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingCover}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Cover Photo from Gallery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="px-3.5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Camera</span>
                  </button>

                  {coverImageUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl('')}
                      className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Preset Banners */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-stone-400">Presets:</span>
                  {presetBanners.map(b => (
                    <button
                      key={b.label}
                      type="button"
                      onClick={() => setCoverImageUrl(b.url)}
                      className="px-2 py-0.5 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-[10px] font-semibold transition"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Item 3: UPI Payment QR Photo (Optional) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>UPI Payment QR & UPI ID (Optional)</span>
              </label>
              <span className="text-[10px] text-stone-400">PhonePe / GPay / Paytm QR Code</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-stone-300 bg-white shadow-xs shrink-0 flex items-center justify-center">
                  {upiQrImageUrl ? (
                    <img
                      src={upiQrImageUrl}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain p-1"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-center p-1 text-stone-400">
                      <QrCode className="w-6 h-6 mx-auto mb-0.5 opacity-40" />
                      <span className="text-[9px]">No QR</span>
                    </div>
                  )}

                  {isUploadingUpiQr && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => upiQrInputRef.current?.click()}
                    disabled={isUploadingUpiQr}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload UPI QR Photo</span>
                  </button>
                  {upiQrImageUrl && (
                    <button
                      type="button"
                      onClick={() => setUpiQrImageUrl('')}
                      className="text-[10px] text-rose-600 font-bold block hover:underline"
                    >
                      Remove QR Photo
                    </button>
                  )}
                </div>
              </div>

              {/* UPI ID string */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700 text-[11px]">UPI ID / VPA</label>
                <input
                  id="input-res-upi-id"
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="e.g. 9831684703@paytm or rajcabin@okaxis"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Item 4: Brand Accent Color */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
            <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-600" />
              <span>Brand Theme Accent Color</span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              {themePresets.map(tp => (
                <button
                  key={tp.hex}
                  type="button"
                  onClick={() => setPrimaryColor(tp.hex)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition cursor-pointer ${
                    primaryColor.toLowerCase() === tp.hex.toLowerCase()
                      ? 'bg-white border-stone-900 text-stone-900 shadow-xs ring-2 ring-stone-900/20'
                      : 'bg-white/80 border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${tp.bg}`} />
                  <span>{tp.name}</span>
                </button>
              ))}

              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <input
                  id="input-res-color"
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer"
                  title="Pick Custom Color"
                />
                <span className="font-mono text-[11px] text-stone-700 font-bold">{primaryColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Basic Restaurant Contact & Info */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100 font-bold text-stone-800 text-sm">
            <Store className="w-4 h-4 text-rose-600" />
            <span>2. Restaurant Details & Contact Info</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-600 text-[11px]">
                Restaurant Name *
              </label>
              <input
                id="input-res-name"
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. New Raj Cabin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-600 text-[11px]">
                Tagline / Slogan
              </label>
              <input
                id="input-res-tagline"
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="e.g. Multi-Cuisine Restaurant & Rooftop Dining | Since 1989"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-600 text-[11px]">
                Phone Number
              </label>
              <input
                id="input-res-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98316 84703"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-600 text-[11px]">
                Cuisine Tags (Comma Separated)
              </label>
              <input
                id="input-res-cuisines"
                type="text"
                value={cuisines}
                onChange={e => setCuisines(e.target.value)}
                placeholder="Biryani & Mughlai, Bengali Delicacies, Tandoor & Starters, Chinese"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-600 text-[11px]">
                Address Location
              </label>
              <input
                id="input-res-address"
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Building No. 116, 28, Rishi Bankim Chandra Road (R.B.C Road)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-stone-600 text-[11px]">
                City / State
              </label>
              <input
                id="input-res-city"
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Naihati, Kolkata"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold uppercase tracking-wider text-stone-600 text-[11px]">
                Opening Hours & Days
              </label>
              <input
                id="input-res-hours"
                type="text"
                value={openingHours}
                onChange={e => setOpeningHours(e.target.value)}
                placeholder="11:00 AM - 11:00 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            id="btn-save-restaurant-profile"
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Branding Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
