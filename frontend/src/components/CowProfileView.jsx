import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Tag, 
  Calendar, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Plus, 
  ArrowLeft, 
  FlaskConical, 
  Zap, 
  Microscope,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Filter,
  X,
  Eye,
  Check
} from 'lucide-react';
import { translations } from '../translations';
import { API_BASE_URL } from '../constants';

export default function CowProfileView({ 
  language, 
  initialRfid = null, 
  onStartPredictionForCow,
  onReturnHome 
}) {
  const t = translations[language] || translations.en;
  const detailRef = useRef(null);

  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRfid, setSelectedRfid] = useState(initialRfid || 'RFID-IND-1001');
  const [cowDetail, setCowDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, HEALTHY, CAUTION, URGENT

  // Modal State for instant, foolproof "View" feedback
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Audio Playback for past record
  const [playingRecordId, setPlayingRecordId] = useState(null);

  useEffect(() => {
    loadAllCows();
  }, []);

  useEffect(() => {
    if (selectedRfid) {
      loadCowDetail(selectedRfid);
    }
  }, [selectedRfid]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const loadAllCows = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cows`);
      if (res.ok) {
        const data = await res.json();
        setCows(data);
        if (!selectedRfid && data.length > 0) {
          setSelectedRfid(data[0].rfid);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadCowDetail = async (rfidId) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cows/${encodeURIComponent(rfidId)}`);
      if (res.ok) {
        const data = await res.json();
        setCowDetail(data);
        return data;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
    return null;
  };

  // Direct action when user clicks "View Details" or any cow card
  const handleViewCow = async (rfidId, openModal = true) => {
    setSelectedRfid(rfidId);
    const data = await loadCowDetail(rfidId);
    if (openModal) {
      setIsModalOpen(true);
    }
    // Also smoothly bring the inline detail section into view
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSpeakHistoryItem = (record) => {
    if (!('speechSynthesis' in window)) {
      alert('Text to speech is not supported in this browser.');
      return;
    }

    if (playingRecordId === record.id) {
      window.speechSynthesis.cancel();
      setPlayingRecordId(null);
      return;
    }

    const cowName = cowDetail?.name || selectedRfid;
    const stage = record.predicted_stage;
    let text = '';
    let langCode = language === 'hi' ? 'hi-IN' : 'en-US';

    if (language === 'hi') {
      if (stage === 'Healthy') {
        text = `गाय ${cowName}, तारीख ${record.timestamp}: स्वस्थ थन। दूध सुरक्षित था।`;
      } else if (stage === 'Subclinical') {
        text = `गाय ${cowName}, तारीख ${record.timestamp}: हल्का थनैल संक्रमण। सोमैटिक सेल बढ़े हुए थे।`;
      } else {
        text = `गाय ${cowName}, तारीख ${record.timestamp}: गंभीर थनैल रोग पाया गया था। तुरंत उपचार की आवश्यकता थी।`;
      }
    } else {
      if (stage === 'Healthy') {
        text = `Record for Cow ${cowName} on ${record.timestamp}: Healthy udder, milk safe.`;
      } else if (stage === 'Subclinical') {
        text = `Record for Cow ${cowName} on ${record.timestamp}: Caution, mild mastitis infection detected.`;
      } else {
        text = `Record for Cow ${cowName} on ${record.timestamp}: Urgent clinical mastitis detected.`;
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95;

    utterance.onstart = () => setPlayingRecordId(record.id);
    utterance.onend = () => setPlayingRecordId(null);
    utterance.onerror = () => setPlayingRecordId(null);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Filter cows
  const filteredCows = cows.filter(c => {
    const matchesSearch = 
      c.rfid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.breed && c.breed.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'HEALTHY') return c.last_stage === 'Healthy';
    if (activeFilter === 'CAUTION') return c.last_stage === 'Subclinical';
    if (activeFilter === 'URGENT') return c.last_stage === 'Clinical';

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Header with Search Bar & Quick Run Test */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#e6dcbe] shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-[#0c2f1a] text-[#faecc4] flex items-center justify-center shadow-md shrink-0">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0c2f1a] tracking-tight">
                {t.navMyCows} &amp; {t.navHistory}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'en' 
                  ? 'Click "View Details" on any cow to inspect complete chronological health records.' 
                  : 'किसी भी गाय का संपूर्ण स्वास्थ्य इतिहास देखने के लिए "विवरण देखें" पर क्लिक करें।'}
              </p>
            </div>
          </div>

          {/* New Test Quick Action */}
          {onStartPredictionForCow && (
            <button
              onClick={() => onStartPredictionForCow(selectedRfid)}
              className="min-h-[48px] px-5 py-2.5 rounded-2xl text-xs font-black bg-[#4f7324] hover:bg-[#3d5b1b] text-[#faecc4] shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{t.runNewTest}</span>
            </button>
          )}
        </div>

        {/* Search Input (48px tap target) */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchRfid}
            className="w-full min-h-[50px] pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-[#0c2f1a] bg-[#fcfbf7] text-sm sm:text-base font-medium text-slate-900 focus:outline-hidden transition-all shadow-inner"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: t.filterAll },
            { id: 'HEALTHY', label: t.filterHealthy, color: 'emerald' },
            { id: 'CAUTION', label: t.filterCaution, color: 'amber' },
            { id: 'URGENT', label: t.filterUrgent, color: 'rose' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-[#0c2f1a] text-[#faecc4] border-[#0c2f1a] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Horizontal Cow Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCows.map((c) => {
            const isSelected = selectedRfid?.toLowerCase() === c.rfid.toLowerCase();
            const isClinical = c.last_stage === 'Clinical';
            const isSubclinical = c.last_stage === 'Subclinical';

            return (
              <div
                key={c.rfid}
                onClick={() => handleViewCow(c.rfid, false)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 relative ${
                  isSelected
                    ? 'border-[#0c2f1a] bg-[#f8f6ee] shadow-lg ring-2 ring-[#0c2f1a]/20 scale-[1.01]'
                    : 'border-slate-200 bg-white hover:border-[#4f7324]/50 hover:shadow-md'
                }`}
              >
                {/* Active Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-[#0c2f1a] text-[#faecc4] text-[10px] font-black flex items-center space-x-1 shadow-xs">
                    <Check className="h-3 w-3" />
                    <span>{language === 'en' ? 'Active' : 'सक्रिय'}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                    {c.rfid}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center space-x-1 ${
                    isClinical 
                      ? 'bg-rose-100 text-rose-800' 
                      : isSubclinical 
                      ? 'bg-amber-100 text-amber-900' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isClinical ? <AlertOctagon className="h-3 w-3" /> : isSubclinical ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    <span>{c.last_stage || 'Untested'}</span>
                  </span>
                </div>

                <div>
                  <div className="font-black text-slate-900 text-base">{c.name || 'Unnamed Cow'}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">{c.breed}</div>
                </div>

                {/* Bottom Row: Test Count & Clear Interactive View Button */}
                <div className="text-xs font-medium text-slate-500 border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="font-bold">
                    {c.test_count || 0} {language === 'en' ? 'Tests' : 'जांच'}
                  </span>
                  
                  {/* High-visibility View Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewCow(c.rfid, true);
                    }}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#0c2f1a] hover:bg-[#184e2b] text-[#faecc4] font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                    title="Open cow details"
                  >
                    <Eye className="h-3.5 w-3.5 text-[#faecc4]" />
                    <span>{language === 'en' ? 'View Details' : 'विवरण देखें'}</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>


      {/* 2. Selected Cow Detail Profile & Chronological Timeline (Inline Section) */}
      <div id="cow-detail-section" ref={detailRef} className="scroll-mt-6">
        {detailLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-[#e6dcbe] shadow-xs">
            <div className="h-8 w-8 border-4 border-[#0c2f1a] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500 font-bold">
              {language === 'en' ? 'Loading Cow Profile & Health Timeline...' : 'गाय का रिकॉर्ड लोड हो रहा है...'}
            </p>
          </div>
        ) : cowDetail ? (
          <div className="space-y-6">
            
            {/* Profile Overview Card */}
            <div className="bg-[#0c2f1a] text-[#faecc4] rounded-3xl p-6 sm:p-8 border-2 border-[#164a2b] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#144827] rounded-full blur-2xl opacity-40 pointer-events-none"></div>

              <div className="relative z-10 flex items-center space-x-4 sm:space-x-5">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-[#faecc4] text-[#0c2f1a] flex items-center justify-center font-black text-3xl shadow-lg shrink-0">
                  🐄
                </div>
                <div>
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <h3 className="text-2xl sm:text-3xl font-black text-[#faecc4] tracking-tight">
                      {cowDetail.name || cowDetail.rfid}
                    </h3>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-[#1b4e2d] border border-[#faecc4]/30 text-[#faecc4] font-bold">
                      {cowDetail.rfid}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#faecc4]/80 mt-1 font-medium">
                    {cowDetail.breed} • {language === 'en' ? 'Registered on' : 'पंजीकरण तारीख:'} {cowDetail.date_added?.substring(0, 10)}
                  </p>
                  {cowDetail.notes && (
                    <p className="text-[11px] text-[#faecc4]/70 mt-1 italic">
                      "{cowDetail.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 flex items-center space-x-3 w-full md:w-auto">
                {onStartPredictionForCow && (
                  <button
                    type="button"
                    onClick={() => onStartPredictionForCow(cowDetail.rfid)}
                    className="flex-1 md:flex-initial min-h-[48px] px-6 py-3 rounded-2xl text-xs font-black bg-[#faecc4] hover:bg-[#fff7dd] text-[#0c2f1a] shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t.runNewTest}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Timeline of Past Predictions */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#e6dcbe] shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-[#4f7324]" />
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    {t.timelineHeading}
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                  {cowDetail.predictions?.length || 0} {language === 'en' ? 'Records Found' : 'कुल रिकॉर्ड उपलब्ध'}
                </span>
              </div>

              {(!cowDetail.predictions || cowDetail.predictions.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  {t.noHistoryYet}
                </div>
              ) : (
                <div className="space-y-4">
                  {cowDetail.predictions.map((rec, index) => {
                    const isHealthy = rec.predicted_stage === 'Healthy';
                    const isSubclinical = rec.predicted_stage === 'Subclinical';
                    const isClinical = rec.predicted_stage === 'Clinical';

                    return (
                      <div
                        key={rec.id || index}
                        className={`p-5 sm:p-6 rounded-2xl border-2 transition-all space-y-4 ${
                          isHealthy
                            ? 'bg-[#f7faf7] border-emerald-300 text-slate-900'
                            : isSubclinical
                            ? 'bg-[#fffdf5] border-amber-300 text-slate-900'
                            : 'bg-[#fff5f5] border-rose-300 text-slate-900'
                        }`}
                      >
                        {/* Top Row: Timestamp, Stage Badge & Audio Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-3">
                          <div className="flex items-center space-x-3">
                            <span className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs ${
                              isHealthy ? 'bg-emerald-600' : isSubclinical ? 'bg-amber-500' : 'bg-rose-600'
                            }`}>
                              {isHealthy ? <CheckCircle2 className="h-5 w-5" /> : isSubclinical ? <AlertTriangle className="h-5 w-5" /> : <AlertOctagon className="h-5 w-5" />}
                            </span>

                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-black text-base text-slate-900">
                                  {isHealthy ? t.healthyPlain : isSubclinical ? t.subclinicalPlain : t.clinicalPlain}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  isHealthy ? 'bg-emerald-100 text-emerald-800' : isSubclinical ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                                }`}>
                                  {rec.predicted_stage}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 font-medium">
                                {rec.timestamp}
                              </span>
                            </div>
                          </div>

                          {/* Audio button */}
                          <button
                            type="button"
                            onClick={() => handleSpeakHistoryItem(rec)}
                            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-2xs cursor-pointer ${
                              playingRecordId === rec.id
                                ? 'bg-rose-600 text-white animate-pulse'
                                : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {playingRecordId === rec.id ? (
                              <>
                                <VolumeX className="h-4 w-4" />
                                <span>{t.stopSpeaking}</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-4 w-4 text-blue-600" />
                                <span>{t.tapToHear}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Biomarker Readings Matrix */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 p-3.5 rounded-xl border border-black/5 text-xs font-medium">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Milk pH</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">{rec.ph} pH</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Conductivity (EC)</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">{rec.ec} mS/cm</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Somatic Cells (SCC)</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">{rec.scc} ×10⁵/mL</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Risk Score</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">{rec.risk_score} / 100</span>
                          </div>
                        </div>

                        {/* Recommendation */}
                        {(rec.veterinary_recommendation || rec.clinical_explanation) && (
                          <div className="text-xs text-slate-700 leading-relaxed font-medium bg-white/70 p-3 rounded-xl">
                            <strong>{t.actionPlan}:</strong> {rec.veterinary_recommendation || rec.clinical_explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>
        ) : null}
      </div>

      {/* 3. Dedicated Cow Profile & History Full Modal (Opens immediately on "View Details") */}
      {isModalOpen && cowDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border-2 border-[#e6dcbe] shadow-2xl overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-[#0c2f1a] text-[#faecc4] flex items-center justify-between border-b border-[#164a2b] shrink-0">
              <div className="flex items-center space-x-3.5">
                <div className="h-12 w-12 rounded-2xl bg-[#faecc4] text-[#0c2f1a] flex items-center justify-center text-2xl shadow-md shrink-0">
                  🐄
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl sm:text-2xl font-black text-[#faecc4]">
                      {cowDetail.name || cowDetail.rfid}
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#1b4e2d] border border-[#faecc4]/30 text-[#faecc4]">
                      {cowDetail.rfid}
                    </span>
                  </div>
                  <p className="text-xs text-[#faecc4]/80">
                    {cowDetail.breed} • {language === 'en' ? 'Registration:' : 'पंजीकरण:'} {cowDetail.date_added?.substring(0, 10)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-[#faecc4]/70 hover:text-white hover:bg-[#164a2b] transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body: Test History Timeline */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {cowDetail.notes && (
                <div className="p-3 bg-[#fcfbf7] border border-[#e6dcbe] rounded-xl text-xs text-slate-700 italic">
                  <strong>{language === 'en' ? 'Herd Notes:' : 'नोट्स:'}</strong> {cowDetail.notes}
                </div>
              )}

              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-[#4f7324]" />
                  <span>{t.timelineHeading}</span>
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  {cowDetail.predictions?.length || 0} {language === 'en' ? 'Records' : 'रिकॉर्ड'}
                </span>
              </div>

              {(!cowDetail.predictions || cowDetail.predictions.length === 0) ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  {t.noHistoryYet}
                </div>
              ) : (
                <div className="space-y-3">
                  {cowDetail.predictions.map((rec, index) => {
                    const isHealthy = rec.predicted_stage === 'Healthy';
                    const isSubclinical = rec.predicted_stage === 'Subclinical';

                    return (
                      <div
                        key={rec.id || index}
                        className={`p-4 rounded-xl border-2 space-y-3 ${
                          isHealthy
                            ? 'bg-[#f7faf7] border-emerald-300'
                            : isSubclinical
                            ? 'bg-[#fffdf5] border-amber-300'
                            : 'bg-[#fff5f5] border-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              isHealthy ? 'bg-emerald-100 text-emerald-800' : isSubclinical ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                            }`}>
                              {rec.predicted_stage}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              {rec.timestamp}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSpeakHistoryItem(rec)}
                            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs flex items-center space-x-1 cursor-pointer"
                          >
                            <Volume2 className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-[11px] font-bold">{t.tapToHear}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-center text-xs bg-white/70 p-2 rounded-lg border border-black/5 font-mono">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">pH</span>
                            <span className="font-bold text-slate-900">{rec.ph}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">EC</span>
                            <span className="font-bold text-slate-900">{rec.ec}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">SCC</span>
                            <span className="font-bold text-slate-900">{rec.scc}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">Risk</span>
                            <span className="font-bold text-slate-900">{rec.risk_score}</span>
                          </div>
                        </div>

                        {(rec.veterinary_recommendation || rec.clinical_explanation) && (
                          <p className="text-[11px] text-slate-700 leading-snug">
                            <strong>{t.actionPlan}:</strong> {rec.veterinary_recommendation || rec.clinical_explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#fcfbf7] border-t border-[#e6dcbe] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {language === 'en' ? 'Close Window' : 'बंद करें'}
              </button>

              {onStartPredictionForCow && (
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    onStartPredictionForCow(cowDetail.rfid);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#0c2f1a] hover:bg-[#184e2b] text-[#faecc4] text-xs font-black flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t.runNewTest}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
