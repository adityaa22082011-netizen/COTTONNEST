import React from 'react';
import { ALLOWED_DISCOUNTS } from '../utils/discount.ts';
import { X, Trophy, CheckCircle } from 'lucide-react';

interface PrizeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastAmount?: number;
}

export const PrizeTableModal: React.FC<PrizeTableModalProps> = ({
  isOpen,
  onClose,
  lastAmount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        id="prize-table-dialog"
        className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">Jackpot Odds & Multiples (₹)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
          Every wheel spin guarantees a discount strictly between <strong>₹100 and ₹150</strong> in multiples of 5.
          Each tier on the wheel has an equal fair probability of 1 in 11 (~9.09%).
        </p>

        <div className="space-y-2">
          {ALLOWED_DISCOUNTS.map((amount) => {
            const isLatest = lastAmount === amount;
            return (
              <div
                key={amount}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  isLatest
                    ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center text-sm ${
                      amount === 150
                        ? 'bg-amber-500 text-white shadow-xs'
                        : amount >= 130
                        ? 'bg-slate-800 text-white'
                        : 'bg-white text-slate-800 border border-slate-200'
                    }`}
                  >
                    ₹{amount}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">₹{amount} Off Voucher</span>
                      {amount === 150 && (
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-xs">
                          MAX TIER
                        </span>
                      )}
                      {amount === 100 && (
                        <span className="text-[10px] font-semibold text-slate-500">
                          BASE TIER
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">Multiple of 5 (5 × {amount / 5})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200">
                    9.09% Odds
                  </span>
                  {isLatest && <CheckCircle className="w-4 h-4 text-amber-600" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Close Table
          </button>
        </div>
      </div>
    </div>
  );
};
