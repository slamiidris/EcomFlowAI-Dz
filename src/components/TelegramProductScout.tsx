import { useState, useEffect, useRef } from 'react';
import { Search, Send, TrendingUp, ShoppingBag, Radio, ExternalLink, Loader2, Sparkles, AlertCircle, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { scoutTelegramProducts, ScoutedProduct } from '../services/telegramService';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';

// Helper for Browser Notifications
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === "granted";
};

const sendTrendNotification = (product: ScoutedProduct) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  
  new Notification("🔥 Nouvelle Tendance Détectée !", {
    body: `${product.name} - Score de tendance de ${product.trendingScore}/100 sur Telegram.`,
    icon: `https://loremflickr.com/100/100/${product.name.replace(/\s+/g, ',')}`,
    tag: product.name,
  });
};

function ImageWithFallback({ keywords, alt, className }: { keywords: string, alt: string, className?: string }) {
  const [src, setSrc] = useState(`https://loremflickr.com/600/400/${keywords.replace(/\s+/g, ',')}`);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleImageError = () => {
    if (!error) {
      setError(true);
      // Fallback to a high-quality unsplash image if loremflickr fails
      setSrc(`https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600&h=400`);
    }
  };

  return (
    <div className={cn("relative w-full h-full bg-white/5 flex items-center justify-center overflow-hidden", className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="animate-spin text-white/10" size={24} />
        </div>
      )}
      <img 
        src={src} 
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-700",
          loading ? "opacity-0 scale-110" : "opacity-100 scale-100",
          !error && "group-hover:scale-110"
        )}
        onLoad={() => setLoading(false)}
        onError={handleImageError}
        referrerPolicy="no-referrer"
      />
      {error && !loading && (
        <div className="absolute top-2 right-2">
          <AlertCircle size={12} className="text-white/20" />
        </div>
      )}
    </div>
  );
}

export default function TelegramProductScout() {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [products, setProducts] = useState<ScoutedProduct[]>([]);
  const [isFirstSearch, setIsFirstSearch] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Check notification status on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);

  // Fetch whether the Telegram backend is in live (MTProto) or simulation mode
  useEffect(() => {
    fetch('/api/telegram-trends')
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data) setIsLive(data.mode === 'live'); })
      .catch(() => setIsLive(false));
  }, []);

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
    } else {
      const granted = await requestNotificationPermission();
      if (granted) setNotificationsEnabled(true);
    }
  };
  
  const TRENDING_SUGGESTIONS = [
    { term: "Hachoir Manuel 3 Lames", category: "Cuisine", popularity: "Explosive" },
    { term: "Abaya Dubai Luxe", category: "Mode", popularity: "High" },
    { term: "Smart Watch Ultra 2", category: "High-Tech", popularity: "Trending" },
    { term: "Mixeur Plongeant DZ", category: "Cuisine", popularity: "Stable" },
    { term: "Pack Eclairage Solaire", category: "Maison", popularity: "Very High" },
    { term: "Aspirateur de Voiture", category: "Accessoires", popularity: "Rising" },
    { term: "Sneakers Jordan DZ", category: "Mode", popularity: "Active" },
    { term: "Machine à Café Expresso", category: "Cuisine", popularity: "High" },
  ];

  const filteredSuggestions = TRENDING_SUGGESTIONS.filter(item => 
    item.term.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  // True when the server reports a live MTProto connection (vs labeled simulation).
  const [isLive, setIsLive] = useState(false);

  const loadingSteps = [
    "Connexion sécurisée aux passerelles Telegram...",
    "Scanning des hubs Grossistes (Hamiz, El Eulma, Sétif)...",
    "Filtrage par volume de commandes réels (COD)...",
    "Analyse IA des visuels et descriptions marketing...",
    "Calcul des scores de profitabilités du marché DZ...",
    "Extraction des fiches produits à fort potentiel...",
    "Optimisation des hooks marketing en Darija...",
    "Finalisation du dashboard de scouting..."
  ];

  const loadingTips = [
    "Saviez-vous ? Le marché du Hamiz est le plus grand hub électronique d'Afrique du Nord.",
    "Astuce : Les produits 'Maison' ont le taux de retour le plus bas en Algérie.",
    "Tendance : Le paiement à la livraison (COD) représente 95% des transactions locales.",
    "Conseil : Un bon hook en Darija augmente le CTR de 40% sur Facebook Ads.",
    "Info : Les hubs d'El Eulma sont spécialisés dans l'électroménager et le textile.",
    "Stratégie : Testez toujours votre produit via Telegram avant de lancer de grosses ads."
  ];

  const [currentTipIdx, setCurrentTipIdx] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setCurrentTipIdx(prev => (prev + 1) % loadingTips.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e?: React.FormEvent, searchQuery?: string) => {
    e?.preventDefault();
    const finalQuery = searchQuery ?? query;
    setQuery(finalQuery);
    setShowSuggestions(false);
    setLoading(true);
    setError(null);
    setProgress(0);
    setLoadingStep(0);
    setIsFirstSearch(false);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        const next = prev + (Math.random() * 15);
        
        // Update loading step based on progress
        const step = Math.floor((next / 100) * loadingSteps.length);
        setLoadingStep(Math.min(step, loadingSteps.length - 1));
        
        return next;
      });
    }, 400);

    try {
      const data = await scoutTelegramProducts(finalQuery);
      setProgress(100);
      setProducts(data);
      if (data.length > 0) {
        toast.success(`${data.length} produits tendance détectés avec succès ! 🚀`);
      }
      
      // Notify for top trending product if enabled
      if (notificationsEnabled && data.length > 0) {
        const topProduct = data.reduce((prev, current) => 
          (current.trendingScore > prev.trendingScore) ? current : prev
        );
        sendTrendNotification(topProduct);
      }

      if (data.length === 0) {
        setError("Aucun produit trouvé pour cette recherche. Essayez d'autres mots-clés.");
      }
    } catch (err: any) {
      console.error("Scouting failed", err);
      const errorStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
      const isQuota = 
        errorStr.includes("429") || 
        errorStr.includes("RESOURCE_EXHAUSTED") || 
        errorStr.includes("quota") ||
        err?.status === "RESOURCE_EXHAUSTED";
        
      if (isQuota) {
        setError("Quota Gemini épuisé ou limite de débit atteinte (Erreur 429). L'IA a besoin d'une pause ou votre forfait a atteint sa limite. Réessayez dans quelques minutes.");
      } else {
        setError("Une erreur est survenue lors du scouting. Vérifiez votre connexion ou réessayez plus tard.");
      }
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    // Initial scout for trending products
    handleSearch();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-1 justify-between items-center w-full md:w-auto">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Send size={24} />
              </span>
              Telegram Product Scout <span className="text-emerald-500">AI</span>
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-white/40 text-sm font-medium">Scannez les tendances Telegram Algérie en temps réel.</p>
              <div className={cn(
                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5",
                isLive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-white/20 border border-white/5"
              )}>
                <div className={cn("w-1 h-1 rounded-full", isLive ? "bg-emerald-500 animate-pulse" : "bg-white/20")} />
                {isLive ? "API Connectée" : "Simulation Active"}
              </div>
            </div>
          </div>

          <button
            onClick={toggleNotifications}
            className={cn(
              "p-3 rounded-xl border transition-all flex items-center gap-2",
              notificationsEnabled 
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" 
                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
            )}
            title={notificationsEnabled ? "Notifications Activées" : "Activer les notifications push"}
          >
            {notificationsEnabled ? <Bell size={20} className="animate-bounce" /> : <BellOff size={20} />}
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
              {notificationsEnabled ? "Alertes ON" : "Alertes OFF"}
            </span>
          </button>
        </div>

        <div className="w-full md:w-auto relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="relative group">
            <div className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Rechercher par niche (ex: Cuisine, Sneakers...)"
                className="w-full md:w-80 bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/20"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors" size={18} />
              
              {/* Discrete Progress Bar on Input */}
              {loading && (
                <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-white/5 overflow-hidden rounded-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  />
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            </button>
          </form>

          <AnimatePresence>
            {showSuggestions && query.length > 0 && filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl py-2 overflow-hidden z-50 shadow-2xl"
              >
                <div className="px-4 py-1 pb-2 border-b border-white/5 mb-1">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Tendances du Marché DZ</p>
                </div>
                {filteredSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(undefined, suggestion.term)}
                    className="w-full px-4 py-2 hover:bg-emerald-500/10 flex items-center justify-between group/item transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/20 group-hover/item:text-emerald-400 transition-colors">
                        <TrendingUp size={14} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white group-hover/item:text-emerald-400 transition-colors">{suggestion.term}</p>
                        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">{suggestion.category}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-500/60 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                      {suggestion.popularity}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Market Pulse Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-6 border border-white/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <Radio size={14} className="text-emerald-400 animate-pulse" />
              Direct de Telegram
            </h3>
            <div className="space-y-4">
              {[
                { channel: "Grossistes Algiers", status: "Hot", color: "text-orange-400" },
                { channel: "DZ Import Luxury", status: "Actif", color: "text-emerald-400" },
                { channel: "Constantine Tech", status: "Nouveau", color: "text-emerald-400" }
              ].map((c, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-white/60 font-semibold">{c.channel}</span>
                  <span className={cn("px-1.5 py-0.5 rounded-sm bg-white/5 font-black uppercase tracking-tighter", c.color)}>{c.status}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-[10px] text-white/30 italic leading-relaxed">
                "Analyse basée sur le volume de messages et l'engagement des membres dans les groupes de vente DZ."
              </p>
            </div>
          </div>

          <div className="glass-card p-6 border border-white/10 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Top Catégories Actuelles</h3>
            <div className="space-y-2">
              {['Smart Home', 'Summer Fashion', 'Kitchen Hack', 'Beauty Tech'].map((cat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center justify-center py-20 px-8 glass-card border border-emerald-500/10 relative overflow-hidden"
              >
                {/* Background Animation */}
                <div className="absolute inset-0 bg-emerald-500/5 overflow-hidden pointer-events-none">
                  <motion.div 
                    animate={{ 
                      x: ['-100%', '100%'],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-y-0 w-1/2 bg-linear-to-r from-transparent via-emerald-500/10 to-transparent skew-x-12"
                  />
                </div>

                <div className="relative z-10 w-full max-w-md space-y-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                      <div className="relative bg-black/40 p-5 rounded-3xl border border-emerald-500/20 shadow-2xl">
                        <Send size={40} className="text-emerald-500 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">Analyse des flux Telegram DZ</h3>
                      <p className="text-emerald-500/60 text-xs font-bold uppercase tracking-widest mt-1">IA Product Scout v4.0</p>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                      <div className="flex flex-col">
                        <AnimatePresence mode="wait">
                          <motion.span 
                            key={loadingStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-[10px] font-black text-emerald-400 uppercase tracking-widest"
                          >
                            {loadingSteps[loadingStep]}
                          </motion.span>
                        </AnimatePresence>
                        <span className="text-[9px] text-white/30 font-bold uppercase mt-1">Status: Recherche active...</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-black text-white tabular-nums tracking-tighter">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="h-4 w-full bg-black/40 rounded-full border border-white/10 p-1 overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "circOut", duration: 0.5 }}
                        className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] relative overflow-hidden"
                      >
                        <motion.div 
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent w-1/2 -skew-x-12"
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Tips Carousel */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
                        <TrendingUp size={16} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Conseil Expert</p>
                        <AnimatePresence mode="wait">
                          <motion.p 
                            key={currentTipIdx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-xs font-medium text-white/80 leading-relaxed italic"
                          >
                            {loadingTips[currentTipIdx]}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="grid grid-cols-2 gap-2">
                    {loadingSteps.map((step, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl text-[9px] font-bold transition-all duration-700 border",
                          loadingStep > idx ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                          loadingStep === idx ? "bg-white/5 border-emerald-400/30 text-white shadow-lg shadow-emerald-500/5" :
                          "bg-transparent border-white/5 text-white/20"
                        )}
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          loadingStep > idx ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                          loadingStep === idx ? "bg-emerald-400 animate-pulse" : "bg-white/10"
                        )} />
                        <span className="truncate">{step.split('...')[0]}</span>
                        {loadingStep === idx && (
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Loader2 size={10} className="text-emerald-400" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 glass-card border border-red-500/10 text-center px-6"
              >
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 underline decoration-red-500/30">Erreur de Scouting</h3>
                <p className="text-white/60 font-medium max-w-md mx-auto">{error}</p>
                <button 
                  onClick={() => handleSearch()}
                  className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5 flex items-center gap-2"
                >
                  <Search size={18} />
                  Réessayer la recherche
                </button>
              </motion.div>
            ) : products.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {products.map((product, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="glass-card p-6 flex flex-col group hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
                      <ImageWithFallback 
                        keywords={product.imageKeywords || 'gadget,tech'} 
                        alt={product.name}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-4">
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/60 bg-black/40 backdrop-blur-md px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    <div className="absolute top-0 right-0 p-4 z-10">
                      <div className="px-2 py-1 bg-emerald-500 text-white rounded text-[10px] font-black uppercase tracking-widest shadow-xl">
                        Top Win
                      </div>
                    </div>

                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 gap-2 flex items-center">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <ShoppingBag size={16} className="text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/20 font-medium uppercase tracking-tighter">{product.sourceChannel}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-orange-400">
                          <TrendingUp size={14} />
                          <span className="text-xs font-black tracking-tight">{product.trendingScore}% Trend</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{product.name}</h3>
                        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500/60">{product.category}</span>
                      </div>
                      
                      <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{product.description}</p>
                      
                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1">
                        <p className="text-[9px] uppercase font-black text-emerald-400 tracking-widest">Why it's hot DZ</p>
                        <p className="text-[11px] text-emerald-400/80 leading-relaxed">{product.whyTrending}</p>
                      </div>

                      <div className="pt-2">
                        <p className="text-[9px] uppercase font-black text-white/20 tracking-widest mb-1">Hook Marketing Perçu</p>
                        <p className="text-sm font-bold text-white/90 font-arabic text-right leading-relaxed" dir="rtl">{product.marketingHook}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-black text-white/20 tracking-[0.2em]">Estim. Price DZ</span>
                        <span className="text-lg font-black text-white">{product.estimatedPrice}</span>
                      </div>
                      <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all">
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : !isFirstSearch && (
              <div className="flex flex-col items-center justify-center py-20 glass-card border border-white/5 text-center px-6">
                <Search size={40} className="text-white/10 mb-4" />
                <p className="text-white/60 font-medium">Aucun signal trouvé pour cette niche.</p>
                <p className="text-xs text-white/30 max-w-xs mt-2">Essayez des termes plus larges comme "Cuisine", "Beauté" ou "Outils".</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
