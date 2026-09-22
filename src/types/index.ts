export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface ERCBand {
  monthsRemaining: number; // e.g., >36, >24, >12, <=12
  percentage: number; // e.g., 3%, 2%, 1%, 0.5%
}

export interface Mortgage {
  id: string;
  clientId: string;
  lender: string;
  product: string;
  fixedRate: number; // annual %
  startDate: string;
  endDate: string;
  termYears: number;
  balance: number;
  monthlyPayment: number;
  ercSchedule: ERCBand[];
  type: 'fixed-2' | 'fixed-5' | 'tracker';
  status: 'active' | 'expired' | 'switching';
}

export interface RateSnapshot {
  date: string;
  boeBaseRate: number;
  avg2yrFixed: number;
  avg5yrFixed: number;
  avgSVR: number;
}

export interface Alert {
  id: string;
  clientId: string;
  mortgageId: string;
  type: 'expiry-180' | 'expiry-120' | 'expiry-90' | 'expiry-60' | 'expiry-30' | 'break-even' | 'rate-drop';
  title: string;
  message: string;
  date: string;
  status: 'unread' | 'read' | 'dismissed';
  daysUntilExpiry: number;
  potentialSavings?: number;
}

export interface EmailDraft {
  id: string;
  clientId: string;
  mortgageId: string;
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'scheduled';
  createdAt: string;
  savingsAmount?: number;
  breakEvenDate?: string;
}

export interface BreakEvenResult {
  canSaveBySwitching: boolean;
  ercCost: number;
  currentMonthlyPayment: number;
  bestAvailableRate: number;
  newMonthlyPayment: number;
  monthlySaving: number;
  monthsToBreakEven: number;
  totalSavingOverRemainingTerm: number;
  recommendedAction: 'switch-now' | 'wait' | 'stay';
  explanation: string;
}

export interface BestAvailableDeal {
  lender: string;
  product: string;
  rate: number;
  termYears: number;
  fee: number;
  ltv: number;
}

export type ViewType = 'dashboard' | 'clients' | 'calculator' | 'rates' | 'emails' | 'alerts' | 'reports';
