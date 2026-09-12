import React, { useState } from 'react';
import { 
  Check, 
  Calendar, 
  RotateCw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  ShieldCheck, 
  TrendingUp, 
  Thermometer, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  HelpCircle,
  Activity,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Area, 
  ComposedChart 
} from 'recharts';
import { translations } from '../translations';
import UdderHealthCard from './UdderHealthCard';

export default function DashboardView({ language, activeCow = {}, onSelectCowPreset, onOpenParameterDrawer }) {
  const t = translations[language];

  const [currentPage, setCurrentPage] = useState(1);

  // Pre-configured cow risk trajectories for the 14-day trend
  const trendData = activeCow?.trendData || [
    { date: 'Sep 27', risk: 10 },
    { date: 'Sep 29', risk: 18 },
    { date: 'Oct 1', risk: 16 },
    { date: 'Oct 3', risk: 12 },
    { date: 'Oct 5', risk: 15 },
    { date: 'Oct 7', risk: 20 },
    { date: 'Oct 9', risk: 19 },
    { date: 'Oct 10', risk: activeCow?.riskScore || 24, isCurrent: true },
    { date: 'Oct 12', risk: activeCow?.riskScore ? Math.min(100, activeCow.riskScore + 2) : 25, isForecast: true },
    { date: 'Oct 14', risk: activeCow?.riskScore ? Math.min(100, activeCow.riskScore + 3) : 26, isForecast: true },
  ];

  // Derive risk category colors
  const isHigh = (activeCow?.riskScore >= 70) || (activeCow?.stage === 'Clinical');
  const isMed = ((activeCow?.riskScore >= 40 && activeCow?.riskScore < 70) || activeCow?.stage === 'Subclinical');
  const isLow = !isHigh && !isMed;

  const riskStatusText = isHigh 
    ? t.statusHighRisk 
    : isMed 
    ? t.statusMedRisk 
    : t.statusLowRisk;

  const riskStatusColor = isHigh 
    ? 'text-rose-700 bg-rose-50 border-rose-200' 
    : isMed 
    ? 'text-amber-800 bg-amber-50 border-amber-200' 
    : 'text-emerald-800 bg-emerald-50 border-emerald-200';

  const riskStrokeColor = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981';

  // History records
  const historyRecords = [
    { date: '10 Sep 2026, 08:15 AM', score: activeCow.riskScore || 24, status: riskStatusText, statusType: isHigh ? 'danger' : isMed ? 'warning' : 'normal', remarks: isHigh ? 'Acute EC spike, isolate immediately' : isMed ? 'Slightly elevated conductivity' : 'Normal biophysical readings' },
    { date: '9 Sep 2026, 08:10 AM', score: Math.max(10, (activeCow.riskScore || 24) - 2), status: isHigh ? t.statusHighRisk : isMed ? t.statusMedRisk : t.statusLowRisk, statusType: isHigh ? 'danger' : isMed ? 'warning' : 'normal', remarks: isHigh ? 'Elevated temperature noted' : 'Stable automated readings' },
    { date: '8 Sep 2026, 08:05 AM', score: Math.max(10, (activeCow.riskScore || 24) - 5), status: isHigh ? t.statusMedRisk : t.statusLowRisk, statusType: isHigh ? 'warning' : 'normal', remarks: 'Routine herd milk recording' },
    { date: '7 Sep 2026, 08:12 AM', score: Math.max(10, (activeCow.riskScore || 24) - 8), status: t.statusLowRisk, statusType: 'normal', remarks: 'Normal biophysical readings' },
    { date: '6 Sep 2026, 08:07 AM', score: Math.max(10, (activeCow.riskScore || 24) - 10), status: t.statusLowRisk, statusType: 'normal', remarks: 'Normal biophysical readings' }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* 1. Welcome Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t.welcomeTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.welcomeSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date & Refresh */}
          <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium">Tue, 10 Sep 2026</span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <RotateCw className="h-3.5 w-3.5 text-slate-400" />
            <span>{t.autoRefresh}</span>
          </div>

          {/* Test Parameters Button */}
          <button
            onClick={onOpenParameterDrawer}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all active:scale-95"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{t.testNewCowBtn}</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Herd KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Cows */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
              <path d="M19.5 4.5c-.83-.83-2.17-.83-3 0l-1.5 1.5H9L7.5 4.5c-.83-.83-2.17-.83-3 0s-.83 2.17 0 3L6 9v7c0 1.66 1.34 3 3 3h6c1.66 0 3-1.34 3-3V9l1.5-1.5c.83-.83.83-2.17 0-3z"/>
            </svg>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">{t.kpiTotalCows}</span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">48</span>
            <span className="text-[11px] font-medium text-slate-400 block">{t.kpiTotalSub}</span>
          </div>
        </div>

        {/* At Risk (7-14 days) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">{t.kpiAtRisk}</span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">3</span>
            <span className="text-[11px] font-medium text-amber-600 block">{t.kpiAtRiskSub}</span>
          </div>
        </div>

        {/* High Risk (1-6 days) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertOctagon className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">{t.kpiHighRisk}</span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">1</span>
            <span className="text-[11px] font-medium text-rose-600 block">{t.kpiHighRiskSub}</span>
          </div>
        </div>

        {/* Currently Mastitis */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">{t.kpiActiveMastitis}</span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
              {isHigh ? '1' : '0'}
            </span>
            <span className="text-[11px] font-medium text-emerald-600 block">{t.kpiActiveMastitisSub}</span>
          </div>
        </div>

      </div>

      {/* Quick Cow Switcher Bar */}
      <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t.selectCow}
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'cow1', code: '#C023', name: 'Cow #C023', badge: 'Healthy', color: 'emerald' },
              { id: 'cow2', code: '#C018', name: 'Cow #C018', badge: 'Subclinical', color: 'amber' },
              { id: 'cow3', code: '#C009', name: 'Cow #C009', badge: 'Clinical', color: 'rose' }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => onSelectCowPreset(c.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                  activeCow.id === c.code
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{c.code}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  c.color === 'emerald' ? 'bg-emerald-100 text-emerald-800' : c.color === 'amber' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                }`}>
                  {c.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onOpenParameterDrawer}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
        >
          <span>{language === 'en' ? 'Edit or Simulate Parameters →' : 'मापदंड बदलें या सिम्युलेट करें →'}</span>
        </button>
      </div>

      {/* 3. Middle Row: Cow Details | Risk Score & Forecast | Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card 1: Cow Details (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                {t.backToAllCows}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${riskStatusColor}`}>
                {riskStatusText}
              </span>
            </div>

            <div className="flex items-start space-x-4">
              {/* Cow Photo */}
              <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-sm border border-slate-200 shrink-0 bg-slate-100">
                <img 
                  src="/cow_holstein.jpg" 
                  alt="Holstein Dairy Cow" 
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">{t.cowIdLabel}</span>
                <h3 className="text-xl font-black text-slate-900 font-mono">
                  {activeCow.id || '#C023'}
                </h3>
                <span className="text-xs font-semibold text-slate-600 block mt-1">
                  {activeCow.breed || 'Holstein-Friesian'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">{t.lactationLabel}</span>
                <span className="font-bold text-slate-800 font-mono mt-0.5 block">
                  {activeCow.lactation || '2nd Lactation (Mid)'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">{t.daysInMilkLabel}</span>
                <span className="font-bold text-slate-800 font-mono mt-0.5 block">
                  {activeCow.daysInMilk || 142} DIM
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">{t.fieldYield}</span>
                <span className="font-bold text-slate-800 font-mono mt-0.5 block">
                  {activeCow.milkYield || '5 - 10 L/day'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">{t.lastMastitisLabel}</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {isHigh ? 'Active Episode' : isMed ? 'Mild 60d ago' : 'No History'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Risk Score & Forecast (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {t.riskScoreTitle}
              </h3>
              <span className="text-xs font-medium text-slate-400">
                ML Probability
              </span>
            </div>

            <div className="flex items-center justify-around py-2">
              {/* Radial Donut Gauge */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="3.5"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={riskStrokeColor}
                    strokeWidth="3.5"
                    strokeDasharray={`${activeCow.riskScore || 24}, 100`}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900 font-mono leading-none">
                    {activeCow.riskScore || 24}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold font-mono">/100</span>
                  <span className="text-[10px] font-bold mt-0.5" style={{ color: riskStrokeColor }}>
                    {riskStatusText}
                  </span>
                </div>
              </div>

              {/* Forecast Details */}
              <div className="space-y-3 text-xs pl-2">
                <div>
                  <span className="text-slate-400 font-medium block">{t.forecastWindow}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border mt-0.5 ${riskStatusColor}`}>
                    {riskStatusText}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">{t.confidenceLabel}</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">
                    {activeCow.confidence ? `${(activeCow.confidence * 100).toFixed(0)}%` : '92%'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">{t.estimatedOnset}</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {isHigh ? 'Immediate (Active)' : isMed ? t.onsetIntervalSoon : t.onsetIntervalNone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Quick Insights (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {t.quickInsightsTitle}
              </h3>
              <span className="text-xs text-slate-400">
                Telemetry
              </span>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Insight 1: SCC */}
              <div className="flex items-start space-x-2.5">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isHigh ? 'bg-rose-100 text-rose-700' : isMed ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <p className="text-slate-700 leading-snug">
                  {isHigh ? t.insightSccSevere : isMed ? t.insightSccElevated : t.insightSccNormal}
                  <span className="font-mono text-slate-400 ml-1">({activeCow.scc || 1.20} ×10⁵)</span>
                </p>
              </div>

              {/* Insight 2: Temperature */}
              <div className="flex items-start space-x-2.5">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isHigh ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <Thermometer className="h-3 w-3 stroke-[2.5]" />
                </div>
                <p className="text-slate-700 leading-snug">
                  {isHigh ? t.insightTempFever : t.insightTempStable}
                </p>
              </div>

              {/* Insight 3: Conductivity */}
              <div className="flex items-start space-x-2.5">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isHigh || isMed ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <Activity className="h-3 w-3 stroke-[2.5]" />
                </div>
                <p className="text-slate-700 leading-snug">
                  {isHigh || isMed ? t.insightEcElevated : t.insightEcNormal}
                  <span className="font-mono text-slate-400 ml-1">({activeCow.ec || 4.25} mS/cm)</span>
                </p>
              </div>

              {/* Insight 4: History */}
              <div className="flex items-start space-x-2.5">
                <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="h-3 w-3 stroke-[2.5]" />
                </div>
                <p className="text-slate-700 leading-snug">
                  {isHigh ? t.insightHistoryWarning : t.insightHistoryClean}
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* 4. Lower Row: Risk Trend (Last 14 Days) & Udder Health Metrics (4 Quarters) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Risk Trend (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <h3 className="text-sm font-bold text-slate-900">
              {t.riskTrendTitle}
            </h3>

            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                <span>{t.legendRiskScore}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-400">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-100"></span>
                <span>{t.legendForecastWindow}</span>
              </div>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(val) => [`${val}/100`, 'Risk Score']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="risk" fill="#eff6ff" stroke="none" />
                <Line 
                  type="monotone" 
                  dataKey="risk" 
                  stroke="#2563eb" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: '#1d4ed8' }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Historical Milking Sensor Stream</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md font-mono">
              {t.currentRiskLabel}: {activeCow.riskScore || 24}
            </span>
          </div>
        </div>

        {/* Udder Health Metrics (4 Quarters) (5 cols) */}
        <div className="lg:col-span-5">
          <UdderHealthCard language={language} cowData={activeCow} />
        </div>

      </div>

      {/* 5. Bottom Row: Recent History Table & AI Explanation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Milking History (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {t.recentHistoryTitle}
              </h3>
              <span className="text-xs text-slate-400">Sensor Logs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">{t.colDateTime}</th>
                    <th className="py-2.5 px-3">{t.colRiskScore}</th>
                    <th className="py-2.5 px-3">{t.colStatus}</th>
                    <th className="py-2.5 px-3">{t.colRemarks}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {historyRecords.map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-sans text-slate-800">{rec.date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{rec.score}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          rec.statusType === 'danger' 
                            ? 'bg-rose-100 text-rose-800' 
                            : rec.statusType === 'warning' 
                            ? 'bg-amber-100 text-amber-900' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-500 text-[11px]">{rec.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{t.showingPages}</span>
            <div className="flex items-center space-x-1">
              <button className="h-6 w-6 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                <ChevronLeft className="h-3 w-3" />
              </button>
              <span className="h-6 w-6 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-xs">1</span>
              <span className="h-6 w-6 rounded border border-slate-200 flex items-center justify-center text-xs">2</span>
              <span className="h-6 w-6 rounded border border-slate-200 flex items-center justify-center text-xs">3</span>
              <button className="h-6 w-6 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Explanation & Recommendations (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold text-sm">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span>{t.aiExplanationTitle}</span>
              </div>
              <button 
                onClick={onOpenParameterDrawer}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                {t.howThisWorks}
              </button>
            </div>

            {/* Bullets */}
            <div className="mt-3 text-xs space-y-2 text-slate-600">
              <p className="font-bold text-slate-900">
                {language === 'en' 
                  ? `Current risk is evaluated as ${riskStatusText} (${activeCow.riskScore || 24}/100) because:`
                  : `वर्तमान जोखिम ${riskStatusText} (${activeCow.riskScore || 24}/100) मूल्यांकित किया गया है क्योंकि:`}
              </p>
              <ul className="space-y-1.5 list-disc pl-4 text-slate-600 text-[11px]">
                <li>{language === 'en' ? `Somatic cell count is measured at ${activeCow.scc || 1.20} ×10⁵ cells/mL.` : `सोमैटिक सेल काउंट ${activeCow.scc || 1.20} ×10⁵/मिली पर दर्ज है।`}</li>
                <li>{language === 'en' ? `Milk pH is steady at ${activeCow.ph || 6.55}.` : `दूध का pH ${activeCow.ph || 6.55} पर स्थिर है।`}</li>
                <li>{language === 'en' ? `Electrical conductivity is ${activeCow.ec || 4.25} mS/cm.` : `विद्युत चालकता ${activeCow.ec || 4.25} mS/cm है।`}</li>
                <li>{language === 'en' ? 'Model tree ensemble predicts zero vascular tissue barrier leakage.' : 'रैंडम फ़ॉरेस्ट मॉडल किसी गंभीर आंतरिक रिसाव का संकेत नहीं देता।'}</li>
              </ul>
            </div>
          </div>

          {/* Recommendations Box */}
          <div className={`p-4 rounded-xl border text-xs space-y-2 ${
            isHigh 
              ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
              : isMed 
              ? 'bg-amber-50/70 border-amber-200 text-amber-950' 
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>{t.recommendationsTitle}</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-800">
                {t.nextCheckIn}
              </span>
            </div>

            <div className="space-y-1 text-[11px] leading-relaxed">
              <p>✓ {language === 'en' ? 'Continue regular milking telemetry monitoring' : 'नियमित मिल्किंग टेलीमेट्री निगरानी जारी रखें'}</p>
              <p>✓ {language === 'en' ? 'Maintain strict pre- and post-milking teat dipping' : 'सख्त प्री और पोस्ट-मिल्किंग टीट डिपिंग का पालन करें'}</p>
              <p>✓ {language === 'en' ? 'Ensure barn bedding stays dry, clean, and well-ventilated' : 'बाड़े के बिछावन को सूखा, स्वच्छ और हवादार बनाए रखें'}</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
