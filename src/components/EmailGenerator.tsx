import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateBreakEven } from '../services/calculator';
import { getAIProvider, isMockMode } from '../services/ai';
import { EmailDraft } from '../types';
import { Mail, Send, Sparkles, Loader2, CheckCircle, Clock } from 'lucide-react';

export function EmailGenerator() {
  const { state, dispatch, getClient, getMortgage } = useApp();
  const [generating, setGenerating] = useState(false);
  const [selectedMortgageId, setSelectedMortgageId] = useState('');
  const [selectedDealIdx, setSelectedDealIdx] = useState(0);

  const handleGenerate = async () => {
    if (!selectedMortgageId) return;
    
    const mortgage = getMortgage(selectedMortgageId);
    const client = mortgage ? getClient(mortgage.clientId) : null;
    if (!mortgage || !client) return;

    setGenerating(true);
    try {
      const breakEven = calculateBreakEven(mortgage, state.bestDeals[selectedDealIdx]);
      const ai = getAIProvider();
      const { subject, body } = await ai.generateClientEmail(client, mortgage, breakEven, state.bestDeals[selectedDealIdx]);
      
      const draft: EmailDraft = {
        id: `e${Date.now()}`,
        clientId: client.id,
        mortgageId: mortgage.id,
        subject,
        body,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        savingsAmount: breakEven.totalSavingOverRemainingTerm,
      };
      
      dispatch({ type: 'ADD_EMAIL_DRAFT', payload: draft });
    } catch (error) {
      console.error('Failed to generate email:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = (draftId: string) => {
    const draft = state.emailDrafts.find(d => d.id === draftId);
    if (draft) {
      dispatch({ type: 'UPDATE_EMAIL_DRAFT', payload: { ...draft, status: 'sent' } });
    }
  };

  return (
    <div className="space-y-6">
      {/* Generator */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-emerald-600" />
          <h3 className="font-semibold text-gray-900">AI Email Generator</h3>
          {isMockMode() && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Mock Mode</span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Client Mortgage</label>
            <select
              value={selectedMortgageId}
              onChange={e => setSelectedMortgageId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Choose a mortgage...</option>
              {state.mortgages.map(m => {
                const c = getClient(m.clientId);
                return (
                  <option key={m.id} value={m.id}>
                    {c?.name} – {m.lender} ({m.fixedRate}%)
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
                <option key={i} value={i}>{d.lender} – {d.rate}%</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={!selectedMortgageId || generating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <><Loader2 size={16} className="animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={16} /> Generate Email</>
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          AI will draft a personalised email based on the client's mortgage details, current market rates, and break-even analysis.
        </p>
      </div>

      {/* Email Drafts */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Email Drafts ({state.emailDrafts.length})</h3>
        </div>
        
        {state.emailDrafts.length === 0 ? (
          <div className="p-8 text-center">
            <Mail size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No email drafts yet. Generate your first one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {state.emailDrafts.map(draft => {
              const client = getClient(draft.clientId);
              return (
                <div key={draft.id} className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                          draft.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                          draft.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {draft.status === 'sent' ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {draft.status}
                        </span>
                        <span className="text-xs text-gray-400">{draft.createdAt}</span>
                      </div>
                      <p className="font-medium text-gray-900 truncate">{draft.subject}</p>
                      <p className="text-sm text-gray-500">To: {client?.name} ({client?.email})</p>
                    </div>
                    {draft.status === 'draft' && (
                      <button
                        onClick={() => handleSend(draft.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 flex-shrink-0"
                      >
                        <Send size={12} /> Send
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line max-h-48 overflow-y-auto">
                    {draft.body}
                  </div>
                  {draft.savingsAmount && (
                    <p className="text-xs text-emerald-600 font-medium mt-2">
                      Highlighted saving: £{draft.savingsAmount.toLocaleString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
