import React from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, TrendingDown, AlertTriangle, Users, PoundSterling, Clock } from 'lucide-react';
import { getMonthsRemainingForMortgage } from '../services/calculator';

export function Dashboard() {
  const { state, dispatch, getMortgagesForClient, getClient } = useApp();
  
  const totalBalance = state.mortgages.reduce((sum, m) => sum + m.balance, 0);
  const expiringSoon = state.mortgages.filter(m => {
    const months = getMonthsRemainingForMortgage(m);
    return months <= 180 && months > 0;
  });
  const unreadAlerts = state.alerts.filter(a => a.status === 'unread');
  const totalPotentialSavings = state.alerts.reduce((sum, a) => sum + (a.potentialSavings || 0), 0);
  const latestRate = state.rateHistory[state.rateHistory.length - 1];
  const prevRate = state.rateHistory[state.rateHistory.length - 2];
  const rateChange = latestRate && prevRate ? latestRate.boeBaseRate - prevRate.boeBaseRate : 0;

  const stats = [
    {
      label: 'Total Book Value',
      value: `£${(totalBalance / 1000000).toFixed(1)}M`,
      sublabel: `${state.mortgages.length} active mortgages`,
      icon: <PoundSterling size={20} />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Expiring in 6 Months',
      value: expiringSoon.length.toString(),
      sublabel: 'clients need attention',
      icon: <Clock size={20} />,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Unread Alerts',
      value: unreadAlerts.length.toString(),
      sublabel: 'action required',
      icon: <AlertTriangle size={20} />,
      color: 'bg-red-50 text-red-600',
    },
    {
      label: 'Potential Savings',
      value: `£${(totalPotentialSavings / 1000).toFixed(0)}K`,
      sublabel: 'across all clients',
      icon: <TrendingUp size={20} />,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.sublabel}</p>
          </div>
        ))}
      </div>

      {/* Rate Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Current Market Rates</h3>
          <button 
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'rates' })}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View Details →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">BoE Base Rate</p>
            <p className="text-xl font-bold text-gray-900">{latestRate?.boeBaseRate}%</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              {rateChange < 0 ? (
                <TrendingDown size={14} className="text-emerald-500" />
              ) : rateChange > 0 ? (
                <TrendingUp size={14} className="text-red-500" />
              ) : null}
              <span className={`text-xs ${rateChange < 0 ? 'text-emerald-600' : rateChange > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {rateChange !== 0 ? `${rateChange > 0 ? '+' : ''}${rateChange.toFixed(2)}%` : 'No change'}
              </span>
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Avg 2-Yr Fixed</p>
            <p className="text-xl font-bold text-gray-900">{latestRate?.avg2yrFixed}%</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Avg 5-Yr Fixed</p>
            <p className="text-xl font-bold text-gray-900">{latestRate?.avg5yrFixed}%</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Avg SVR</p>
            <p className="text-xl font-bold text-red-600">{latestRate?.avgSVR}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Alerts</h3>
            <button 
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'alerts' })}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {state.alerts.slice(0, 4).map(alert => {
              const client = getClient(alert.clientId);
              return (
                <div key={alert.id} className={`p-3 rounded-lg border ${alert.status === 'unread' ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{client?.name}</p>
                    </div>
                    {alert.status === 'unread' && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  {alert.potentialSavings && (
                    <p className="text-xs text-emerald-700 font-medium mt-1">
                      Potential saving: £{alert.potentialSavings.toLocaleString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Clients Expiring Soon */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Expiring Soon</h3>
            <button 
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'clients' })}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {expiringSoon.slice(0, 5).map(mortgage => {
              const client = getClient(mortgage.clientId);
              const monthsLeft = getMonthsRemainingForMortgage(mortgage);
              return (
                <div key={mortgage.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{client?.name}</p>
                    <p className="text-xs text-gray-500">{mortgage.lender} at {mortgage.fixedRate}%</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${monthsLeft <= 90 ? 'text-red-600' : monthsLeft <= 120 ? 'text-amber-600' : 'text-gray-700'}`}>
                      {monthsLeft} days
                    </p>
                    <p className="text-xs text-gray-500">remaining</p>
                  </div>
                </div>
              );
            })}
            {expiringSoon.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No clients expiring in the next 6 months</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
