import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Client, Mortgage, RateSnapshot, Alert, EmailDraft, ViewType, BestAvailableDeal } from '../types';
import { seedClients, seedMortgages, seedRateHistory, seedAlerts, seedEmailDrafts, seedBestDeals } from '../data/seed';

interface AppState {
  clients: Client[];
  mortgages: Mortgage[];
  rateHistory: RateSnapshot[];
  alerts: Alert[];
  emailDrafts: EmailDraft[];
  bestDeals: BestAvailableDeal[];
  currentView: ViewType;
  selectedClientId: string | null;
  selectedMortgageId: string | null;
  isLoading: boolean;
  sidebarOpen: boolean;
}

type Action =
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'SELECT_CLIENT'; payload: string | null }
  | { type: 'SELECT_MORTGAGE'; payload: string | null }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'ADD_MORTGAGE'; payload: Mortgage }
  | { type: 'UPDATE_MORTGAGE'; payload: Mortgage }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'UPDATE_ALERT'; payload: Alert }
  | { type: 'DISMISS_ALERT'; payload: string }
  | { type: 'ADD_EMAIL_DRAFT'; payload: EmailDraft }
  | { type: 'UPDATE_EMAIL_DRAFT'; payload: EmailDraft }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

const initialState: AppState = {
  clients: seedClients,
  mortgages: seedMortgages,
  rateHistory: seedRateHistory,
  alerts: seedAlerts,
  emailDrafts: seedEmailDrafts,
  bestDeals: seedBestDeals,
  currentView: 'dashboard',
  selectedClientId: null,
  selectedMortgageId: null,
  isLoading: false,
  sidebarOpen: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload, sidebarOpen: false };
    case 'SELECT_CLIENT':
      return { ...state, selectedClientId: action.payload };
    case 'SELECT_MORTGAGE':
      return { ...state, selectedMortgageId: action.payload };
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };
    case 'UPDATE_CLIENT':
      return { ...state, clients: state.clients.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CLIENT':
      return { ...state, clients: state.clients.filter(c => c.id !== action.payload) };
    case 'ADD_MORTGAGE':
      return { ...state, mortgages: [...state.mortgages, action.payload] };
    case 'UPDATE_MORTGAGE':
      return { ...state, mortgages: state.mortgages.map(m => m.id === action.payload.id ? action.payload : m) };
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case 'UPDATE_ALERT':
      return { ...state, alerts: state.alerts.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'DISMISS_ALERT':
      return { ...state, alerts: state.alerts.map(a => a.id === action.payload ? { ...a, status: 'dismissed' as const } : a) };
    case 'ADD_EMAIL_DRAFT':
      return { ...state, emailDrafts: [action.payload, ...state.emailDrafts] };
    case 'UPDATE_EMAIL_DRAFT':
      return { ...state, emailDrafts: state.emailDrafts.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getClient: (id: string) => Client | undefined;
  getMortgage: (id: string) => Mortgage | undefined;
  getMortgagesForClient: (clientId: string) => Mortgage[];
  getClientForMortgage: (mortgageId: string) => Client | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('rateshift-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (e) {
        console.warn('Failed to load saved state:', e);
      }
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    const toSave = {
      clients: state.clients,
      mortgages: state.mortgages,
      alerts: state.alerts,
      emailDrafts: state.emailDrafts,
    };
    localStorage.setItem('rateshift-state', JSON.stringify(toSave));
  }, [state.clients, state.mortgages, state.alerts, state.emailDrafts]);

  const getClient = (id: string) => state.clients.find(c => c.id === id);
  const getMortgage = (id: string) => state.mortgages.find(m => m.id === id);
  const getMortgagesForClient = (clientId: string) => state.mortgages.filter(m => m.clientId === clientId);
  const getClientForMortgage = (mortgageId: string) => {
    const mortgage = state.mortgages.find(m => m.id === mortgageId);
    return mortgage ? state.clients.find(c => c.id === mortgage.clientId) : undefined;
  };

  return (
    <AppContext.Provider value={{ state, dispatch, getClient, getMortgage, getMortgagesForClient, getClientForMortgage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
