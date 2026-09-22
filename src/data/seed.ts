import { Client, Mortgage, RateSnapshot, Alert, EmailDraft, BestAvailableDeal } from '../types';

export const seedClients: Client[] = [
  { id: 'c1', name: 'James Whitfield', email: 'j.whitfield@email.co.uk', phone: '07700 900123', address: '14 Oak Lane, Bristol BS1 4QR', createdAt: '2024-01-15' },
  { id: 'c2', name: 'Sarah Pemberton', email: 's.pemberton@email.co.uk', phone: '07700 900456', address: '8 Elm Close, Bath BA2 7JN', createdAt: '2024-02-20' },
  { id: 'c3', name: 'David Okonkwo', email: 'd.okonkwo@email.co.uk', phone: '07700 900789', address: '22 Maple Drive, Bristol BS8 2TH', createdAt: '2024-03-10' },
  { id: 'c4', name: 'Emma Richardson', email: 'e.richardson@email.co.uk', phone: '07700 900321', address: '5 Cedar Road, Clifton BS6 7AA', createdAt: '2024-04-05' },
  { id: 'c5', name: 'Michael Chen', email: 'm.chen@email.co.uk', phone: '07700 900654', address: '31 Pine Street, Bristol BS2 9EH', createdAt: '2024-05-12' },
  { id: 'c6', name: 'Laura Fitzgerald', email: 'l.fitzgerald@email.co.uk', phone: '07700 900987', address: '17 Birch Avenue, Bath BA1 5SU', createdAt: '2024-06-18' },
  { id: 'c7', name: 'Robert Kowalski', email: 'r.kowalski@email.co.uk', phone: '07700 900111', address: '9 Willow Way, Bristol BS3 4NT', createdAt: '2024-07-22' },
  { id: 'c8', name: 'Priya Sharma', email: 'p.sharma@email.co.uk', phone: '07700 900222', address: '44 Rose Gardens, Bath BA2 6LP', createdAt: '2024-08-30' },
];

export const seedMortgages: Mortgage[] = [
  {
    id: 'm1', clientId: 'c1', lender: 'Barclays', product: '2-Year Fixed', fixedRate: 4.89,
    startDate: '2024-03-01', endDate: '2026-03-01', termYears: 25, balance: 285000,
    monthlyPayment: 1642, type: 'fixed-2', status: 'active',
    ercSchedule: [
      { monthsRemaining: 24, percentage: 3.0 },
      { monthsRemaining: 12, percentage: 1.5 },
      { monthsRemaining: 6, percentage: 0.5 },
    ]
  },
  {
    id: 'm2', clientId: 'c2', lender: 'Nationwide', product: '5-Year Fixed', fixedRate: 2.45,
    startDate: '2022-06-15', endDate: '2027-06-15', termYears: 28, balance: 342000,
    monthlyPayment: 1498, type: 'fixed-5', status: 'active',
    ercSchedule: [
      { monthsRemaining: 60, percentage: 5.0 },
      { monthsRemaining: 48, percentage: 4.0 },
      { monthsRemaining: 36, percentage: 3.0 },
      { monthsRemaining: 24, percentage: 2.0 },
      { monthsRemaining: 12, percentage: 1.0 },
    ]
  },
  {
    id: 'm3', clientId: 'c3', lender: 'HSBC', product: '2-Year Fixed', fixedRate: 5.19,
    startDate: '2024-08-01', endDate: '2026-08-01', termYears: 22, balance: 198000,
    monthlyPayment: 1289, type: 'fixed-2', status: 'active',
    ercSchedule: [
      { monthsRemaining: 24, percentage: 3.0 },
      { monthsRemaining: 12, percentage: 1.5 },
      { monthsRemaining: 6, percentage: 0.5 },
    ]
  },
  {
    id: 'm4', clientId: 'c4', lender: 'Santander', product: '5-Year Fixed', fixedRate: 1.99,
    startDate: '2021-11-01', endDate: '2026-11-01', termYears: 30, balance: 415000,
    monthlyPayment: 1567, type: 'fixed-5', status: 'active',
    ercSchedule: [
      { monthsRemaining: 60, percentage: 5.0 },
      { monthsRemaining: 48, percentage: 4.0 },
      { monthsRemaining: 36, percentage: 3.0 },
      { monthsRemaining: 24, percentage: 2.0 },
      { monthsRemaining: 12, percentage: 1.0 },
    ]
  },
  {
    id: 'm5', clientId: 'c5', lender: 'Halifax', product: '2-Year Fixed', fixedRate: 5.49,
    startDate: '2024-06-01', endDate: '2026-06-01', termYears: 20, balance: 175000,
    monthlyPayment: 1234, type: 'fixed-2', status: 'active',
    ercSchedule: [
      { monthsRemaining: 24, percentage: 3.0 },
      { monthsRemaining: 12, percentage: 1.5 },
      { monthsRemaining: 6, percentage: 0.5 },
    ]
  },
  {
    id: 'm6', clientId: 'c6', lender: 'Coventry BS', product: '5-Year Fixed', fixedRate: 2.15,
    startDate: '2022-01-01', endDate: '2027-01-01', termYears: 25, balance: 267000,
    monthlyPayment: 1189, type: 'fixed-5', status: 'active',
    ercSchedule: [
      { monthsRemaining: 60, percentage: 5.0 },
      { monthsRemaining: 48, percentage: 4.0 },
      { monthsRemaining: 36, percentage: 3.0 },
      { monthsRemaining: 24, percentage: 2.0 },
      { monthsRemaining: 12, percentage: 1.0 },
    ]
  },
  {
    id: 'm7', clientId: 'c7', lender: 'TSB', product: '2-Year Fixed', fixedRate: 4.69,
    startDate: '2025-01-01', endDate: '2027-01-01', termYears: 23, balance: 310000,
    monthlyPayment: 1756, type: 'fixed-2', status: 'active',
    ercSchedule: [
      { monthsRemaining: 24, percentage: 3.0 },
      { monthsRemaining: 12, percentage: 1.5 },
      { monthsRemaining: 6, percentage: 0.5 },
    ]
  },
  {
    id: 'm8', clientId: 'c8', lender: 'Virgin Money', product: '5-Year Fixed', fixedRate: 2.79,
    startDate: '2023-04-01', endDate: '2028-04-01', termYears: 27, balance: 389000,
    monthlyPayment: 1678, type: 'fixed-5', status: 'active',
    ercSchedule: [
      { monthsRemaining: 60, percentage: 5.0 },
      { monthsRemaining: 48, percentage: 4.0 },
      { monthsRemaining: 36, percentage: 3.0 },
      { monthsRemaining: 24, percentage: 2.0 },
      { monthsRemaining: 12, percentage: 1.0 },
    ]
  },
];

// Generate 12 months of rate history
function generateRateHistory(): RateSnapshot[] {
  const history: RateSnapshot[] = [];
  const now = new Date();
  let boe = 5.25;
  let avg2yr = 5.10;
  let avg5yr = 4.85;
  let avgSVR = 7.89;

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Simulate rate movements
    boe += (Math.random() - 0.55) * 0.15;
    boe = Math.max(4.5, Math.min(5.5, boe));
    avg2yr = boe - 0.15 + (Math.random() - 0.5) * 0.1;
    avg5yr = boe - 0.35 + (Math.random() - 0.5) * 0.1;
    avgSVR = boe + 2.5 + (Math.random() - 0.5) * 0.3;

    history.push({
      date: date.toISOString().split('T')[0],
      boeBaseRate: Math.round(boe * 100) / 100,
      avg2yrFixed: Math.round(avg2yr * 100) / 100,
      avg5yrFixed: Math.round(avg5yr * 100) / 100,
      avgSVR: Math.round(avgSVR * 100) / 100,
    });
  }
  return history;
}

export const seedRateHistory: RateSnapshot[] = generateRateHistory();

export const seedAlerts: Alert[] = [
  {
    id: 'a1', clientId: 'c1', mortgageId: 'm1', type: 'expiry-90',
    title: '90-Day Expiry Warning',
    message: 'James Whitfield\'s Barclays 2-Year Fixed expires in 90 days. Current best 2-year rate: 4.29%. Recommend initiating remortgage search now.',
    date: '2025-12-01', status: 'unread', daysUntilExpiry: 90, potentialSavings: 2400
  },
  {
    id: 'a2', clientId: 'c5', mortgageId: 'm5', type: 'break-even',
    title: 'Break-Even Opportunity Detected',
    message: 'Michael Chen\'s Halifax 2-Year Fixed: Switching now saves £1,847 net after ERC. Best available rate 4.19% vs current 5.49%.',
    date: '2025-12-15', status: 'unread', daysUntilExpiry: 180, potentialSavings: 1847
  },
  {
    id: 'a3', clientId: 'c4', mortgageId: 'm4', type: 'expiry-180',
    title: '180-Day Expiry Warning',
    message: 'Emma Richardson\'s Santander 5-Year Fixed expires in ~11 months. ERC currently 1% (£4,150). Begin product comparison window.',
    date: '2025-12-10', status: 'unread', daysUntilExpiry: 320, potentialSavings: 3600
  },
  {
    id: 'a4', clientId: 'c3', mortgageId: 'm3', type: 'expiry-120',
    title: '120-Day Expiry Warning',
    message: 'David Okonkwo\'s HSBC 2-Year Fixed expires in ~8 months. ERC at 1.5% (£2,970). Monitor rate movements.',
    date: '2025-12-05', status: 'read', daysUntilExpiry: 230, potentialSavings: 1200
  },
  {
    id: 'a5', clientId: 'c2', mortgageId: 'm2', type: 'rate-drop',
    title: 'Rate Drop Alert',
    message: 'BoE base rate dropped 0.25%. Nationwide 5-year products may reprice. Sarah Pemberton\'s deal expires 2027 - no action needed yet.',
    date: '2025-12-18', status: 'unread', daysUntilExpiry: 540
  },
];

export const seedEmailDrafts: EmailDraft[] = [
  {
    id: 'e1', clientId: 'c1', mortgageId: 'm1',
    subject: 'Your Barclays mortgage expires March 2026 – let\'s find you a better rate',
    body: `Dear James,

I hope you're well. I'm reaching out because your Barclays 2-Year Fixed mortgage deal is due to expire on 1st March 2026, and I wanted to make sure we're ahead of the curve.

Here's what I've found for you:

• Your current rate: 4.89%
• Best available 2-year fixed today: 4.29%
• Potential monthly saving: ~£89/month (£1,068/year)
• Outstanding balance: £285,000

If we act now, you could lock in a rate 0.60% lower before your current deal expires. Since you're within the 6-month window, there's no ERC to worry about.

I've prepared a comparison of the top 5 deals available to you. Would you have 15 minutes this week for a quick call to discuss?

Kind regards,
Mark Thompson
Independent Mortgage Advisor`,
    status: 'draft', createdAt: '2025-12-15', savingsAmount: 1068
  },
  {
    id: 'e2', clientId: 'c5', mortgageId: 'm5',
    subject: 'Good news – you could save £1,847 by switching your mortgage now',
    body: `Dear Michael,

I've been monitoring the market for you and I've identified an opportunity worth acting on.

Your Halifax 2-Year Fixed is at 5.49%, but the best available rate right now is 4.19%. Here's the math:

• Early Repayment Charge: £2,625 (1.5% of balance)
• Monthly saving from new rate: £204/month
• Break-even point: 13 months
• Net saving over remaining term: £1,847

Even after paying the ERC, switching now puts you £1,847 better off. Given that rates may rise again, locking in now is prudent.

Shall I put together the full comparison for you? I can have everything ready within 48 hours.

Best regards,
Mark Thompson
Independent Mortgage Advisor`,
    status: 'draft', createdAt: '2025-12-16', savingsAmount: 1847, breakEvenDate: '2027-01-16'
  },
];

export const seedBestDeals: BestAvailableDeal[] = [
  { lender: 'Coventry BS', product: '2-Year Fixed', rate: 4.19, termYears: 2, fee: 999, ltv: 75 },
  { lender: 'Halifax', product: '2-Year Fixed', rate: 4.29, termYears: 2, fee: 995, ltv: 75 },
  { lender: 'Nationwide', product: '2-Year Fixed', rate: 4.34, termYears: 2, fee: 0, ltv: 75 },
  { lender: 'Santander', product: '5-Year Fixed', rate: 4.49, termYears: 5, fee: 1499, ltv: 75 },
  { lender: 'Barclays', product: '5-Year Fixed', rate: 4.55, termYears: 5, fee: 999, ltv: 75 },
  { lender: 'TSB', product: '2-Year Fixed', rate: 4.39, termYears: 2, fee: 495, ltv: 60 },
  { lender: 'Virgin Money', product: '5-Year Fixed', rate: 4.59, termYears: 5, fee: 1999, ltv: 60 },
  { lender: 'HSBC', product: '2-Year Fixed', rate: 4.24, termYears: 2, fee: 1499, ltv: 60 },
];
