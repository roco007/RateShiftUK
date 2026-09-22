import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, BellOff, CheckCircle, AlertTriangle, Clock, TrendingDown, X } from 'lucide-react';

export function Alerts() {
  const { state, dispatch, getClient } = useApp();
  
  const unreadAlerts = state.alerts.filter(a => a.status === 'unread');
  const readAlerts = state.alerts.filter(a => a.status === 'read');
  const dismissedAlerts = state.alerts.filter(a => a.status === 'dismissed');

  const handleMarkRead = (id: string) => {
    const alert = state.alerts.find(a => a.id === id);
    if (alert) dispatch({ type: 'UPDATE_ALERT', payload: { ...alert, status: 'read' } });
  };

  const handleDismiss = (id: string) => {
    dispatch({ type: 'DISMISS_ALERT', payload: id });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'expiry-180': case 'expiry-120': case 'expiry-90': case 'expiry-60': case 'expiry-30':
        return <Clock size={18} className="text-amber-500" />;
      case 'break-even':
        return <TrendingDown size={18} className="text-emerald-500" />;
      case 'rate-drop':
        return <AlertTriangle size={18} className="text-blue-500" />;
      default:
        return <Bell size={18} className="text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'expiry-90': case 'expiry-60': case 'expiry-30':
        return 'border-red-200 bg-red-50';
      case 'expiry-120': case 'expiry-180':
        return 'border-amber-200 bg-amber-50';
      case 'break-even':
        return 'border-emerald-200 bg-emerald-50';
      case 'rate-drop':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Bell size={16} className="text-red-500" />
            <span className="text-sm text-gray-500">Unread</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{unreadAlerts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-emerald-500" />
            <span className="text-sm text-gray-500">Read</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{readAlerts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BellOff size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500">Dismissed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{dismissedAlerts.length}</p>
        </div>
      </div>

      {/* Unread Alerts */}
      {unreadAlerts.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Unread Alerts</h3>
          <div className="space-y-3">
            {unreadAlerts.map(alert => {
              const client = getClient(alert.clientId);
              return (
                <div key={alert.id} className={`rounded-xl border p-4 ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900">{alert.title}</p>
                          <p className="text-sm text-gray-600 mt-0.5">{client?.name}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {alert.potentialSavings && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Save £{alert.potentialSavings.toLocaleString()}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">{alert.date}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{alert.message}</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleMarkRead(alert.id)}
                          className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          Mark Read
                        </button>
                        <button
                          onClick={() => handleDismiss(alert.id)}
                          className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 font-medium flex items-center gap-1"
                        >
                          <X size={12} /> Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Read Alerts */}
      {readAlerts.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Read</h3>
          <div className="space-y-2">
            {readAlerts.map(alert => {
              const client = getClient(alert.clientId);
              return (
                <div key={alert.id} className="bg-white rounded-lg border border-gray-100 p-4 flex items-start gap-3">
                  <div className="mt-0.5 opacity-50">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-700 truncate">{alert.title}</p>
                      <button onClick={() => handleDismiss(alert.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{client?.name} • {alert.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {state.alerts.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Bell size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No alerts yet. Alerts will appear when mortgage expiry windows or rate changes are detected.</p>
        </div>
      )}
    </div>
  );
}
