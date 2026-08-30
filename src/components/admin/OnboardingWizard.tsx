import React, { useState } from 'react';
import { CheckCircle2, Store, UtensilsCrossed, QrCode, Sparkles, Printer, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface OnboardingWizardProps {
  onFinish: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onFinish }) => {
  const { restaurant, tables, categories, menuItems, openCustomerMenuForTable, setAdminTab } = useApp();

  const [step, setStep] = useState(1);

  const steps = [
    { num: 1, label: 'Restaurant Profile', desc: 'Name, Logo & Cuisine' },
    { num: 2, label: 'Categories & Menu', desc: 'Upload delicious dishes' },
    { num: 3, label: 'Table Mapping', desc: 'Create tables & QR links' },
    { num: 4, label: 'Print Standees', desc: 'Place QRs on tables' },
    { num: 5, label: 'Go Live', desc: 'Ready for diners' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-8 rounded-3xl shadow-xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Setup Guide</span>
        </div>
        <h2 className="text-2xl font-black">Welcome to Scan & Dine! 🍽️</h2>
        <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
          Follow these 5 simple steps to get your restaurant digital QR menu running in under 5 minutes. No hardware or app installation required for your guests.
        </p>

        {/* Stepper bar */}
        <div className="grid grid-cols-5 gap-2 pt-4">
          {steps.map(s => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;

            return (
              <div
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                  isCurrent
                    ? 'bg-rose-600 border-rose-500 text-white font-bold shadow-md'
                    : isCompleted
                    ? 'bg-stone-800/80 border-emerald-500/50 text-emerald-400 font-semibold'
                    : 'bg-stone-800/40 border-stone-700/50 text-stone-400'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1">
                  {isCompleted ? '✓ Done' : `Step ${s.num}`}
                </div>
                <div className="text-xs font-bold truncate">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Step 1: Restaurant Identity</h3>
                <p className="text-xs text-stone-500">Configure your restaurant name, branding, and contact numbers.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Restaurant:</span>
                <strong className="text-stone-900">{restaurant?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Address:</span>
                <span className="text-stone-700">{restaurant?.address}, {restaurant?.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Cuisines:</span>
                <span className="text-stone-700">{restaurant?.cuisineTypes ? restaurant.cuisineTypes.join(', ') : 'Multi-Cuisine'}</span>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setAdminTab('profile')}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50"
              >
                Edit Profile Settings
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/25"
              >
                <span>Next: Menu Dishes</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Step 2: Categories & Menu Items</h3>
                <p className="text-xs text-stone-500">
                  You currently have {categories.length} categories and {menuItems.length} dishes seeded.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="text-stone-400 font-bold uppercase text-[10px]">Categories</div>
                <div className="text-xl font-black text-stone-900 mt-1">{categories.length}</div>
                <div className="text-stone-500 text-[11px] mt-1">{(categories || []).map(c => c.name).join(', ')}</div>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="text-stone-400 font-bold uppercase text-[10px]">Food Dishes</div>
                <div className="text-xl font-black text-stone-900 mt-1">{menuItems.length}</div>
                <div className="text-stone-500 text-[11px] mt-1">With Veg/Non-Veg icons & spice levels</div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/25"
              >
                <span>Next: Table Management</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Step 3: Table Number Mapping</h3>
                <p className="text-xs text-stone-500">
                  Every table has a unique QR code. When scanned, it locks the order to that table automatically.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
              <div className="font-bold text-stone-800">Your Active Tables:</div>
              <div className="flex flex-wrap gap-2">
                {tables.map(t => (
                  <span key={t.id} className="px-3 py-1 rounded-xl bg-white border border-stone-200 text-stone-900 font-bold">
                    Table #{t.tableNumber} ({t.capacity} seats)
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/25"
              >
                <span>Next: Print QR Standees</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Step 4: Print Table QR Standees</h3>
                <p className="text-xs text-stone-500">
                  Generate beautiful, high-resolution A4 printable standee sheets with your restaurant logo.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs space-y-2 text-rose-950">
              <div className="font-bold text-sm">🖨️ Ready to print?</div>
              <p>
                Click below to open the printable QR code standee generator. Print them on cardstock or insert them into acrylic table tents.
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/25"
              >
                <span>Next: Go Live</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-black text-stone-900">Your Restaurant is Ready to Dine! 🎉</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Your staff dashboard is now synchronized in real-time. You can simulate testing table orders, kitchen tickets, or waiter calls anytime.
            </p>

            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => openCustomerMenuForTable('12')}
                className="px-6 py-3 rounded-2xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-900 text-xs font-bold shadow-xs transition"
              >
                📱 Test Customer Menu (Table 12)
              </button>
              <button
                type="button"
                onClick={onFinish}
                className="px-8 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                🚀 Open Staff Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
