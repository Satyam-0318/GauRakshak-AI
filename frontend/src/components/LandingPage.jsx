import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Languages, 
  Activity, 
  Thermometer, 
  Layers, 
  TrendingUp, 
  Award,
  ChevronRight,
  RotateCcw,
  Check,
  CheckCircle2
} from 'lucide-react';
import { translations } from '../translations';
import { SAMPLE_PRESETS, API_BASE_URL } from '../constants';

export default function LandingPage({ language, setLanguage, onEnterDashboard, onSelectCowPreset }) {
  const t = translations[language];

  const [selectedPreset, setSelectedPreset] = useState(SAMPLE_PRESETS[0]);
  const [quickResult, setQuickResult] = useState({
    stage: 'Healthy',
    score: 24,
    confidence: 0.92,
    color: 'emerald'
  });
  const [loading, setLoading] = useState(false);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const handleQuickTest = async (preset) => {
    setSelectedPreset(preset);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preset.data)
      });

      if (res.ok) {
        const data = await res.json();
        const calculatedScore = Math.round(
          (data.probabilities.Clinical * 100) + (data.probabilities.Subclinical * 50)
        );
        setQuickResult({
          stage: data.predicted_stage,
          score: Math.min(100, Math.max(15, calculatedScore)),
          confidence: data.confidence,
          color: data.color_theme
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ea] text-slate-800 font-sans antialiased selection:bg-[#faecc4] selection:text-[#0c2f1a]">
      
      {/* 1. Top Grand Wordmark Banner (Matching Dribbble Reference Shot) */}
      <header className="bg-[#0c2f1a] text-[#faecc4] pt-8 pb-10 px-6 sm:px-12 border-b-4 border-[#faecc4]/30 relative overflow-hidden shadow-xl">
        
        {/* Background Subtle Gradient Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#174e2d] rounded-full blur-3xl opacity-40 pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#071d10] rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          
          {/* Tagline Pill */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#18482b] border border-[#faecc4]/40 text-[#faecc4] text-xs font-semibold tracking-wider uppercase mb-3 shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-[#faecc4]" />
            <span>{t.monogramSub}</span>
          </div>

          {/* Grand Indian Agricultural Branding: "GauRakshak AI" Wordmark using Baloo 2 */}
          <h1 className="font-baloo font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#faecc4] tracking-normal leading-none drop-shadow-md select-none py-1">
            {t.landingWordmark}
          </h1>

          <p className="font-poppins text-xs sm:text-sm text-[#faecc4]/80 font-semibold tracking-wider uppercase mt-3">
            {language === 'en' ? 'Healthy Cows • Pure Milk • Smarter Detection' : 'स्वस्थ गायें • शुद्ध दूध • स्मार्ट थनैल जांच'}
          </p>

        </div>
      </header>

      {/* 2. Sub-Navigation Bar (Olive Lawn Green #4f7324) */}
      <nav className="bg-[#4f7324] text-[#faecc4] sticky top-0 z-40 px-6 py-3 shadow-md border-b border-[#3c591a]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo Mark */}
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-full bg-[#faecc4] text-[#0c2f1a] flex items-center justify-center font-baloo font-black text-lg shadow-sm">
              G
            </div>
            <span className="font-baloo font-bold text-xl text-[#faecc4] tracking-tight">
              {t.landingWordmark}
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-semibold text-[#faecc4]/90">
            <a href="#hero" className="hover:text-white transition-colors">{t.navHome}</a>
            <a href="#pillars" className="hover:text-white transition-colors">{t.navOurDairy}</a>
            <a href="#scanner" className="hover:text-white transition-colors">{t.quickScanTitle}</a>
            <a href="#quality" className="hover:text-white transition-colors">{t.navOurStory}</a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#3d5a1b] hover:bg-[#344d16] text-[#faecc4] border border-[#faecc4]/30 transition-all"
              title="Change Language"
            >
              <Languages className="h-3.5 w-3.5" />
              <span>{language === 'en' ? '🇮🇳 हिन्दी' : '🌐 English'}</span>
            </button>

            {/* Enter Farm Dashboard CTA */}
            <button
              onClick={onEnterDashboard}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-[#faecc4] hover:bg-[#fff6dc] text-[#0c2f1a] shadow-md transition-all active:scale-95"
            >
              <span>{t.enterDashboardBtn}</span>
            </button>

          </div>

        </div>
      </nav>

      {/* 3. Hero Showcase Grid (Exact Dribbble 2-Card Layout) */}
      <section id="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Hero Card (Deep Forest Green #0c2f1a) - 8 Cols */}
          <div className="lg:col-span-8 bg-[#0c2f1a] text-[#faecc4] rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-xl border-2 border-[#164b2b] relative overflow-hidden">
            
            <div>
              {/* Header inside card */}
              <div className="flex items-center space-x-2 text-[#faecc4]/80 text-xs font-poppins font-medium mb-2">
                <span className="font-baloo font-bold text-sm tracking-wide">{t.landingWordmark} Platform</span>
                <span>•</span>
                <span>Bovine Diagnostic AI</span>
              </div>

              {/* Title */}
              <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#faecc4] tracking-tight leading-tight uppercase">
                {t.landingTagline}
              </h2>

              <p className="font-poppins text-xs sm:text-sm text-[#faecc4]/85 leading-relaxed max-w-2xl mt-4 font-normal">
                {t.landingSubtext}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <button
                  onClick={onEnterDashboard}
                  className="px-6 py-3 rounded-full text-xs font-black bg-[#faecc4] hover:bg-[#fff7dd] text-[#0c2f1a] shadow-lg shadow-black/30 transition-all flex items-center space-x-2"
                >
                  <span>{t.discoverProductsBtn}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <a
                  href="#scanner"
                  className="px-5 py-3 rounded-full text-xs font-bold border border-[#faecc4]/50 hover:border-[#faecc4] text-[#faecc4] hover:bg-[#faecc4]/10 transition-all"
                >
                  {t.commitmentBtn}
                </a>
              </div>
            </div>

            {/* Embedded Visual: Grazing Dairy Cow in Pasture */}
            <div className="mt-8 rounded-2xl overflow-hidden border-2 border-[#faecc4]/30 shadow-2xl relative group max-h-72">
              <img
                src="/cow_holstein.jpg"
                alt="Holstein Dairy Cow Grazing in Green Pasture"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              
              {/* Floating Badge */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                <div className="flex items-center space-x-2 bg-[#0c2f1a]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#faecc4]/40 text-[#faecc4]">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-bold text-[11px]">{t.heroCowBadge}</span>
                </div>

                <div className="hidden sm:block text-[11px] font-mono text-white/90 bg-black/50 px-3 py-1 rounded-full">
                  EC: 4.25 mS/cm • pH: 6.55 • SCC: 1.2
                </div>
              </div>
            </div>

          </div>

          {/* Right Hero Card (Warm Butter Cream #faecc4) - 4 Cols (Stylized Monogram Card) */}
          <div className="lg:col-span-4 bg-[#faecc4] text-[#0c2f1a] rounded-3xl p-8 flex flex-col justify-between shadow-xl border-2 border-[#e6d39e] text-center">
            
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#0c2f1a]/70 border-b border-[#0c2f1a]/15 pb-3">
              <span>{t.monogramTag}</span>
              <span className="font-mono">81.0% ACC</span>
            </div>

            {/* The GauRakshak AI Royal Dairy Crest & Live Biomarkers */}
            <div className="my-5 flex flex-col items-center justify-center space-y-4">
              
              {/* Ornate Medallion Emblem */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Decorative outer spinning ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#0c2f1a]/30 animate-[spin_40s_linear_infinite]"></div>
                
                {/* Main Medallion Badge */}
                <div className="w-36 h-36 rounded-full bg-[#0c2f1a] text-[#faecc4] border-4 border-[#b89648] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden p-2">
                  
                  {/* Subtle inner radial glow */}
                  <div className="absolute inset-0 bg-radial from-[#1b502e] to-[#0c2f1a] opacity-80 pointer-events-none"></div>

                  {/* Top arc branding */}
                  <span className="relative z-10 text-[9px] font-black uppercase tracking-widest text-[#faecc4]/90 font-mono">
                    ★ GAURAKSHAK ★
                  </span>

                  {/* Center Cow & Milk Droplet Artwork */}
                  <div className="relative z-10 my-1 flex items-center justify-center">
                    <svg viewBox="0 0 64 50" className="h-14 w-20 fill-[#faecc4] drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
                      {/* Stylized Cow Head with traditional horns & milk vessel */}
                      <path d="M32 4 C27 4, 22 8, 20 13 C17 11, 12 11, 8 14 C5 16, 4 20, 6 24 C8 27, 12 28, 16 26 C17 31, 20 37, 24 41 C27 44, 30 46, 32 46 C34 46, 37 44, 40 41 C44 37, 47 31, 48 26 C52 28, 56 27, 58 24 C60 20, 59 16, 56 14 C52 11, 47 11, 44 13 C42 8, 37 4, 32 4 Z M26 10 C28 9, 30 8, 32 8 C34 8, 36 9, 38 10 C36 12, 34 14, 32 14 C30 14, 28 12, 26 10 Z M27 24 C28.6 24, 30 25.4, 30 27 C30 28.6, 28.6 30, 27 30 C25.4 30, 24 28.6, 24 27 C24 25.4, 25.4 24, 27 24 Z M37 24 C38.6 24, 40 25.4, 40 27 C40 28.6, 38.6 30, 37 30 C35.4 30, 34 28.6, 34 27 C34 25.4, 35.4 24, 37 24 Z M32 32 C34 32, 36 33.5, 36 35 C36 36.5, 34 38, 32 38 C30 38, 28 36.5, 28 35 C28 33.5, 30 32, 32 32 Z" />
                    </svg>
                  </div>

                  {/* Bottom AI Diagnostic Tag */}
                  <div className="relative z-10 flex items-center space-x-1 text-[8px] font-black uppercase tracking-wider text-[#b89648] bg-[#071f11] px-2 py-0.5 rounded-full border border-[#b89648]/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>AI HERD OS</span>
                  </div>

                </div>
              </div>

              {/* Live Herd Quality Indicator Pills */}
              <div className="w-full grid grid-cols-3 gap-2 bg-[#f3e3b2] p-2.5 rounded-2xl border border-[#0c2f1a]/15 text-center shadow-inner">
                <div>
                  <span className="text-[9px] text-[#0c2f1a]/70 font-bold block uppercase">Milk pH</span>
                  <span className="font-mono font-black text-sm text-[#0c2f1a] block">6.55</span>
                  <span className="text-[8px] text-emerald-800 font-extrabold block">✓ Optimal</span>
                </div>
                <div className="border-x border-[#0c2f1a]/15">
                  <span className="text-[9px] text-[#0c2f1a]/70 font-bold block uppercase">Conductivity</span>
                  <span className="font-mono font-black text-sm text-[#0c2f1a] block">4.25</span>
                  <span className="text-[8px] text-emerald-800 font-extrabold block">✓ Normal</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#0c2f1a]/70 font-bold block uppercase">SCC Count</span>
                  <span className="font-mono font-black text-sm text-[#0c2f1a] block">1.20</span>
                  <span className="text-[8px] text-emerald-800 font-extrabold block">✓ Grade A</span>
                </div>
              </div>

              {/* Bulk Tank Safe Tag */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-900/10 border border-emerald-800/20 text-emerald-900 text-[11px] font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                <span>{language === 'en' ? 'Tank Safe • Negative for Mastitis' : 'दूध सुरक्षित • थनैल मुक्त प्रमाणित'}</span>
              </div>

            </div>

            {/* Monogram Card Description */}
            <div className="space-y-3 pt-4 border-t border-[#0c2f1a]/15 text-left">
              <span className="text-xs font-bold uppercase tracking-wide text-[#0c2f1a] block">
                Pure Milk Intelligence
              </span>
              <p className="text-xs text-[#0c2f1a]/80 leading-relaxed">
                {language === 'en' 
                  ? 'Engineered to stop clinical mastitis before it contaminates the bulk tank. Combining electrical conductivity, pH shifts, and cellular counts.'
                  : 'थोक टैंक में दूध खराब होने से पहले थनैल को रोकने के लिए निर्मित। चालकता, pH और सोमैटिक सेल काउंट का सटीक विश्लेषण।'}
              </p>

              <button
                onClick={onEnterDashboard}
                className="w-full py-3 rounded-2xl text-xs font-black bg-[#0c2f1a] hover:bg-[#144427] text-[#faecc4] shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>{t.enterDashboardBtn}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Three Pillars of Dairy Purity */}
      <section id="pillars" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#4f7324] block mb-1">
            Science & Purity
          </span>
          <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#0c2f1a]">
            {language === 'en' ? 'Three Pillars of Dairy Quality Assurance' : 'डेयरी गुणवत्ता और शुद्धता के तीन आधार'}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1 */}
          <div className="bg-[#fcfaf3] p-6 rounded-3xl border-2 border-[#e6dcbe] shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-[#0c2f1a] text-[#faecc4] flex items-center justify-center">
              <Activity className="h-6 w-6 stroke-[2]" />
            </div>
            <h4 className="font-serif font-bold text-lg text-[#0c2f1a]">
              {t.pillar1Title}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.pillar1Desc}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#fcfaf3] p-6 rounded-3xl border-2 border-[#e6dcbe] shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-[#4f7324] text-[#faecc4] flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 stroke-[2]" />
            </div>
            <h4 className="font-serif font-bold text-lg text-[#0c2f1a]">
              {t.pillar2Title}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.pillar2Desc}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#fcfaf3] p-6 rounded-3xl border-2 border-[#e6dcbe] shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-[#0c2f1a] text-[#faecc4] flex items-center justify-center">
              <Layers className="h-6 w-6 stroke-[2]" />
            </div>
            <h4 className="font-serif font-bold text-lg text-[#0c2f1a]">
              {t.pillar3Title}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.pillar3Desc}
            </p>
          </div>

        </div>
      </section>

      {/* 5. Interactive 1-Second Telemetry Scanner */}
      <section id="scanner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-[#0c2f1a] text-[#faecc4] rounded-3xl p-8 sm:p-12 border-2 border-[#164b2b] shadow-2xl">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#faecc4]/20">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#faecc4]/70">
                Live Demonstration
              </span>
              <h3 className="font-serif font-bold text-2xl sm:text-3xl text-[#faecc4] mt-1">
                {t.quickScanTitle}
              </h3>
              <p className="text-xs text-[#faecc4]/80 mt-1 max-w-xl">
                {t.quickScanSubtitle}
              </p>
            </div>

            {/* Quick Demo Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#faecc4]/70 mr-1">
                {t.presetsHeader}
              </span>
              {SAMPLE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickTest(p)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all border ${
                    selectedPreset.name === p.name
                      ? 'bg-[#faecc4] text-[#0c2f1a] border-[#faecc4] shadow-md'
                      : 'bg-[#144427] text-[#faecc4] border-[#faecc4]/30 hover:bg-[#1c5a34]'
                  }`}
                >
                  {idx === 0 ? t.presetHealthy : idx === 1 ? t.presetSubclinical : t.presetClinical}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Result Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 items-center">
            
            {/* Biophysical Readout */}
            <div className="space-y-3 bg-[#113a22] p-5 rounded-2xl border border-[#faecc4]/20">
              <span className="text-xs font-semibold text-[#faecc4]/70 block">
                Selected Biophysicals
              </span>
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="bg-[#0c2f1a] p-2.5 rounded-xl border border-[#faecc4]/20">
                  <span className="text-[10px] text-[#faecc4]/70 block font-sans">pH</span>
                  <span className="text-sm font-bold text-[#faecc4]">{selectedPreset.data.pH}</span>
                </div>
                <div className="bg-[#0c2f1a] p-2.5 rounded-xl border border-[#faecc4]/20">
                  <span className="text-[10px] text-[#faecc4]/70 block font-sans">EC (mS)</span>
                  <span className="text-sm font-bold text-[#faecc4]">{selectedPreset.data.EC}</span>
                </div>
                <div className="bg-[#0c2f1a] p-2.5 rounded-xl border border-[#faecc4]/20">
                  <span className="text-[10px] text-[#faecc4]/70 block font-sans">SCC (10⁵)</span>
                  <span className="text-sm font-bold text-[#faecc4]">{selectedPreset.data.SCC}</span>
                </div>
              </div>
            </div>

            {/* Diagnosis Result Banner */}
            <div className={`p-6 rounded-2xl border text-center space-y-2 ${
              quickResult.color === 'rose'
                ? 'bg-rose-950/70 border-rose-400 text-rose-100'
                : quickResult.color === 'amber'
                ? 'bg-amber-950/70 border-amber-400 text-amber-100'
                : 'bg-emerald-950/70 border-emerald-400 text-emerald-100'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 block">
                Trained Random Forest Classification
              </span>
              <span className="font-serif font-black text-2xl block tracking-tight">
                {quickResult.stage === 'Healthy' && (language === 'en' ? 'Healthy Udder' : 'स्वस्थ थन')}
                {quickResult.stage === 'Subclinical' && (language === 'en' ? 'Subclinical Mastitis' : 'सब-क्लिनिकल थनैल')}
                {quickResult.stage === 'Clinical' && (language === 'en' ? 'Clinical Mastitis' : 'क्लिनिकल थनैल रोग')}
              </span>
              <span className="text-xs font-mono font-bold block opacity-90">
                Risk Score: {quickResult.score} / 100 • Confidence: {(quickResult.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Launch Full Cow in Dashboard */}
            <div className="text-center md:text-right space-y-3">
              <span className="text-xs text-[#faecc4]/80 block">
                {language === 'en' ? 'Inspect 4-quarter telemetry, risk curves & history:' : 'चारों थनों का तापमान, ग्राफ और इतिहास देखें:'}
              </span>
              <button
                onClick={() => {
                  onSelectCowPreset(selectedPreset.color === 'emerald' ? 'cow1' : selectedPreset.color === 'amber' ? 'cow2' : 'cow3');
                  onEnterDashboard();
                }}
                className="w-full md:w-auto px-6 py-3.5 rounded-full text-xs font-black bg-[#faecc4] hover:bg-[#fff6dd] text-[#0c2f1a] shadow-lg transition-all inline-flex items-center justify-center space-x-2"
              >
                <span>{t.enterDashboardBtn}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Footer (GauRakshak AI Deep Forest Green) */}
      <footer className="bg-[#092414] text-[#faecc4]/80 py-12 px-6 border-t-2 border-[#faecc4]/20 mt-16 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-[#faecc4] text-[#0c2f1a] flex items-center justify-center font-baloo font-black text-base shadow-sm">
              G
            </div>
            <div>
              <span className="font-baloo font-bold text-lg text-[#faecc4] block leading-tight">
                {t.landingWordmark}
              </span>
              <span className="font-poppins text-[11px] text-[#faecc4]/70">
                {t.landingTagline}
              </span>
            </div>
          </div>

          <p className="max-w-xl text-center md:text-right text-[11px] text-[#faecc4]/70 leading-relaxed">
            {t.disclaimer}
          </p>

        </div>
      </footer>

    </div>
  );
}
