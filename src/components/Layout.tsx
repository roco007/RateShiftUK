import React, { ReactNode } from 'react';
import { useApp } from '../context/AppContext';
import { ViewType } from '../types';
import { 
  LayoutDashboard, Users, Calculator, TrendingUp, Mail, Bell, FileText, 
  Menu, X, Shield
} from 'lucide-react';

const navItems: { view: ViewType; label: string; icon: ReactNode }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { view: 'clients', label: 'Client Vault', icon: <Users size={20} /> },
  { view: 'calculator', label: 'Break-Even Calc', icon: <Calculator size={20} /> },
  { view: 'rates', label: 'Rate Tracker', icon: <TrendingUp size={20} /> },
  { view: 'emails', label: 'AI Emails', icon: <Mail size={20} /> },
  { view: 'alerts', label: 'Alerts', icon: <Bell size={20} /> },
  { view: 'reports', label: 'Reports', icon: <FileText size={20} /> },
];

export function Layout({ children }: { children: ReactNode }) {
  const { state, dispatch } = useApp();
  const unreadAlerts = state.alerts.filter(a => a.status === 'unread').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {state.sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 text-white flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${state.sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">RateShift UK</h1>
              <p className="text-xs text-slate-400">Mortgage Intelligence</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.view}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: item.view })}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${state.currentView === item.view 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.view === 'alerts' && unreadAlerts > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadAlerts}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm font-bold">
              MT
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Mark Thompson</p>
              <p className="text-xs text-slate-400">Independent Broker</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {state.sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <h2 className="text-lg font-semibold text-gray-800 capitalize">
            {navItems.find(n => n.view === state.currentView)?.label || 'Dashboard'}
          </h2>
          
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:inline text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
              Demo Mode
            </span>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500">{state.clients.length} clients</p>
              <p className="text-xs text-gray-500">{state.mortgages.length} mortgages tracked</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
