import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DrawnCoupon } from '../types.ts';
import { CottonNestBanner } from './CottonNestBanner.tsx';
import { Check, Sparkles, Clock, ExternalLink, ShieldCheck, Lock } from 'lucide-react';

interface CouponCardProps {
  coupon: DrawnCoupon | null;
  onViewOdds: () => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, onViewOdds }) => {
  const [applied, setApplied] = useState(false);

  if (!coupon) return null;

  const handleApply = () => {
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  const expiryDate = new Date(coupon.timestamp + coupon.expiryDays * 24 * 60 * 60 * 1000).toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  return (
    <AnimatePresence>
      <motion.div
        id="coupon-reveal-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="relative w-full max-w-lg mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-xl p-5 sm:p-6 overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Cotton Nest Official Voucher</span>
          </div>
          <button
            type="button"
            onClick={onViewOdds}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium underline underline-offset-2 cursor-pointer"
          >
            Prize Breakdown
          </button>
        </div>

        {/* The Cotton Nest Ribbon Banner with Thin Border and Price */}
        <div className="py-2">
          <CottonNestBanner coupon={coupon} />
        </div>

        {/* Voucher Validity & Meta Details */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Valid through <strong>{expiryDate}</strong></span>
          </div>
          <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-md font-mono text-slate-700">
            5× Multiplier Guaranteed
          </span>
        </div>

        {/* Checkout Button & Local Data Lock Notice */}
        <div className="mt-5 space-y-2.5">
          <button
            id="btn-apply-coupon"
            type="button"
            onClick={handleApply}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              applied
                ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-[0.99]'
            }`}
          >
            {applied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Coupon Applied to Cart!</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                <span>Apply Voucher at Checkout (₹{coupon.discountAmount} OFF)</span>
              </>
            )}
          </button>

          {/* Local Data Lock Notice */}
          <div className="py-2.5 px-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 font-semibold text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Prize Locked to Device</span>
            </div>
            <span className="text-[10px] bg-amber-200/70 text-amber-950 px-2 py-0.5 rounded-md font-mono">
              1 Spin Only
            </span>
          </div>

          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
            <span>Saved in local data • Refreshing keeps your coupon locked.</span>
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
