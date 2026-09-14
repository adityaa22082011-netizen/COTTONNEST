import { DrawnCoupon } from '../types.ts';

// Explicitly 100 to 150 in multiples of 5 (in Indian Rupees ₹)
export const ALLOWED_DISCOUNTS = [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150] as const;

export function getRandomDiscount(lastAmount?: number): number {
  // Avoid repeating the exact same amount twice in a row for a varied, dynamic experience
  const pool = lastAmount 
    ? ALLOWED_DISCOUNTS.filter((d) => d !== lastAmount) 
    : ALLOWED_DISCOUNTS;

  let randomIndex = 0;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    randomIndex = arr[0] % pool.length;
  } else {
    randomIndex = Math.floor(Math.random() * pool.length);
  }
  return pool[randomIndex];
}

const THEMES: { [key: number]: { name: string; color: string } } = {
  100: { name: 'Bronze Saver', color: 'from-amber-500 to-orange-500' },
  105: { name: 'Silver Boost', color: 'from-blue-500 to-cyan-500' },
  110: { name: 'Emerald Spark', color: 'from-emerald-500 to-teal-500' },
  115: { name: 'Sapphire Prize', color: 'from-sky-500 to-indigo-500' },
  120: { name: 'Ruby Fortune', color: 'from-rose-500 to-pink-500' },
  125: { name: 'Gold Jackpot', color: 'from-amber-500 to-yellow-400' },
  130: { name: 'Crystal Deluxe', color: 'from-violet-500 to-purple-500' },
  135: { name: 'Diamond Super', color: 'from-cyan-500 to-blue-600' },
  140: { name: 'Grand Sovereign', color: 'from-fuchsia-500 to-rose-500' },
  145: { name: 'Mega Crown', color: 'from-violet-600 to-amber-500' },
  150: { name: 'ULTIMATE JACKPOT', color: 'from-amber-500 via-rose-500 to-violet-600' },
};

export function generateCoupon(customAmount?: number, lastAmount?: number): DrawnCoupon {
  const amount = customAmount ?? getRandomDiscount(lastAmount);
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `LUCKY${amount}-${randomChars}`;
  const theme = THEMES[amount] || { name: 'Lucky Voucher', color: 'from-emerald-500 to-teal-600' };

  return {
    id: `coupon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    discountAmount: amount,
    promoCode: code,
    timestamp: Date.now(),
    expiryDays: 7,
    tierName: theme.name,
    colorTheme: theme.color,
  };
}
