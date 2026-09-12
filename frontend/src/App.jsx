import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import RfidPredictionFlow from './components/RfidPredictionFlow';
import CowProfileView from './components/CowProfileView';
import FarmerHelpGuide from './components/FarmerHelpGuide';
import HistoryAndGuideView from './components/HistoryAndGuideView';
import DashboardView from './components/DashboardView';
import ModelMetrics from './components/ModelMetrics';
import ParameterDrawer from './components/ParameterDrawer';
import Footer from './components/Footer';
import { API_BASE_URL } from './constants';
import { Scan, Tag, History, HelpCircle, BookOpen } from 'lucide-react';
import { translations } from './translations';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  // Primary view: 'landing' or 'dashboard'
  const [viewMode, setViewMode] = useState('landing');
  const [currentTab, setCurrentTab] = useState('predict');
  const [selectedRfid, setSelectedRfid] = useState('RFID-IND-1001');
  
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dairyland_lang') || 'en';
  });

  const t = translations[language] || translations.en;

  const [isModelReady, setIsModelReady] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Pre-configured realistic dairy cows
  const cowPresets = {
    cow1: {
      id: '#C023',
      breed: 'Holstein-Friesian',
      lactation: '2nd Lactation (Mid)',
      daysInMilk: 142,
      milkYield: '5 - 10 L/day',
      riskScore: 24,
      stage: 'Healthy',
      confidence: 0.92,
      ph: 6.55,
      ec: 4.25,
      scc: 1.20,
      Season: 'Winter',
      LactationStage: 'Mid',
      Parity: '2nd',
      MilkYield: '5-10',
      quarters: {
        FL: { temp: 37.2, ec: 4.6, status: 'normal' },
        FR: { temp: 37.4, ec: 4.8, status: 'normal' },
        RL: { temp: 37.1, ec: 4.5, status: 'normal' },
        RR: { temp: 37.3, ec: 4.7, status: 'normal' }
      },
      trendData: [
        { date: 'Sep 27', risk: 10 },
        { date: 'Sep 29', risk: 18 },
        { date: 'Oct 1', risk: 16 },
        { date: 'Oct 3', risk: 12 },
        { date: 'Oct 5', risk: 15 },
        { date: 'Oct 7', risk: 20 },
        { date: 'Oct 9', risk: 19 },
        { date: 'Oct 10', risk: 24, isCurrent: true },
        { date: 'Oct 12', risk: 25, isForecast: true },
        { date: 'Oct 14', risk: 26, isForecast: true },
      ]
    },
    cow2: {
      id: '#C018',
      breed: 'Holstein-Friesian',
      lactation: '3rd Lactation (Mid)',
      daysInMilk: 85,
      milkYield: '5 - 10 L/day',
      riskScore: 58,
      stage: 'Subclinical',
      confidence: 0.84,
      ph: 6.80,
      ec: 5.10,
      scc: 3.60,
      Season: 'Rainy',
      LactationStage: 'Mid',
      Parity: '3rd',
      MilkYield: '5-10',
      quarters: {
        FL: { temp: 37.3, ec: 4.6, status: 'normal' },
        FR: { temp: 38.1, ec: 5.2, status: 'warning' },
        RL: { temp: 37.2, ec: 4.5, status: 'normal' },
        RR: { temp: 37.4, ec: 4.7, status: 'normal' }
      },
      trendData: [
        { date: 'Sep 27', risk: 22 },
        { date: 'Sep 29', risk: 28 },
        { date: 'Oct 1', risk: 35 },
        { date: 'Oct 3', risk: 42 },
        { date: 'Oct 5', risk: 46 },
        { date: 'Oct 7', risk: 52 },
        { date: 'Oct 9', risk: 55 },
        { date: 'Oct 10', risk: 58, isCurrent: true },
        { date: 'Oct 12', risk: 62, isForecast: true },
        { date: 'Oct 14', risk: 65, isForecast: true },
      ]
    },
    cow3: {
      id: '#C009',
      breed: 'Jersey-Holstein Cross',
      lactation: '4th Lactation (Early)',
      daysInMilk: 35,
      milkYield: '0 - 4 L/day',
      riskScore: 94,
      stage: 'Clinical',
      confidence: 0.98,
      ph: 7.25,
      ec: 6.80,
      scc: 38.5,
      Season: 'Summer',
      LactationStage: 'Early',
      Parity: '4th and above',
      MilkYield: '0-4',
      quarters: {
        FL: { temp: 38.9, ec: 6.8, status: 'danger' },
        FR: { temp: 37.8, ec: 5.4, status: 'warning' },
        RL: { temp: 38.5, ec: 6.4, status: 'danger' },
        RR: { temp: 37.6, ec: 5.1, status: 'normal' }
      },
      trendData: [
        { date: 'Sep 27', risk: 30 },
        { date: 'Sep 29', risk: 45 },
        { date: 'Oct 1', risk: 60 },
        { date: 'Oct 3', risk: 72 },
        { date: 'Oct 5', risk: 85 },
        { date: 'Oct 7', risk: 90 },
        { date: 'Oct 9', risk: 92 },
        { date: 'Oct 10', risk: 94, isCurrent: true },
        { date: 'Oct 12', risk: 96, isForecast: true },
        { date: 'Oct 14', risk: 98, isForecast: true },
      ]
    }
  };

  const [activeCow, setActiveCow] = useState(cowPresets.cow1);

  const handleSelectCowPreset = (presetKey) => {
    if (cowPresets[presetKey]) {
      setActiveCow(cowPresets[presetKey]);
    }
  };

  const handleApplyPrediction = (predictionResult) => {
    const isClinical = predictionResult.predicted_stage === 'Clinical';
    const isSubclinical = predictionResult.predicted_stage === 'Subclinical';

    const calculatedRiskScore = Math.round(
      (predictionResult.probabilities.Clinical * 100) + 
      (predictionResult.probabilities.Subclinical * 50)
    );

    setActiveCow(prev => ({
      ...prev,
      id: predictionResult.cowId || prev.id,
      breed: predictionResult.breed || prev.breed,
      daysInMilk: predictionResult.daysInMilk || prev.daysInMilk,
      riskScore: Math.min(100, Math.max(12, calculatedRiskScore)),
      stage: predictionResult.predicted_stage,
      confidence: predictionResult.confidence,
      ph: predictionResult.input_parameters.pH,
      ec: predictionResult.input_parameters.EC,
      scc: predictionResult.input_parameters.SCC,
      Season: predictionResult.input_parameters.Season,
      LactationStage: predictionResult.input_parameters.LactationStage,
      Parity: predictionResult.input_parameters.Parity,
      MilkYield: predictionResult.input_parameters.MilkYield,
      quarters: {
        FL: { 
          temp: isClinical ? 38.9 : isSubclinical ? 37.3 : 37.2, 
          ec: predictionResult.input_parameters.EC, 
          status: isClinical ? 'danger' : isSubclinical ? 'warning' : 'normal' 
        },
        FR: { 
          temp: isClinical ? 37.8 : isSubclinical ? 38.1 : 37.4, 
          ec: Math.round((predictionResult.input_parameters.EC * 0.95) * 10) / 10, 
          status: isClinical ? 'warning' : isSubclinical ? 'warning' : 'normal' 
        },
        RL: { 
          temp: isClinical ? 38.5 : 37.1, 
          ec: Math.round((predictionResult.input_parameters.EC * 0.92) * 10) / 10, 
          status: isClinical ? 'danger' : 'normal' 
        },
        RR: { 
          temp: 37.3, 
          ec: Math.round((predictionResult.input_parameters.EC * 0.88) * 10) / 10, 
          status: 'normal' 
        }
      },
      trendData: [
        { date: 'Sep 27', risk: Math.max(10, calculatedRiskScore - 25) },
        { date: 'Sep 29', risk: Math.max(12, calculatedRiskScore - 20) },
        { date: 'Oct 1', risk: Math.max(15, calculatedRiskScore - 15) },
        { date: 'Oct 3', risk: Math.max(14, calculatedRiskScore - 12) },
        { date: 'Oct 5', risk: Math.max(16, calculatedRiskScore - 8) },
        { date: 'Oct 7', risk: Math.max(18, calculatedRiskScore - 4) },
        { date: 'Oct 9', risk: Math.max(19, calculatedRiskScore - 2) },
        { date: 'Oct 10', risk: calculatedRiskScore, isCurrent: true },
        { date: 'Oct 12', risk: Math.min(100, calculatedRiskScore + 3), isForecast: true },
        { date: 'Oct 14', risk: Math.min(100, calculatedRiskScore + 5), isForecast: true },
      ]
    }));
  };

  // Sync language selection to localStorage
  const handleSetLanguage = (newLang) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('dairyland_lang', typeof newLang === 'function' ? newLang(language) : newLang);
    } catch (e) {
      // Ignore storage errors
    }
  };

  // Poll health endpoint to verify model readiness
  useEffect(() => {
    const checkModel = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        if (res.ok) {
          const data = await res.json();
          setIsModelReady(data.model_loaded === true);
          setModelInfo(data);
        } else {
          setIsModelReady(false);
        }
      } catch (e) {
        setIsModelReady(false);
      }
    };

    checkModel();
    const interval = setInterval(checkModel, 8000);
    return () => clearInterval(interval);
  }, []);

  // If in Landing Page mode, render GauRakshak AI landing page
  if (viewMode === 'landing') {
    return (
      <LandingPage
        language={language}
        setLanguage={handleSetLanguage}
        onEnterDashboard={() => setViewMode('dashboard')}
        onSelectCowPreset={handleSelectCowPreset}
      />
    );
  }

  // Otherwise render the full Dairy Farm OS Manager Dashboard
  return (
    <ErrorBoundary onReset={() => setViewMode('landing')}>
      <div className="min-h-screen flex bg-[#f7f4ea] text-slate-800 font-sans antialiased">
      
      {/* 1. Left GauRakshak AI Dark Forest Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onReturnToLanding={() => setViewMode('landing')}
        isModelReady={isModelReady}
        modelInfo={modelInfo}
        language={language}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Bar with Return Home button & Cow Navigator */}
        <TopBar
          language={language}
          setLanguage={handleSetLanguage}
          onReturnToLanding={() => setViewMode('landing')}
          onNavigateToCow={(rfid) => {
            setSelectedRfid(rfid);
            setCurrentTab('cows');
          }}
        />

        {/* Dynamic Body Content */}
        <main className="p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto flex-1 mb-16 md:mb-0">
          {/* Primary Farmer Views */}
          {currentTab === 'predict' && (
            <RfidPredictionFlow
              language={language}
              initialRfid={selectedRfid}
              onViewCowProfile={(rfid) => {
                setSelectedRfid(rfid);
                setCurrentTab('cows');
              }}
              onPredictionComplete={handleApplyPrediction}
            />
          )}

          {(currentTab === 'cows' || currentTab === 'history' || currentTab === 'historyGuide') && (
            <CowProfileView
              language={language}
              initialRfid={selectedRfid}
              onStartPredictionForCow={(rfid) => {
                setSelectedRfid(rfid);
                setCurrentTab('predict');
              }}
              onReturnHome={() => setCurrentTab('predict')}
            />
          )}

          {currentTab === 'help' && (
            <FarmerHelpGuide language={language} />
          )}

          {/* Secondary Tools (Pending Task 4 Audit) */}
          {currentTab === 'dashboard' && (
            <DashboardView
              language={language}
              activeCow={activeCow}
              onSelectCowPreset={handleSelectCowPreset}
              onOpenParameterDrawer={() => setIsDrawerOpen(true)}
            />
          )}


          {currentTab === 'reports' && (
            <ModelMetrics language={language} />
          )}

          {currentTab === 'settings' && (
            <div className="bg-white rounded-3xl p-6 border-2 border-[#e6dcbe] shadow-xs space-y-4 animate-fade-in">
              <h2 className="font-serif font-bold text-xl text-[#092615]">
                {language === 'en' ? 'GauRakshak AI Farm Telemetry Settings' : 'गौ-रक्षक एआई फार्म सेटिंग्स'}
              </h2>
              <div className="text-xs text-slate-600 space-y-3">
                <p><strong>Farm Unit:</strong> GauRakshak AI Organic Parlor #01</p>
                <p><strong>Manager:</strong> Harshit Thakur</p>
                <p><strong>Active Model Engine:</strong> Tuned Random Forest Classifier (mastitis_model.pkl)</p>
                <p><strong>Telemetry Sampling:</strong> Continuous Milking Parlor Telemetry (Every 5 min)</p>
              </div>
            </div>
          )}
        </main>

        {/* Mobile Farmer Bottom Navigation Bar (3 Touch Targets: Scan, Cows & History, Guide) */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#092615] text-[#faecc4] border-t-2 border-[#164426] z-50 px-2 py-1.5 flex items-center justify-around shadow-2xl">
          {[
            { id: 'predict', label: t.navPredict, icon: Scan },
            { id: 'cows', label: t.navMyCowsHistory || (language === 'en' ? 'Cows & History' : 'गायें एवं इतिहास'), icon: Tag },
            { id: 'help', label: t.navHelp, icon: HelpCircle },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'cows' && (currentTab === 'history' || currentTab === 'historyGuide'));
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center rounded-xl transition-all ${
                  isActive ? 'bg-[#faecc4] text-[#092615] font-black' : 'text-[#faecc4]/70 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 mb-0.5" />
                <span className="text-[10px] font-bold tracking-tight leading-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <Footer language={language} />

      </div>

      {/* 3. Slide-Over Parameter Evaluator Drawer */}
      <ParameterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        language={language}
        onApplyPrediction={handleApplyPrediction}
        currentInput={activeCow}
      />

      </div>
    </ErrorBoundary>
  );
}
