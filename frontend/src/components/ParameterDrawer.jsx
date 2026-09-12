import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { translations } from '../translations';
import { NUMERICAL_FIELDS, CATEGORICAL_OPTIONS, SAMPLE_PRESETS, API_BASE_URL } from '../constants';

export default function ParameterDrawer({ isOpen, onClose, language, onApplyPrediction, currentInput }) {
  const t = translations[language];

  const [formData, setFormData] = useState({
    pH: currentInput?.pH ?? 6.55,
    EC: currentInput?.EC ?? 4.25,
    SCC: currentInput?.SCC ?? 1.20,
    Season: currentInput?.Season ?? 'Winter',
    LactationStage: currentInput?.LactationStage ?? 'Mid',
    Parity: currentInput?.Parity ?? '2nd',
    MilkYield: currentInput?.MilkYield ?? '5-10',
    cowId: currentInput?.cowId ?? '#C023',
    breed: currentInput?.breed ?? 'Holstein',
    daysInMilk: currentInput?.daysInMilk ?? 142
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handlePresetSelect = (preset) => {
    setFormData(prev => ({
      ...prev,
      ...preset.data,
      cowId: preset.color === 'emerald' ? '#C023' : preset.color === 'amber' ? '#C018' : '#C009',
      breed: preset.color === 'rose' ? 'Jersey-Cross' : 'Holstein',
      daysInMilk: preset.color === 'emerald' ? 142 : preset.color === 'amber' ? 85 : 35
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Prediction error: ${res.status}`);
      }

      const result = await res.json();
      onApplyPrediction({
        ...result,
        cowId: formData.cowId,
        breed: formData.breed,
        daysInMilk: formData.daysInMilk
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to evaluate cow.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <div className="flex items-center space-x-2 text-blue-600 font-semibold text-xs">
                <Sparkles className="h-4 w-4" />
                <span>{language === 'en' ? 'Live ML Model Inference' : 'लाइव मॉडल प्रेडिक्शन'}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {t.modalTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.modalSubtitle}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Form Body */}
          <form id="prediction-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            
            {/* Quick Demo Presets */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                {t.presetsHeader}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold text-left transition-all ${
                      p.color === 'emerald'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : p.color === 'amber'
                        ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <span className="block">{idx === 0 ? t.presetHealthy : idx === 1 ? t.presetSubclinical : t.presetClinical}</span>
                    <span className="text-[10px] font-normal opacity-80 block font-mono mt-0.5">
                      SCC {p.data.SCC}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cow Identification */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.cowIdLabel}
                </label>
                <input
                  type="text"
                  value={formData.cowId}
                  onChange={(e) => handleInputChange('cowId', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.daysInMilkLabel}
                </label>
                <input
                  type="number"
                  value={formData.daysInMilk}
                  onChange={(e) => handleInputChange('daysInMilk', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>

            {/* Milk Biophysical Inputs */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                {language === 'en' ? 'Milk Biophysical Biomarkers' : 'दूध के बायोफिजिकल माप'}
              </span>

              {/* pH */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{t.fieldPh}</span>
                  <span className="font-mono text-blue-600">{formData.pH}</span>
                </div>
                <input
                  type="range"
                  min={5.5}
                  max={8.0}
                  step={0.05}
                  value={formData.pH}
                  onChange={(e) => handleInputChange('pH', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>5.5</span>
                  <span className="text-emerald-700 font-semibold">Normal 6.4 - 6.7</span>
                  <span>8.0</span>
                </div>
              </div>

              {/* EC */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{t.fieldEc}</span>
                  <span className="font-mono text-blue-600">{formData.EC} mS/cm</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={15.0}
                  step={0.1}
                  value={formData.EC}
                  onChange={(e) => handleInputChange('EC', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>0.0</span>
                  <span className="text-emerald-700 font-semibold">Normal 4.0 - 4.8</span>
                  <span>15.0</span>
                </div>
              </div>

              {/* SCC */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{t.fieldScc}</span>
                  <span className="font-mono text-blue-600">{formData.SCC} ×10⁵/mL</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={60.0}
                  step={0.2}
                  value={formData.SCC}
                  onChange={(e) => handleInputChange('SCC', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>0.0</span>
                  <span className="text-emerald-700 font-semibold">Healthy &lt; 2.0</span>
                  <span>60.0</span>
                </div>
              </div>
            </div>

            {/* Categorical Cow Factors */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.fieldSeason}
                </label>
                <select
                  value={formData.Season}
                  onChange={(e) => handleInputChange('Season', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Winter">Winter</option>
                  <option value="Summer">Summer</option>
                  <option value="Rainy">Rainy</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.fieldLactation}
                </label>
                <select
                  value={formData.LactationStage}
                  onChange={(e) => handleInputChange('LactationStage', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Early">Early</option>
                  <option value="Mid">Mid</option>
                  <option value="Late">Late</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.fieldParity}
                </label>
                <select
                  value={formData.Parity}
                  onChange={(e) => handleInputChange('Parity', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Primiparous">Primiparous</option>
                  <option value="2nd">2nd</option>
                  <option value="3rd">3rd</option>
                  <option value="4th and above">4th and above</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {t.fieldYield}
                </label>
                <select
                  value={formData.MilkYield}
                  onChange={(e) => handleInputChange('MilkYield', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="0-4">0 - 4 L</option>
                  <option value="5-10">5 - 10 L</option>
                  <option value=">10">&gt; 10 L</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

          </form>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              {language === 'en' ? 'Cancel' : 'रद्द करें'}
            </button>

            <button
              type="submit"
              form="prediction-form"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t.evaluatingText}</span>
                </>
              ) : (
                <>
                  <span>{t.runPredictionBtn}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
