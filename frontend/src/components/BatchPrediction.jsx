import React, { useState } from 'react';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  AlertOctagon, 
  Filter
} from 'lucide-react';
import { API_BASE_URL } from '../constants';
import { translations } from '../translations';

export default function BatchPrediction({ language }) {
  const t = translations[language];

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [filterStage, setFilterStage] = useState('ALL');

  // Sample CSV generator for instant user testing
  const handleDownloadSample = () => {
    const sampleCsvContent = `id,pH,EC,SCC,Season,LactationStage,Parity,MilkYield
COW-101,6.52,4.20,1.10,Winter,Mid,2nd,5-10
COW-102,6.58,4.35,1.45,Winter,Early,Primiparous,>10
COW-103,6.80,5.10,3.60,Rainy,Mid,3rd,5-10
COW-104,6.75,4.95,2.80,Rainy,Late,2nd,5-10
COW-105,7.25,6.80,42.0,Summer,Early,4th and above,0-4
COW-106,7.10,6.40,28.5,Summer,Mid,3rd,0-4
COW-107,6.60,4.40,1.80,Winter,Mid,Primiparous,5-10
COW-108,6.85,5.30,4.20,Rainy,Early,4th and above,5-10`;

    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_mastitis_cows.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (uploadedFile) => {
    if (!uploadedFile) return;
    if (!uploadedFile.name.endsWith('.csv')) {
      setError(language === 'en' ? 'Please upload a standard CSV (.csv) file.' : 'कृपया मान्य सीएसवी (.csv) फ़ाइल अपलोड करें।');
      return;
    }

    setFile(uploadedFile);
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const res = await fetch(`${API_BASE_URL}/predict/upload-csv`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      setResults(data.results);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error processing CSV file');
    } finally {
      setLoading(false);
    }
  };

  const handleExportResults = () => {
    if (!results || results.length === 0) return;

    const headers = [
      'id', 'pH', 'EC', 'SCC', 'Season', 'LactationStage', 'Parity', 'MilkYield',
      'predicted_stage', 'confidence', 'p_healthy', 'p_subclinical', 'p_clinical'
    ];

    const rows = results.map(r => [
      r.id, r.pH, r.EC, r.SCC, r.Season, r.LactationStage, r.Parity, r.MilkYield,
      r.predicted_stage, r.confidence, r.p_healthy, r.p_subclinical, r.p_clinical
    ].join(','));

    const csvData = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mastitis_predictions_batch_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows
  const filteredResults = results ? results.filter(r => {
    if (filterStage === 'ALL') return true;
    return r.predicted_stage.toUpperCase() === filterStage;
  }) : [];

  // Summary counts
  const counts = results ? {
    total: results.length,
    healthy: results.filter(r => r.predicted_stage === 'Healthy').length,
    subclinical: results.filter(r => r.predicted_stage === 'Subclinical').length,
    clinical: results.filter(r => r.predicted_stage === 'Clinical').length,
  } : null;

  const getStageLabel = (stage) => {
    if (language === 'en') return stage;
    if (stage === 'Healthy') return 'स्वस्थ';
    if (stage === 'Subclinical') return 'सब-क्लिनिकल';
    if (stage === 'Clinical') return 'क्लिनिकल';
    return stage;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Upload & Actions Panel */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div>
            <div className="flex items-center space-x-2 text-teal-700 font-semibold text-sm">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{t.batchScreening}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {t.batchTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.batchSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300"
            >
              <Download className="h-4 w-4" />
              <span>{t.downloadSampleCsv}</span>
            </button>

            {results && (
              <button
                onClick={handleExportResults}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>{t.exportResults} ({results.length})</span>
              </button>
            )}
          </div>

        </div>

        {/* Drag and Drop Zone */}
        <div className="mt-6">
          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 transition-all rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer text-center group">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files[0])}
            />
            <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-200 text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-300 flex items-center justify-center transition-colors">
              <Upload className="h-6 w-6 stroke-[1.5]" />
            </div>
            <p className="text-sm font-semibold text-slate-800 mt-3">
              {file ? file.name : t.dropzoneText}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {t.requiredHeaders}
            </p>
          </label>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="inline-flex h-8 w-8 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin"></div>
          <p className="text-xs font-semibold text-slate-700">
            {language === 'en' ? 'Processing Batch Herd Records...' : 'झुंड के रिकॉर्ड्स का विश्लेषण हो रहा है...'}
          </p>
        </div>
      )}

      {/* Results Section */}
      {results && !loading && (
        <div className="space-y-6">
          
          {/* Summary Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block">{t.totalScreened}</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                {counts.total}
              </span>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800">{t.stageHealthy}</span>
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-2xl font-black text-emerald-900 font-mono mt-1 block">
                {counts.healthy}
                <span className="text-xs font-normal text-emerald-700 ml-2">
                  ({Math.round((counts.healthy / counts.total) * 100)}%)
                </span>
              </span>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-800">{t.stageSubclinical}</span>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-2xl font-black text-amber-950 font-mono mt-1 block">
                {counts.subclinical}
                <span className="text-xs font-normal text-amber-700 ml-2">
                  ({Math.round((counts.subclinical / counts.total) * 100)}%)
                </span>
              </span>
            </div>

            <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-800">{t.stageClinical}</span>
                <AlertOctagon className="h-4 w-4 text-rose-600" />
              </div>
              <span className="text-2xl font-black text-rose-950 font-mono mt-1 block">
                {counts.clinical}
                <span className="text-xs font-normal text-rose-700 ml-2">
                  ({Math.round((counts.clinical / counts.total) * 100)}%)
                </span>
              </span>
            </div>

          </div>

          {/* Results Table with Filter */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">{t.filterBy}</span>
              </div>

              <div className="flex space-x-1.5 text-xs font-medium">
                {[
                  { key: 'ALL', label: language === 'en' ? 'ALL' : 'सभी' },
                  { key: 'HEALTHY', label: language === 'en' ? 'HEALTHY' : 'स्वस्थ' },
                  { key: 'SUBCLINICAL', label: language === 'en' ? 'SUBCLINICAL' : 'सब-क्लिनिकल' },
                  { key: 'CLINICAL', label: language === 'en' ? 'CLINICAL' : 'क्लिनिकल' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setFilterStage(opt.key)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterStage === opt.key
                        ? 'bg-slate-900 text-white shadow-sm font-semibold'
                        : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{t.cowId}</th>
                    <th className="py-3 px-4">pH</th>
                    <th className="py-3 px-4">EC (mS/cm)</th>
                    <th className="py-3 px-4">SCC (×10⁵/mL)</th>
                    <th className="py-3 px-4">{t.seasonLabel}</th>
                    <th className="py-3 px-4">{t.stage}</th>
                    <th className="py-3 px-4">{t.parityLabel}</th>
                    <th className="py-3 px-4">{language === 'en' ? 'Predicted Stage' : 'अनुमानित अवस्था'}</th>
                    <th className="py-3 px-4">{t.modelConfidence}</th>
                    <th className="py-3 px-4 text-right">{t.probabilitiesHeader}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredResults.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">{r.id}</td>
                      <td className="py-3 px-4">{r.pH.toFixed(2)}</td>
                      <td className="py-3 px-4">{r.EC.toFixed(2)}</td>
                      <td className="py-3 px-4">{r.SCC.toFixed(2)}</td>
                      <td className="py-3 px-4 font-sans text-slate-600">{r.Season}</td>
                      <td className="py-3 px-4 font-sans text-slate-600">{r.LactationStage}</td>
                      <td className="py-3 px-4 font-sans text-slate-600">{r.Parity}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          r.predicted_stage === 'Healthy'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.predicted_stage === 'Subclinical'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-900'
                        }`}>
                          {getStageLabel(r.predicted_stage)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {(r.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        <span className="text-emerald-700 font-medium">{(r.p_healthy * 100).toFixed(0)}%</span> / 
                        <span className="text-amber-700 font-medium ml-1">{(r.p_subclinical * 100).toFixed(0)}%</span> / 
                        <span className="text-rose-700 font-medium ml-1">{(r.p_clinical * 100).toFixed(0)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
