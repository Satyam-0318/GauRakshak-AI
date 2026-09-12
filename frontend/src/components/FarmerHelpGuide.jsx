import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Volume2, 
  VolumeX, 
  FlaskConical, 
  Zap, 
  Microscope, 
  Milk, 
  ShieldCheck, 
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { translations } from '../translations';

export default function FarmerHelpGuide({ language }) {
  const t = translations[language];
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeakGuide = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text to speech not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let speechText = '';
    let voiceLang = language === 'hi' ? 'hi-IN' : 'en-US';

    if (language === 'hi') {
      speechText = `गौ-रक्षक एआई किसान गाइड में आपका स्वागत है। थनैल रोग की 3 मुख्य स्थितियां होती हैं: पहला हरा रंग यानी स्वस्थ थन। दूध सुरक्षित है और सामान्य रूप से दोहा जा सकता है। दूसरा पीला रंग यानी हल्का संक्रमण या शुरुआती थनैल। इस दूध को अलग बर्तन में निकालें और पशु चिकित्सक को दिखाएं। तीसरा लाल रंग यानी गंभीर थनैल रोग। इस दूध का उपयोग बिल्कुल न करें, गाय को अलग बाड़े में रखें और तुरंत डॉक्टर से एंटीबायोटिक उपचार कराएं।`;
    } else {
      speechText = `Welcome to the GauRakshak AI Farmer Guide. Mastitis has three color-coded stages: Green means Healthy Udder, milk is 100 percent pure and safe. Yellow means Mild Early Mastitis, milk from this quarter should be isolated and evaluated by your local vet. Red means Severe Clinical Mastitis, immediately stop using this milk, isolate the cow, and call your veterinarian for urgent clinical treatment.`;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = voiceLang;
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#e6dcbe] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-[#0c2f1a] text-[#faecc4] flex items-center justify-center shadow-md shrink-0">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0c2f1a] tracking-tight">
                {language === 'en' ? 'Farmer Udder Health Guide' : 'किसान थनैल रोग मार्गदर्शिका'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'en' 
                  ? 'Simple traffic-light rules to protect cow health and bulk tank purity.' 
                  : 'दूध की शुद्धता और गाय के स्वास्थ्य की रक्षा के लिए सरल ट्रैफिक-लाइट नियम।'}
              </p>
            </div>
          </div>

          {/* Audio Explanation Button */}
          <button
            type="button"
            onClick={handleSpeakGuide}
            className={`min-h-[48px] px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center space-x-2 shadow-sm active:scale-95 ${
              isSpeaking
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-[#4f7324] hover:bg-[#3d5b1b] text-[#faecc4]'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="h-4 w-4" />
                <span>{t.stopSpeaking}</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                <span>{language === 'en' ? '🔊 Listen to Guide' : '🔊 गाइड आवाज़ में सुनें'}</span>
              </>
            )}
          </button>
        </div>

        {/* 3 Color Rules (Green, Yellow, Red) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Green Card */}
          <div className="bg-[#f4faf4] p-6 rounded-3xl border-2 border-emerald-300 space-y-4 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  {language === 'en' ? 'Safe / Safe Milk' : 'सुरक्षित / कोई रोग नहीं'}
                </span>
                <h3 className="text-lg font-black text-emerald-950">
                  {language === 'en' ? '🟢 Healthy (स्वस्थ)' : '🟢 स्वस्थ थन'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed font-medium">
              {language === 'en'
                ? 'Milk is normal and pure. All biological readings (pH 6.4 - 6.7, EC 4.0 - 4.8) are in optimal condition. Safe for bulk cooling tank.'
                : 'दूध पूरी तरह शुद्ध है। pH 6.4 से 6.7 और चालकता सामान्य है। इस दूध को बेझिझक डेयरी में दे सकते हैं।'}
            </p>

            <div className="bg-white/80 p-3 rounded-xl text-xs font-bold text-emerald-800 border border-emerald-200">
              {language === 'en' ? 'Action: Routine teat dipping' : 'सलाह: नियमित थन सफाई जारी रखें'}
            </div>
          </div>

          {/* Yellow Card */}
          <div className="bg-[#fffdf0] p-6 rounded-3xl border-2 border-amber-300 space-y-4 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                  {language === 'en' ? 'Caution / Early Signs' : 'सावधानी / शुरुआती लक्षण'}
                </span>
                <h3 className="text-lg font-black text-amber-950">
                  {language === 'en' ? '🟡 Subclinical (हल्का)' : '🟡 सब-क्लिनिकल थनैल'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              {language === 'en'
                ? 'Infection has started inside the udder but no visible flakes yet. Somatic cells are rising (2.0 - 5.0). Milk pH is slightly alkaline.'
                : 'दूध में छिछड़े नहीं दिख रहे पर अंदर सूजन शुरू हो चुकी है। कोशिकाएं बढ़ रही हैं। तुरंत सावधानी बरतने की जरूरत है।'}
            </p>

            <div className="bg-white/80 p-3 rounded-xl text-xs font-bold text-amber-900 border border-amber-200">
              {language === 'en' ? 'Action: CMT test & call vet' : 'सलाह: सीएमटी जांच करें व डॉक्टर को दिखाएं'}
            </div>
          </div>

          {/* Red Card */}
          <div className="bg-[#fff5f5] p-6 rounded-3xl border-2 border-rose-300 space-y-4 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shrink-0 animate-pulse">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                  {language === 'en' ? 'Urgent / Danger' : 'खतरा / तत्काल इलाज'}
                </span>
                <h3 className="text-lg font-black text-rose-950">
                  {language === 'en' ? '🔴 Clinical (गंभीर)' : '🔴 गंभीर थनैल रोग'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-rose-950 leading-relaxed font-medium">
              {language === 'en'
                ? 'High fever, swollen teat, watery milk or flakes. Somatic cell count > 5.0. Electrical conductivity spike. Do NOT mix milk in tank.'
                : 'थन में सूजन, तेज दर्द, दूध में खून या छिछड़े। यह दूध किसी काम का नहीं है। गाय को तुरंत अलग करें।'}
            </p>

            <div className="bg-white/80 p-3 rounded-xl text-xs font-bold text-rose-900 border border-rose-200">
              {language === 'en' ? 'Action: Immediate antibiotic therapy' : 'सलाह: तुरंत पशु चिकित्सक से सुई/इलाज कराएं'}
            </div>
          </div>

        </div>

      </div>

      {/* Pictogram Parameter Explanations */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#e6dcbe] shadow-xs space-y-6">
        <h3 className="text-lg sm:text-xl font-black text-slate-900">
          {language === 'en' ? 'What do these 3 test readings mean?' : 'दूध के ये 3 परीक्षण क्या बताते हैं?'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#fcfbf7] border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
              <FlaskConical className="h-5 w-5" />
              <span>{language === 'en' ? '1. Milk pH Level' : '1. दूध का pH स्तर'}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'en'
                ? 'Fresh raw milk is naturally slightly acidic (6.4 - 6.7). When bacteria damage udder cells, blood fluids leak in, making milk alkaline (>6.8).'
                : 'ताजा शुद्ध दूध 6.4 से 6.7 pH का होता है। थन में बीमारी होने पर खून का पानी मिलने से pH 6.8 से ऊपर बढ़ जाता है।'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#fcfbf7] border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-amber-600 font-bold text-sm">
              <Zap className="h-5 w-5" />
              <span>{language === 'en' ? '2. Electrical Conductivity (EC)' : '2. विद्युत चालकता (EC)'}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'en'
                ? 'Healthy milk has low salt content (4.0 - 4.8 mS/cm). Mastitis causes sodium and chlorine ions to flood in, making milk conduct electricity faster (>5.0).'
                : 'स्वस्थ दूध में नमक की मात्रा कम होती है (4.0 से 4.8)। थनैल होने पर सोडियम और क्लोराइड बढ़ने से दूध में बिजली ज्यादा तेजी से बहती है।'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#fcfbf7] border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-rose-600 font-bold text-sm">
              <Microscope className="h-5 w-5" />
              <span>{language === 'en' ? '3. Somatic Cells (SCC)' : '3. सोमैटिक सेल काउंट'}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'en'
                ? 'These are defensive white blood cells. A healthy cow has under 2.0 lakh cells/mL. During mastitis, millions of cells rush in to fight bacteria.'
                : 'ये शरीर की रक्षक कोशिकाएं हैं। स्वस्थ गाय में 2 लाख से कम होती हैं। थनैल होने पर ये 5 लाख से 30 लाख तक पहुंच जाती हैं।'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
