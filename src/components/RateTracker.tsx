import React from 'react';
import { useApp } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function RateTracker() {
  const { state } = useApp();
  const latest = state.rateHistory[state.rateHistory.length - 1];
  const prev = state.rateHistory[state.rateHistory.length - 2];
  const rateChange = latest && prev ? latest.boeBaseRate - prev.boeBaseRate : 0;

  const chartData = state.rateHistory.map(r => ({
    date: new Date(r.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    'BoE Base': r.boeBaseRate,
    '2-Yr Fixed': r.avg2yrFixed,
    '5-Yr Fixed': r.avg5yrFixed,
    'SVR': r.avgSVR,
  }));

  return (
    <div className="space-y-6">
      {/* Current Rates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RateCard
          label="BoE Base Rate"
          rate={latest?.boeBaseRate || 0}
          change={rateChange}
          color="blue"
        />
        <RateCard
          label="Avg 2-Year Fixed"
          rate={latest?.avg2yrFixed || 0}
          change={latest && prev ? latest.avg2yrFixed - prev.avg2yrFixed : 0}
          color="emerald"
        />
        <RateCard
          label="Avg 5-Year Fixed"
          rate={latest?.avg5yrFixed || 0}
          change={latest && prev ? latest.avg5yrFixed - prev.avg5yrFixed : 0}
          color="purple"
        />
        <RateCard
          label="Avg SVR"
          rate={latest?.avgSVR || 0}
          change={latest && prev ? latest.avgSVR - prev.avgSVR : 0}
          color="red"
        />
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Interest Rate Trends (12 Months)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
            <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
            <Legend />
            <Line type="monotone" dataKey="BoE Base" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="2-Yr Fixed" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="5-Yr Fixed" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="SVR" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Spread Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Rate Spread Analysis</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={state.rateHistory.map(r => ({
            date: new Date(r.date).toLocaleDateString('en-GB', { month: 'short' }),
            'Fixed vs BoE': Math.round((r.avg2yrFixed - r.boeBaseRate) * 100) / 100,
            'SVR vs BoE': Math.round((r.avgSVR - r.boeBaseRate) * 100) / 100,
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
            <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
            <Legend />
            <Area type="monotone" dataKey="Fixed vs BoE" stroke="#10b981" fill="#d1fae5" />
            <Area type="monotone" dataKey="SVR vs BoE" stroke="#ef4444" fill="#fee2e2" />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 mt-3">
          Shows the spread between the BoE base rate and fixed/SVR products. A widening SVR spread 
          indicates higher cost of falling off your fixed deal.
        </p>
      </div>

      {/* Best Available Deals */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Best Available Deals Today</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 font-medium text-gray-500">Lender</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Product</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Rate</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Fee</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Max LTV</th>
              </tr>
            </thead>
            <tbody>
              {state.bestDeals.map((deal, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-medium text-gray-900">{deal.lender}</td>
                  <td className="py-2.5 px-3 text-gray-600">{deal.product}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{deal.rate}%</td>
                  <td className="py-2.5 px-3 text-right text-gray-600">£{deal.fee.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-gray-600">{deal.ltv}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RateCard({ label, rate, change, color }: { label: string; rate: number; change: number; color: string }) {
  const isDown = change < 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-gray-900">{rate.toFixed(2)}%</p>
        {change !== 0 && (
          <div className={`flex items-center gap-0.5 text-xs font-medium mb-1 ${isDown ? 'text-emerald-600' : 'text-red-600'}`}>
            {isDown ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
            <span>{isDown ? '' : '+'}{change.toFixed(2)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
