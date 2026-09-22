import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import { calculateBreakEven, getMonthsRemainingForMortgage } from '../services/calculator';
import { getAIProvider, isMockMode } from '../services/ai';
import { FileText, Download, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export function Reports() {
  const { state, getClient, getMortgage } = useApp();
  const { settings, getActiveAIProvider } = useSettings();
  const [selectedMortgageId, setSelectedMortgageId] = useState(state.mortgages[0]?.id || '');
  const [selectedDealIdx, setSelectedDealIdx] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedMortgage = state.mortgages.find(m => m.id === selectedMortgageId);
  const client = selectedMortgage ? getClient(selectedMortgage.clientId) : null;
  const bestDeal = state.bestDeals[selectedDealIdx];
  const activeProvider = getActiveAIProvider();

  const handleGenerateReport = async () => {
    if (!selectedMortgage || !client || !bestDeal) {
      toast.error('Please select a valid mortgage');
      return;
    }
    
    setGenerating(true);
    setError(null);
    try {
      const breakEven = calculateBreakEven(selectedMortgage, bestDeal);
      const ai = getAIProvider(
        activeProvider,
        settings.openaiKey,
        settings.geminiKey,
        settings.openaiModel,
        settings.geminiModel
      );
      const summary = await ai.generateReportSummary(client, selectedMortgage, breakEven);
      setReportContent(summary);
      toast.success('Report generated successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate report';
      setError(message);
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedMortgage || !client || !bestDeal || !reportContent) {
      toast.error('Generate a report first');
      return;
    }
    
    const breakEven = calculateBreakEven(selectedMortgage, bestDeal);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text('RateShift UK', 20, 25);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Mortgage Review Report', 20, 38);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 20, 48);
    doc.text(`Broker: Mark Thompson | RateShift UK`, 20, 54);
    doc.text(`AI Provider: ${activeProvider === 'mock' ? 'Mock' : activeProvider === 'openai' ? 'OpenAI' : 'Google Gemini'}`, 20, 60);
    
    // Client Details
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 65, 190, 65);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Client Details', 20, 77);
    
    doc.setFontSize(10);
    doc.text(`Name: ${client.name}`, 20, 87);
    doc.text(`Email: ${client.email}`, 20, 95);
    doc.text(`Address: ${client.address}`, 20, 103);
    
    // Mortgage Details
    doc.setFontSize(12);
    doc.text('Current Mortgage', 20, 120);
    
    doc.setFontSize(10);
    doc.text(`Lender: ${selectedMortgage.lender}`, 20, 130);
    doc.text(`Product: ${selectedMortgage.product}`, 20, 138);
    doc.text(`Fixed Rate: ${selectedMortgage.fixedRate}%`, 20, 146);
    doc.text(`Outstanding Balance: £${selectedMortgage.balance.toLocaleString()}`, 20, 154);
    doc.text(`Monthly Payment: £${selectedMortgage.monthlyPayment.toLocaleString()}`, 20, 162);
    doc.text(`Expiry Date: ${new Date(selectedMortgage.endDate).toLocaleDateString('en-GB')}`, 20, 170);
    doc.text(`Months Remaining: ${getMonthsRemainingForMortgage(selectedMortgage)}`, 20, 178);
    
    // Analysis
    doc.setFontSize(12);
    doc.text('Break-Even Analysis', 20, 195);
    
    doc.setFontSize(10);
    doc.text(`ERC Cost: £${breakEven.ercCost.toLocaleString()}`, 20, 205);
    doc.text(`Best Available Rate: ${breakEven.bestAvailableRate}%`, 20, 213);
    doc.text(`New Monthly Payment: £${Math.round(breakEven.newMonthlyPayment).toLocaleString()}`, 20, 221);
    doc.text(`Monthly Saving: £${Math.round(breakEven.monthlySaving).toLocaleString()}`, 20, 229);
    doc.text(`Months to Break Even: ${breakEven.monthsToBreakEven === 999 ? 'N/A' : breakEven.monthsToBreakEven}`, 20, 237);
    doc.text(`Net Saving Over Term: £${breakEven.totalSavingOverRemainingTerm.toLocaleString()}`, 20, 245);
    
    // New page for recommendation
    doc.addPage();
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Recommendation', 20, 25);
    
    doc.setFontSize(10);
    const recommendation = breakEven.recommendedAction === 'switch-now' ? 'SWITCH NOW' : 
                           breakEven.recommendedAction === 'wait' ? 'WAIT & MONITOR' : 'STAY ON CURRENT DEAL';
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(14);
    doc.text(recommendation, 20, 38);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const explanationLines = doc.splitTextToSize(breakEven.explanation, 170);
    doc.text(explanationLines, 20, 52);
    
    // AI Summary
    if (reportContent) {
      doc.setFontSize(12);
      doc.text('AI Analysis Summary', 20, 80);
      doc.setFontSize(9);
      const summaryLines = doc.splitTextToSize(reportContent, 170);
      doc.text(summaryLines, 20, 92);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This report is for informational purposes only and does not constitute financial advice.', 20, 280);
    doc.text('RateShift UK | AI-Powered Mortgage Intelligence', 20, 286);
    
    doc.save(`RateShift-Report-${client.name.replace(/\s+/g, '-')}.pdf`);
    toast.success('PDF downloaded!');
  };

  return (
    <div className="space-y-6">
      {/* Report Generator */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-emerald-600" />
          <h3 className="font-semibold text-gray-900">Client PDF Report Generator</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
            <select
              value={selectedMortgageId}
              onChange={e => setSelectedMortgageId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            >
              {state.mortgages.map(m => {
                const c = getClient(m.clientId);
                return (
                  <option key={m.id} value={m.id}>
                    {c?.name} – {m.lender}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comparison Deal</label>
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
          <div className="flex items-end gap-2">
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Generate
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={!reportContent}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-50"
            >
              <Download size={16} /> PDF
            </button>
          </div>
        </div>
        
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Report Preview */}
      {reportContent && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Report Preview</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              activeProvider === 'mock' ? 'bg-amber-100 text-amber-700' :
              activeProvider === 'openai' ? 'bg-blue-100 text-blue-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {activeProvider === 'mock' ? 'Mock Mode' : activeProvider === 'openai' ? 'OpenAI' : 'Gemini'}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-5 text-sm text-gray-700 whitespace-pre-line font-mono leading-relaxed max-h-96 overflow-y-auto">
            {reportContent}
          </div>
        </div>
      )}

      {/* Quick Reports */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Summary – All Clients</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 font-medium text-gray-500">Client</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Lender</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Rate</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Balance</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Days Left</th>
                <th className="text-center py-2 px-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {state.mortgages.map(m => {
                const c = getClient(m.clientId);
                const daysLeft = getMonthsRemainingForMortgage(m);
                const breakEven = calculateBreakEven(m, state.bestDeals[0]);
                return (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-medium text-gray-900">{c?.name}</td>
                    <td className="py-2.5 px-3 text-gray-600">{m.lender}</td>
                    <td className="py-2.5 px-3 text-right">{m.fixedRate}%</td>
                    <td className="py-2.5 px-3 text-right">£{m.balance.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={daysLeft <= 90 ? 'text-red-600 font-medium' : daysLeft <= 180 ? 'text-amber-600' : 'text-gray-600'}>
                        {daysLeft}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        breakEven.recommendedAction === 'switch-now' ? 'bg-emerald-100 text-emerald-700' :
                        breakEven.recommendedAction === 'wait' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {breakEven.recommendedAction === 'switch-now' ? 'Switch' :
                         breakEven.recommendedAction === 'wait' ? 'Wait' : 'Stay'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
