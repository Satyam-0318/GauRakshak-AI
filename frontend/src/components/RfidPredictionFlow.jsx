import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, 
  Search, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCcw, 
  ChevronRight, 
  Calendar, 
  FlaskConical, 
  Zap, 
  Microscope, 
  Milk, 
  Sun, 
  CloudRain, 
  Snowflake, 
  History,
  Check,
  Tag,
  ShieldCheck,
  Info
} from 'lucide-react';
import { translations } from '../translations';
import { API_BASE_URL } from '../constants';

export default function RfidPredictionFlow({ 
  language, 
  onViewCowProfile, 
  initialRfid = null,
  onPredictionComplete 
}) {
  const t = translations[language];

  // RFID and Cow State
  const [rfid, setRfid] = useState(initialRfid || 'RFID-IND-1001');
  const [knownCows, setKnownCows] = useState([]);
  const [selectedCow, setSelectedCow] = useState(null);
  const [isNewCow, setIsNewCow] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newCowData, setNewCowData] = useState({
    name: '',
    breed: 'Gir',
    notes: ''
  });

  // Parameters (Farmer Friendly Numeric Values)
  const [ph, setPh] = useState(6.55);
  const [ec, setEc] = useState(4.25);
  const [scc, setScc] = useState(1.20);
  const [season, setSeason] = useState('Winter');
  const [lactationStage, setLactationStage] = useState('Mid');
  const [parity, setParity] = useState('2nd');
  const [milkYield, setMilkYield] = useState('5-10');

  // Inference State
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);

  // Audio Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef(null);

  // Load known cows on mount
  useEffect(() => {
    fetchCows();
  }, []);

  // Update selected cow when RFID changes
  useEffect(() => {
    if (rfid && rfid.trim()) {
      checkRfidInDatabase(rfid.trim());
    }
  }, [rfid]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fetchCows = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/cows`);
      if (res.ok) {
        const data = await res.json();
        setKnownCows(data);
        const match = data.find(c => c.rfid.toLowerCase() === rfid.toLowerCase());
        if (match) {
          setSelectedCow(match);
          setIsNewCow(false);
        }
      }
    } catch (e) {
      console.error('Error fetching cows:', e);
    }
  };

  const checkRfidInDatabase = async (rfidQuery) => {
    try {
      const res = await fetch(`${API_BASE_URL}/cows/${encodeURIComponent(rfidQuery)}`);
      if (res.ok) {
        const cow = await res.json();
        setSelectedCow(cow);
        setIsNewCow(false);
      } else {
        setSelectedCow(null);
        setIsNewCow(true);
      }
    } catch (e) {
      setSelectedCow(null);
      setIsNewCow(true);
    }
  };

  const handleRegisterCow = async (e) => {
    e.preventDefault();
    if (!rfid || !rfid.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/cows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfid: rfid.trim().toUpperCase(),
          name: newCowData.name.trim() || `Cow ${rfid.trim().toUpperCase()}`,
          breed: newCowData.breed,
          notes: newCowData.notes
        })
      });

      if (res.ok) {
        const created = await res.json();
        setSelectedCow(created);
        setIsNewCow(false);
        setShowRegisterModal(false);
        fetchCows();
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  // Run Prediction and auto-save
  const handleRunPrediction = async () => {
    setLoading(true);
    setError(null);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const payload = {
        rfid: rfid.trim().toUpperCase(),
        pH: parseFloat(ph),
        EC: parseFloat(ec),
        SCC: parseFloat(scc),
        Season: season,
        LactationStage: lactationStage,
        Parity: parity,
        MilkYield: milkYield
      };

      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      setPredictionResult(data);
      if (onPredictionComplete) {
        onPredictionComplete(data);
      }
      fetchCows(); // refresh cow list with updated count and status
    } catch (err) {
      setError(err.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Text-to-Speech Audio Playback
  const handlePlayAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text to speech is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cowName = selectedCow?.name || rfid;
    const stage = predictionResult?.predicted_stage || 'Healthy';

    let speechText = '';
    let voiceLang = 'en-US';

    if (language === 'hi') {
      voiceLang = 'hi-IN';
      if (stage === 'Healthy') {
        speechText = `गाय ${cowName}, आर एफ आई डी ${rfid} का परिणाम: स्वस्थ थन। दूध पूरी तरह सुरक्षित है। कोई संक्रमण नहीं पाया गया है। सामान्य दुग्ध दोहन जारी रखें।`;
      } else if (stage === 'Subclinical') {
        speechText = `सावधानी! गाय ${cowName}, आर एफ आई डी ${rfid} में हल्का थनैल संक्रमण पाया गया है। दूध में सोमैटिक सेल और चालकता बढ़ रही है। कृपया स्थानीय पशु चिकित्सक को दिखाएं और थन का सीएमटी परीक्षण करें।`;
      } else {
        speechText = `आपातकालीन चेतावनी! गाय ${cowName}, आर एफ आई डी ${rfid} में गंभीर थनैल रोग पाया गया है। इस गाय को तुरंत अन्य गायों से अलग करें। इस दूध का उपयोग न करें और तुरंत पशु चिकित्सक से संपर्क करें।`;
      }
    } else {
      voiceLang = 'en-US';
      if (stage === 'Healthy') {
        speechText = `Cow ${cowName}, RFID ${rfid} test result: Healthy udder. Milk is completely pure and safe. Continue regular milking hygiene.`;
      } else if (stage === 'Subclinical') {
        speechText = `Caution! Cow ${cowName}, RFID ${rfid} shows mild early mastitis infection. Somatic cell count and conductivity are elevated. Please consult your dairy veterinarian soon.`;
      } else {
        speechText = `Urgent alert! Cow ${cowName}, RFID ${rfid} is diagnosed with clinical mastitis. Isolate this cow immediately, do not mix milk in bulk tank, and contact your veterinarian for urgent treatment.`;
      }
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = voiceLang;
    utterance.rate = 0.95; // Slightly slower for clear rural comprehension
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Helper formatting
  const isHealthy = predictionResult?.predicted_stage === 'Healthy';
  const isSubclinical = predictionResult?.predicted_stage === 'Subclinical';
  const isClinical = predictionResult?.predicted_stage === 'Clinical';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. STEP 1: RFID Scanner & Cow Selector Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#e6dcbe] shadow-xs space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-[#0c2f1a] text-[#faecc4] flex items-center justify-center shadow-md shrink-0">
              <Scan className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0c2f1a] tracking-tight">
                {t.rfidStepTitle}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t.rfidStepSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4f7324] bg-[#f2f7ec] px-3 py-1 rounded-full border border-[#d5e7c4]">
              RFID Tracking Active
            </span>
          </div>
        </div>

        {/* RFID Input & Quick Actions */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {t.rfidInputLabel}
          </label>
          
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {/* Tag Input Box (Large 48px touch target) */}
            <div className="relative flex-1">
              <input
                type="text"
                value={rfid}
                onChange={(e) => setRfid(e.target.value.toUpperCase())}
                placeholder={t.rfidPlaceholder}
                className="w-full min-h-[52px] px-4 py-3 text-base sm:text-lg font-mono font-bold tracking-wider rounded-2xl border-2 border-[#faecc4]/80 focus:border-[#0c2f1a] bg-[#fcfbf7] text-slate-900 focus:outline-hidden transition-all shadow-inner"
              />
              <Tag className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Quick Demo Scan Button */}
            <button
              type="button"
              onClick={() => {
                const sampleTags = ['RFID-IND-1001', 'RFID-IND-1002', 'RFID-IND-1003', 'RFID-IND-1004'];
                const nextTag = sampleTags[(sampleTags.indexOf(rfid) + 1) % sampleTags.length];
                setRfid(nextTag);
              }}
              className="min-h-[52px] px-5 py-3 rounded-2xl text-xs font-black bg-[#4f7324] hover:bg-[#3f5e1c] text-[#faecc4] transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-95"
            >
              <Scan className="h-4 w-4" />
              <span>{language === 'en' ? 'Simulate RFID Scan' : 'आर.एफ.आई.डी स्कैन करें'}</span>
            </button>
          </div>
        </div>

        {/* Quick Select Chips from Registered Cows */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {t.quickSelectRfid}
          </span>
          <div className="flex flex-wrap gap-2">
            {knownCows.map((c) => {
              const isSelected = rfid.toLowerCase() === c.rfid.toLowerCase();
              const isDanger = c.last_stage === 'Clinical';
              const isWarn = c.last_stage === 'Subclinical';

              return (
                <button
                  key={c.rfid}
                  type="button"
                  onClick={() => setRfid(c.rfid)}
                  className={`min-h-[48px] px-4 py-2.5 rounded-2xl text-xs font-bold border-2 transition-all flex items-center space-x-2 ${
                    isSelected
                      ? 'border-[#0c2f1a] bg-[#0c2f1a] text-[#faecc4] shadow-md scale-102'
                      : 'border-[#e8dfc7] bg-white text-slate-700 hover:border-[#0c2f1a]/40 hover:bg-[#fcfaf4]'
                  }`}
                >
                  <span className="font-mono">{c.rfid}</span>
                  <span className="text-[11px] opacity-80">({c.name || c.breed})</span>
                  {c.last_stage && (
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      isDanger ? 'bg-rose-500' : isWarn ? 'bg-amber-400' : 'bg-emerald-500'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cow Profile Summary or New Cow Registration Banner */}
        {selectedCow ? (
          <div className="bg-[#f5fbf4] rounded-2xl p-4 sm:p-5 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="h-11 w-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                🐄
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-base sm:text-lg text-emerald-950">
                    {selectedCow.name || selectedCow.rfid}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {t.rfidRegisteredBadge}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {selectedCow.breed} • {selectedCow.test_count || selectedCow.predictions?.length || 0} {t.pastRecordsCount}
                </p>
              </div>
            </div>

            {onViewCowProfile && (
              <button
                type="button"
                onClick={() => onViewCowProfile(selectedCow.rfid)}
                className="min-h-[48px] px-4 py-2 rounded-xl text-xs font-bold bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-50 transition-all flex items-center space-x-1.5 shadow-2xs"
              >
                <History className="h-3.5 w-3.5" />
                <span>{t.viewCowProfile}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : isNewCow && rfid.trim() ? (
          <div className="bg-[#fff9ea] rounded-2xl p-4 sm:p-5 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sm sm:text-base text-amber-950">{rfid}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {t.rfidNewBadge}
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-0.5">
                  {t.noHistoryYet}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRegisterModal(true)}
              className="min-h-[48px] px-5 py-2.5 rounded-xl text-xs font-black bg-amber-700 hover:bg-amber-800 text-white shadow-sm transition-all flex items-center space-x-2 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>{t.registerCowTitle}</span>
            </button>
          </div>
        ) : null}

      </div>


      {/* Register Cow Modal (Simple, Farmer-Friendly) */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-[#0c2f1a] shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-[#0c2f1a]">{t.registerCowTitle}</h3>
                <p className="text-xs text-slate-500">{t.registerCowSubtitle}</p>
              </div>
              <span className="font-mono font-bold text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                {rfid}
              </span>
            </div>

            <form onSubmit={handleRegisterCow} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.cowNameLabel}
                </label>
                <input
                  type="text"
                  value={newCowData.name}
                  onChange={(e) => setNewCowData({ ...newCowData, name: e.target.value })}
                  placeholder="e.g. Gauri / Stall 4"
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-[#0c2f1a] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.cowBreedLabel}
                </label>
                <select
                  value={newCowData.breed}
                  onChange={(e) => setNewCowData({ ...newCowData, breed: e.target.value })}
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-[#0c2f1a] focus:outline-hidden bg-white"
                >
                  <option value="Gir">Gir (गीर गाय)</option>
                  <option value="Sahiwal">Sahiwal (साहीवाल)</option>
                  <option value="Red Sindhi">Red Sindhi (लाल सिंधी)</option>
                  <option value="Rathi">Rathi (राठी)</option>
                  <option value="Murrah Cross">Murrah Cross (मुर्राह क्रॉस)</option>
                  <option value="Holstein Cross">Holstein Cross (एच.एफ क्रॉस)</option>
                  <option value="Jersey Cross">Jersey Cross (जर्सी क्रॉस)</option>
                  <option value="Indigenous / Desi">Desi / Indigenous (देशी गाय)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.cowNotesLabel}
                </label>
                <input
                  type="text"
                  value={newCowData.notes}
                  onChange={(e) => setNewCowData({ ...newCowData, notes: e.target.value })}
                  placeholder="e.g. Calved last month, healthy appetite"
                  className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-[#0c2f1a] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  {language === 'en' ? 'Cancel' : 'रद्द करें'}
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl text-xs font-black bg-[#0c2f1a] hover:bg-[#144427] text-[#faecc4] shadow-md transition-all"
                >
                  {t.saveAndProceedBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* 2. STEP 2: Farmer-Friendly Low-Literacy Parameter Inputs (Sliders & Steppers) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#e6dcbe] shadow-xs space-y-8">
        
        {/* Step 2 Header */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-[#4f7324] text-[#faecc4] flex items-center justify-center shadow-md shrink-0">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0c2f1a] tracking-tight">
                {t.step2Parameters}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {t.step2Subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* 3 Core Numeric Sliders with Big Steppers (min 48px tap targets) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* A. Milk pH Slider */}
          <div className="bg-[#fcfbf7] p-5 rounded-2xl border-2 border-[#faecc4] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FlaskConical className="h-5 w-5 text-amber-700" />
                <span className="font-black text-sm text-slate-900">
                  {language === 'en' ? 'Milk pH Level' : 'दूध का pH स्तर'}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                ph > 6.8 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {ph.toFixed(2)} pH
              </span>
            </div>

            {/* Visual Indicator Bar */}
            <div className="h-3 w-full rounded-full bg-linear-to-r from-emerald-500 via-amber-400 to-rose-500 relative shadow-inner">
              {/* Normal range marker */}
              <div className="absolute inset-y-0 left-[35%] w-[18%] bg-white/40 border border-white/80" title="Normal 6.4 - 6.7"></div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>6.0 (Sour)</span>
              <span className="text-emerald-700">6.4 - 6.7 (Normal)</span>
              <span className="text-rose-600">7.6 (Infection)</span>
            </div>

            {/* Slider & 48px Steppers */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setPh(prev => Math.max(5.8, parseFloat((prev - 0.05).toFixed(2))))}
                className="h-12 w-12 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 font-black text-lg flex items-center justify-center active:scale-95 shadow-2xs"
                title="Decrease pH"
              >
                <Minus className="h-5 w-5" />
              </button>

              <input
                type="range"
                min="5.8"
                max="7.6"
                step="0.05"
                value={ph}
                onChange={(e) => setPh(parseFloat(e.target.value))}
                className="flex-1 h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0c2f1a]"
              />

              <button
                type="button"
                onClick={() => setPh(prev => Math.min(7.6, parseFloat((prev + 0.05).toFixed(2))))}
                className="h-12 w-12 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 font-black text-lg flex items-center justify-center active:scale-95 shadow-2xs"
                title="Increase pH"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* B. Electrical Conductivity (EC) Slider */}
          <div className="bg-[#fcfbf7] p-5 rounded-2xl border-2 border-[#faecc4] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <span className="font-black text-sm text-slate-900">
                  {language === 'en' ? 'Conductivity (EC)' : 'विद्युत चालकता (EC)'}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                ec > 5.0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {ec.toFixed(2)} mS/cm
              </span>
            </div>

            {/* Visual Indicator Bar */}
            <div className="h-3 w-full rounded-full bg-linear-to-r from-emerald-500 via-amber-400 to-rose-500 relative shadow-inner">
              <div className="absolute inset-y-0 left-[20%] w-[25%] bg-white/40 border border-white/80" title="Normal 4.0 - 4.8"></div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>3.0</span>
              <span className="text-emerald-700">4.0 - 4.8 (Normal)</span>
              <span className="text-rose-600">8.0 (Spike)</span>
            </div>

            {/* Slider & 48px Steppers */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setEc(prev => Math.max(3.0, parseFloat((prev - 0.1).toFixed(2))))}
                className="h-12 w-12 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 font-black text-lg flex items-center justify-center active:scale-95 shadow-2xs"
                title="Decrease EC"
              >
                <Minus className="h-5 w-5" />
              </button>

              <input
                type="range"
                min="3.0"
                max="8.0"
                step="0.1"
                value={ec}
                onChange={(e) => setEc(parseFloat(e.target.value))}
                className="flex-1 h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0c2f1a]"
              />

              <button
                type="button"
                onClick={() => setEc(prev => Math.min(8.0, parseFloat((prev + 0.1).toFixed(2))))}
                className="h-12 w-12 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 font-black text-lg flex items-center justify-center active:scale-95 shadow-2xs"
                title="Increase EC"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* C. Somatic Cell Count (SCC) Slider */}
          <div className="bg-[#fcfbf7] p-5 rounded-2xl border-2 border-[#faecc4] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Microscope className="h-5 w-5 text-rose-600" />
                <span className="font-black text-sm text-slate-900">
                  {language === 'en' ? 'Somatic Cells (SCC)' : 'सोमैटिक सेल काउंट (SCC)'}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                scc > 5.0 ? 'bg-rose-100 text-rose-800' : scc >= 2.0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {scc.toFixed(1)} ×10⁵/mL
              </span>
            </div>

            {/* Visual Indicator Bar */}
            <div className="h-3 w-full rounded-full bg-linear-to-r from-emerald-500 via-amber-400 to-rose-600 relative shadow-inner">
              <div className="absolute inset-y-0 left-0 w-[15%] bg-white/40 border border-white/80" title="Healthy < 2.0"></div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span className="text-emerald-700">&lt; 2.0 (Healthy)</span>
              <span className="text-amber-700">2 - 5 (Mild)</span>
              <span className="text-rose-600">&gt; 5.0 (Severe)</span>
            </div>

            {/* Slider & 48px Steppers */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setScc(prev => Math.max(0.5, parseFloat((prev - 0.2).toFixed(1))))}
                className="h-12 w-12 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 font-black text-lg flex items-center justify-center active:scale-95 shadow-2xs"
                title="Decrease SCC"
              >
                <Minus className="h-5 w-5" />
              </button>

              <input
                type="range"
                min="0.5"
                max="15.0"
                step="0.2"
                value={scc}
                onChange={(e) => setScc(parseFloat(e.target.value))}
                className="flex-1 h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0c2f1a]"
              />

              <button
                type="button"
                onClick={() => setScc(prev => Math.min(15.0, parseFloat((prev + 0.2).toFixed(1))))}
                className="h-12 w-12 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 font-black text-lg flex items-center justify-center active:scale-95 shadow-2xs"
                title="Increase SCC"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

        </div>


        {/* Pictorial Categorical Choices (Large Touch Buttons) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* 1. Daily Milk Yield */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              {language === 'en' ? 'Daily Milk Yield' : 'दूध उत्पादन (लीटर/दिन)'}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: '0-4', label: '0-4 L', icon: '🥛' },
                { val: '5-10', label: '5-10 L', icon: '🥛🥛' },
                { val: '>10', label: '>10 L', icon: '🥛🥛🥛' }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setMilkYield(item.val)}
                  className={`min-h-[48px] p-2 rounded-xl text-center border-2 transition-all flex flex-col items-center justify-center ${
                    milkYield === item.val
                      ? 'border-[#0c2f1a] bg-[#0c2f1a] text-[#faecc4] font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Season */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              {language === 'en' ? 'Season' : 'मौसम'}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: 'Winter', label: language === 'en' ? 'Winter' : 'सर्दी', icon: <Snowflake className="h-3.5 w-3.5" /> },
                { val: 'Summer', label: language === 'en' ? 'Summer' : 'गर्मी', icon: <Sun className="h-3.5 w-3.5" /> },
                { val: 'Rainy', label: language === 'en' ? 'Rainy' : 'बरसात', icon: <CloudRain className="h-3.5 w-3.5" /> }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setSeason(item.val)}
                  className={`min-h-[48px] p-2 rounded-xl text-center border-2 transition-all flex flex-col items-center justify-center space-y-0.5 ${
                    season === item.val
                      ? 'border-[#0c2f1a] bg-[#0c2f1a] text-[#faecc4] font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {item.icon}
                  <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Lactation Stage */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              {language === 'en' ? 'Lactation Stage' : 'स्तनपान अवस्था'}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: 'Early', label: language === 'en' ? 'Early' : 'शुरुआती', sub: '0-100 d' },
                { val: 'Mid', label: language === 'en' ? 'Mid' : 'मध्य', sub: '100-200 d' },
                { val: 'Late', label: language === 'en' ? 'Late' : 'अंतिम', sub: '>200 d' }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setLactationStage(item.val)}
                  className={`min-h-[48px] p-2 rounded-xl text-center border-2 transition-all flex flex-col items-center justify-center ${
                    lactationStage === item.val
                      ? 'border-[#0c2f1a] bg-[#0c2f1a] text-[#faecc4] font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[11px] font-bold">{item.label}</span>
                  <span className="text-[9px] opacity-70">{item.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Calving Number (Parity) */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              {language === 'en' ? 'Calving (Parity)' : 'ब्यांत संख्या'}
            </span>
            <div className="grid grid-cols-4 gap-1">
              {[
                { val: 'Primiparous', label: '1st' },
                { val: '2nd', label: '2nd' },
                { val: '3rd', label: '3rd' },
                { val: '4th and above', label: '4th+' }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setParity(item.val)}
                  className={`min-h-[48px] p-1.5 rounded-xl text-center border-2 transition-all flex flex-col items-center justify-center ${
                    parity === item.val
                      ? 'border-[#0c2f1a] bg-[#0c2f1a] text-[#faecc4] font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-black">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>


        {/* Big High-Contrast Action Button (Min 56px Tap Area) */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={loading}
            onClick={handleRunPrediction}
            className="w-full min-h-[56px] py-4 px-6 rounded-2xl text-base sm:text-lg font-black bg-[#0c2f1a] hover:bg-[#144427] active:scale-98 text-[#faecc4] shadow-xl shadow-black/20 transition-all flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 border-3 border-[#faecc4] border-t-transparent rounded-full animate-spin"></div>
                <span>{language === 'en' ? 'Evaluating Milk Biomarkers...' : 'दूध की जांच हो रही है...'}</span>
              </div>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-[#faecc4]" />
                <span>
                  {language === 'en' 
                    ? `🔍 Test Udder Health for ${selectedCow?.name || rfid}` 
                    : `🔍 ${selectedCow?.name || rfid} के थन की जांच करें`}
                </span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertOctagon className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

      </div>


      {/* 3. STEP 3: Farmer-Friendly Result Card + Text-To-Speech Playback */}
      {predictionResult && (
        <div className={`rounded-3xl p-6 sm:p-8 border-3 shadow-xl space-y-6 animate-fade-in ${
          isHealthy 
            ? 'bg-[#f4faf4] border-emerald-500 text-emerald-950'
            : isSubclinical
            ? 'bg-[#fffcf0] border-amber-500 text-amber-950'
            : 'bg-[#fff5f5] border-rose-600 text-rose-950'
        }`}>

          {/* Auto-Save Confirmation Banner */}
          <div className="flex items-center justify-between text-xs font-bold border-b border-black/10 pb-3">
            <span className="flex items-center space-x-1.5 text-emerald-800">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>{t.autoSavedMessage}</span>
            </span>
            <span className="font-mono text-slate-500">
              Record #{predictionResult.history_record_id || 'AUTO'}
            </span>
          </div>

          {/* Traffic-Light Status Header: Both Color AND Distinct Icon */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              {isHealthy ? (
                <div className="h-16 w-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shrink-0">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
              ) : isSubclinical ? (
                <div className="h-16 w-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-lg shrink-0">
                  <AlertTriangle className="h-9 w-9" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-3xl bg-rose-600 text-white flex items-center justify-center shadow-lg shrink-0 animate-bounce">
                  <AlertOctagon className="h-9 w-9" />
                </div>
              )}

              <div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-75 block">
                  {selectedCow?.name || rfid} • {predictionResult.predicted_stage}
                </span>
                
                {/* Low Literacy Clear Headline */}
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  {isHealthy ? t.healthyPlain : isSubclinical ? t.subclinicalPlain : t.clinicalPlain}
                </h3>
              </div>
            </div>

            {/* Audio Playback Button (Min 48px Tap Target) */}
            <button
              type="button"
              onClick={handlePlayAudio}
              className={`min-h-[52px] px-6 py-3 rounded-2xl text-sm font-black transition-all flex items-center justify-center space-x-2.5 shadow-md active:scale-95 ${
                isSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-white text-slate-900 border-2 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-5 w-5" />
                  <span>{t.stopSpeaking}</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-5 w-5 text-blue-600" />
                  <span>{t.tapToHear}</span>
                </>
              )}
            </button>
          </div>

          {/* Practical Advice Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-black/10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider block opacity-75">
              {t.actionPlan}
            </span>
            <p className="text-sm sm:text-base font-semibold leading-relaxed">
              {predictionResult.veterinary_recommendation || predictionResult.clinical_explanation}
            </p>
          </div>

          {/* Confidence and Quick Jump to Timeline */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs font-mono font-bold opacity-80">
              Risk: {predictionResult.risk_score || 24}/100 • Model Confidence: {Math.round(predictionResult.confidence * 100)}%
            </div>

            {onViewCowProfile && (
              <button
                type="button"
                onClick={() => onViewCowProfile(rfid)}
                className="min-h-[48px] px-5 py-2.5 rounded-xl text-xs font-black bg-[#0c2f1a] text-[#faecc4] hover:bg-[#144427] transition-all flex items-center justify-center space-x-2"
              >
                <History className="h-4 w-4" />
                <span>{language === 'en' ? 'View Cow Health Timeline →' : 'गाय की समयरेखा और इतिहास देखें →'}</span>
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
