import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getMonthsRemainingForMortgage, getCurrentERCForMortgage } from '../services/calculator';
import { Client, Mortgage, ERCBand } from '../types';
import { Plus, Search, ChevronRight, X, Upload, Users } from 'lucide-react';

export function ClientVault() {
  const { state, dispatch, getMortgagesForClient } = useApp();
  const [search, setSearch] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddMortgage, setShowAddMortgage] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = state.clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddClient(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} /> Add Client
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} /> Import CSV
          </button>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No clients found</p>
            <button onClick={() => setShowAddClient(true)} className="text-emerald-600 text-sm mt-2 hover:underline">
              Add your first client
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredClients.map(client => {
              const mortgages = getMortgagesForClient(client.id);
              const soonestExpiry = mortgages.reduce((min, m) => {
                const months = getMonthsRemainingForMortgage(m);
                return months < min ? months : min;
              }, Infinity);
              
              return (
                <div
                  key={client.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{client.name}</p>
                        <p className="text-sm text-gray-500 truncate">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">{mortgages.length} mortgage{mortgages.length !== 1 ? 's' : ''}</p>
                        <p className={`text-xs ${soonestExpiry <= 90 ? 'text-red-600' : soonestExpiry <= 180 ? 'text-amber-600' : 'text-gray-500'}`}>
                          {soonestExpiry === Infinity ? 'No active deals' : `${soonestExpiry} days to expiry`}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onAddMortgage={() => { setShowAddMortgage(true); }}
        />
      )}

      {/* Add Client Modal */}
      {showAddClient && <AddClientModal onClose={() => setShowAddClient(false)} />}
      
      {/* Add Mortgage Modal */}
      {showAddMortgage && selectedClient && (
        <AddMortgageModal clientId={selectedClient.id} onClose={() => setShowAddMortgage(false)} />
      )}
    </div>
  );
}

function ClientDetailModal({ client, onClose, onAddMortgage }: { client: Client; onClose: () => void; onAddMortgage: () => void }) {
  const { getMortgagesForClient } = useApp();
  const mortgages = getMortgagesForClient(client.id);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{client.name}</h3>
            <p className="text-sm text-gray-500">{client.email} • {client.phone}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Mortgages ({mortgages.length})</h4>
            <button onClick={onAddMortgage} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
              <Plus size={14} /> Add Mortgage
            </button>
          </div>
          
          <div className="space-y-3">
            {mortgages.map(m => {
              const monthsLeft = getMonthsRemainingForMortgage(m);
              const ercPct = getCurrentERCForMortgage(m);
              return (
                <div key={m.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{m.lender} – {m.product}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {m.fixedRate}% • £{m.balance.toLocaleString()} balance • £{m.monthlyPayment.toLocaleString()}/mo
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${monthsLeft <= 90 ? 'text-red-600' : monthsLeft <= 180 ? 'text-amber-600' : 'text-gray-700'}`}>
                        {monthsLeft} days
                      </p>
                      <p className="text-xs text-gray-500">to expiry</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-gray-500">
                    <span>Expires: {new Date(m.endDate).toLocaleDateString('en-GB')}</span>
                    <span>ERC: {ercPct}% (£{Math.round(ercPct / 100 * m.balance).toLocaleString()})</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500"><strong>Address:</strong> {client.address}</p>
            <p className="text-xs text-gray-500 mt-1"><strong>Client since:</strong> {new Date(client.createdAt).toLocaleDateString('en-GB')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddClientModal({ onClose }: { onClose: () => void }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: `c${Date.now()}`,
      ...form,
      createdAt: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD_CLIENT', payload: newClient });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Add New Client</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Add Client</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMortgageModal({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    lender: '', product: '', fixedRate: '', startDate: '', endDate: '',
    balance: '', monthlyPayment: '', termYears: '25', type: 'fixed-2' as 'fixed-2' | 'fixed-5' | 'tracker',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMortgage: Mortgage = {
      id: `m${Date.now()}`,
      clientId,
      lender: form.lender,
      product: form.product,
      fixedRate: parseFloat(form.fixedRate),
      startDate: form.startDate,
      endDate: form.endDate,
      balance: parseFloat(form.balance),
      monthlyPayment: parseFloat(form.monthlyPayment),
      termYears: parseInt(form.termYears),
      type: form.type,
      status: 'active',
      ercSchedule: form.type === 'fixed-2' ? [
        { monthsRemaining: 24, percentage: 3.0 },
        { monthsRemaining: 12, percentage: 1.5 },
        { monthsRemaining: 6, percentage: 0.5 },
      ] : [
        { monthsRemaining: 60, percentage: 5.0 },
        { monthsRemaining: 48, percentage: 4.0 },
        { monthsRemaining: 36, percentage: 3.0 },
        { monthsRemaining: 24, percentage: 2.0 },
        { monthsRemaining: 12, percentage: 1.0 },
      ],
    };
    dispatch({ type: 'ADD_MORTGAGE', payload: newMortgage });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-gray-900">Add Mortgage</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lender</label>
              <input required value={form.lender} onChange={e => setForm({ ...form, lender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Barclays" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <input required value={form.product} onChange={e => setForm({ ...form, product: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" placeholder="e.g. 2-Year Fixed" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Rate (%)</label>
              <input required type="number" step="0.01" value={form.fixedRate} onChange={e => setForm({ ...form, fixedRate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deal Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'fixed-2' | 'fixed-5' | 'tracker' })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
                <option value="fixed-2">2-Year Fixed</option>
                <option value="fixed-5">5-Year Fixed</option>
                <option value="tracker">Tracker</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input required type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input required type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Balance (£)</label>
              <input required type="number" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Payment (£)</label>
              <input required type="number" value={form.monthlyPayment} onChange={e => setForm({ ...form, monthlyPayment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term (years)</label>
            <input required type="number" value={form.termYears} onChange={e => setForm({ ...form, termYears: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Add Mortgage</button>
          </div>
        </form>
      </div>
    </div>
  );
}
