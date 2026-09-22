import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateBreakEven, getMonthsRemainingForMortgage } from '../services/calculator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calculator as CalcIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function BreakEvenCalculator() {
  const { state, getClient } = useApp();
  const [selectedMortgageId, setSelectedMortgageId] = useState(state.mortgages[0]?.id || '');
  const [selectedDealIdx, setSelectedDealIdx] = useState(0);

  const selectedMortgage = state.mortgages.find(m => m.id === selectedMortgageId);
  const bestDeal = state.bestDeals[selectedDealIdx];
  const client = selectedMortgage ? getClient(selectedMortgage.clientId) : null;

  const result = useMemo(() => {
    if (!selectedMortgage || !bestDeal) return null;
    return calculateBreakEven(selectedMortgage, bestDeal);
  }, [selectedMortgage, bestDeal]);

  const chartData = result ? [
    { name: 'ERC Cost', value: result.ercCost, fill: '#ef4444' },
    { name: 'Product Fee', value: bestDeal.fee, fill: '#f59e0b' },
    { name: 'Net Saving', value: Math.max(0, result.totalSavingOverRemainingTerm), fill: '#10b981' },
  ] : [];

  const monthlyComparison = result ? [
    { name: 'Current', payment: result.currentMonthlyPayment },
    { name: 'New Deal', payment: result.newMonthlyPayment },
  ] : [];

  if (!state.mortgages.length) {
    return (
      <div className="text-center py-12">
        <CalcIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No mortgages to analyse. Add clients and mortgages first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Select Mortgage & Deal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Mortgage</label>
            <select
              value={selectedMortgageId}
              onChange={e => setSelectedMortgageId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            >
              {state.mortgages.map(m => {
                const c = getClient(m.clientId);
                return (
                  <option key={m.id} value={m.id}>
                    {c?.name} – {m.lender} {m.product} ({m.fixedRate}%)
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Best Available Deal</label>
            <select
              value={selectedDealIdx}
              onChange={e => setSelectedDealIdx(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            >
              {state.bestDeals.map((d, i) => (
                <option key={i} value={i}>
                  {d.lender} {d.product} – {d.rate}% (£{d.fee} fee)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {result && selectedMortgage && bestDeal && (
        <>
          {/* Result Summary */}
          <div className={`rounded-xl border p-5 shadow-sm ${
            result.recommendedAction === 'switch-now' ? 'bg-emerald-50 border-emerald-200' :
            result.recommendedAction === 'wait' ? 'bg-amber-50 border-amber-200' :
            'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-start gap-3">
              {result.recommendedAction === 'switch-now' ? (
                <CheckCircle size={24} className="text-emerald-600 flex-shrink-0" />
              ) : result.recommendedAction === 'wait' ? (
                <AlertCircle size={24} className="text-amber-600 flex-shrink-0" />
              ) : (
                <XCircle size={24} className="text-gray-500 flex-shrink-0" />
              )}
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {result.recommendedAction === 'switch-now' ? '✓ Switch Now Recommended' :
                   result.recommendedAction === 'wait' ? '⏳ Wait & Monitor' : '✗ Stay on Current Deal'}
                </h3>
                <p className="text-sm text-gray-700 mt-1">{result.explanation}</p>
                {client && (
                  <p className="text-xs text-gray-500 mt-2">Analysis for {client.name} – {selectedMortgage.lender} {selectedMortgage.product}</p>
                )}
              </div>
            </div>
          </div>

          {/* Key Figures */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">ERC Cost</p>
              <p className="text-xl font-bold text-red-600">£{result.ercCost.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Monthly Saving</p>
              <p className="text-xl font-bold text-emerald-600">£{Math.round(result.monthlySaving).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Break-Even</p>
              <p className="text-xl font-bold text-gray-900">{result.monthsToBreakEven === 999 ? 'N/A' : `${result.monthsToBreakEven} mo`}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Net Saving</p>
              <p className={`text-xl font-bold ${result.totalSavingOverRemainingTerm > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                £{result.totalSavingOverRemainingTerm.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Cost vs Savings Breakdown</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `£${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => `£${v.toLocaleString()}`} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Monthly Payment Comparison</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `£${v}`} />
                  <Tooltip formatter={(v: number) => `£${v.toLocaleString()}`} />
                  <Bar dataKey="payment" radius={[6, 6, 0, 0]}>
                    <Cell fill="#94a3b8" />
                    <Cell fill="#10b981" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">Detailed Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Current Deal</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Lender</span><span className="font-medium">{selectedMortgage.lender}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Rate</span><span className="font-medium">{selectedMortgage.fixedRate}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Balance</span><span className="font-medium">£{selectedMortgage.balance.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Monthly Payment</span><span className="font-medium">£{result.currentMonthlyPayment.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Months Remaining</span><span className="font-medium">{getMonthsRemainingForMortgage(selectedMortgage)}</span></div>
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">New Deal</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Lender</span><span className="font-medium">{bestDeal.lender}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Rate</span><span className="font-medium text-emerald-600">{bestDeal.rate}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Product Fee</span><span className="font-medium">£{bestDeal.fee.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Monthly Payment</span><span className="font-medium text-emerald-600">£{Math.round(result.newMonthlyPayment).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Rate Difference</span><span className="font-medium text-emerald-600">-{(selectedMortgage.fixedRate - bestDeal.rate).toFixed(2)}%</span></div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
