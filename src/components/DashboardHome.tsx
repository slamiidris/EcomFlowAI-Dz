import { TrendingUp, Users, ShoppingBag, Package, Settings2, CheckCircle2, Circle, GripVertical, ArrowUpDown, RefreshCw, Check, Image as ImageIcon, Video, Layout, Trash2, Eye, Download, Copy, X, Sparkles, Clock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { HistoryItem } from '../lib/history';
import { historyApi, preferencesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

// localStorage fallback for generation history (read only when the API is unreachable).
const getLocalHistory = (): HistoryItem[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('dzads_generation_history');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse generation history', e);
    return [];
  }
};

export default function DashboardHome() {
  const { user } = useAuth();
  const [showConfig, setShowConfig] = useState(false);
  const [isReorderingMode, setIsReorderingMode] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState<string[]>(['featured', 'stats', 'geo', 'prediction', 'history']);
  const [activeWidgets, setActiveWidgets] = useState({
    stats: true,
    geo: true,
    prediction: true,
    history: true
  });
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  // Load configuration, widget order and history from the API on mount
  // (localStorage remains the fallback so the app never breaks offline).
  useEffect(() => {
    const handleHistoryUpdate = (e: any) => {
      if (e.detail) {
        setHistoryItems(e.detail);
      }
    };
    window.addEventListener('dzads_history_updated', handleHistoryUpdate);

    let cancelled = false;

    const loadHistory = async () => {
      try {
        const res = await historyApi.list();
        if (cancelled) return;
        const list: any[] = Array.isArray(res) ? res : ((res as any)?.history ?? []);
        if (Array.isArray(list)) {
          setHistoryItems(list.map(item => ({
            ...item,
            timestamp: new Date(item.createdAt).getTime(),
          })));
        }
      } catch (e) {
        console.error('Failed to load history from API', e);
        if (!cancelled) setHistoryItems(getLocalHistory());
      }
    };

    const loadPreferences = async () => {
      try {
        const prefs = await preferencesApi.get();
        if (cancelled) return;

        if (prefs?.dashboardConfig && typeof prefs.dashboardConfig === 'object') {
          setActiveWidgets(prev => ({ ...prev, ...prefs.dashboardConfig }));
        }
        if (Array.isArray(prefs?.dashboardWidgetOrder) && prefs.dashboardWidgetOrder.length > 0) {
          const validKeys = ['featured', 'stats', 'geo', 'prediction', 'history'];
          const filtered = prefs.dashboardWidgetOrder.filter((k: string) => validKeys.includes(k));
          const missing = validKeys.filter(k => !filtered.includes(k));
          setWidgetOrder([...filtered, ...missing]);
        }
      } catch (e) {
        console.error('Failed to load preferences from API', e);
        if (cancelled) return;
        // Fallback to localStorage
        const savedConfig = localStorage.getItem('dashboard_config');
        if (savedConfig) {
          try {
            const parsed = JSON.parse(savedConfig);
            setActiveWidgets(prev => ({ ...prev, ...parsed }));
          } catch (err) {
            console.error("Failed to parse dashboard config", err);
          }
        }
        const savedOrder = localStorage.getItem('dashboard_widget_order');
        if (savedOrder) {
          try {
            const parsed = JSON.parse(savedOrder);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const validKeys = ['featured', 'stats', 'geo', 'prediction', 'history'];
              const filtered = parsed.filter((k: string) => validKeys.includes(k));
              const missing = validKeys.filter(k => !filtered.includes(k));
              setWidgetOrder([...filtered, ...missing]);
            }
          } catch (err) {
            console.error("Failed to parse widget order", err);
          }
        }
      }
    };

    loadHistory();
    loadPreferences();

    return () => {
      cancelled = true;
      window.removeEventListener('dzads_history_updated', handleHistoryUpdate);
    };
  }, []);

  // Save configuration (dual-write: localStorage for instant effect, API for persistence)
  const toggleWidget = (id: keyof typeof activeWidgets) => {
    const newConfig = { ...activeWidgets, [id]: !activeWidgets[id] };
    setActiveWidgets(newConfig);
    localStorage.setItem('dashboard_config', JSON.stringify(newConfig));
    preferencesApi.update({ dashboardConfig: newConfig }).catch(() => {});
  };

  const handleReorder = (newOrder: string[]) => {
    setWidgetOrder(newOrder);
    localStorage.setItem('dashboard_widget_order', JSON.stringify(newOrder));
    preferencesApi.update({ dashboardWidgetOrder: newOrder }).catch(() => {});
  };

  const resetOrder = () => {
    setWidgetOrder(['featured', 'stats', 'geo', 'prediction', 'history']);
    localStorage.removeItem('dashboard_widget_order');
    preferencesApi.update({ dashboardWidgetOrder: ['featured', 'stats', 'geo', 'prediction', 'history'] }).catch(() => {});
  };

  const handleRestoreItem = (item: HistoryItem) => {
    if (item.type === 'image') {
      localStorage.setItem('dzads_last_generated_image', JSON.stringify(item.payload));
      window.dispatchEvent(new CustomEvent('nav-change', { detail: 'images' }));
    } else if (item.type === 'script') {
      localStorage.setItem('dzads_last_generated_script', JSON.stringify(item.payload));
      window.dispatchEvent(new CustomEvent('nav-change', { detail: 'video' }));
    } else if (item.type === 'landing_page') {
      const sessionsStr = localStorage.getItem('dzads_lp_sessions');
      let sessionsList: any[] = [];
      if (sessionsStr) {
        try {
          sessionsList = JSON.parse(sessionsStr);
        } catch (e) {
          console.error(e);
        }
      }
      const exists = sessionsList.some((s: any) => s.id === item.payload.id);
      if (!exists) {
        sessionsList = [item.payload, ...sessionsList];
        localStorage.setItem('dzads_lp_sessions', JSON.stringify(sessionsList));
      }
      localStorage.setItem('dzads_lp_last_active_id', item.payload.id);
      window.dispatchEvent(new CustomEvent('nav-change', { detail: 'landing' }));
    }
  };

  const handleDeleteItem = (id: string) => {
    // Optimistic local update
    setHistoryItems(prev => prev.filter(i => i.id !== id));
    // Persist the deletion to the server API
    historyApi.delete(id).catch(() => {});
  };

  const handleClearHistory = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider tout votre historique de génération ?")) {
      setHistoryItems([]);
      historyApi.clear().catch(() => {});
    }
  };

  const stats = [
    { label: 'Conversion Moyenne (DZ)', value: '4.2%', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Audience Active', value: '12.4M', icon: Users, color: 'text-emerald-500' },
    { label: 'Top Catégorie', value: 'Cosmétiques', icon: ShoppingBag, color: 'text-emerald-600' },
    { label: 'Livraison Moy. (COD)', value: '72h', icon: Package, color: 'text-orange-400' },
  ];

  const renderWidget = (id: string) => {
    switch (id) {
      case 'featured':
        return (
          <div key="featured" className="group relative">
            {isReorderingMode && (
              <div className="absolute top-3 right-3 z-50 flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg select-none cursor-grab active:cursor-grabbing hover:bg-emerald-400 transition-colors animate-pulse">
                <GripVertical size={12} />
                <span>Déplacer Studio</span>
              </div>
            )}
            <div className={cn(
              "glass-card p-1 overflow-hidden relative border-indigo-500/20 transition-all duration-300",
              isReorderingMode && "opacity-75 ring-2 ring-dashed ring-indigo-500/40 scale-[0.99]"
            )}>
              <div className="absolute inset-0 bg-linear-to-r from-indigo-500/20 via-purple-500/10 to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-xl border border-white/10">
                  <ShoppingBag size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-bold text-white mb-1">Studio Photo AI: Vos produits en HD</h2>
                  <p className="text-white/40 text-sm">Générez des visuels professionnels pour vos publicités en un clic.</p>
                </div>
                {!isReorderingMode && (
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('nav-change', { detail: 'images' }))}
                    className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:scale-105 transition-all shadow-lg whitespace-nowrap cursor-pointer active:scale-95"
                  >
                    Lancer le Studio
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case 'stats':
        if (!activeWidgets.stats) return null;
        return (
          <div key="stats" className="group relative">
            {isReorderingMode && (
              <div className="absolute top-3 right-3 z-50 flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg select-none cursor-grab active:cursor-grabbing hover:bg-emerald-400 transition-colors animate-pulse">
                <GripVertical size={12} />
                <span>Déplacer Stats</span>
              </div>
            )}
            <div className={cn(
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-300",
              isReorderingMode && "opacity-75 p-2 ring-2 ring-dashed ring-emerald-500/30 rounded-2xl scale-[0.99]"
            )}>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="glass-card glass-card-hover p-6 group cursor-default border-white/5 relative"
                >
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className={cn("p-4 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 group-hover:ring-white/20 transition-all shadow-inner", stat.color)}>
                      <stat.icon size={22} />
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="w-1 h-3 bg-white/5 rounded-full" />
                      ))}
                    </div>
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-white/30 text-[10px] uppercase font-black tracking-widest mb-1 group-hover:text-white/50 transition-colors">{stat.label}</h3>
                    <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                  </div>
                  <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 border-t-2 border-r-2 border-white/10 rounded-tr-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'geo':
        if (!activeWidgets.geo) return null;
        return (
          <div key="geo" className="group relative">
            {isReorderingMode && (
              <div className="absolute top-3 right-3 z-50 flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg select-none cursor-grab active:cursor-grabbing hover:bg-emerald-400 transition-colors animate-pulse">
                <GripVertical size={12} />
                <span>Déplacer Analyses</span>
              </div>
            )}
            <div className={cn(
              "glass-card p-8 transition-all duration-300",
              isReorderingMode && "opacity-75 ring-2 ring-dashed ring-emerald-500/30 scale-[0.99]"
            )}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <Users size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">Analyses Géographiques (Wilayas)</h3>
              </div>
              <div className="space-y-6">
                {[
                  { name: '16 - Alger', share: '32%', color: 'bg-emerald-500' },
                  { name: '31 - Oran', share: '18%', color: 'bg-emerald-400' },
                  { name: '25 - Constantine', share: '12%', color: 'bg-emerald-600' },
                  { name: '06 - Béjaïa', share: '8%', color: 'bg-emerald-300' },
                ].map((wilaya) => (
                  <div key={wilaya.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60 font-medium">{wilaya.name}</span>
                      <span className="text-white font-bold">{wilaya.share}</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: wilaya.share }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full", wilaya.color)}
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'prediction':
        if (!activeWidgets.prediction) return null;
        return (
          <div key="prediction" className="group relative">
            {isReorderingMode && (
              <div className="absolute top-3 right-3 z-50 flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg select-none cursor-grab active:cursor-grabbing hover:bg-emerald-400 transition-colors animate-pulse">
                <GripVertical size={12} />
                <span>Déplacer Prédiction</span>
              </div>
            )}
            <div className={cn(
              "glass-card p-8 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 flex flex-col items-center justify-center text-center transition-all duration-300",
              isReorderingMode && "opacity-75 ring-2 ring-dashed ring-emerald-500/30 scale-[0.99]"
            )}>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 shadow-xl border border-white/10">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Conversion Prediction</h3>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Basé sur les tendances actuelles du marché e-commerce en Algérie.
              </p>
              <div className="text-4xl font-black text-dz-gold mb-1">+24.8%</div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Potentiel de Croissance</p>
            </div>
          </div>
        );

      case 'history':
        if (!activeWidgets.history) return null;
        return (
          <div key="history" className="group relative">
            {isReorderingMode && (
              <div className="absolute top-3 right-3 z-50 flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg select-none cursor-grab active:cursor-grabbing hover:bg-emerald-400 transition-colors animate-pulse">
                <GripVertical size={12} />
                <span>Déplacer Historique</span>
              </div>
            )}
            <div className={cn(
              "glass-card p-6 md:p-8 transition-all duration-300 relative overflow-hidden",
              isReorderingMode && "opacity-75 ring-2 ring-dashed ring-emerald-500/30 scale-[0.99]"
            )}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      Historique des Générations AI
                      <span className="text-[10px] bg-indigo-500/25 text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {historyItems.length}
                      </span>
                    </h3>
                    <p className="text-white/40 text-xs">Consultez, téléchargez et restaurez rapidement vos 10 dernières créations.</p>
                  </div>
                </div>

                {historyItems.length > 0 && !isReorderingMode && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Vider l'historique</span>
                  </button>
                )}
              </div>

              {historyItems.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 mb-4">
                    <Sparkles size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-white/60 mb-1">Aucune génération récente</h4>
                  <p className="text-white/30 text-xs max-w-sm">
                    Générez des scripts vidéo, des images produits, ou des landing pages pour voir votre historique se constituer ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                  {historyItems.map((item) => {
                    const isScript = item.type === 'script';
                    const isImage = item.type === 'image';
                    const isLp = item.type === 'landing_page';

                    let typeLabel = "Image Produit";
                    let typeColor = "bg-cyan-500/10 text-cyan-300 border-cyan-500/10";
                    let TypeIcon = ImageIcon;

                    if (isScript) {
                      typeLabel = "Script Vidéo AI";
                      typeColor = "bg-emerald-500/10 text-emerald-300 border-emerald-500/10";
                      TypeIcon = Video;
                    } else if (isLp) {
                      typeLabel = "Landing Page";
                      typeColor = "bg-amber-500/10 text-amber-300 border-amber-500/10";
                      TypeIcon = Layout;
                    }

                    return (
                      <div
                        key={item.id}
                        className="group/item flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:border-white/10"
                      >
                        <div className="flex flex-1 items-start gap-3.5 min-w-0">
                          <div className={cn("p-2.5 rounded-xl shrink-0 border", isImage ? "bg-cyan-500/5 text-cyan-400 border-cyan-500/10" : isScript ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10" : "bg-amber-500/5 text-amber-400 border-amber-500/10")}>
                            <TypeIcon size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <h4 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">{(item as any).name || item.title}</h4>
                              <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border", typeColor)}>
                                {typeLabel}
                              </span>
                              <span className="text-[10px] text-white/30 flex items-center gap-1 font-medium">
                                <Clock size={10} />
                                {new Date(item.timestamp).toLocaleDateString('fr-FR')} {new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-white/50 text-xs truncate max-w-md">{(item as any).subtitle || item.previewText || 'Génération AI'}</p>
                          </div>
                        </div>

                        {!isReorderingMode && (
                          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="px-3 py-1.5 bg-white/5 text-white border border-white/10 hover:bg-indigo-500/20 hover:border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                              title="Consulter les détails"
                            >
                              <Eye size={12} />
                              <span>Consulter</span>
                            </button>
                            <button
                              onClick={() => handleRestoreItem(item)}
                              className="px-3 py-1.5 bg-white text-black hover:scale-[1.03] rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-md"
                              title="Charger dans le générateur"
                            >
                              <ExternalLink size={12} />
                              <span>Restaurer</span>
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/5 rounded-lg border border-transparent hover:border-red-500/10 transition-all cursor-pointer active:scale-90"
                              title="Supprimer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end relative gap-4">
        <div className="min-w-0">
          <p className="text-dz-emerald text-[10px] uppercase font-black tracking-[0.3em] mb-1">Algérie Market Intelligence</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter truncate">Salam, {user?.name?.split(' ')[0] || 'Ahmed'} 👋</h1>
          <p className="text-white/40 text-sm md:text-base font-medium">Votre centre de commandement e-commerce propulsé par l'IA.</p>
        </div>
        <div className="flex gap-2 md:gap-3 shrink-0 mb-1">
          <div className="glass-panel px-4 py-2.5 rounded-2xl hidden sm:flex items-center gap-3 border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-40"></div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Marché DZ: Live</span>
          </div>

          {/* Reordering toggle */}
          <button 
            type="button"
            onClick={() => setIsReorderingMode(!isReorderingMode)}
            className={cn(
              "p-2.5 rounded-full glass-panel border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-bold flex items-center gap-2 cursor-pointer",
              isReorderingMode && "text-emerald-400 border-emerald-400/30 bg-emerald-400/5 ring-4 ring-emerald-400/10"
            )}
            title={isReorderingMode ? "Quitter la réorganisation" : "Trier les widgets"}
          >
            {isReorderingMode ? <Check size={16} /> : <ArrowUpDown size={16} />}
            <span className="hidden md:inline">{isReorderingMode ? "Fini" : "Trier"}</span>
          </button>

          {isReorderingMode && (
            <button 
              type="button"
              onClick={resetOrder}
              className="p-2.5 rounded-full glass-panel border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all text-xs font-bold flex items-center gap-2 cursor-pointer"
              title="Réinitialiser l'ordre"
            >
              <RefreshCw size={16} />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}
          
          <div className="relative">
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className={cn(
                "p-2.5 rounded-full glass-panel border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-bold flex items-center gap-2",
                showConfig && "text-emerald-400 border-emerald-400/30 bg-emerald-400/5 ring-4 ring-emerald-400/10"
              )}
            >
              <Settings2 size={16} />
              <span className="hidden md:inline">Config</span>
            </button>

            <AnimatePresence>
              {showConfig && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-64 glass-card border border-white/10 shadow-2xl p-4 z-50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
                  <div className="relative">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 ml-1">Configuration Dashboard</p>
                    <div className="space-y-1">
                      {[
                        { id: 'stats', label: 'Statistiques Globales', icon: TrendingUp },
                        { id: 'geo', label: 'Analyses Wilayas', icon: Users },
                        { id: 'prediction', label: 'Prédictions de Marché', icon: TrendingUp },
                        { id: 'history', label: 'Historique des Créations', icon: Clock }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleWidget(item.id as any)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                            activeWidgets[item.id as keyof typeof activeWidgets] 
                              ? "bg-white/5 text-white" 
                              : "text-white/30 hover:bg-white/[0.02]"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon size={16} className={activeWidgets[item.id as keyof typeof activeWidgets] ? "text-emerald-400" : ""} />
                            <span className="text-xs font-semibold">{item.label}</span>
                          </div>
                          {activeWidgets[item.id as keyof typeof activeWidgets] ? (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          ) : (
                            <Circle size={16} className="text-white/10" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Guide notice banner during reordering */}
      {isReorderingMode && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-semibold"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shrink-0" />
            <span>🔧 Mode Réorganisation : Faites glisser les blocs pour personnaliser l'ordre de votre Dashboard.</span>
          </div>
          <button 
            onClick={() => setIsReorderingMode(false)}
            className="px-4 py-1.5 bg-emerald-500 text-white font-black rounded-xl hover:scale-105 active:scale-95 transition-all text-[10px] uppercase shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            Sauvegarder l'Espace
          </button>
        </motion.div>
      )}

      {/* Interactive Drag and Drop Grid or List */}
      <AnimatePresence mode="popLayout">
        {isReorderingMode ? (
          <Reorder.Group 
            axis="y" 
            values={widgetOrder} 
            onReorder={handleReorder}
            className="space-y-10"
          >
            {widgetOrder.map((id) => {
              // Only render standard active keys
              if (id === 'stats' && !activeWidgets.stats) return null;
              if (id === 'geo' && !activeWidgets.geo) return null;
              if (id === 'prediction' && !activeWidgets.prediction) return null;

              return (
                <Reorder.Item 
                  key={id} 
                  value={id}
                  className="focus:outline-hidden"
                >
                  {renderWidget(id)}
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        ) : (
          <div className="space-y-10">
            {/* If BOTH analyses (geo) and predictions are active and adjacent, they looks wonderful in a 8/4 grid, else standard stack! */}
            {(() => {
              const activeIds = widgetOrder.filter(id => {
                if (id === 'featured') return true;
                if (id === 'stats' && activeWidgets.stats) return true;
                if (id === 'geo' && activeWidgets.geo) return true;
                if (id === 'prediction' && activeWidgets.prediction) return true;
                return false;
              });

              // Track which indexes we rendered in custom blocks to avoid duplicates
              const rendered = new Set<string>();
              const elements: React.ReactNode[] = [];

              for (let idx = 0; idx < activeIds.length; idx++) {
                const currentId = activeIds[idx];
                if (rendered.has(currentId)) continue;

                const nextId = activeIds[idx + 1];

                // Super premium custom row: if 'geo' and 'prediction' are adjacent, keep their desktop side-by-side grid of 8/4
                if (
                  (currentId === 'geo' && nextId === 'prediction') ||
                  (currentId === 'prediction' && nextId === 'geo')
                ) {
                  const geoFirst = currentId === 'geo';
                  elements.push(
                    <div key="geo-prediction-row" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {geoFirst ? (
                        <>
                          <div className="lg:col-span-8">{renderWidget('geo')}</div>
                          <div className="lg:col-span-4">{renderWidget('prediction')}</div>
                        </>
                      ) : (
                        <>
                          <div className="lg:col-span-4">{renderWidget('prediction')}</div>
                          <div className="lg:col-span-8">{renderWidget('geo')}</div>
                        </>
                      )}
                    </div>
                  );
                  rendered.add(currentId);
                  rendered.add(nextId);
                } else {
                  elements.push(renderWidget(currentId));
                  rendered.add(currentId);
                }
              }

              return elements;
            })()}
          </div>
        )}
      </AnimatePresence>

      {/* Premium History Consultation Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto glass-card p-6 md:p-8 border border-white/15 shadow-2xl flex flex-col focus:outline-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Glow Accent */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent pointer-events-none" />

              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl border",
                    selectedItem.type === 'image' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                    selectedItem.type === 'script' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    {selectedItem.type === 'image' ? <ImageIcon size={20} /> :
                     selectedItem.type === 'script' ? <Video size={20} /> :
                     <Layout size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white tracking-tight">{(selectedItem as any).name || selectedItem.title}</h3>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border",
                        selectedItem.type === 'image' ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/10" :
                        selectedItem.type === 'script' ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/10" :
                        "bg-amber-500/10 text-amber-300 border-amber-500/10"
                      )}>
                        {selectedItem.type === 'image' ? 'Image' : selectedItem.type === 'script' ? 'Script Vidéo' : 'Landing Page'}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5 font-medium">
                      <Clock size={11} />
                      Généré le {new Date(selectedItem.timestamp).toLocaleDateString('fr-FR')} à {new Date(selectedItem.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body Content */}
              <div className="flex-1 overflow-y-auto pr-1">
                {/* 1. IMAGE TEMPLATE */}
                {selectedItem.type === 'image' && (() => {
                  const imgData = selectedItem.payload;
                  const imgSrc = imgData.result || imgData.img || (typeof imgData === 'string' ? imgData : null);

                  const downloadImage = () => {
                    if (!imgSrc) return;
                    const itemTitle = (selectedItem as any).name || selectedItem.title || 'creation';
                    const link = document.createElement('a');
                    link.href = imgSrc;
                    link.download = `dzads-studio-${itemTitle.replace(/\s+/g, '_')}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  };

                  const copyPrompt = () => {
                    navigator.clipboard.writeText(imgData.productName || (selectedItem as any).name || selectedItem.title || '');
                    setSelectedItem(prev => prev ? { ...prev, _copied: true } as any : null);
                    setTimeout(() => {
                      setSelectedItem(prev => prev ? { ...prev, _copied: false } as any : null);
                    }, 2000);
                  };

                  return (
                    <div className="space-y-6">
                      <div className="relative group rounded-2xl overflow-hidden bg-black/40 border border-white/5 max-h-[420px] flex items-center justify-center p-2">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={(selectedItem as any).name || selectedItem.title}
                            referrerPolicy="no-referrer"
                            className="max-h-[400px] object-contain rounded-xl shadow-2xl transition-all duration-500"
                          />
                        ) : (
                          <div className="py-20 text-center text-white/40">Données de l'image manquantes</div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.01] border border-white/5 rounded-2xl p-5">
                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider">Spécifications AI</h4>
                          <div>
                            <span className="text-[10px] text-white/30 uppercase font-bold">Produit</span>
                            <p className="text-sm font-semibold text-white">{imgData.productName || (selectedItem as any).name || selectedItem.title}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-white/30 uppercase font-bold">Style visuel</span>
                            <p className="text-sm font-semibold text-white capitalize">{imgData.style || 'Lifestyle'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-white/30 uppercase font-bold">Format d'image (Ratio)</span>
                            <p className="text-sm font-semibold text-white">{imgData.aspectRatio || '1:1'}</p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-end gap-3 md:border-l md:border-white/5 md:pl-6">
                          <button
                            onClick={downloadImage}
                            className="w-full py-3 bg-emerald-500 text-black font-black uppercase tracking-wider text-xs rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                          >
                            <Download size={14} />
                            <span>Télécharger l'image</span>
                          </button>
                          <button
                            onClick={copyPrompt}
                            className="w-full py-3 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {((selectedItem as any)._copied) ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            <span>{((selectedItem as any)._copied) ? "Nom Copié !" : "Copier le Nom"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. SCRIPT TEMPLATE */}
                {selectedItem.type === 'script' && (() => {
                  const scriptData = selectedItem.payload;
                  const actualResult = scriptData.result || scriptData.payload || scriptData;
                  const scenes = actualResult.scenes || [];

                  const copyScriptText = () => {
                    const formatted = `TITLE: ${actualResult.title || (selectedItem as any).name || selectedItem.title}\n\n` + 
                      scenes.map((s: any, idx: number) => `SCENE ${idx + 1} (${s.time || '5s'}):\n[VISUEL]: ${s.visual}\n[AUDIO]: ${s.audio}\n`).join("\n");
                    navigator.clipboard.writeText(formatted);
                    setSelectedItem(prev => prev ? { ...prev, _copied: true } as any : null);
                    setTimeout(() => {
                      setSelectedItem(prev => prev ? { ...prev, _copied: false } as any : null);
                    }, 2000);
                  };

                  return (
                    <div className="space-y-6">
                      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 mb-4 gap-3">
                          <div>
                            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider">Brief Stratégique</span>
                            <h4 className="text-base font-bold text-white mt-0.5">{actualResult.title || (selectedItem as any).name || selectedItem.title}</h4>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/80">
                              🎬 {scriptData.videoType || "UGC"}
                            </span>
                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/80">
                              ⏱️ {scriptData.videoDuration || "30s"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4">
                            <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Angle Marketing Ciblé</span>
                            <p className="text-xs text-white/80 mt-1 leading-relaxed">{scriptData.painPoint || "Présentation directe des bénéfices produit"}</p>
                          </div>
                          <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4">
                            <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Audience & Direction Vocale</span>
                            <p className="text-xs text-white/80 mt-1 leading-relaxed font-semibold text-dz-emerald">🗣️ {actualResult.marketingStrategy?.voiceoverTone || "Ton UGC naturel, chaleureux et persuasif"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Scenes Timeline */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Découpage Scénique ({scenes.length} scènes)</h4>
                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                          {scenes.map((scene: any, idx: number) => (
                            <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex gap-4 items-start hover:border-white/10 transition-colors">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-xs flex items-center justify-center shrink-0">
                                {idx + 1}
                              </div>
                              <div className="flex-1 space-y-2 min-w-0">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Scène {idx + 1}</span>
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded-md">{scene.time || "5s"}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                  <div>
                                    <span className="text-[9px] font-black uppercase text-white/40 tracking-wider">Instructions Visuelles</span>
                                    <p className="text-xs text-white/80 mt-0.5 bg-black/20 p-2 rounded-lg border border-white/5">{scene.visual}</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">🗣️ Audio / Voix-Off (Darija)</span>
                                    <p className="text-xs text-white mt-0.5 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 font-medium italic">"{scene.audio}"</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 flex justify-end gap-3 border-t border-white/5">
                        <button
                          onClick={copyScriptText}
                          className="px-5 py-3 bg-emerald-500 text-black font-black uppercase tracking-wider text-xs rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                        >
                          {((selectedItem as any)._copied) ? <Check size={14} /> : <Copy size={14} />}
                          <span>{((selectedItem as any)._copied) ? "Texte Copié !" : "Copier le Script"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. LANDING PAGE TEMPLATE */}
                {selectedItem.type === 'landing_page' && (() => {
                  const lpState = selectedItem.payload.state;
                  const sections = lpState.lpData?.sections || [];

                  const copyLandingStructure = () => {
                    navigator.clipboard.writeText(JSON.stringify(lpState.lpData, null, 2));
                    setSelectedItem(prev => prev ? { ...prev, _copied: true } as any : null);
                    setTimeout(() => {
                      setSelectedItem(prev => prev ? { ...prev, _copied: false } as any : null);
                    }, 2000);
                  };

                  return (
                    <div className="space-y-6">
                      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 mb-4 gap-3">
                          <div>
                            <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">Copie de Structure Landing Page</span>
                            <h4 className="text-base font-bold text-white mt-0.5">{lpState.productName || (selectedItem as any).name || selectedItem.title}</h4>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/80 capitalize">
                              🎨 Style: {lpState.designStyle || "Moderne"}
                            </span>
                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/80 capitalize">
                              💬 Ton: {lpState.tone || "Persuasif"}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4">
                            <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Marque</span>
                            <p className="text-xs text-white/85 mt-1 font-semibold">{lpState.brand || "Générique"}</p>
                          </div>
                          <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4">
                            <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Stratégie d'entonnoir</span>
                            <p className="text-xs text-white/85 mt-1 font-semibold capitalize">{lpState.funnelStrategy?.replace(/_/g, ' ') || "AIDA"}</p>
                          </div>
                          <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4">
                            <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">Langue de rédaction</span>
                            <p className="text-xs text-white/85 mt-1 font-semibold capitalize">{lpState.language === 'ar' ? 'Arabe (Darija)' : 'Français'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Sections Blueprint */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">Structure Rédactionnelle ({sections.length} Sections)</h4>
                        <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                          {sections.map((section: any, idx: number) => (
                            <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex gap-4 hover:border-white/10 transition-colors">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black text-xs flex items-center justify-center shrink-0">
                                {idx + 1}
                              </div>
                              <div className="flex-1 space-y-2 min-w-0">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Section {idx + 1} • {section.sectionType || "Contenu"}</span>
                                  {section.narrativeRole && (
                                    <span className="text-[9px] font-bold text-amber-400 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-full capitalize">{section.narrativeRole}</span>
                                  )}
                                </div>
                                <div className="space-y-1.5 pt-1">
                                  <h5 className="text-xs font-bold text-white leading-relaxed">{section.headline || section.title || "Titre de section"}</h5>
                                  {section.subheadline && (
                                    <p className="text-[11px] text-white/50">{section.subheadline}</p>
                                  )}
                                  {section.bulletPoints && Array.isArray(section.bulletPoints) && section.bulletPoints.length > 0 && (
                                    <ul className="text-xs space-y-1 pt-1.5 pl-1">
                                      {section.bulletPoints.map((bp: string, bIdx: number) => (
                                        <li key={bIdx} className="text-white/70 flex items-start gap-1.5 leading-relaxed">
                                          <span className="text-amber-500 select-none">•</span>
                                          <span>{bp}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {section.ctaText && (
                                    <div className="pt-2">
                                      <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/15 font-bold uppercase tracking-wider">
                                        CTA: {section.ctaText}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 flex justify-end gap-3 border-t border-white/5">
                        <button
                          onClick={copyLandingStructure}
                          className="px-5 py-3 bg-amber-500 text-black font-black uppercase tracking-wider text-xs rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                        >
                          {((selectedItem as any)._copied) ? <Check size={14} /> : <Copy size={14} />}
                          <span>{((selectedItem as any)._copied) ? "Structure Copiée !" : "Copier la Structure JSON"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
