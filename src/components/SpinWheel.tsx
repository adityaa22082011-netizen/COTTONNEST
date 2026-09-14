import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DrawnCoupon, SpinStep } from '../types.ts';
import { ALLOWED_DISCOUNTS } from '../utils/discount.ts';
import { playMechanicalClick } from '../utils/audio.ts';
import { Sparkles, Trophy } from 'lucide-react';

interface SpinWheelProps {
  step: SpinStep;
  activeCoupon: DrawnCoupon | null;
  onSpin: () => void;
  onCompleteSpin: (wonAmount: number) => void;
  targetAmount: number | null;
  soundEnabled: boolean;
  onViewOdds: () => void;
}

// 11 Slices corresponding to ALLOWED_DISCOUNTS = [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150]
const SLICE_COLORS = [
  { bg: '#3b82f6', text: '#ffffff', accent: '#93c5fd' }, // ₹100 - Royal Blue
  { bg: '#10b981', text: '#ffffff', accent: '#a7f3d0' }, // ₹105 - Emerald
  { bg: '#f59e0b', text: '#ffffff', accent: '#fde68a' }, // ₹110 - Amber Gold
  { bg: '#8b5cf6', text: '#ffffff', accent: '#ddd6fe' }, // ₹115 - Purple
  { bg: '#ef4444', text: '#ffffff', accent: '#fecaca' }, // ₹120 - Crimson
  { bg: '#06b6d4', text: '#ffffff', accent: '#a5f3fc' }, // ₹125 - Cyan
  { bg: '#f97316', text: '#ffffff', accent: '#fed7aa' }, // ₹130 - Tangerine
  { bg: '#ec4899', text: '#ffffff', accent: '#fbcfe8' }, // ₹135 - Pink
  { bg: '#14b8a6', text: '#ffffff', accent: '#99f6e4' }, // ₹140 - Teal
  { bg: '#6366f1', text: '#ffffff', accent: '#c7d2fe' }, // ₹145 - Indigo
  { bg: '#eab308', text: '#713f12', accent: '#fef08a' }, // ₹150 - ULTIMATE GOLD
];

export const SpinWheel: React.FC<SpinWheelProps> = ({
  step,
  onSpin,
  onCompleteSpin,
  targetAmount,
  soundEnabled,
  onViewOdds,
}) => {
  const [currentAngle, setCurrentAngle] = useState<number>(0);
  const [tickerDeflect, setTickerDeflect] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const angleRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastToothIndexRef = useRef<number>(-1);

  const numSlices = ALLOWED_DISCOUNTS.length;
  const sliceAngle = 360 / numSlices; // ~32.727°

  // Helper to calculate slice angles and SVG path
  // Coordinate system: 0 degrees is 12 o'clock (top pointer position)
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    // Angle 0 at top (-90 degrees in standard math)
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', x, y,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z',
    ].join(' ');
  };

  // Perform physics deceleration spin
  const startSpinAnimation = useCallback((targetDiscount: number) => {
    // Find slice index of target discount
    const targetIndex = ALLOWED_DISCOUNTS.indexOf(targetDiscount as typeof ALLOWED_DISCOUNTS[number]);
    const safeIndex = targetIndex >= 0 ? targetIndex : 0;

    // Angle of slice center from top (0 deg at top, clockwise)
    const sliceCenter = (safeIndex + 0.5) * sliceAngle;

    // Desired final angle mod 360 so that sliceCenter is at 0 (top)
    // When wheel rotates by R, sliceCenter moves to (sliceCenter + R) % 360
    // To land at top (0 deg): R = (360 - sliceCenter) % 360
    const desiredFinalMod = (360 - sliceCenter + 360) % 360;

    // Small jitter inside slice to make it feel natural (±30% of half slice)
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.55);

    const currentMod = (angleRef.current % 360 + 360) % 360;
    let distanceNeeded = (desiredFinalMod + jitter - currentMod);
    while (distanceNeeded < 0) distanceNeeded += 360;

    // Add 6 full revolutions for dramatic suspense (around 4.2 seconds)
    const totalSpinDistance = 360 * 6 + distanceNeeded;
    const startAngle = angleRef.current;
    const endAngle = startAngle + totalSpinDistance;

    const duration = 4400; // ms
    const startTime = performance.now();

    // Quintic / cubic ease-out deceleration curve for physical wheel friction
    const easeOut = (t: number): number => {
      return 1 - Math.pow(1 - t, 4);
    };

    let lastSoundTime = 0;

    const ratchetAngle = sliceAngle / 4; // 4 ratchet teeth per slice (~44 teeth per full rotation)

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);

      const newAngle = startAngle + totalSpinDistance * easedProgress;
      angleRef.current = newAngle;
      setCurrentAngle(newAngle);

      // Continuous mechanical ratchet clicking:
      // Track ratchet tooth index as wheel rotates
      const currentTooth = Math.floor(newAngle / ratchetAngle);

      if (currentTooth !== lastToothIndexRef.current) {
        const isMajor = currentTooth % 4 === 0;
        const timeSinceLast = currentTime - lastSoundTime;

        // Rate-limit to at least 18ms between clicks so audio buffers stay crystal clear,
        // delivering a continuous ~55 clicks/sec mechanical ratcheting sound at top speed
        if (timeSinceLast >= 18) {
          const intensity = 1.15 - progress * 0.45;
          playMechanicalClick(soundEnabled, intensity, isMajor);
          lastSoundTime = currentTime;

          // Pointer flapper reaction
          setTickerDeflect(true);
          setTimeout(() => setTickerDeflect(false), isMajor ? 50 : 25);
        }
        lastToothIndexRef.current = currentTooth;
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Complete spin - play final locking latch mechanical click
        playMechanicalClick(soundEnabled, 1.2, true);
        angleRef.current = endAngle;
        setCurrentAngle(endAngle);
        onCompleteSpin(targetDiscount);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [sliceAngle, soundEnabled, onCompleteSpin]);

  // Trigger spin when step becomes 'spinning'
  useEffect(() => {
    if (step === 'spinning' && targetAmount !== null) {
      startSpinAnimation(targetAmount);
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [step, targetAmount, startSpinAnimation]);

  const isSpinning = step === 'spinning';

  return (
    <div className="relative w-full max-w-[460px] mx-auto select-none flex flex-col items-center" id="spin-wheel-container">
      {/* Top Status & Odds Button */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSpinning ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isSpinning ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </span>
          <span className="text-xs font-bold tracking-wide uppercase text-slate-700">
            {isSpinning ? 'Spinning for your lucky prize...' : 'Spin the Wheel • Win ₹100 – ₹150'}
          </span>
        </div>

        <button
          type="button"
          onClick={onViewOdds}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer shadow-xs"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Odds</span>
        </button>
      </div>

      {/* Main Fortune Wheel Stage */}
      <div className="relative p-2 sm:p-4 flex items-center justify-center">
        {/* Outer Shadow & Halo Ring */}
        <div className="absolute inset-2 sm:inset-4 rounded-full bg-gradient-to-tr from-amber-200/50 via-yellow-100/30 to-amber-200/40 filter blur-xl pointer-events-none" />

        {/* Outer Gold Bezel Frame */}
        <div className="relative w-[340px] h-[340px] sm:w-[390px] sm:h-[390px] rounded-full p-3 sm:p-3.5 bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-500 shadow-[0_16px_35px_-8px_rgba(217,119,6,0.35),0_0_0_1px_rgba(245,158,11,0.6)] border-4 border-amber-600/60 flex items-center justify-center">
          
          {/* Decorative LED Indicator Pegs along perimeter (22 bulbs) */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 22 }).map((_, i) => {
              const angle = (i * 360) / 22;
              const rad = (angle * Math.PI) / 180;
              const r = 47.8; // percentage radius
              const left = 50 + r * Math.cos(rad);
              const top = 50 + r * Math.sin(rad);
              const isTwinkling = isSpinning && i % 2 === 0;

              return (
                <div
                  key={i}
                  className={`absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-800/40 shadow-xs transition-colors ${
                    isTwinkling
                      ? 'bg-white shadow-[0_0_6px_#fff]'
                      : i % 2 === 0
                      ? 'bg-amber-100'
                      : 'bg-yellow-400'
                  }`}
                  style={{ left: `${left}%`, top: `${top}%` }}
                />
              );
            })}
          </div>

          {/* Rotating Wheel Disk */}
          <div
            className="w-full h-full rounded-full overflow-hidden shadow-inner relative"
            style={{
              transform: `rotate(${currentAngle}deg)`,
              transformOrigin: 'center center',
            }}
          >
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full drop-shadow-sm"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Slices */}
              {ALLOWED_DISCOUNTS.map((amount, idx) => {
                const startAngle = idx * sliceAngle;
                const endAngle = (idx + 1) * sliceAngle;
                const midAngle = startAngle + sliceAngle / 2;
                const colorConfig = SLICE_COLORS[idx % SLICE_COLORS.length];
                const pathData = describeArc(200, 200, 195, startAngle, endAngle);

                // Text placement at radius 132
                const textPos = polarToCartesian(200, 200, 132, midAngle);
                const isSpecial = amount === 150;

                return (
                  <g key={amount}>
                    {/* Wedge Path */}
                    <path
                      d={pathData}
                      fill={colorConfig.bg}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />

                    {/* Text Label Rotated Radiantly */}
                    <g
                      transform={`translate(${textPos.x}, ${textPos.y}) rotate(${midAngle})`}
                    >
                      {/* Currency Symbol ₹ */}
                      <text
                        x="0"
                        y="-12"
                        fill={colorConfig.text}
                        fontSize="13"
                        fontWeight="700"
                        textAnchor="middle"
                        fontFamily="Outfit, sans-serif"
                        opacity="0.9"
                      >
                        ₹
                      </text>

                      {/* Amount */}
                      <text
                        x="0"
                        y="8"
                        fill={colorConfig.text}
                        fontSize={isSpecial ? '24' : '22'}
                        fontWeight="900"
                        textAnchor="middle"
                        fontFamily="Outfit, sans-serif"
                        letterSpacing="-0.5"
                      >
                        {amount}
                      </text>

                      {/* Sub-label */}
                      <text
                        x="0"
                        y="22"
                        fill={colorConfig.accent}
                        fontSize="9"
                        fontWeight="800"
                        textAnchor="middle"
                        fontFamily="Plus Jakarta Sans, sans-serif"
                        letterSpacing="0.5"
                      >
                        OFF
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Edge Pins / Pegs on Slice Dividers */}
              {ALLOWED_DISCOUNTS.map((_, idx) => {
                const angle = idx * sliceAngle;
                const pos = polarToCartesian(200, 200, 188, angle);
                return (
                  <circle
                    key={`pin-${idx}`}
                    cx={pos.x}
                    cy={pos.y}
                    r="4"
                    fill="#fef08a"
                    stroke="#854d0e"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>

          {/* Center Hub & Interactive Spin Button */}
          <button
            id="wheel-center-spin-button"
            type="button"
            onClick={onSpin}
            disabled={isSpinning}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Spin the wheel"
            className={`absolute z-30 w-24 h-24 sm:w-26 sm:h-26 rounded-full flex flex-col items-center justify-center transition-transform duration-200 cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.25)] border-4 border-amber-300 ${
              isSpinning
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed scale-95'
                : isHovered
                ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 scale-105 active:scale-95 text-slate-950'
                : 'bg-gradient-to-b from-yellow-400 via-amber-500 to-amber-600 text-slate-950'
            }`}
          >
            {/* Gloss reflection overlay */}
            <div className="absolute top-1 inset-x-3 h-7 rounded-t-full bg-white/35 pointer-events-none" />

            <Sparkles className={`w-5 h-5 text-slate-950 mb-0.5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span className="text-sm sm:text-base font-black tracking-wider uppercase font-mono">
              {isSpinning ? 'LUCKY' : 'SPIN'}
            </span>
            <span className="text-[9px] font-bold text-amber-950/80 -mt-0.5">
              ₹100-₹150
            </span>
          </button>

          {/* Top Pointer / Needle Flapper (at 12 o'clock) */}
          <div
            id="wheel-ticker-pointer"
            className="absolute -top-3 z-40 flex flex-col items-center pointer-events-none transition-transform duration-75 origin-top"
            style={{
              transform: tickerDeflect ? 'rotate(-14deg) scale(1.05)' : 'rotate(0deg)',
            }}
          >
            {/* Heavy-duty metallic pointer */}
            <svg width="42" height="46" viewBox="0 0 42 46" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g filter="url(#tickerShadow)">
                {/* Pointer body pointing down */}
                <path
                  d="M21 42L8 10C7 8 8.5 5 11 5H31C33.5 5 35 8 34 10L21 42Z"
                  fill="url(#tickerGold)"
                  stroke="#78350f"
                  strokeWidth="2"
                />
                {/* Center highlight spine */}
                <path d="M21 7L21 38" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                {/* Top pivot circle */}
                <circle cx="21" cy="11" r="5.5" fill="#fef08a" stroke="#78350f" strokeWidth="2" />
                <circle cx="21" cy="11" r="2.5" fill="#b45309" />
              </g>
              <defs>
                <filter id="tickerShadow" x="0" y="0" width="42" height="46" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.35" />
                </filter>
                <linearGradient id="tickerGold" x1="8" y1="5" x2="34" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fef08a" />
                  <stop offset="0.4" stopColor="#f59e0b" />
                  <stop offset="1" stopColor="#b45309" />
                </linearGradient>
              </defs>
            </svg>
          </div>

        </div>
      </div>

      {/* Bottom Main Action Button */}
      <div className="mt-6 w-full max-w-sm flex flex-col items-center">
        <button
          id="btn-main-spin"
          type="button"
          onClick={onSpin}
          disabled={isSpinning}
          className={`relative group w-full py-4 px-6 rounded-xl font-black text-base transition-all duration-200 shadow-md flex items-center justify-center gap-3 cursor-pointer ${
            isSpinning
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 hover:brightness-105 active:scale-[0.99] border border-amber-300 shadow-amber-500/25'
          }`}
        >
          {isSpinning ? (
            <div className="flex items-center gap-2.5 text-slate-700 font-bold">
              <span className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
              <span>Spinning the Wheel...</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-950 group-hover:rotate-12 transition-transform" />
              <span className="tracking-wide text-amber-950 font-extrabold uppercase">
                Spin the Wheel Now
              </span>
              <span className="text-xs bg-amber-950/10 px-2 py-0.5 rounded-md font-mono text-amber-900 font-bold">
                100% Win
              </span>
            </>
          )}
        </button>
        <p className="text-[11px] text-slate-500 mt-2 text-center font-medium">
          Guaranteed random coupon: ₹100, ₹105, ₹110, ₹115, ₹120, ₹125, ₹130, ₹135, ₹140, ₹145, or ₹150.
        </p>
      </div>
    </div>
  );
};
