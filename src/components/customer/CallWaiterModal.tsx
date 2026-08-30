import React, { useState } from 'react';
import { X, Bell, Droplets, Receipt, HelpCircle, Sparkles, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CallWaiterModal: React.FC = () => {
  const { isCallWaiterOpen, setIsCallWaiterOpen, submitWaiterCall, activeTableNumber, t } = useApp();

  const [selectedType, setSelectedType] = useState<'call_waiter' | 'water' | 'bill' | 'help' | 'clean_table'>('call_waiter');
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isCallWaiterOpen) return null;

  const options = [
    {
      id: 'call_waiter' as const,
      label: t.callWaiter,
      icon: Bell,
      desc: 'Request table assistance',
      color: 'bg-rose-50 border-rose-200 text-rose-700'
    },
    {
      id: 'water' as const,
      label: t.needWater,
      icon: Droplets,
      desc: 'Bring fresh drinking water',
      color: 'bg-sky-50 border-sky-200 text-sky-700'
    },
    {
      id: 'bill' as const,
      label: t.requestBill,
      icon: Receipt,
      desc: 'Bring final printed invoice',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
    },
    {
      id: 'clean_table' as const,
      label: t.cleanTable,
      icon: Sparkles,
      desc: 'Clear plates & sanitize table',
      color: 'bg-amber-50 border-amber-200 text-amber-700'
    },
    {
      id: 'help' as const,
      label: t.needHelp,
      icon: HelpCircle,
      desc: 'Ask general menu queries',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
    }
  ];

  const handleSubmit = async () => {
    try {
      setIsSending(true);
      await submitWaiterCall(selectedType, customNote);
      setCustomNote('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        id="call-waiter-modal"
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">{t.callWaiter}</h2>
              <p className="text-xs text-stone-500 font-medium">Table #{activeTableNumber}</p>
            </div>
          </div>
          <button
            id="btn-close-waiter-modal"
            onClick={() => setIsCallWaiterOpen(false)}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options list */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
            What do you need assistance with?
          </label>
          <div className="grid grid-cols-1 gap-2">
            {options.map(opt => {
              const isSelected = selectedType === opt.id;
              const IconComp = opt.icon;
              return (
                <button
                  key={opt.id}
                  id={`waiter-option-${opt.id}`}
                  type="button"
                  onClick={() => setSelectedType(opt.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/70 ring-1 ring-rose-600'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${opt.color}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-stone-900">{opt.label}</div>
                    <div className="text-xs text-stone-500">{opt.desc}</div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-rose-600 bg-rose-600' : 'border-stone-300'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional note */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Additional Note (Optional)
          </label>
          <input
            id="input-waiter-note"
            type="text"
            value={customNote}
            onChange={e => setCustomNote(e.target.value)}
            placeholder="e.g. Extra napkins, baby chair, cutlery..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Submit button */}
        <button
          id="btn-send-waiter-request"
          type="button"
          disabled={isSending}
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition"
        >
          <Send className="w-4 h-4" />
          <span>{isSending ? 'Sending Request...' : 'Send Request to Staff'}</span>
        </button>
      </div>
    </div>
  );
};
