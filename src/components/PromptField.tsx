import React, { useState } from 'react';
import { RotateCcw, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface PromptFieldProps {
  id?: string;
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isTextArea?: boolean;
  rows?: number;
  dir?: 'ltr' | 'rtl';
  helpText?: string;
  badgeText?: string;
  className?: string;
  allowClear?: boolean;
  allowHide?: boolean;
  defaultHidden?: boolean;
  clearTooltip?: string;
  hideTooltip?: string;
  showTooltip?: string;
}

export default function PromptField({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
  isTextArea = false,
  rows = 3,
  dir = 'ltr',
  helpText,
  badgeText,
  className,
  allowClear = true,
  allowHide = true,
  defaultHidden = false,
  clearTooltip = "تصفير (مسح) الخانة",
  hideTooltip = "إخفاء / طي الخانة",
  showTooltip = "إظهار الخانة"
}: PromptFieldProps) {
  const [isHidden, setIsHidden] = useState(defaultHidden);

  const handleClear = () => {
    onChange('');
  };

  const toggleHide = () => {
    setIsHidden(!isHidden);
  };

  return (
    <div className={cn("space-y-2 group/prompt-field", className)} id={id}>
      {/* Field Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          {icon && <span className="shrink-0 text-dz-emerald">{icon}</span>}
          <label className="text-[10px] font-black uppercase tracking-widest text-white/60 font-arabic leading-snug">
            {label}
          </label>
          {badgeText && (
            <span className="text-[9px] font-black uppercase tracking-wider bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-dz-gold shrink-0">
              {badgeText}
            </span>
          )}
        </div>

        {/* Action Buttons for Hide and Clear */}
        <div className="flex items-center gap-1 shrink-0 bg-black/40 border border-white/10 rounded-xl p-0.5 sm:p-1 shadow-sm ml-auto">
          {allowClear && (
            <button
              type="button"
              onClick={handleClear}
              disabled={!value}
              className={cn(
                "p-1 sm:p-1.5 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer active:scale-90",
                value 
                  ? "text-white/60 hover:text-rose-400 hover:bg-rose-500/10" 
                  : "text-white/20 cursor-not-allowed"
              )}
              title={clearTooltip}
            >
              <RotateCcw size={12} className={cn(value && "group-hover/prompt-field:rotate-[-45deg] transition-transform")} />
              <span className="text-[9px] hidden sm:inline font-mono">تصفير</span>
            </button>
          )}

          {allowHide && (
            <button
              type="button"
              onClick={toggleHide}
              className={cn(
                "p-1 sm:p-1.5 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer active:scale-90",
                isHidden 
                  ? "bg-dz-amber/20 text-dz-amber border border-dz-amber/30" 
                  : "text-white/60 hover:text-dz-emerald hover:bg-dz-emerald/10"
              )}
              title={isHidden ? showTooltip : hideTooltip}
            >
              {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
              <span className="text-[9px] hidden sm:inline font-mono">
                {isHidden ? "إظهار" : "إخفاء"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Input / Textarea Content or Collapsed State */}
      <AnimatePresence mode="wait">
        {isHidden ? (
          <motion.div
            key="hidden-placeholder"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-2.5 px-3 bg-black/40 border border-dashed border-white/10 rounded-2xl flex items-center justify-between text-xs text-white/40"
          >
            <span className="flex items-center gap-2 italic text-[11px]">
              <EyeOff size={13} className="text-dz-amber shrink-0" />
              <span>الخانة مخفية حالياً ({value ? `${value.slice(0, 25)}...` : 'فارغة'})</span>
            </span>
            <button
              type="button"
              onClick={toggleHide}
              className="text-[10px] font-black text-dz-emerald hover:underline cursor-pointer flex items-center gap-1"
            >
              <Sparkles size={11} />
              إظهار البرومبت
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="field-content"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="relative"
          >
            {isTextArea ? (
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                dir={dir}
                className={cn(
                  "input-dz resize-none w-full transition-all",
                  dir === 'rtl' && "font-arabic text-right"
                )}
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                dir={dir}
                className={cn(
                  "input-dz w-full transition-all",
                  dir === 'rtl' && "font-arabic text-right"
                )}
              />
            )}

            {helpText && (
              <p className="text-[10px] text-white/40 mt-1 pl-1 italic">
                {helpText}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
