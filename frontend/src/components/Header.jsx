import React from 'react';
import { Activity, Stethoscope, FileSpreadsheet, BarChart3, Languages, Cpu } from 'lucide-react';
import { translations } from '../translations';

export default function Header({ activeTab, setActiveTab, isModelReady, modelInfo, language, setLanguage }) {
  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Activity className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {t.appTitle} <span className="text-emerald-600 font-semibold">{language === 'en' ? 'AI' : 'एआई'}</span>
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {t.modelBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Controls: Model Badge, Language Switcher, Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Trained Model Status Badge (API Connected completely removed as requested) */}
            <div className="flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200 text-emerald-900 shadow-sm">
              <span className="relative flex h-2 w-2">
                {isModelReady && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isModelReady ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <Cpu className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
              <span className="font-semibold">
                {isModelReady ? t.modelActive : t.modelLoading}
              </span>
              {isModelReady && modelInfo?.test_accuracy && (
                <span className="text-emerald-700/80 border-l border-emerald-200 pl-2 font-mono">
                  {modelInfo.model_name || 'Random Forest'} • {(modelInfo.test_accuracy * 100).toFixed(1)}% {t.modelAccuracy}
                </span>
              )}
            </div>

            {/* Language Switcher Button */}
            <button
              id="btn-language-toggle"
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-sm transition-all active:scale-95"
              title="Switch language / भाषा बदलें"
            >
              <Languages className="h-3.5 w-3.5 text-emerald-600" />
              <span>{language === 'en' ? '🇮🇳 हिन्दी' : '🌐 English'}</span>
            </button>

            {/* Navigation Tabs */}
            <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                id="tab-single"
                onClick={() => setActiveTab('single')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'single'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Stethoscope className="h-3.5 w-3.5" />
                <span>{t.tabSingle}</span>
              </button>

              <button
                id="tab-batch"
                onClick={() => setActiveTab('batch')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'batch'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>{t.tabBatch}</span>
              </button>

              <button
                id="tab-metrics"
                onClick={() => setActiveTab('metrics')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'metrics'
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>{t.tabMetrics}</span>
              </button>
            </nav>
          </div>

        </div>
      </div>
    </header>
  );
}
