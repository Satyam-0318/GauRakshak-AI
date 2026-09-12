import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Layers, 
  Sliders, 
  Activity, 
  Award,
  BookOpen,
  CheckCircle2,
  Cpu,
  Microscope,
  TableProperties,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';
import { API_BASE_URL } from '../constants';
import { translations } from '../translations';

export default function ModelMetrics({ language }) {
  const t = translations[language] || translations.en;

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/metrics`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load model metrics');
        return res.json();
      })
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border-2 border-[#e6dcbe] shadow-xs space-y-3">
        <div className="inline-flex h-8 w-8 rounded-full border-3 border-[#092615] border-t-transparent animate-spin"></div>
        <p className="text-xs font-semibold text-slate-700">
          {language === 'en' ? 'Loading Model Evaluation Metrics...' : 'मॉडल मूल्यांकन मेट्रिक्स लोड हो रहे हैं...'}
        </p>
      </div>
    );
  }

  // Bar chart data for Per-Class F1 / Precision / Recall
  const benchmarkChartData = metrics?.benchmark_scores ? [
    {
      stage: language === 'en' ? 'Healthy' : 'स्वस्थ',
      Precision: Math.round(metrics.benchmark_scores.Healthy.precision * 100),
      Recall: Math.round(metrics.benchmark_scores.Healthy.recall * 100),
      F1: Math.round(metrics.benchmark_scores.Healthy.f1 * 100),
    },
    {
      stage: language === 'en' ? 'Subclinical' : 'सब-क्लिनिकल',
      Precision: Math.round(metrics.benchmark_scores.Subclinical.precision * 100),
      Recall: Math.round(metrics.benchmark_scores.Subclinical.recall * 100),
      F1: Math.round(metrics.benchmark_scores.Subclinical.f1 * 100),
    },
    {
      stage: language === 'en' ? 'Clinical' : 'क्लिनिकल',
      Precision: Math.round(metrics.benchmark_scores.Clinical.precision * 100),
      Recall: Math.round(metrics.benchmark_scores.Clinical.recall * 100),
      F1: Math.round(metrics.benchmark_scores.Clinical.f1 * 100),
    },
  ] : [];

  // Top feature importance chart data
  const featureChartData = metrics?.feature_importance?.slice(0, 6).map(f => ({
    name: f.feature,
    importance: Math.round(f.importance * 1000) / 10
  })) || [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. Main Overview Banner Header */}
      <div className="bg-[#092615] text-[#faecc4] rounded-3xl p-6 sm:p-8 border-2 border-[#164426] shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#144827] rounded-full blur-2xl opacity-40 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#133d20] border border-[#faecc4]/30 text-[#faecc4] text-xs font-bold uppercase tracking-wider">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <span>{language === 'en' ? 'Technical Specifications' : 'तकनीकी विनिर्देश एवं प्रमाणन'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-baloo tracking-tight text-[#faecc4]">
              {language === 'en' ? 'GauRakshak AI: Model Diagnostics & Evaluation Specs' : 'गौ-रक्षक AI: मॉडल डायग्नोस्टिक्स एवं मूल्यांकन स्पेक्स'}
            </h1>
            <p className="text-xs sm:text-sm text-[#faecc4]/80 leading-relaxed font-medium">
              {language === 'en' 
                ? 'Independent validation report for the Random Forest classifier trained on physiological dairy cattle biomarkers (pH, EC, Somatic Cell Counts).'
                : 'डेयरी गायों के जैविक संकेतकों (दूध pH, विद्युत चालकता EC, सोमैटिक सेल SCC) पर प्रशिक्षित रैंडम फॉरेस्ट मॉडल की स्वतंत्र मूल्यांकन रिपोर्ट।'}
            </p>
          </div>

          <div className="bg-[#123820] border border-[#1d5230] rounded-2xl p-4 text-center shrink-0 shadow-inner">
            <span className="text-[10px] text-[#faecc4]/60 uppercase tracking-wider font-bold block">
              {language === 'en' ? 'Verified Accuracy' : 'सत्यापित सटीकता'}
            </span>
            <span className="text-3xl sm:text-4xl font-black font-mono text-[#faecc4] block mt-1">
              81.03%
            </span>
            <span className="text-[10px] text-emerald-300 font-bold flex items-center justify-center space-x-1 mt-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>{language === 'en' ? 'Production Ready' : 'सक्रिय उत्पादन मॉडल'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Architecture & Diagnostic Accuracy Scores */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2.5 border-b-2 border-[#e6dcbe] pb-2">
          <div className="h-7 w-7 rounded-lg bg-[#092615] text-[#faecc4] flex items-center justify-center text-xs font-bold">
            1
          </div>
          <div>
            <h2 className="text-lg font-black text-[#092615] tracking-tight">
              {language === 'en' ? 'Architecture & Core Performance Benchmarks' : 'मॉडल संरचना एवं मुख्य प्रदर्शन परिणाम'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'en' ? 'Overall classification accuracy, macro F1-score, and ensemble parameters.' : 'कुल वर्गीकरण सटीकता, मैक्रो F1 स्कोर और एन्सेम्बल पैरामीटर्स।'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border-2 border-[#e6dcbe] shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold text-slate-600">{t.testAccuracy}</span>
              <Award className="h-4 w-4 text-[#4f7324]" />
            </div>
            <span className="text-3xl font-black text-slate-900 font-mono mt-2 block">
              {((metrics?.test_accuracy || 0.8103) * 100).toFixed(1)}%
            </span>
            <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
              {t.targetBenchmark}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-[#e6dcbe] shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold text-slate-600">{t.macroF1}</span>
              <Activity className="h-4 w-4 text-teal-600" />
            </div>
            <span className="text-3xl font-black text-slate-900 font-mono mt-2 block">
              81.2%
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">
              {t.macroDesc}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-[#e6dcbe] shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold text-slate-600">{t.modelEstimator}</span>
              <Layers className="h-4 w-4 text-indigo-600" />
            </div>
            <span className="text-lg font-black text-slate-900 mt-2 block">
              Random Forest
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">
              {t.estimatorDesc}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-[#e6dcbe] shadow-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold text-slate-600">{t.noiseCalib}</span>
              <Sliders className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-3xl font-black text-slate-900 font-mono mt-2 block">
              18.0×
            </span>
            <span className="text-[11px] text-amber-800 font-bold mt-1 block">
              {t.noiseDesc}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: Two Column Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECTION 2: Stage-Wise Performance (Precision, Recall & F1) */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2.5 border-b-2 border-[#e6dcbe] pb-2">
            <div className="h-7 w-7 rounded-lg bg-[#092615] text-[#faecc4] flex items-center justify-center text-xs font-bold">
              2
            </div>
            <div>
              <h3 className="text-base font-black text-[#092615] tracking-tight">
                {language === 'en' ? 'Stage-Wise Precision & Recall' : 'तीनों चरणों में सटीकता और रिकॉल विश्लेषण'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {language === 'en' ? 'Performance breakdown across Healthy, Subclinical, and Clinical mastitis.' : 'स्वस्थ, सब-क्लिनिकल एवं क्लिनिकल चरणों में मॉडल का प्रदर्शन।'}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border-2 border-[#e6dcbe] shadow-xs space-y-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarkChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="stage" tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(val) => [`${val}%`, '']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="Precision" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Recall" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="F1" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-800 font-bold block">{language === 'en' ? 'Healthy F1' : 'स्वस्थ F1'}</span>
                <span className="font-extrabold text-emerald-900 font-mono text-sm">80.4%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-amber-800 font-bold block">{language === 'en' ? 'Subclinical F1' : 'सब-क्लिनिकल F1'}</span>
                <span className="font-extrabold text-amber-900 font-mono text-sm">75.3%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-rose-800 font-bold block">{language === 'en' ? 'Clinical F1' : 'क्लिनिकल F1'}</span>
                <span className="font-extrabold text-rose-900 font-mono text-sm">87.8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Biomarker Feature Importance */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2.5 border-b-2 border-[#e6dcbe] pb-2">
            <div className="h-7 w-7 rounded-lg bg-[#092615] text-[#faecc4] flex items-center justify-center text-xs font-bold">
              3
            </div>
            <div>
              <h3 className="text-base font-black text-[#092615] tracking-tight">
                {language === 'en' ? 'Biomarker Feature Importance' : 'बायोमार्कर्स महत्व (निर्णय के मुख्य कारक)'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {language === 'en' ? 'Gini-importance ranking showing why pH, EC, and SCC dictate diagnosis.' : 'दूध pH, विद्युत चालकता और सोमैटिक सेल काउंट का सापेक्षिक प्रभाव।'}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border-2 border-[#e6dcbe] shadow-xs space-y-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureChartData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 60]} unit="%" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontWeight: 700 }} width={70} />
                  <Tooltip 
                    formatter={(val) => [`${val}%`, 'Importance']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="importance" fill="#0d9488" radius={[0, 6, 6, 0]}>
                    {featureChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? '#0c2f1a' : index === 1 ? '#4f7324' : index === 2 ? '#2563eb' : '#64748b'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
              {t.featureImpNote}
            </p>
          </div>
        </div>

      </div>

      {/* SECTION 4: Confusion Matrix Display */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2.5 border-b-2 border-[#e6dcbe] pb-2">
          <div className="h-7 w-7 rounded-lg bg-[#092615] text-[#faecc4] flex items-center justify-center text-xs font-bold">
            4
          </div>
          <div>
            <h2 className="text-lg font-black text-[#092615] tracking-tight">
              {language === 'en' ? 'Clinical Confusion Matrix (True vs Predicted)' : 'कन्फ्यूजन मैट्रिक्स (वास्तविक बनाम अनुमानित परिणाम)'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'en' 
                ? 'Truth table verifying accurate diagnosis across 780 ground-truth veterinary cow samples.' 
                : '780 वास्तविक नमूनों पर मॉडल के अनुमानित परिणामों का क्लास-वार मिलान तालिका।'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#e6dcbe] shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border border-slate-200 rounded-2xl overflow-hidden">
              <thead className="bg-[#092615] text-[#faecc4] font-bold border-b border-[#164426]">
                <tr>
                  <th className="py-3 px-4 text-left">{t.trueVsPred}</th>
                  <th className="py-3 px-4 text-emerald-300 bg-[#0f3820]">{t.predHealthy}</th>
                  <th className="py-3 px-4 text-amber-300 bg-[#164024]">{t.predSubclinical}</th>
                  <th className="py-3 px-4 text-rose-300 bg-[#1c482a]">{t.predClinical}</th>
                  <th className="py-3 px-4">{t.classRecall}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs sm:text-sm">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-left font-sans bg-slate-50 text-slate-900">
                    {language === 'en' ? 'True Healthy (Safe)' : 'वास्तविक स्वस्थ (सुरक्षित)'}
                  </td>
                  <td className="py-3.5 px-4 bg-emerald-100/70 font-black text-emerald-900">223 (85.8%)</td>
                  <td className="py-3.5 px-4 text-slate-500">34</td>
                  <td className="py-3.5 px-4 text-slate-400">3</td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">85.8%</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-left font-sans bg-slate-50 text-slate-900">
                    {language === 'en' ? 'True Subclinical (Mild)' : 'वास्तविक सब-क्लिनिकल (हल्का)'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">56</td>
                  <td className="py-3.5 px-4 bg-amber-100/70 font-black text-amber-900">194 (74.6%)</td>
                  <td className="py-3.5 px-4 text-slate-500">10</td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">74.6%</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-left font-sans bg-slate-50 text-slate-900">
                    {language === 'en' ? 'True Clinical (Urgent)' : 'वास्तविक क्लिनिकल (गंभीर)'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">16</td>
                  <td className="py-3.5 px-4 text-slate-500">29</td>
                  <td className="py-3.5 px-4 bg-rose-100/70 font-black text-rose-900">215 (82.7%)</td>
                  <td className="py-3.5 px-4 font-bold text-slate-700">82.7%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 5: Methodology & Clinical Standards Documentation */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2.5 border-b-2 border-[#e6dcbe] pb-2">
          <div className="h-7 w-7 rounded-lg bg-[#092615] text-[#faecc4] flex items-center justify-center text-xs font-bold">
            5
          </div>
          <div>
            <h2 className="text-lg font-black text-[#092615] tracking-tight">
              {language === 'en' ? 'Veterinary Standards & Training Methodology' : 'पशु चिकित्सा मानक एवं प्रशिक्षण पद्धति'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'en' ? '5-fold cross validation, standardization, and physiological feature engineering.' : '5-फोल्ड क्रॉस वैलिडेशन, मानकीकरण एवं शारीरिक फीचर इंजीनियरिंग।'}
            </p>
          </div>
        </div>

        <div className="bg-[#fcfbf7] p-6 sm:p-8 rounded-3xl border-2 border-[#e6dcbe] space-y-4 text-xs text-slate-700 leading-relaxed font-medium">
          <div className="flex items-center space-x-2 font-black text-[#092615] text-sm">
            <BookOpen className="h-5 w-5 text-[#4f7324]" />
            <span>{t.methodologyTitle}</span>
          </div>
          <p>
            {t.methodologyP1}
          </p>
          <p>
            {t.methodologyP2}
          </p>
        </div>
      </div>

    </div>
  );
}
