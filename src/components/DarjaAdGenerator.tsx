import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Copy, 
  Check, 
  Megaphone, 
  Smartphone, 
  Facebook,
  Monitor,
  Maximize,
  Square as SquareIcon,
  Layout,
  X,
  Package,
  Target,
  Megaphone as MegaphoneIcon,
  Mic2,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateDarjaAds } from '../services/gemini';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import Markdown from 'react-markdown';
import PromptField from './PromptField';

export default function DarjaAdGenerator() {
  const toast = useToast();
  const [productName, setProductName] = useState('');
  const [platform, setPlatform] = useState<'facebook' | 'tiktok'>('facebook');
  const [tone, setTone] = useState('Persuasif/Vendeur');
  const [keywords, setKeywords] = useState('');
  const [aspectRatio, setAspectRatio] = useState('4:5');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (platform === 'facebook') {
      setAspectRatio('1:1');
    } else {
      setAspectRatio('9:16');
    }
  }, [platform]);

  const handleGenerate = async () => {
    if (!productName) return;
    setIsLoading(true);
    setError(null);
    try {
      const ads = await generateDarjaAds(productName, platform, tone, keywords, aspectRatio);
      setResult(ads);
      toast.success("Publicités Darja générées avec succès ! 📣");
    } catch (err: any) {
      console.error(err);
      const errorStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
      const isQuota = 
        errorStr.includes("429") || 
        errorStr.includes("RESOURCE_EXHAUSTED") || 
        errorStr.includes("quota") ||
        errorStr.toLowerCase().includes("exceeded") ||
        errorStr.includes("QUOTA_EXCEEDED") ||
        err?.status === "RESOURCE_EXHAUSTED" ||
        errorStr.toLowerCase().includes("limit reached");
      
      if (isQuota) {
        setError("Quota Gemini épuisé. L'IA a besoin d'une pause ou votre limite est atteinte (Erreur 429). Réessayez dans quelques minutes.");
      } else {
        setError("Erreur lors de la génération des pubs. Veuillez vérifier votre connexion.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Script de publicité copié dans le presse-papier ! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <Megaphone className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Générateur Ads Darja</h2>
          <p className="text-gray-400">Texte pub en mélange Darja/Français pour un maximum de conversion</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="glass-card p-6 space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium relative group"
            >
              <button 
                onClick={() => setError(null)}
                className="absolute top-2 right-2 opacity-20 hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              <p className="pr-6">{error}</p>
            </motion.div>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Sparkles size={18} />
            </div>
            <h2 className="text-lg font-bold text-white">Configuration de l'Ad</h2>
          </div>
          <PromptField
            label="Nom du Produit / Prompt"
            icon={<Package size={12} className="text-emerald-500" />}
            value={productName}
            onChange={setProductName}
            placeholder="Ex: Hachoir Manuel, Robot de cuisine électrique..."
            badgeText="PROMPT"
          />

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 flex items-center gap-2">
              <MegaphoneIcon size={10} className="text-emerald-500" />
              Plateforme Cible
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPlatform('facebook')}
                className={cn(
                  "flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest",
                  platform === 'facebook' 
                    ? "bg-emerald-600/20 border-emerald-500 text-white shadow-xl shadow-emerald-600/20" 
                    : "bg-white/[0.03] border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                )}
              >
                <Facebook className="w-4 h-4" />
                Facebook Ads
              </button>
              <button
                onClick={() => setPlatform('tiktok')}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all",
                  platform === 'tiktok' 
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20" 
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                )}
              >
                <Smartphone className="w-4 h-4" />
                TikTok Ads
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 flex items-center gap-2">
               <Mic2 size={10} className="text-emerald-500" />
               Ton de la Publicité
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 appearance-none transition-all"
            >
              <option value="Persuasif/Vendeur" className="bg-slate-900">Persuasif & Vendeur</option>
              <option value="Urgent" className="bg-slate-900">Urgent (Stock limité)</option>
              <option value="Informatif" className="bg-slate-900">Informatif (Détails techniques)</option>
              <option value="Émotionnel" className="bg-slate-900">Émotionnel (Bénéfice style de vie)</option>
              <option value="Humoristique" className="bg-slate-900">Humoristique (Darija fun)</option>
            </select>
          </div>

          <PromptField
            label="Mots-clés / Consignes Spéciales"
            icon={<Sparkles size={12} className="text-emerald-500" />}
            value={keywords}
            onChange={setKeywords}
            placeholder="Ex: premium, livraison gratuite, promo, livraison 58 wilayas..."
            badgeText="OPTIONNEL"
          />

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Layout size={14} />
              </div>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Format de l'image (AI)</label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '16:9', label: 'Paysage', icon: Monitor },
                { id: '1:1', label: 'Carré', icon: SquareIcon },
                { id: '4:5', label: 'Portrait', icon: Maximize },
                { id: '9:16', label: 'Story', icon: Smartphone }
              ].map((ratio) => {
                const Icon = ratio.icon;
                return (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`p-2 rounded-xl flex flex-col items-center gap-1.5 transition-all border ${
                      aspectRatio === ratio.id
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="text-[9px] font-black">{ratio.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !productName}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-2xl shadow-emerald-600/30 active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Générer les variations
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-6 relative group"
              >
                <button
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-all opacity-0 group-hover:opacity-100"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <div className="prose prose-invert prose-sm max-w-none markdown-body">
                  {(() => {
                    const data = result && typeof result === 'object' ? result : null;
                    if (data && data.visuals) {
                      return (
                        <div className="space-y-4">
                          {data.visuals.map((v: any, i: number) => (
                            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase">{v.narrativeRole || v.step || `Variation ${i + 1}`}</span>
                              </div>
                              {v.title && <h4 className="text-white font-bold text-sm">{v.title}</h4>}
                              {v.textOverlay?.headline && <p className="text-xs text-indigo-300 italic">{v.textOverlay.headline}</p>}
                              {v.marketingAngle && <p className="text-[10px] text-gray-400">{v.marketingAngle}</p>}
                              
                              {v.prompt && (
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(v.prompt);
                                  }}
                                  className="mt-2 text-[10px] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all"
                                >
                                  <Copy size={12} /> Copier le Prompt AI
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return <Markdown>{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</Markdown>;
                  })()}
                </div>
              </motion.div>
            ) : (
              <div className="h-64 bg-white/5 backdrop-blur-md border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-gray-500">
                <Megaphone className="w-12 h-12 mb-4 opacity-20" />
                <p>Vos variations publicitaires apparaîtront ici. Soyez créatifs !</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
