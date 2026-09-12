import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  Languages, 
  ChevronDown, 
  Home, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Tag, 
  X, 
  Check, 
  ArrowRight 
} from 'lucide-react';
import { translations } from '../translations';

export default function TopBar({ 
  language, 
  setLanguage, 
  onReturnToLanding,
  onNavigateToCow 
}) {
  const t = translations[language] || translations.en;
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      type: 'urgent',
      titleEn: 'Clinical Mastitis Detected',
      titleHi: 'गंभीर थनैल रोग की चेतावनी!',
      descEn: 'Kamdhenu (RFID-IND-1003) tested SCC 38.5. Immediate veterinary isolation required.',
      descHi: 'कामधेनु (RFID-IND-1003) में SCC 38.5 पाया गया। तुरंत पशु चिकित्सक से संपर्क करें।',
      timeEn: '12m ago',
      timeHi: '12 मिनट पहले',
      rfid: 'RFID-IND-1003',
      read: false
    },
    {
      id: 'notif-2',
      type: 'caution',
      titleEn: 'Alkaline Milk Warning',
      titleHi: 'दूध में क्षारियता बढ़ी (pH 6.80)',
      descEn: 'Lakshmi (RFID-IND-1002) evening milking showed high conductivity (5.10 mS/cm).',
      descHi: 'लक्ष्मी (RFID-IND-1002) की शाम की जांच में कंडक्टिविटी अधिक पाई गई।',
      timeEn: '1h ago',
      timeHi: '1 घंटा पहले',
      rfid: 'RFID-IND-1002',
      read: false
    },
    {
      id: 'notif-3',
      type: 'healthy',
      titleEn: 'Udder Recovery Confirmed',
      titleHi: 'स्वस्थ थन रिकवरी की पुष्टि',
      descEn: 'Gauri (RFID-IND-1001) test passed: all 4 quarters healthy (pH 6.55). Milk approved.',
      descHi: 'गौरी (RFID-IND-1001) की जांच सामान्य रही: दूध सुरक्षित घोषित।',
      timeEn: '3h ago',
      timeHi: '3 घंटे पहले',
      rfid: 'RFID-IND-1001',
      read: false
    },
    {
      id: 'notif-4',
      type: 'info',
      titleEn: 'New RFID Cow Added',
      titleHi: 'नया RFID टैग पंजीकृत हुआ',
      descEn: 'Shyama (RFID-IND-1004) registered under Gir breed in database.',
      descHi: 'श्यामा (RFID-IND-1004) का पंजीकरण गिर नस्ल के अंतर्गत संपन्न हुआ।',
      timeEn: 'Yesterday',
      timeHi: 'कल',
      rfid: 'RFID-IND-1004',
      read: true
    }
  ]);

  // Count unread
  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif) => {
    // Mark this specific notification as read
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setIsNotifOpen(false);

    if (notif.rfid && onNavigateToCow) {
      onNavigateToCow(notif.rfid);
    }
  };

  return (
    <header className="h-16 bg-[#fcfaf2] border-b-2 border-[#e6ddc1] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      
      {/* Left: Home Button & Search Bar */}
      <div className="flex-1 max-w-md flex items-center space-x-2 sm:space-x-3">
        {/* Quick Back to Landing Home */}
        <button
          onClick={onReturnToLanding}
          className="h-10 px-3 rounded-xl bg-[#092615] hover:bg-[#134426] text-[#faecc4] text-xs font-bold flex items-center space-x-1.5 shrink-0 shadow-xs transition-colors cursor-pointer"
          title="Return to Landing Page"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">{language === 'en' ? 'Home' : 'होम'}</span>
        </button>

        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-white text-xs rounded-xl border border-[#e6ddc1] focus:outline-hidden focus:ring-2 focus:ring-[#4f7324]/30 focus:border-[#4f7324] transition-all font-medium placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="min-h-[42px] flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black border-2 border-[#d8caa4] bg-[#faecc4] hover:bg-[#fff7dd] text-[#092615] transition-all shadow-xs active:scale-95 cursor-pointer"
          title="Switch Language / भाषा बदलें"
        >
          <Languages className="h-4 w-4 text-[#4f7324]" />
          <span>{language === 'en' ? '🇮🇳 हिन्दी' : '🌐 English'}</span>
        </button>

        {/* Notification Bell with Functional Interactive Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(prev => !prev)}
            className={`h-10 w-10 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
              isNotifOpen 
                ? 'bg-[#092615] text-[#faecc4] border-[#092615] shadow-md' 
                : 'border-[#e6ddc1] bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title={t.notifications}
            aria-label="Toggle notifications panel"
          >
            <Bell className="h-4 w-4" />
          </button>
          
          {/* Badge Count */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs pointer-events-none">
              {unreadCount}
            </span>
          )}

          {/* Interactive Notification Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl border-2 border-[#e6dcbe] shadow-2xl z-50 overflow-hidden animate-fade-in">
              
              {/* Dropdown Header */}
              <div className="p-4 bg-[#092615] text-[#faecc4] flex items-center justify-between border-b border-[#164426]">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-[#faecc4]" />
                  <h3 className="font-bold text-sm tracking-tight">
                    {language === 'en' ? 'Farm Herd Alerts' : 'डेयरी फार्म अलर्ट एवं सूचनाएं'}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                      {unreadCount} {language === 'en' ? 'New' : 'नई'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 rounded-lg text-[#faecc4]/70 hover:text-white hover:bg-[#164426] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sub-bar with "Mark all as read" */}
              <div className="px-4 py-2 bg-[#fbf9f2] border-b border-[#e6dcbe] flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {notifications.length} {language === 'en' ? 'Total Notifications' : 'कुल सूचनाएं'}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[#4f7324] hover:text-[#385317] font-bold flex items-center space-x-1 hover:underline cursor-pointer"
                  >
                    <Check className="h-3 w-3" />
                    <span>{language === 'en' ? 'Mark all as read' : 'सभी पढ़े हुए मार्क करें'}</span>
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => {
                  const isUrgent = n.type === 'urgent';
                  const isCaution = n.type === 'caution';
                  const isHealthy = n.type === 'healthy';

                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 transition-all cursor-pointer flex items-start space-x-3 hover:bg-[#faf7ee] ${
                        !n.read ? 'bg-[#fffdf7]' : 'bg-white opacity-85'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                        isUrgent 
                          ? 'bg-rose-100 text-rose-700' 
                          : isCaution 
                          ? 'bg-amber-100 text-amber-800' 
                          : isHealthy 
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isUrgent ? (
                          <AlertOctagon className="h-4 w-4" />
                        ) : isCaution ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : isHealthy ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Tag className="h-4 w-4" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold leading-tight ${
                            !n.read ? 'text-slate-900 font-extrabold' : 'text-slate-700'
                          }`}>
                            {language === 'en' ? n.titleEn : n.titleHi}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {language === 'en' ? n.timeEn : n.timeHi}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                          {language === 'en' ? n.descEn : n.descHi}
                        </p>
                        {n.rfid && (
                          <div className="mt-1.5 flex items-center space-x-1.5 text-[10px] text-[#4f7324] font-bold">
                            <span>{language === 'en' ? 'Inspect' : 'देखें'} {n.rfid}</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Unread indicator dot */}
                      {!n.read && (
                        <div className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-1"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Panel Footer */}
              <div className="p-3 bg-[#fbf9f2] border-t border-[#e6dcbe] text-center">
                <span className="text-[11px] text-slate-500 font-medium">
                  {language === 'en' 
                    ? 'Click any alert to open cow profile' 
                    : 'गाय का रिकॉर्ड देखने के लिए अलर्ट पर क्लिक करें'}
                </span>
              </div>

            </div>
          )}

        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-3 border-l border-[#e6ddc1]">
          <div className="h-9 w-9 rounded-xl bg-[#092615] text-[#faecc4] flex items-center justify-center font-serif font-black text-sm shadow-xs">
            HT
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {t.managerName}
            </div>
            <div className="text-[10px] font-medium text-slate-500 flex items-center space-x-1">
              <span>{t.managerRole}</span>
              <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
            </div>
          </div>
        </div>

      </div>

    </header>
  );
}
