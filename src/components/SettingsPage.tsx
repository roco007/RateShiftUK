import React, { useState } from 'react';
import { useSettings, AIProviderType } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Key, Sparkles, RotateCcw, CheckCircle, AlertCircle, Eye, EyeOff, LogOut, User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { settings, updateSettings, resetSettings, getActiveAIProvider, hasValidOpenAIKey, hasValidGeminiKey } = useSettings();
  const { user, logout, isDemoMode } = useAuth();
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const activeProvider = getActiveAIProvider();

  const handleProviderChange = (provider: AIProviderType) => {
    if (provider === 'openai' && !hasValidOpenAIKey()) {
      toast.error('Please add your OpenAI API key first');
      return;
    }
    if (provider === 'gemini' && !hasValidGeminiKey()) {
      toast.error('Please add your Gemini API key first');
      return;
    }
    updateSettings({ aiProvider: provider });
    toast.success(`Switched to ${provider === 'mock' ? 'Mock' : provider === 'openai' ? 'OpenAI' : 'Google Gemini'} provider`);
  };

  const handleReset = () => {
    resetSettings();
    setShowResetConfirm(false);
    toast.success('Settings reset to defaults');
  };

  const maskKey = (key: string) => {
    if (!key || key.length < 8) return '';
    return key.slice(0, 4) + '••••••••' + key.slice(-4);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Account Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <User size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Account</h3>
        </div>
        
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          {user?.picture ? (
            <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-700 font-bold text-lg">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
          )}
          <div className="flex-1">
            <p className="font-medium text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isDemoMode ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {isDemoMode ? 'Demo Account' : 'Google Account'}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* AI Provider Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">AI Provider</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            activeProvider === 'mock' ? 'bg-amber-100 text-amber-700' :
            activeProvider === 'openai' ? 'bg-blue-100 text-blue-700' :
            'bg-purple-100 text-purple-700'
          }`}>
            Active: {activeProvider === 'mock' ? 'Mock' : activeProvider === 'openai' ? 'OpenAI' : 'Gemini'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleProviderChange('mock')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              activeProvider === 'mock' ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🤖</span>
              {activeProvider === 'mock' && <CheckCircle size={14} className="text-amber-600" />}
            </div>
            <p className="font-medium text-sm text-gray-900">Mock Mode</p>
            <p className="text-xs text-gray-500 mt-1">No API key needed. Uses realistic templates.</p>
          </button>

          <button
            onClick={() => handleProviderChange('openai')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              activeProvider === 'openai' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            } ${!hasValidOpenAIKey() ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🧠</span>
              {activeProvider === 'openai' && <CheckCircle size={14} className="text-blue-600" />}
            </div>
            <p className="font-medium text-sm text-gray-900">OpenAI GPT</p>
            <p className="text-xs text-gray-500 mt-1">{hasValidOpenAIKey() ? 'Key configured ✓' : 'Requires API key'}</p>
          </button>

          <button
            onClick={() => handleProviderChange('gemini')}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              activeProvider === 'gemini' ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
            } ${!hasValidGeminiKey() ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✨</span>
              {activeProvider === 'gemini' && <CheckCircle size={14} className="text-purple-600" />}
            </div>
            <p className="font-medium text-sm text-gray-900">Google Gemini</p>
            <p className="text-xs text-gray-500 mt-1">{hasValidGeminiKey() ? 'Key configured ✓' : 'Requires API key'}</p>
          </button>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Key size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">API Keys</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Keys are stored locally in your browser. They are never sent to our servers.
        </p>

        <div className="space-y-4">
          {/* OpenAI Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
              {hasValidOpenAIKey() && <span className="text-emerald-600 ml-2">✓ Configured</span>}
            </label>
            <div className="relative">
              <input
                type={showOpenAIKey ? 'text' : 'password'}
                value={settings.openaiKey}
                onChange={e => updateSettings({ openaiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showOpenAIKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">
                Get your key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">platform.openai.com</a>
              </p>
              {settings.openaiKey && (
                <span className="text-xs text-gray-400 font-mono">{maskKey(settings.openaiKey)}</span>
              )}
            </div>
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Model</label>
              <select
                value={settings.openaiModel}
                onChange={e => updateSettings({ openaiModel: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Fast, Cost-effective)</option>
                <option value="gpt-4o">GPT-4o (Most Capable)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legacy)</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Gemini Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Gemini API Key
              {hasValidGeminiKey() && <span className="text-emerald-600 ml-2">✓ Configured</span>}
            </label>
            <div className="relative">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={settings.geminiKey}
                onChange={e => updateSettings({ geminiKey: e.target.value })}
                placeholder="AIza..."
                className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">
                Get your key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">aistudio.google.com</a>
              </p>
              {settings.geminiKey && (
                <span className="text-xs text-gray-400 font-mono">{maskKey(settings.geminiKey)}</span>
              )}
            </div>
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Model</label>
              <select
                value={settings.geminiModel}
                onChange={e => updateSettings({ geminiModel: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
              >
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast, Cost-effective)</option>
                <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (Fastest)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Most Capable)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <SettingsIcon size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Preferences</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-xs text-gray-500">Receive alerts for mortgage expiry windows</p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={e => updateSettings({ notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-emerald-500 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
            </div>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6 shadow-sm">
        <h3 className="font-semibold text-red-700 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">Reset all settings to defaults. This will clear your API keys and preferences.</p>
        
        {showResetConfirm ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              Confirm Reset
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
          >
            <RotateCcw size={14} /> Reset All Settings
          </button>
        )}
      </div>
    </div>
  );
}
