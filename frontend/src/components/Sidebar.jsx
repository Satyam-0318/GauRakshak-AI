import React from 'react';
import { 
  Scan,
  Tag,
  History,
  HelpCircle,
  LayoutDashboard, 
  Layers, 
  BarChart3, 
  Settings, 
  ArrowLeft,
  Cpu,
  BookOpen
} from 'lucide-react';
import { translations } from '../translations';

export default function Sidebar({ currentTab, setCurrentTab, onReturnToLanding, isModelReady, modelInfo, language }) {
  const t = translations[language] || translations.en;

  // Primary Farmer Sections: My Cows & History combined into 1 button; Farmer Guide separate
  const primaryMenuItems = [
    { id: 'predict', label: t.navPredict, icon: Scan },
    { id: 'cows', label: t.navMyCowsHistory || (language === 'en' ? 'My Cows & History' : 'मेरी गायें एवं इतिहास'), icon: Tag },
    { id: 'help', label: t.navHelp, icon: HelpCircle },
  ];

  // Secondary Tools (Available for audit in Task 4)
  const secondaryMenuItems = [
    { id: 'reports', label: language === 'en' ? 'Model Specs' : 'मॉडल स्पेक्स', icon: BarChart3 },
    { id: 'dashboard', label: language === 'en' ? 'Parlor Telemetry' : 'पार्लर टेलीमेट्री', icon: LayoutDashboard },
  ];

  return (
    <aside className="w-64 bg-[#092615] text-[#faecc4] flex flex-col justify-between shrink-0 border-r-2 border-[#164426] min-h-screen shadow-xl">
      
      {/* Top Brand Header */}
      <div>
        <div className="p-5 border-b border-[#164426]">
          
          {/* Back to Landing Page Link */}
          <button
            onClick={onReturnToLanding}
            className="flex items-center space-x-1.5 text-[11px] font-bold text-[#faecc4]/80 hover:text-white mb-3 hover:underline"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>{t.backToLanding}</span>
          </button>

          <div className="flex items-center space-x-3">
            {/* GauRakshak AI Emblem */}
            <div className="h-10 w-10 rounded-2xl bg-[#faecc4] text-[#092615] flex items-center justify-center font-baloo font-black text-xl shadow-md">
              G
            </div>
            <div>
              <h1 className="font-baloo font-bold text-lg text-[#faecc4] tracking-tight leading-tight">
                {t.brandName}
              </h1>
              <p className="text-[10px] text-[#faecc4]/70 font-medium">
                {t.brandTagline}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Primary Navigation Menu Buttons (Large 48px targets) */}
        <nav className="p-3 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#faecc4]/50 px-2 block">
            {language === 'en' ? 'Core Farmer Actions' : 'मुख्य किसान मेनू'}
          </span>

          {primaryMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'cows' && currentTab === 'history');
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full min-h-[48px] flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#faecc4] text-[#092615] shadow-lg font-black scale-101'
                    : 'text-[#faecc4]/85 hover:text-white hover:bg-[#123820]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[#092615]' : 'text-[#faecc4]/75'}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
              </button>
            );
          })}

          {/* Secondary Features (Pending Task 4 Audit) */}
          <div className="pt-3 mt-2 border-t border-[#164426]/70 space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#faecc4]/40 px-2 block">
              {language === 'en' ? 'Secondary Tools' : 'अतिरिक्त टूल्स'}
            </span>
            {secondaryMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full min-h-[38px] flex items-center space-x-2.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#1b4b2d] text-[#faecc4] font-bold'
                      : 'text-[#faecc4]/60 hover:text-white hover:bg-[#123820]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 opacity-70" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Bottom Status Card: Local Trained Model & Farm Silhouette */}
      <div className="p-4">
        <div className="bg-[#0f3820] rounded-2xl p-4 border border-[#1b502c] shadow-inner relative overflow-hidden">
          
          {/* Status Beacon */}
          <div className="flex items-center space-x-2 text-[11px] font-medium text-emerald-300 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-bold">{t.modelStatusActive}</span>
          </div>

          <div className="text-xs font-bold text-[#faecc4] flex items-center space-x-1.5 mb-1">
            <Cpu className="h-3.5 w-3.5 text-[#faecc4] shrink-0" />
            <span>{t.modelStatusName}</span>
          </div>

          <p className="text-[10px] text-[#faecc4]/70 font-mono mb-3">
            {t.lastUpdated}: 10:42 AM
          </p>

          {/* Farm Barn Silhouette Graphic */}
          <div className="pt-2 border-t border-[#184928] flex flex-col items-center justify-center text-center">
            <svg viewBox="0 0 120 40" className="h-8 w-28 fill-[#faecc4] opacity-50 mb-1">
              <circle cx="15" cy="20" r="10" />
              <rect x="13" y="28" width="4" height="10" />
              <path d="M45 22h14v10h-2v4h-3v-4h-4v4h-3v-4h-2v-10zM57 18h5v6h-5z" />
              <circle cx="63" cy="20" r="1.5" />
              <path d="M85 38V18l12-8 12 8v20z" />
              <rect x="93" y="24" width="8" height="14" />
              <path d="M112 38V12c0-3 3-5 5-5s5 2 5 5v26z" />
            </svg>
            <span className="text-[11px] font-bold text-[#faecc4] tracking-tight font-serif">
              {t.sidebarFooterTitle}
            </span>
            <span className="text-[10px] text-[#faecc4]/60">
              {t.sidebarFooterSubtitle}
            </span>
          </div>

        </div>
      </div>

    </aside>
  );
}
