import React from 'react';
import { translations } from '../translations';

export default function UdderHealthCard({ language, cowData }) {
  const t = translations[language];

  // Derive quarter values based on cowData
  const quarters = cowData?.quarters || {
    FL: { temp: 37.2, ec: 4.6, status: 'normal' },
    FR: { temp: 37.4, ec: 4.8, status: 'normal' },
    RL: { temp: 37.1, ec: 4.5, status: 'normal' },
    RR: { temp: 37.3, ec: 4.7, status: 'normal' }
  };

  const getStatusColor = (status) => {
    if (status === 'danger') return 'bg-rose-500 ring-rose-300';
    if (status === 'warning') return 'bg-amber-500 ring-amber-300';
    return 'bg-emerald-500 ring-emerald-300';
  };

  const getQuarterFill = (status) => {
    if (status === 'danger') return '#fee2e2';
    if (status === 'warning') return '#fef3c7';
    return '#f0fdf4';
  };

  const getQuarterStroke = (status) => {
    if (status === 'danger') return '#ef4444';
    if (status === 'warning') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">
          {t.udderHealthTitle}
        </h3>
        <span className="text-xs font-semibold text-slate-400">
          {t.udderFourQuarters}
        </span>
      </div>

      {/* Main Udder Layout: Left Metrics | Center Udder Schematic | Right Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 py-4">
        
        {/* Left Column: FL and RL */}
        <div className="space-y-4 text-xs">
          
          {/* Front Left */}
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2 font-semibold text-slate-800 mb-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ring-2 ${getStatusColor(quarters.FL.status)}`}></span>
              <span>{t.fl}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">{t.temp}</span>
                <span className="font-bold text-slate-800">{quarters.FL.temp}°C</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">{t.ec}</span>
                <span className="font-bold text-slate-800">{quarters.FL.ec}</span>
              </div>
            </div>
          </div>

          {/* Rear Left */}
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2 font-semibold text-slate-800 mb-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ring-2 ${getStatusColor(quarters.RL.status)}`}></span>
              <span>{t.rl}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">{t.temp}</span>
                <span className="font-bold text-slate-800">{quarters.RL.temp}°C</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">{t.ec}</span>
                <span className="font-bold text-slate-800">{quarters.RL.ec}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Center: Anatomical 4-Quarter Udder SVG Schematic */}
        <div className="flex flex-col items-center justify-center p-2">
          <div className="relative w-40 h-36 flex items-center justify-center">
            
            <svg viewBox="0 0 160 140" className="w-full h-full drop-shadow-sm">
              {/* Outer Udder Contour */}
              <path
                d="M 80,10 C 35,10 15,45 20,85 C 25,120 60,130 80,130 C 100,130 135,120 140,85 C 145,45 125,10 80,10 Z"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* Front Left Quarter (Top-Left) */}
              <path
                d="M 80,15 C 50,15 32,38 34,70 C 50,70 65,70 78,70 L 78,15 Z"
                fill={getQuarterFill(quarters.FL.status)}
                stroke={getQuarterStroke(quarters.FL.status)}
                strokeWidth="1.8"
                className="transition-colors duration-300"
              />
              <text x="56" y="48" fontSize="11" fontWeight="700" fill="#334155" textAnchor="middle">FL</text>

              {/* Front Right Quarter (Top-Right) */}
              <path
                d="M 82,15 L 82,70 C 95,70 110,70 126,70 C 128,38 110,15 82,15 Z"
                fill={getQuarterFill(quarters.FR.status)}
                stroke={getQuarterStroke(quarters.FR.status)}
                strokeWidth="1.8"
                className="transition-colors duration-300"
              />
              <text x="104" y="48" fontSize="11" fontWeight="700" fill="#334155" textAnchor="middle">FR</text>

              {/* Rear Left Quarter (Bottom-Left) */}
              <path
                d="M 34,73 C 36,105 60,125 78,125 L 78,73 Z"
                fill={getQuarterFill(quarters.RL.status)}
                stroke={getQuarterStroke(quarters.RL.status)}
                strokeWidth="1.8"
                className="transition-colors duration-300"
              />
              <text x="56" y="103" fontSize="11" fontWeight="700" fill="#334155" textAnchor="middle">RL</text>

              {/* Rear Right Quarter (Bottom-Right) */}
              <path
                d="M 82,73 L 82,125 C 100,125 124,105 126,73 Z"
                fill={getQuarterFill(quarters.RR.status)}
                stroke={getQuarterStroke(quarters.RR.status)}
                strokeWidth="1.8"
                className="transition-colors duration-300"
              />
              <text x="104" y="103" fontSize="11" fontWeight="700" fill="#334155" textAnchor="middle">RR</text>

              {/* Teats representations */}
              <ellipse cx="48" cy="70" rx="3.5" ry="3.5" fill="#64748b" />
              <ellipse cx="112" cy="70" rx="3.5" ry="3.5" fill="#64748b" />
              <ellipse cx="54" cy="115" rx="3.5" ry="3.5" fill="#64748b" />
              <ellipse cx="106" cy="115" rx="3.5" ry="3.5" fill="#64748b" />
            </svg>

          </div>
          <span className="text-[10px] font-medium text-slate-400 mt-1">
            Top-down Udder Anatomy View
          </span>
        </div>

        {/* Right Column: FR and RR */}
        <div className="space-y-4 text-xs">
          
          {/* Front Right */}
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2 font-semibold text-slate-800 mb-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ring-2 ${getStatusColor(quarters.FR.status)}`}></span>
              <span>{t.fr}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">{t.temp}</span>
                <span className="font-bold text-slate-800">{quarters.FR.temp}°C</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">{t.ec}</span>
                <span className="font-bold text-slate-800">{quarters.FR.ec}</span>
              </div>
            </div>
          </div>

          {/* Rear Right */}
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2 font-semibold text-slate-800 mb-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ring-2 ${getStatusColor(quarters.RR.status)}`}></span>
              <span>{t.rr}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">{t.temp}</span>
                <span className="font-bold text-slate-800">{quarters.RR.temp}°C</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-sans">{t.ec}</span>
                <span className="font-bold text-slate-800">{quarters.RR.ec}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
