import React, { useState } from 'react';
import { 
  BookOpen, 
  History, 
  HelpCircle, 
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import CowProfileView from './CowProfileView';
import FarmerHelpGuide from './FarmerHelpGuide';
import { translations } from '../translations';

export default function HistoryAndGuideView({ 
  language, 
  initialRfid = null, 
  initialSection = 'history',
  onStartPredictionForCow,
  onReturnHome 
}) {
  const t = translations[language] || translations.en;
  const [activeSection, setActiveSection] = useState(initialSection || 'history');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* 1. Unified Header Banner & 2-Segment Switcher */}
      <div className="bg-[#092615] text-[#faecc4] rounded-3xl p-6 sm:p-7 border-2 border-[#164426] shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#144827] rounded-full blur-2xl opacity-40 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#133d20] border border-[#faecc4]/30 text-[#faecc4] text-xs font-bold uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
              <span>{language === 'en' ? 'Farmer Knowledge & Records' : 'किसान रिकॉर्ड एवं ज्ञान केंद्र'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-baloo tracking-tight text-[#faecc4]">
              {t.navHistoryGuide}
            </h2>
            <p className="text-xs text-[#faecc4]/80 font-medium max-w-xl">
              {language === 'en' 
                ? 'Review past RFID diagnostic test timelines or study traffic-light mastitis safety protocols.' 
                : 'गायों का पुराना जांच इतिहास देखें अथवा थनैल रोग बचाव व सुरक्षा नियमों की गाइड पढ़ें।'}
            </p>
          </div>

          {/* Unified 2-Segment Toggle Button (Large 48px Touch Target) */}
          <div className="bg-[#05170d] p-1.5 rounded-2xl border border-[#1b502c] flex items-center shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveSection('history')}
              className={`min-h-[46px] px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 cursor-pointer ${
                activeSection === 'history'
                  ? 'bg-[#faecc4] text-[#092615] shadow-md scale-[1.02]'
                  : 'text-[#faecc4]/70 hover:text-white'
              }`}
            >
              <History className="h-4 w-4" />
              <span>{t.tabTestHistory}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('guide')}
              className={`min-h-[46px] px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center space-x-2 cursor-pointer ${
                activeSection === 'guide'
                  ? 'bg-[#faecc4] text-[#092615] shadow-md scale-[1.02]'
                  : 'text-[#faecc4]/70 hover:text-white'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>{t.tabFarmerGuide}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Active Tab Content Canvas */}
      {activeSection === 'history' ? (
        <CowProfileView
          language={language}
          initialRfid={initialRfid}
          onStartPredictionForCow={onStartPredictionForCow}
          onReturnHome={onReturnHome}
        />
      ) : (
        <FarmerHelpGuide language={language} />
      )}

    </div>
  );
}
