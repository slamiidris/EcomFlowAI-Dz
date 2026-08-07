import { useState } from 'react';
import { 
  LayoutDashboard, 
  Clapperboard, 
  Wand2, 
  TrendingUp, 
  Settings, 
  LogOut,
  Menu,
  X,
  Radar,
  Calculator,
  CalendarDays,
  Bot,
  MessageSquareQuote,
  Layers,
  Camera,
  LineChart,
  Send,
  Box,
  GripVertical,
  ArrowUpDown,
  Check,
  RefreshCw,
  Tag,
  BadgeCheck,
  ShoppingBag,
  Store,
  Flame,
  Coins,
  PackageCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Reorder, motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

type NavItem = 'dashboard' | 'video' | 'landing' | 'assembler' | 'trends' | 'images' | 'calculator' | 'settings';

interface SidebarProps {
  activeTab: NavItem;
  setActiveTab: (tab: NavItem) => void;
}

const navKeyMap: Record<string, string> = {
  images: 'menuPhotos',
  dashboard: 'menuDashboard',
  video: 'menuVideo',
  landing: 'menuLanding',
  assembler: 'menuAssembler',
  calculator: 'menuCalculator',
  trends: 'menuTrends',
  settings: 'menuSettings',
};

const defaultNavItems = [
  { id: 'dashboard', label: 'Dashboard Ventes', icon: LayoutDashboard, color: 'text-emerald-400' },
  { id: 'video', label: 'Pubs Vidéo TikTok/FB', icon: Clapperboard, color: 'text-purple-400' },
  { id: 'landing', label: 'Tunnels & Landing Page', icon: Wand2, color: 'text-blue-400' },
  { id: 'calculator', label: 'Calculateur Marge COD', icon: Coins, color: 'text-amber-400' },
];

const getStoredNavItems = () => {
  const stored = localStorage.getItem('dzads_tools_order');
  if (stored) {
    try {
      const ids: string[] = JSON.parse(stored);
      const ordered = ids
        .map(id => defaultNavItems.find(item => item.id === id))
        .filter(Boolean) as typeof defaultNavItems;
      const missing = defaultNavItems.filter(item => !ids.includes(item.id));
      return [...ordered, ...missing];
    } catch (e) {
      console.error(e);
    }
  }
  return defaultNavItems;
};

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { t, isRTL } = useLanguage();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(true);
  const [isReorderingMode, setIsReorderingMode] = useState(false);
  const [items, setItems] = useState<typeof defaultNavItems>(getStoredNavItems);

  const handleReorder = (newOrder: typeof defaultNavItems) => {
    setItems(newOrder);
    localStorage.setItem('dzads_tools_order', JSON.stringify(newOrder.map(o => o.id)));
  };

  const resetOrder = () => {
    setItems(defaultNavItems);
    localStorage.removeItem('dzads_tools_order');
  };

  return (
    <div className={cn(
      "h-[calc(100vh-1.5rem)] my-3 glass-panel rounded-2xl sm:rounded-3xl text-white transition-all duration-500 flex flex-col z-20 overflow-hidden shrink-0",
      isRTL ? "mr-2 sm:mr-4 ml-0" : "ml-2 sm:ml-4 mr-0",
      isOpen ? "w-52 sm:w-60" : "w-16 sm:w-18"
    )}>
      <div className="p-3 sm:p-4 flex items-center justify-between pb-3">
        {isOpen && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-linear-to-tr from-dz-gold via-dz-amber to-dz-emerald rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-sm sm:text-base shadow-[0_0_15px_rgba(16,185,129,0.25)] text-white border border-white/20 animate-float shrink-0">
              🛍️
            </div>
            <div className="flex flex-col min-w-0 truncate">
              <span className="font-black text-xs sm:text-sm tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white via-slate-100 to-dz-emerald truncate">
                DZ-Commerce OS
              </span>
              <span className="text-[8px] font-mono text-dz-gold uppercase tracking-wider truncate">
                E-Com AI Platform
              </span>
            </div>
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="p-1.5 hover:bg-white/10 rounded-lg sm:rounded-xl transition-all active:scale-95 cursor-pointer shrink-0">
          {isOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Reordering Controls (Only visible when open) */}
      {isOpen && (
        <div className="px-3 sm:px-4 pb-2 flex items-center justify-between border-b border-white/5 gap-1.5 select-none">
          <span className="text-[9px] font-mono tracking-wider text-white/40 uppercase truncate">
            {isReorderingMode ? t('menuReorderText', "👉 Glisser pour trier") : t('menuToolsText', "Menu Outils")}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {isReorderingMode && (
              <button
                type="button"
                onClick={resetOrder}
                className="p-0.5 px-1.5 rounded-md bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 text-[8px] font-black uppercase transition-all flex items-center gap-0.5 active:scale-95"
                title="Réinitialiser l'ordre"
              >
                <RefreshCw size={8} />
                <span>Reset</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsReorderingMode(!isReorderingMode)}
              className={cn(
                "p-0.5 px-1.5 rounded-md text-[8px] font-black uppercase border transition-all flex items-center gap-0.5 active:scale-95",
                isReorderingMode 
                  ? "bg-dz-emerald/20 border-dz-emerald/40 text-dz-emerald" 
                  : "bg-white/5 border-white/5 hover:bg-white/10 text-white/50 hover:text-white"
              )}
              title={isReorderingMode ? "Quitter le tri" : "Réorganiser les outils"}
            >
              {isReorderingMode ? <Check size={8} /> : <ArrowUpDown size={8} />}
              <span>{isReorderingMode ? t('menuDone', "OK") : t('menuOrganize', "Trier")}</span>
            </button>
          </div>
        </div>
      )}

      {isReorderingMode && isOpen ? (
        <Reorder.Group 
          axis="y" 
          values={items} 
          onReorder={handleReorder}
          className="flex-1 px-2 py-2 space-y-1 overflow-y-auto scrollbar-hide"
        >
          {items.map((item) => (
            <Reorder.Item
              key={item.id}
              value={item}
              className={cn(
                "w-full flex items-center justify-between p-2 rounded-lg transition-all group relative cursor-grab active:cursor-grabbing border bg-white/[0.02] border-dashed border-white/15 text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-2.5 select-none min-w-0">
                <item.icon size={15} className={cn("shrink-0", item.color)} />
                <span className="text-[10px] font-semibold tracking-wide uppercase truncate">{t(navKeyMap[item.id] || '', item.label)}</span>
              </div>
              <GripVertical size={13} className="text-white/30 group-hover:text-white/70 shrink-0" />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto scrollbar-hide">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as NavItem)}
              className={cn(
                "w-full flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl transition-all group relative cursor-pointer",
                activeTab === item.id 
                  ? "bg-linear-to-r from-dz-gold/15 to-dz-emerald/15 text-white shadow-[0_2px_15px_rgba(0,242,254,0.12)] border border-dz-emerald/30" 
                  : "text-white/40 border border-transparent hover:bg-white/5 hover:text-white"
              )}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 w-1 h-5 bg-linear-to-b from-dz-gold to-dz-emerald rounded-r-full shadow-[0_0_8px_rgba(0,242,254,0.8)]" />
              )}
              <item.icon size={16} className={cn(
                "shrink-0 transition-all duration-300 group-hover:scale-110",
                activeTab === item.id ? "text-dz-emerald scale-105 drop-shadow-[0_0_6px_rgba(0,242,254,0.5)]" : cn("opacity-60 group-hover:opacity-100", item.color)
              )} />
              {isOpen && <span className="text-[10.5px] font-bold tracking-wider uppercase select-none truncate text-left font-arabic">{t(navKeyMap[item.id] || '', item.label)}</span>}
            </button>
          ))}
        </nav>
      )}

      <div className="p-2 sm:p-3 mt-auto">
        <div className="p-2.5 glass-card border-dz-emerald/30 mb-2 hidden md:block shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <p className="text-[9px] uppercase tracking-widest text-transparent bg-clip-text bg-linear-to-r from-dz-emerald via-emerald-400 to-dz-gold font-black mb-1">Crédits E-Com AI</p>
          <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-bold font-mono text-white">850</span>
            <span className="text-[9px] text-white/40">/ 1000 Restant</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="bg-linear-to-r from-dz-emerald to-dz-gold h-full w-[85%] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          </div>
        </div>

        <div className="space-y-0.5">
          {/* App Version Icon & Badge */}
          <button
            type="button"
            onClick={() => toast.info(t('latestVersionMsg', 'Vous utilisez la dernière version (v2.4.0) !'))}
            className="w-full flex items-center justify-between p-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/70 hover:text-white cursor-pointer group active:scale-95 mb-0.5"
            title="Version de l'application / رقم التحديث"
            id="sidebar-app-version-button"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 rounded-lg bg-dz-emerald/10 border border-dz-emerald/30 text-dz-emerald group-hover:scale-110 group-hover:bg-dz-emerald/20 transition-all shrink-0">
                <Tag size={13} />
              </div>
              {isOpen && (
                <div className="flex flex-col text-left truncate">
                  <span className="text-[10px] font-bold text-white tracking-wide leading-tight truncate">
                    {t('appVersion', 'Version v2.4.0')}
                  </span>
                  <span className="text-[8px] text-dz-emerald font-semibold flex items-center gap-1 mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-dz-emerald animate-pulse"></span>
                    v2.4.0
                  </span>
                </div>
              )}
            </div>
            {isOpen && (
              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-linear-to-r from-dz-gold/20 to-dz-emerald/20 text-dz-emerald border border-dz-emerald/30 shadow-xs shrink-0">
                PRO
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full flex items-center gap-2.5 p-2 transition-all rounded-xl active:scale-95 group cursor-pointer",
              activeTab === 'settings' 
                ? "bg-linear-to-r from-dz-gold/15 to-dz-emerald/15 text-white border border-dz-emerald/30 shadow-[0_2px_15px_rgba(0,242,254,0.12)]" 
                : "text-white/30 border border-transparent hover:text-white hover:bg-white/5"
            )}
          >
            <Settings size={16} className={cn("transition-transform group-hover:rotate-45 shrink-0", activeTab === 'settings' ? "text-dz-emerald drop-shadow-[0_0_6px_rgba(0,242,254,0.5)]" : "")} />
            {isOpen && <span className="text-[10.5px] font-bold uppercase tracking-wider truncate text-left">{t('menuSettings', 'Paramètres')}</span>}
          </button>
          <button className="w-full flex items-center gap-2.5 p-2 text-rose-500/60 hover:text-rose-400 transition-all rounded-xl hover:bg-rose-500/10 active:scale-95 group cursor-pointer">
            <LogOut size={16} className="transition-transform group-hover:-translate-x-1 shrink-0" />
            {isOpen && <span className="text-[10.5px] font-bold uppercase tracking-wider truncate text-left">{t('logout', 'Déconnexion')}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
