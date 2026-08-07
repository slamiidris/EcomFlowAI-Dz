import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown, RotateCw } from 'lucide-react';
import { useLanguage, Language } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

export const LANGUAGES: { id: Language; label: string; nativeName: string; flag: string; code: string }[] = [
  {
    id: 'fr',
    label: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    code: 'FR'
  },
  {
    id: 'ar',
    label: 'Arabe',
    nativeName: 'العربية',
    flag: '🇩🇿',
    code: 'AR'
  },
  {
    id: 'en',
    label: 'Anglais',
    nativeName: 'English',
    flag: '🇬🇧',
    code: 'EN'
  }
];

export default function LanguageSwitcher() {
  const { language, setLanguage, cycleLanguage, isRTL } = useLanguage();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

  const notifyChange = (langId: Language) => {
    if (langId === 'ar') {
      toast.success(`تم تغيير اللغة إلى العربية 🇩🇿`);
    } else if (langId === 'en') {
      toast.success(`Language changed to English 🇬🇧`);
    } else {
      toast.success(`Langue changée en Français 🇫🇷`);
    }
  };

  const handleSelectLanguage = (langId: Language) => {
    if (langId !== language) {
      setLanguage(langId);
      notifyChange(langId);
    }
    setIsOpen(false);
  };

  const handleQuickCycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = LANGUAGES.findIndex(l => l.id === language);
    const nextLang = LANGUAGES[(currentIndex + 1) % LANGUAGES.length];
    setLanguage(nextLang.id);
    notifyChange(nextLang.id);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation inside dropdown & global shortcut (Alt+L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcut Alt+L to cycle language
      if (e.altKey && e.code === 'KeyL') {
        e.preventDefault();
        cycleLanguage();
        const currentIndex = LANGUAGES.findIndex(l => l.id === language);
        const nextLang = LANGUAGES[(currentIndex + 1) % LANGUAGES.length];
        notifyChange(nextLang.id);
        return;
      }

      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % LANGUAGES.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + LANGUAGES.length) % LANGUAGES.length);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelectLanguage(LANGUAGES[focusedIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, language, cycleLanguage]);

  return (
    <div className="relative inline-block text-left shrink-0" ref={containerRef} id="global-language-switcher">
      <div className="flex items-center bg-black/40 hover:bg-black/60 rounded-lg sm:rounded-2xl border border-white/10 hover:border-white/25 transition-all p-0.5 sm:p-1 shadow-md group">
        {/* Quick Cycle Button (One-click toggle) */}
        <button
          type="button"
          onClick={handleQuickCycle}
          className="p-0.5 sm:p-1.5 px-1 sm:px-2 rounded sm:rounded-xl bg-white/5 hover:bg-dz-emerald/20 text-dz-emerald hover:text-white transition-all cursor-pointer flex items-center gap-0.5 sm:gap-1.5 active:scale-90"
          title="Bascule rapide de langue (Alt + L)"
        >
          <RotateCw size={9} className="transition-transform group-hover:rotate-180 duration-500" />
          <span className="text-xs sm:text-base leading-none select-none">{currentLang.flag}</span>
        </button>

        {/* Dropdown Menu Trigger */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setFocusedIndex(LANGUAGES.findIndex(l => l.id === language));
          }}
          className={cn(
            "flex items-center gap-1 sm:gap-2 px-1 sm:px-2.5 py-0.5 sm:py-1 rounded sm:rounded-xl text-[8.5px] sm:text-xs font-bold text-white select-none cursor-pointer transition-all active:scale-95",
            isOpen && "bg-white/10 text-dz-emerald font-black"
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          title="Choisir la langue de la plateforme"
        >
          <span className="flex items-center gap-0.5 sm:gap-1.5 text-[8.5px] sm:text-[11px] font-black tracking-wider text-white/90">
            <span className="text-[10px] sm:text-sm leading-none drop-shadow-xs">{currentLang.flag}</span>
            <span className="uppercase">{currentLang.code}</span>
          </span>

          <ChevronDown 
            size={9} 
            className={cn("text-white/40 transition-transform duration-300", isOpen && "rotate-180 text-dz-emerald")} 
          />
        </button>
      </div>

      {/* Language Selection Dropdown Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute mt-2 w-52 rounded-2xl glass-card p-1.5 border border-white/20 shadow-2xl z-50 overflow-hidden focus:outline-hidden",
              isRTL ? "left-0" : "right-0"
            )}
            role="listbox"
            tabIndex={-1}
          >
            {/* Header info */}
            <div className="px-3 py-2 border-b border-white/10 mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Globe size={12} className="text-dz-emerald" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                  {language === 'ar' ? 'اختر اللغة' : language === 'en' ? 'Select Language' : 'Choisir la langue'}
                </span>
              </div>
              <span className="text-[9px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded font-mono font-bold">
                Alt+L
              </span>
            </div>

            {/* List of languages */}
            <div className="space-y-1">
              {LANGUAGES.map((lang, index) => {
                const isSelected = lang.id === language;
                const isFocused = index === focusedIndex;

                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.id)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none text-left",
                      isSelected
                        ? "bg-linear-to-r from-dz-emerald/25 via-emerald-500/15 to-transparent text-white border border-dz-emerald/40 font-bold shadow-xs"
                        : isFocused
                        ? "bg-white/10 text-white border border-white/10"
                        : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg leading-none">{lang.flag}</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight text-white">{lang.nativeName}</span>
                        <span className="text-[9px] text-white/40 font-normal">{lang.label}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-dz-emerald/20 border border-dz-emerald/60 flex items-center justify-center text-dz-emerald shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

