import { Mortgage, BreakEvenResult, BestAvailableDeal } from '../types';

/**
 * ERC Break-Even Calculator
 * Calculates whether switching mortgages early (paying ERC) is financially beneficial
 */

function getMonthsRemaining(endDate: string): number {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30)));
}

function getCurrentERCPercentage(mortgage: Mortgage): number {
  const monthsRemaining = getMonthsRemaining(mortgage.endDate);
  
  // Find the applicable ERC band
  for (const band of mortgage.ercSchedule) {
    if (monthsRemaining <= band.monthsRemaining) {
      return band.percentage;
    }
  }
  
  // If past all bands, no ERC
  if (monthsRemaining <= 0) return 0;
  
  // If above highest band, use highest
  return mortgage.ercSchedule[0]?.percentage || 0;
}

function calculateMonthlyPayment(balance: number, annualRate: number, termYears: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  
  if (monthlyRate === 0) return balance / numPayments;
  
  const payment = balance * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                  (Math.pow(1 + monthlyRate, numPayments) - 1);
  return Math.round(payment * 100) / 100;
}

export function calculateBreakEven(
  mortgage: Mortgage,
  bestDeal: BestAvailableDeal
): BreakEvenResult {
  const monthsRemaining = getMonthsRemaining(mortgage.endDate);
  const ercPercentage = getCurrentERCPercentage(mortgage);
  const ercCost = (ercPercentage / 100) * mortgage.balance;
  
  // Calculate remaining term (use the shorter of current remaining or new deal)
  const remainingTermYears = Math.min(
    Math.ceil(monthsRemaining / 12),
    bestDeal.termYears
  );
  
  // Current monthly payment (on remaining balance)
  const currentMonthlyPayment = calculateMonthlyPayment(
    mortgage.balance,
    mortgage.fixedRate,
    Math.ceil(monthsRemaining / 12)
  );
  
  // New monthly payment
  const newMonthlyPayment = calculateMonthlyPayment(
    mortgage.balance + (bestDeal.fee > 0 ? bestDeal.fee : 0),
    bestDeal.rate,
    bestDeal.termYears
  );
  
  const monthlySaving = currentMonthlyPayment - newMonthlyPayment;
  const monthsToBreakEven = monthlySaving > 0 ? Math.ceil(ercCost / monthlySaving) : Infinity;
  
  const totalSavingOverTerm = (monthlySaving * remainingTermYears * 12) - ercCost - bestDeal.fee;
  
  const canSaveBySwitching = totalSavingOverTerm > 0 && monthsRemaining > 0;
  
  let recommendedAction: 'switch-now' | 'wait' | 'stay';
  let explanation: string;
  
  if (monthsRemaining <= 6) {
    // Within 6 months, no/minimal ERC - always recommend switching
    recommendedAction = 'switch-now';
    explanation = `With only ${monthsRemaining} months remaining, ERC is minimal (${ercPercentage}%). Switching now saves £${Math.round(totalSavingOverTerm).toLocaleString()} net.`;
  } else if (canSaveBySwitching && monthsToBreakEven < remainingTermYears * 6) {
    recommendedAction = 'switch-now';
    explanation = `Break-even in ${monthsToBreakEven} months with net saving of £${Math.round(totalSavingOverTerm).toLocaleString()}. The ERC of £${Math.round(ercCost).toLocaleString()} is recovered quickly.`;
  } else if (canSaveBySwitching) {
    recommendedAction = 'wait';
    explanation = `Switching saves £${Math.round(totalSavingOverTerm).toLocaleString()} but break-even takes ${monthsToBreakEven} months. Consider waiting ${Math.min(3, Math.ceil(monthsRemaining / 4))} months for ERC to reduce.`;
  } else {
    recommendedAction = 'stay';
    explanation = `ERC of £${Math.round(ercCost).toLocaleString()} (${ercPercentage}%) exceeds potential savings. Stay on current deal until closer to expiry.`;
  }
  
  return {
    canSaveBySwitching,
    ercCost: Math.round(ercCost),
    currentMonthlyPayment,
    bestAvailableRate: bestDeal.rate,
    newMonthlyPayment,
    monthlySaving: Math.round(monthlySaving * 100) / 100,
    monthsToBreakEven: monthsToBreakEven === Infinity ? 999 : monthsToBreakEven,
    totalSavingOverRemainingTerm: Math.round(totalSavingOverTerm),
    recommendedAction,
    explanation,
  };
}

export function getMonthsRemainingForMortgage(mortgage: Mortgage): number {
  return getMonthsRemaining(mortgage.endDate);
}

export function getCurrentERCForMortgage(mortgage: Mortgage): number {
  return getCurrentERCPercentage(mortgage);
}

export function calculateSVRCost(mortgage: Mortgage, svrRate: number): number {
  const remainingMonths = getMonthsRemaining(mortgage.endDate);
  const remainingYears = Math.ceil(remainingMonths / 12);
  
  const currentPayment = calculateMonthlyPayment(mortgage.balance, mortgage.fixedRate, remainingYears);
  const svrPayment = calculateMonthlyPayment(mortgage.balance, svrRate, remainingYears);
  
  return Math.round((svrPayment - currentPayment) * remainingMonths);
}
