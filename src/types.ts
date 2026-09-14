export type SpinStep = 'idle' | 'spinning' | 'revealed';

export interface DrawnCoupon {
  id: string;
  discountAmount: number;
  promoCode: string;
  timestamp: number;
  expiryDays: number;
  tierName: string;
  colorTheme: string;
}

export interface WheelSegment {
  amount: number;
  label: string;
  color: string;
  textColor: string;
  accentColor: string;
}
