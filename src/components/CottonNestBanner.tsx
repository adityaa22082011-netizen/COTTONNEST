import React, { useState } from 'react';
import { DrawnCoupon } from '../types.ts';
import { Copy, Check, ShieldCheck } from 'lucide-react';

interface CottonNestBannerProps {
  coupon: DrawnCoupon;
  className?: string;
}

export const CottonNestBanner: React.FC<CottonNestBannerProps> = ({ coupon, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className={`relative w-full max-w-xl mx-auto select-none ${className}`} id="cotton-nest-voucher-banner">
      {/* SVG Container for the swallowtail banner with thin border and Cotton Nest name */}
      <div className="relative w-full drop-shadow-md filter">
        <svg
          viewBox="0 0 540 160"
          className="w-full h-auto overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft celestial/ice-blue gradient */}
            <linearGradient id="bannerBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e1f2fe" />
              <stop offset="50%" stopColor="#e8f5ff" />
              <stop offset="100%" stopColor="#d9effe" />
            </linearGradient>

            {/* Subtle Abstract Textile Pattern */}
            <pattern id="textilePattern" width="48" height="48" patternUnits="userSpaceOnUse">
              <path
                d="M4 12 Q 12 4, 20 12 T 36 12 M12 28 Q 20 20, 28 28 T 44 28 M0 40 Q 8 32, 16 40 T 32 40 M28 6 Q 34 2, 40 6 T 48 6 M2 22 C 6 20, 10 24, 14 22 C 18 20, 22 24, 26 22"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.8"
                opacity="0.2"
                strokeLinecap="round"
              />
              <circle cx="24" cy="14" r="1.2" fill="#0284c7" opacity="0.15" />
              <circle cx="8" cy="34" r="1" fill="#0284c7" opacity="0.15" />
              <circle cx="42" cy="40" r="1.2" fill="#0284c7" opacity="0.15" />
            </pattern>
          </defs>

          {/* Swallowtail Ribbon Banner Shape with Thin Border:
              Top-left: (0, 0)
              Right: (540, 0)
              Right Inward Notch: (508, 80) -> (540, 160)
              Bottom-left: (0, 160)
              Left Inward Notch: (32, 80) -> (0, 0)
          */}
          <path
            d="M 0 0 
               L 540 0 
               L 508 80 
               L 540 160 
               L 0 160 
               L 32 80 
               Z"
            fill="url(#bannerBgGrad)"
            stroke="#7dd3fc"
            strokeWidth="1.2"
            strokeLinejoin="miter"
          />

          {/* Textile pattern overlay */}
          <path
            d="M 0 0 L 540 0 L 508 80 L 540 160 L 0 160 L 32 80 Z"
            fill="url(#textilePattern)"
            opacity="0.85"
          />

          {/* Inner Delicate Thin Accent Border Frame */}
          <path
            d="M 6 4 
               L 532 4 
               L 502 80 
               L 532 156 
               L 6 156 
               L 36 80 
               Z"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="0.75"
            strokeDasharray="4 2"
            opacity="0.45"
          />

          {/* === BRAND NAME: COTTON NEST (Elegant Typography inside Light Box) === */}
          <g transform="translate(114, 80)">
            {/* Soft luminous card behind brand name */}
            <rect
              x="-72"
              y="-46"
              width="144"
              height="92"
              rx="10"
              fill="#ffffff"
              fillOpacity="0.92"
              stroke="#bae6fd"
              strokeWidth="1.2"
            />

            {/* Delicate inner accent frame */}
            <rect
              x="-66"
              y="-40"
              width="132"
              height="80"
              rx="6"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="0.75"
              strokeDasharray="3 2"
            />

            {/* Elegant Crown / Star Flourish */}
            <g transform="translate(0, -22)" opacity="0.75">
              <path
                d="M 0 -6 L 1.8 -1.8 L 6 0 L 1.8 1.8 L 0 6 L -1.8 1.8 L -6 0 L -1.8 -1.8 Z"
                fill="#0284c7"
              />
              <circle cx="-16" cy="0" r="1" fill="#38bdf8" />
              <circle cx="16" cy="0" r="1" fill="#38bdf8" />
            </g>

            {/* COTTON NEST Name in Elegant Serif Typography */}
            <text
              x="0"
              y="2"
              textAnchor="middle"
              fontFamily="'Playfair Display', 'Cormorant Garamond', 'Baskerville', 'Georgia', serif"
              fontSize="16"
              fontWeight="700"
              fill="#0f172a"
              letterSpacing="0.08em"
            >
              COTTON NEST
            </text>

            {/* Slogan: ── FEEL THE SOFTNESS ── */}
            <g transform="translate(0, 20)">
              <line x1="-50" y1="-3" x2="-36" y2="-3" stroke="#94a3b8" strokeWidth="0.75" />
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fontFamily="'Plus Jakarta Sans', sans-serif"
                fontSize="6.8"
                fontWeight="700"
                fill="#475569"
                letterSpacing="0.14em"
              >
                FEEL THE SOFTNESS
              </text>
              <line x1="36" y1="-3" x2="50" y2="-3" stroke="#94a3b8" strokeWidth="0.75" />
            </g>
          </g>

          {/* Subtle Vertical Dashed Divider between Brand Name and Price */}
          <line
            x1="200"
            y1="28"
            x2="200"
            y2="132"
            stroke="#7dd3fc"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.75"
          />

          {/* === RIGHT SIDE: THE PRICE & VOUCHER DETAILS === */}
          <g transform="translate(216, 0)">
            {/* Exclusive Store Voucher Eyebrow */}
            <text
              x="0"
              y="38"
              fontFamily="'Plus Jakarta Sans', sans-serif"
              fontSize="8.5"
              fontWeight="800"
              fill="#0369a1"
              letterSpacing="0.18em"
            >
              EXCLUSIVE STORE VOUCHER
            </text>

            {/* The Price & OFF */}
            <g transform="translate(0, 74)">
              {/* Currency Symbol ₹ */}
              <text
                x="0"
                y="-2"
                fontFamily="Outfit, sans-serif"
                fontSize="24"
                fontWeight="800"
                fill="#0f172a"
              >
                ₹
              </text>
              {/* Main Price Amount (₹100 to ₹150) */}
              <text
                x="18"
                y="0"
                fontFamily="Outfit, sans-serif"
                fontSize="38"
                fontWeight="900"
                fill="#0f172a"
                letterSpacing="-1"
              >
                {coupon.discountAmount}
              </text>
              {/* OFF Pill */}
              <text
                x="100"
                y="-4"
                fontFamily="Outfit, sans-serif"
                fontSize="20"
                fontWeight="900"
                fill="#0284c7"
                letterSpacing="0.5"
              >
                OFF
              </text>
            </g>

            {/* Sub-label */}
            <text
              x="0"
              y="96"
              fontFamily="'Plus Jakarta Sans', sans-serif"
              fontSize="8.5"
              fontWeight="600"
              fill="#475569"
            >
              Applicable on all Cotton Nest bedding & apparel
            </text>

            {/* Promo Code Pill Box */}
            <g transform="translate(0, 110)">
              <rect
                x="0"
                y="0"
                width="165"
                height="28"
                rx="6"
                fill="#ffffff"
                stroke="#7dd3fc"
                strokeWidth="1"
              />
              <text
                x="10"
                y="18"
                fontFamily="monospace"
                fontSize="12"
                fontWeight="800"
                fill="#0284c7"
                letterSpacing="1"
              >
                {coupon.promoCode}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Copy Code & Verification Bar */}
      <div className="mt-3 flex items-center justify-between gap-2 px-2">
        <button
          type="button"
          onClick={handleCopy}
          id="btn-copy-cotton-code"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 active:scale-95'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-sky-600" />
              <span>Copy Code: <strong className="font-mono">{coupon.promoCode}</strong></span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cotton Nest • Flat ₹{coupon.discountAmount} OFF</span>
        </div>
      </div>
    </div>
  );
};
