import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SpinWheel } from './components/SpinWheel.tsx';
import { CouponCard } from './components/CouponCard.tsx';
import { PrizeTableModal } from './components/PrizeTableModal.tsx';
import { GitHubGuideModal } from './components/GitHubGuideModal.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';
import { SpinStep, DrawnCoupon } from './types.ts';
import { generateCoupon, ALLOWED_DISCOUNTS } from './utils/discount.ts';
import {
  playCelebrationFanfare,
  playClickSound,
} from './utils/audio.ts';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Github,
  Trophy,
  History,
  Info,
  Disc3,
  Lock,
  RotateCcw,
} from 'lucide-react';

const STORAGE_KEY_COUPON = 'jackpot_won_coupon_v1';
const STORAGE_KEY_HISTORY = 'jackpot_coupon_history_v1';

export default function App() {
  // Load initial coupon from localStorage to prevent re-spinning across refreshes
  const [activeCoupon, setActiveCoupon] = useState<DrawnCoupon | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COUPON);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // If a coupon already exists in local storage, lock the state to 'revealed'
  const [step, setStep] = useState<SpinStep>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COUPON);
      return saved ? 'revealed' : 'idle';
    } catch {
      return 'idle';
    }
  });

  const [targetAmount, setTargetAmount] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [history, setHistory] = useState<DrawnCoupon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [showOddsModal, setShowOddsModal] = useState<boolean>(false);
  const [showGitHubModal, setShowGitHubModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Optional manual testing override (defaults to pure random)
  const [testAmount, setTestAmount] = useState<number | null>(null);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {
      // storage quota or incognito guard
    }
  }, [history]);

  const handleStartSpin = () => {
    // Double check: if already revealed or in local storage, block spinning completely
    if (step !== 'idle') return;
    try {
      if (localStorage.getItem(STORAGE_KEY_COUPON)) {
        setStep('revealed');
        return;
      }
    } catch {
      // ignore
    }

    const chosenCoupon = generateCoupon(testAmount ?? undefined, activeCoupon?.discountAmount);
    setActiveCoupon(chosenCoupon);
    setTargetAmount(chosenCoupon.discountAmount);

    // Save immediately to localStorage so refreshing mid-spin cannot be used to retry
    try {
      localStorage.setItem(STORAGE_KEY_COUPON, JSON.stringify(chosenCoupon));
    } catch (e) {
      console.error('Failed to save spin to localStorage', e);
    }

    playClickSound(soundEnabled);
    setStep('spinning');
  };

  const handleCompleteSpin = (wonAmount: number) => {
    setStep('revealed');
    playCelebrationFanfare(soundEnabled, wonAmount);

    // Trigger celebratory confetti burst
    try {
      confetti({
        particleCount: wonAmount >= 140 ? 110 : 75,
        spread: 80,
        origin: { y: 0.62 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#f97316', '#eab308'],
      });
    } catch {
      // canvas guard
    }

    if (activeCoupon) {
      // Ensure coupon is saved in local data
      try {
        localStorage.setItem(STORAGE_KEY_COUPON, JSON.stringify(activeCoupon));
      } catch {
        // ignore
      }
      setHistory((prev) => {
        if (prev.some((c) => c.id === activeCoupon.id)) return prev;
        return [activeCoupon, ...prev];
      });
    }
  };

  // Demo testing reset helper to clear localStorage if explicitly requested
  const handleResetLocalStorageForDemo = () => {
    if (window.confirm('Reset local data? This will clear your saved coupon and allow a new spin for demo testing.')) {
      try {
        localStorage.removeItem(STORAGE_KEY_COUPON);
        localStorage.removeItem(STORAGE_KEY_HISTORY);
      } catch {
        // ignore
      }
      setActiveCoupon(null);
      setTargetAmount(null);
      setHistory([]);
      setStep('idle');
    }
  };

  const hasAlreadySpun = Boolean(activeCoupon && step === 'revealed');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white flex items-center justify-center shadow-xs font-black text-base tracking-wider">
              CN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                  Cotton Nest
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                  ₹100–₹150 in 5s
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Feel The Softness • Lucky Prize Wheel
              </p>
            </div>
          </div>

          {/* Controls & Modals Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Sound Toggle */}
            <button
              id="btn-sound-toggle"
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Prize Odds Table */}
            <button
              id="btn-odds-modal"
              type="button"
              onClick={() => setShowOddsModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">Odds Table (₹)</span>
            </button>

            {/* History Drawer */}
            <button
              id="btn-history-modal"
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Saved Prize</span>
              {history.length > 0 && (
                <span className="ml-0.5 bg-amber-500 text-white font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {history.length}
                </span>
              )}
            </button>

            {/* GitHub Launch Guide */}
            <button
              id="btn-github-guide"
              type="button"
              onClick={() => setShowGitHubModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xs cursor-pointer transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Launch on GitHub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Persistent Local Data Banner */}
      {hasAlreadySpun && (
        <div className="bg-amber-500/10 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-900 font-medium flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-amber-700" />
          <span>
            You have already used your 1 lucky spin. Your coupon is safely saved in local data even after refreshing!
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full px-4 py-6 sm:py-10 flex-1 flex flex-col items-center justify-center">
        {/* Intro Subtitle & Multiples Pill */}
        <div className="text-center max-w-xl mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-semibold text-slate-700">
              {hasAlreadySpun
                ? 'Spin Already Claimed • Single Use Only'
                : '11 Slices: ₹100, ₹105, ₹110, ₹115, ₹120, ₹125, ₹130, ₹135, ₹140, ₹145, ₹150'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {hasAlreadySpun ? 'Your Saved Prize Coupon' : 'Spin the Lucky Wheel'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
            {hasAlreadySpun
              ? 'This prize is stored in your device local storage. You cannot respin after refreshing.'
              : 'Give the wheel a spin to unlock your guaranteed discount coupon between ₹100 and ₹150 in multiples of 5!'}
          </p>
        </div>

        {/* The Spin Wheel or Winning Card Stage */}
        <div className="w-full max-w-xl">
          {step === 'revealed' && activeCoupon ? (
            <div className="space-y-6">
              <CouponCard
                coupon={activeCoupon}
                onViewOdds={() => setShowOddsModal(true)}
              />
            </div>
          ) : (
            <SpinWheel
              step={step}
              activeCoupon={activeCoupon}
              onSpin={handleStartSpin}
              onCompleteSpin={handleCompleteSpin}
              targetAmount={targetAmount}
              soundEnabled={soundEnabled}
              onViewOdds={() => setShowOddsModal(true)}
            />
          )}
        </div>

        {/* Quick Multiples Verification Bar & Local Data Status */}
        <div className="mt-8 w-full max-w-2xl bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {hasAlreadySpun ? 'Local Data Active:' : 'All 11 Wheel Prize Sectors:'}
                </span>
                <p className="text-[11px] text-slate-500">
                  {hasAlreadySpun
                    ? 'Your prize is locked to this browser. Refreshing preserves your coupon and prevents respinning.'
                    : 'Strictly ₹100 to ₹150 in multiples of 5 with fair equal odds (~9.09%).'}
                </p>
              </div>
            </div>

            {/* Test Tier Picker or Demo Reset */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {hasAlreadySpun ? (
                <button
                  type="button"
                  id="btn-reset-demo"
                  onClick={handleResetLocalStorageForDemo}
                  title="Clear local data to test spinning again"
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Demo Spin</span>
                </button>
              ) : (
                <>
                  <span className="text-[11px] font-semibold text-slate-500">Mode:</span>
                  <select
                    id="select-tier-mode"
                    aria-label="Prize Generation Mode"
                    value={testAmount ?? 'random'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTestAmount(val === 'random' ? null : Number(val));
                    }}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:ring-1 focus:ring-amber-400 outline-hidden cursor-pointer"
                  >
                    <option value="random">Random Fair Spin (Default)</option>
                    {ALLOWED_DISCOUNTS.map((d) => (
                      <option key={d} value={d}>
                        Target ₹{d} OFF
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Mini tags of all 11 values */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 justify-center">
            {ALLOWED_DISCOUNTS.map((amount) => (
              <span
                key={amount}
                className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                  activeCoupon?.discountAmount === amount && step === 'revealed'
                    ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                ₹{amount}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Spin the Wheel • Light Static Web Edition</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowGitHubModal(true)}
              className="text-slate-700 hover:text-slate-900 font-medium underline underline-offset-2 cursor-pointer"
            >
              GitHub Pages Ready
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setShowOddsModal(true)}
              className="text-slate-700 hover:text-slate-900 font-medium underline underline-offset-2 cursor-pointer"
            >
              Odds & Rules
            </button>
            {hasAlreadySpun && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleResetLocalStorageForDemo}
                  className="text-slate-500 hover:text-rose-600 cursor-pointer"
                >
                  Clear Local Data (Demo)
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <PrizeTableModal
        isOpen={showOddsModal}
        onClose={() => setShowOddsModal(false)}
        lastAmount={activeCoupon?.discountAmount}
      />

      <GitHubGuideModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
      />

      <HistoryDrawer
        history={history}
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onClear={() => {
          setHistory([]);
          try {
            localStorage.removeItem(STORAGE_KEY_HISTORY);
          } catch {
            // ignore
          }
        }}
      />
    </div>
  );
}
