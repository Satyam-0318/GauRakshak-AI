import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { translations } from '../translations';

export default function Footer({ language }) {
  const t = translations[language];

  return (
    <footer className="border-t-2 border-[#e6ddc1] bg-[#fcfaf2] py-8 mt-12 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2 text-slate-700">
            <div className="h-5 w-5 rounded-full bg-[#092615] text-[#faecc4] flex items-center justify-center font-serif font-black text-[10px]">
              G
            </div>
            <span className="font-serif font-bold text-sm text-[#092615]">
              {t.brandName}
            </span>
            <span>•</span>
            <span className="text-slate-500 font-medium">{t.sidebarFooterSubtitle}</span>
          </div>

          <div className="flex items-center space-x-2 text-amber-900 bg-[#faecc4]/60 px-4 py-2 rounded-2xl border border-[#e2d09c] text-center md:text-left">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
            <p className="text-[11px] leading-relaxed">
              {t.disclaimer}
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
