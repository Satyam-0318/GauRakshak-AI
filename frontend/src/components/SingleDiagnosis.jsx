import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertOctagon, 
  RotateCcw, 
  Sparkles, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Thermometer
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { 
  NUMERICAL_FIELDS, 
  SAMPLE_PRESETS, 
  API_BASE_URL 
} from '../constants';
import { translations } from '../translations';

export default function SingleDiagnosis({ language }) {
  const t = translations[language];

  const [formData, setFormData] = useState({
    pH: 6.60,
    EC: 4.40,
    SCC: 1.50,
    Season: 'Winter',
    LactationStage: 'Mid',
    Parity: '2nd',
    MilkYield: '5-10'
  });

  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Categorical Options based on language
  const categoricalOptions = {
    Season: [
      { value: 'Winter', label: t.seasonWinter },
      { value: 'Summer', label: t.seasonSummer },
      { value: 'Rainy', label: t.seasonRainy }
    ],
    LactationStage: [
      { value: 'Early', label: t.lactEarly },
      { value: 'Mid', label: t.lactMid },
      { value: 'Late', label: t.lactLate }
    ],
    Parity: [
      { value: 'Primiparous', label: t.parity1 },
      { value: '2nd', label: t.parity2 },
      { value: '3rd', label: t.parity3 },
      { value: '4th and above', label: t.parity4 }
    ],
    MilkYield: [
      { value: '0-4', label: t.yieldLow },
      { value: '5-10', label: t.yieldMed },
      { value: '>10', label: t.yieldHigh }
    ]
  };

  // Validation logic
  const validate = () => {
    const errors = {};
    if (formData.pH === '' || isNaN(formData.pH)) {
      errors.pH = language === 'en' ? 'Please enter a valid pH value' : 'कृपया मान्य pH मान दर्ज करें';
    } else if (formData.pH < 5.5 || formData.pH > 8.0) {
      errors.pH = language === 'en' ? 'Milk pH must be between 5.5 and 8.0' : 'दूध का pH 5.5 से 8.0 के बीच होना चाहिए';
    }

    if (formData.EC === '' || isNaN(formData.EC)) {
      errors.EC = language === 'en' ? 'Please enter electrical conductivity' : 'कृपया विद्युत चालकता (EC) दर्ज करें';
    } else if (formData.EC < 0.0 || formData.EC > 25.0) {
      errors.EC = language === 'en' ? 'EC must be between 0.0 and 25.0 mS/cm' : 'EC 0.0 से 25.0 mS/cm के बीच होना चाहिए';
    }

    if (formData.SCC === '' || isNaN(formData.SCC)) {
      errors.SCC = language === 'en' ? 'Please enter Somatic Cell Count' : 'कृपया सोमैटिक सेल काउंट (SCC) दर्ज करें';
    } else if (formData.SCC < 0.0 || formData.SCC > 300.0) {
      errors.SCC = language === 'en' ? 'SCC must be between 0.0 and 300.0' : 'SCC 0.0 से 300.0 के बीच होना चाहिए';
    }

    return errors;
  };

  const errors = validate();
  const isValid = Object.keys(errors).length === 0;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const loadPreset = (preset) => {
    setFormData(preset.data);
    setTouched({});
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        pH: parseFloat(formData.pH),
        EC: parseFloat(formData.EC),
        SCC: parseFloat(formData.SCC),
        Season: formData.Season,
        LactationStage: formData.LactationStage,
        Parity: formData.Parity,
        MilkYield: formData.MilkYield
      };

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server error ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to communicate with prediction service.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      pH: 6.60,
      EC: 4.40,
      SCC: 1.50,
      Season: 'Winter',
      LactationStage: 'Mid',
      Parity: '2nd',
      MilkYield: '5-10'
    });
    setTouched({});
    setResult(null);
    setError(null);
  };

  // Prepare chart data if result exists
  const chartData = result ? [
    { 
      name: language === 'en' ? 'Healthy' : 'स्वस्थ', 
      probability: Math.round(result.probabilities.Healthy * 100), 
      color: '#10b981' 
    },
    { 
      name: language === 'en' ? 'Subclinical' : 'सब-क्लिनिकल', 
      probability: Math.round(result.probabilities.Subclinical * 100), 
      color: '#f59e0b' 
    },
    { 
      name: language === 'en' ? 'Clinical' : 'क्लिनिकल', 
      probability: Math.round(result.probabilities.Clinical * 100), 
      color: '#ef4444' 
    }
  ] : [];

  // Localized clinical reasoning and recommendations
  const getLocalizedExplanation = () => {
    if (!result) return '';
    if (language === 'en') return result.clinical_explanation;

    // Hindi translation of clinical explanation
    if (result.predicted_stage === 'Healthy') {
      return `गाय को ${(result.confidence * 100).toFixed(1)}% मॉडल विश्वास के साथ स्वस्थ के रूप में वर्गीकृत किया गया है। दूध के सभी प्राथमिक बायोमार्कर (SCC: ${result.biomarkers.SCC.value}, EC: ${result.biomarkers.EC.value} mS/cm) सुरक्षित सामान्य शारीरिक सीमाओं में हैं।`;
    } else if (result.predicted_stage === 'Subclinical') {
      return `सब-क्लिनिकल थनैल रोग की पहचान हुई (${(result.confidence * 100).toFixed(1)}% मॉडल विश्वास)। यह परिणाम मुख्य रूप से बढ़े हुए सोमैटिक सेल काउंट (${result.biomarkers.SCC.value} ×10⁵/मिली) और बढ़ी हुई विद्युत चालकता (${result.biomarkers.EC.value} mS/cm) द्वारा प्रेरित है। यद्यपि दूध में अभी गांठें नहीं दिख रही हैं, पर थन के अंदर सूजन शुरू हो चुकी है।`;
    } else {
      return `क्लिनिकल थनैल रोग की पुष्टि हुई (${(result.confidence * 100).toFixed(1)}% मॉडल विश्वास)। अत्यधिक उच्च SCC (${result.biomarkers.SCC.value} ×10⁵/मिली), उच्च विद्युत चालकता (${result.biomarkers.EC.value} mS/cm), और क्षारीय pH (${result.biomarkers.pH.value}) थन के ऊतकों की गंभीर क्षति और सक्रिय जीवाणु संक्रमण को दर्शाते हैं।`;
    }
  };

  const getLocalizedRecommendation = () => {
    if (!result) return '';
    if (language === 'en') return result.veterinary_recommendation;

    if (result.predicted_stage === 'Healthy') {
      return 'नियमित स्वच्छता और मानक मिल्किंग प्रोटोकॉल जारी रखें। मासिक आधार पर दूध रिकॉर्डिंग परीक्षण की निगरानी करें।';
    } else if (result.predicted_stage === 'Subclinical') {
      return 'प्रभावित थन के हिस्से की पहचान के लिए चारों थनों का कैलिफ़ोर्निया मेस्टाइटिस टेस्ट (CMT) करें। पोस्ट-मिल्किंग टीट डिपिंग (Teat Dip) का सख्ती से पालन करें और 48 घंटों में पुनः परीक्षण करें।';
    } else {
      return 'दूध की गुणवत्ता और अन्य गायों में संक्रमण फैलने से रोकने के लिए गाय को तुरंत अलग करें। थन में सूजन और दूध में छिछड़ों की जांच करें। लक्षित एंटीबायोटिक और दर्द निवारक उपचार के लिए तुरंत पशुचिकित्सक से परामर्श लें।';
    }
  };

  const getLocalizedBiomarkerStatus = (key, rawStatus) => {
    if (language === 'en') return rawStatus;
    if (rawStatus.includes('Normal')) return 'सामान्य (Normal)';
    if (rawStatus.includes('Elevated') && rawStatus.includes('Subclinical')) return 'बढ़ा हुआ (सब-क्लिनिकल)';
    if (rawStatus.includes('Severely')) return 'अत्यधिक उच्च (क्लिनिकल)';
    if (rawStatus.includes('Elevated')) return 'बढ़ा हुआ (Elevated)';
    if (rawStatus.includes('High')) return 'अत्यधिक उच्च (High)';
    if (rawStatus.includes('Alkaline')) return 'क्षारीय (सूजन संकेत)';
    return rawStatus;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner & Quick Presets */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-700 font-semibold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>{t.diagEngine}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {t.diagTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.diagSubtitle}
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">{t.quickPresets}</span>
            {SAMPLE_PRESETS.map((p, idx) => {
              const label = idx === 0 ? t.presetHealthy : (idx === 1 ? t.presetSubclinical : t.presetClinical);
              return (
                <button
                  key={idx}
                  type="button"
                  id={`preset-${p.color}`}
                  onClick={() => loadPreset(p)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
                    p.color === 'emerald'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : p.color === 'amber'
                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                  title={p.description}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Biophysical Milk Measurements */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-emerald-600" />
                <span>{t.biophysicalTitle}</span>
              </h3>
              <span className="text-[11px] font-medium text-slate-400">{t.primaryBiomarkers}</span>
            </div>

            {/* pH Input */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label htmlFor="input-pH" className="font-semibold text-slate-700">
                  {language === 'en' ? NUMERICAL_FIELDS.pH.label : 'दूध का pH'}
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {t.typical}: {NUMERICAL_FIELDS.pH.normalRange}
                </span>
              </div>
              <div className="relative">
                <input
                  id="input-pH"
                  type="number"
                  step={NUMERICAL_FIELDS.pH.step}
                  min={NUMERICAL_FIELDS.pH.min}
                  max={NUMERICAL_FIELDS.pH.max}
                  value={formData.pH}
                  onChange={(e) => handleInputChange('pH', e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border font-mono transition-colors focus:outline-none focus:ring-2 ${
                    touched.pH && errors.pH
                      ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/40 text-rose-900'
                      : 'border-slate-300 focus:ring-emerald-200 focus:border-emerald-500 bg-white'
                  }`}
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 pointer-events-none">
                  pH
                </span>
              </div>
              {touched.pH && errors.pH ? (
                <p className="text-xs text-rose-600 mt-1">{errors.pH}</p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">{t.phTooltip}</p>
              )}
            </div>

            {/* EC Input */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label htmlFor="input-EC" className="font-semibold text-slate-700">
                  {language === 'en' ? NUMERICAL_FIELDS.EC.label : 'विद्युत चालकता (EC)'}
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {t.typical}: {NUMERICAL_FIELDS.EC.normalRange}
                </span>
              </div>
              <div className="relative">
                <input
                  id="input-EC"
                  type="number"
                  step={NUMERICAL_FIELDS.EC.step}
                  min={NUMERICAL_FIELDS.EC.min}
                  max={NUMERICAL_FIELDS.EC.max}
                  value={formData.EC}
                  onChange={(e) => handleInputChange('EC', e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border font-mono transition-colors focus:outline-none focus:ring-2 ${
                    touched.EC && errors.EC
                      ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/40 text-rose-900'
                      : 'border-slate-300 focus:ring-emerald-200 focus:border-emerald-500 bg-white'
                  }`}
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 pointer-events-none">
                  mS/cm
                </span>
              </div>
              {touched.EC && errors.EC ? (
                <p className="text-xs text-rose-600 mt-1">{errors.EC}</p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">{t.ecTooltip}</p>
              )}
            </div>

            {/* SCC Input */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label htmlFor="input-SCC" className="font-semibold text-slate-700">
                  {language === 'en' ? NUMERICAL_FIELDS.SCC.label : 'सोमैटिक सेल काउंट (SCC)'}
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {t.healthyLabel}: {NUMERICAL_FIELDS.SCC.normalRange}
                </span>
              </div>
              <div className="relative">
                <input
                  id="input-SCC"
                  type="number"
                  step={NUMERICAL_FIELDS.SCC.step}
                  min={NUMERICAL_FIELDS.SCC.min}
                  max={NUMERICAL_FIELDS.SCC.max}
                  value={formData.SCC}
                  onChange={(e) => handleInputChange('SCC', e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-sm border font-mono transition-colors focus:outline-none focus:ring-2 ${
                    touched.SCC && errors.SCC
                      ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/40 text-rose-900'
                      : 'border-slate-300 focus:ring-emerald-200 focus:border-emerald-500 bg-white'
                  }`}
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 pointer-events-none">
                  ×10⁵/mL
                </span>
              </div>
              {touched.SCC && errors.SCC ? (
                <p className="text-xs text-rose-600 mt-1">{errors.SCC}</p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">{t.sccTooltip}</p>
              )}
            </div>
          </div>

          {/* Card 2: Cow & Environmental Context */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                <span>{t.animalContextTitle}</span>
              </h3>
              <span className="text-[11px] font-medium text-slate-400">{t.contextualInputs}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Season */}
              <div>
                <label htmlFor="select-season" className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.seasonLabel}
                </label>
                <select
                  id="select-season"
                  value={formData.Season}
                  onChange={(e) => handleInputChange('Season', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                >
                  {categoricalOptions.Season.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Lactation Stage */}
              <div>
                <label htmlFor="select-lactation" className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.lactationLabel}
                </label>
                <select
                  id="select-lactation"
                  value={formData.LactationStage}
                  onChange={(e) => handleInputChange('LactationStage', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                >
                  {categoricalOptions.LactationStage.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Parity */}
              <div>
                <label htmlFor="select-parity" className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.parityLabel}
                </label>
                <select
                  id="select-parity"
                  value={formData.Parity}
                  onChange={(e) => handleInputChange('Parity', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                >
                  {categoricalOptions.Parity.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Milk Yield */}
              <div>
                <label htmlFor="select-yield" className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.yieldLabel}
                </label>
                <select
                  id="select-yield"
                  value={formData.MilkYield}
                  onChange={(e) => handleInputChange('MilkYield', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                >
                  {categoricalOptions.MilkYield.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-predict"
              type="submit"
              disabled={!isValid || loading}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 shadow-md transition-all ${
                isValid && !loading
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t.evaluatingBtn}</span>
                </>
              ) : (
                <>
                  <span>{t.predictBtn}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              id="btn-reset"
              type="button"
              onClick={handleReset}
              className="py-3 px-4 rounded-xl text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center space-x-1.5 transition-colors"
              title={t.resetBtn}
            >
              <RotateCcw className="h-4 w-4" />
              <span>{t.resetBtn}</span>
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-semibold">{t.predFailed}</p>
                <p>{error}</p>
              </div>
            </div>
          )}

        </form>

        {/* Right Column: Results Display */}
        <div className="lg:col-span-7 space-y-6">
          
          {loading && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <div className="inline-flex h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
              <h4 className="text-base font-bold text-slate-800">{t.analyzingTitle}</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t.analyzingDesc}
              </p>
            </div>
          )}

          {!loading && !result && (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm space-y-4">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">{t.awaitingTitle}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {t.awaitingDesc}
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Primary Color-Coded Result Card */}
              <div className={`rounded-2xl p-6 border shadow-sm transition-all ${
                result.color_theme === 'emerald'
                  ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white border-emerald-200'
                  : result.color_theme === 'amber'
                  ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border-amber-200'
                  : 'bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-white border-rose-200'
              }`}>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
                  <div className="flex items-center space-x-3.5">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-sm ${
                      result.color_theme === 'emerald'
                        ? 'bg-emerald-600'
                        : result.color_theme === 'amber'
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`}>
                      {result.predicted_stage === 'Healthy' && <CheckCircle className="h-6 w-6 stroke-[2.5]" />}
                      {result.predicted_stage === 'Subclinical' && <AlertTriangle className="h-6 w-6 stroke-[2.5]" />}
                      {result.predicted_stage === 'Clinical' && <AlertOctagon className="h-6 w-6 stroke-[2.5]" />}
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {t.diagnosticAssessment}
                      </span>
                      <h2 className={`text-2xl font-black tracking-tight ${
                        result.color_theme === 'emerald'
                          ? 'text-emerald-900'
                          : result.color_theme === 'amber'
                          ? 'text-amber-950'
                          : 'text-rose-950'
                      }`}>
                        {result.predicted_stage === 'Healthy' && t.healthyUdder}
                        {result.predicted_stage === 'Subclinical' && t.subclinicalDetected}
                        {result.predicted_stage === 'Clinical' && t.clinicalDetected}
                      </h2>
                    </div>
                  </div>

                  {/* Confidence Badge */}
                  <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                    <span className="text-[11px] font-medium text-slate-500 block">{t.modelConfidence}</span>
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Probability Distribution Chart */}
                <div className="mt-5 pt-1">
                  <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
                    <span>{t.probabilityDistribution}</span>
                    <span className="text-[11px] font-normal text-slate-400">{t.rfSoftmax}</span>
                  </h4>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                        <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} width={90} />
                        <Tooltip 
                          formatter={(val) => [`${val}%`, 'Probability']}
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                        />
                        <Bar dataKey="probability" radius={[0, 6, 6, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Biomarker Deviation Comparison */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span>{t.biomarkerComparison}</span>
                  </h4>
                  <span className="text-xs text-slate-400">{t.vsBaselines}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* SCC Card */}
                  <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    result.biomarkers.SCC.severity === 'high'
                      ? 'bg-rose-50/70 border-rose-200'
                      : result.biomarkers.SCC.severity === 'medium'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-emerald-50/70 border-emerald-200'
                  }`}>
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>SCC</span>
                      <span className="font-mono font-bold text-slate-900">
                        {result.biomarkers.SCC.value} {result.biomarkers.SCC.unit}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {t.healthyLabel}: <span className="font-mono font-medium">{result.biomarkers.SCC.reference}</span>
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      result.biomarkers.SCC.severity === 'high'
                        ? 'bg-rose-200 text-rose-800'
                        : result.biomarkers.SCC.severity === 'medium'
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-emerald-200 text-emerald-800'
                    }`}>
                      {getLocalizedBiomarkerStatus('SCC', result.biomarkers.SCC.status)}
                    </span>
                  </div>

                  {/* EC Card */}
                  <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    result.biomarkers.EC.severity === 'high'
                      ? 'bg-rose-50/70 border-rose-200'
                      : result.biomarkers.EC.severity === 'medium'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-emerald-50/70 border-emerald-200'
                  }`}>
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{language === 'en' ? 'Conductivity (EC)' : 'विद्युत चालकता (EC)'}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {result.biomarkers.EC.value} {result.biomarkers.EC.unit}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {t.healthyLabel}: <span className="font-mono font-medium">{result.biomarkers.EC.reference}</span>
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      result.biomarkers.EC.severity === 'high'
                        ? 'bg-rose-200 text-rose-800'
                        : result.biomarkers.EC.severity === 'medium'
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-emerald-200 text-emerald-800'
                    }`}>
                      {getLocalizedBiomarkerStatus('EC', result.biomarkers.EC.status)}
                    </span>
                  </div>

                  {/* pH Card */}
                  <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    result.biomarkers.pH.severity === 'high'
                      ? 'bg-rose-50/70 border-rose-200'
                      : result.biomarkers.pH.severity === 'medium'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-emerald-50/70 border-emerald-200'
                  }`}>
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{language === 'en' ? 'Milk pH' : 'दूध pH'}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {result.biomarkers.pH.value}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {t.healthyLabel}: <span className="font-mono font-medium">{result.biomarkers.pH.reference}</span>
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      result.biomarkers.pH.severity === 'high'
                        ? 'bg-rose-200 text-rose-800'
                        : result.biomarkers.pH.severity === 'medium'
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-emerald-200 text-emerald-800'
                    }`}>
                      {getLocalizedBiomarkerStatus('pH', result.biomarkers.pH.status)}
                    </span>
                  </div>

                </div>
              </div>

              {/* Plain-Language Clinical Reasoning */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <span>{t.clinicalReasoning}</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {getLocalizedExplanation()}
                </p>
              </div>

              {/* Veterinary Recommendation Box */}
              <div className={`rounded-2xl p-5 border text-xs space-y-2 ${
                result.action_code === 'ISOLATE_TREAT'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : result.action_code === 'INSPECT_CMT'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center space-x-2 font-bold text-xs">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{t.vetRecommendation}</span>
                </div>
                <p className="leading-relaxed">
                  {getLocalizedRecommendation()}
                </p>
              </div>

              {/* Reset Action */}
              <div className="pt-2 text-center">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-800 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{t.analyzeAnother}</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
