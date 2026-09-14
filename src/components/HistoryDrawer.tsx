import React, { useState } from 'react';
import { DrawnCoupon } from '../types.ts';
import { History, Copy, Check, Trash2, X } from 'lucide-react';

interface HistoryDrawerProps {
  history: DrawnCoupon[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  isOpen,
  onClose,
  onClear,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        id="history-drawer-dialog"
        className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Your Drawn Coupons History</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-medium">
              {history.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {history.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No coupons won yet. Spin the wheel to get your exclusive discount coupon!
            </div>
          ) : (
            history.map((coupon) => (
              <div
                key={coupon.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/60 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">
                      ₹{coupon.discountAmount} OFF
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {coupon.tierName}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-amber-700 font-semibold block mt-0.5">
                    {coupon.promoCode}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(coupon.promoCode, coupon.id)}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md font-medium cursor-pointer transition-all ${
                    copiedId === coupon.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {copiedId === coupon.id ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
