import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Facebook,
  Key,
  Briefcase,
  Save,
  CheckCircle2,
  AlertCircle,
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { settingsApi } from '../services/api';

interface IntegrationSettings {
  facebookAdsToken: string;
  facebookAccountId: string;
  tiktokAdsToken: string;
  tiktokAccountId: string;
  googleAdsCustomerId: string;
  googleAdsDeveloperToken: string;
  snapAdsToken: string;
  snapAccountId: string;
  geminiApiKey: string;
  workspaceName: string;
  customApiToken: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<IntegrationSettings>({
    facebookAdsToken: '',
    facebookAccountId: '',
    tiktokAdsToken: '',
    tiktokAccountId: '',
    googleAdsCustomerId: '',
    googleAdsDeveloperToken: '',
    snapAdsToken: '',
    snapAccountId: '',
    geminiApiKey: '',
    workspaceName: 'E-com DZ Workspace',
    customApiToken: ''
  });

  const toast = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Which secret fields are currently set server-side (never prefilled — the
  // server returns them masked, so we only track a boolean).
  const [tokensSet, setTokensSet] = useState<Record<string, boolean>>({});

  // Token fields are secrets — stored encrypted server-side, never echoed
  // back in full and never written to localStorage.
  const TOKEN_KEYS = [
    'facebookAdsToken', 'tiktokAdsToken', 'googleAdsDeveloperToken',
    'snapAdsToken', 'geminiApiKey', 'customApiToken',
  ];

  useEffect(() => {
    let cancelled = false;
    const applySettings = (parsed: any) => {
      const stripped: Record<string, any> = { ...parsed };
      const setFlags: Record<string, boolean> = {};
      for (const k of TOKEN_KEYS) {
        setFlags[k] = Boolean(parsed?.[k]);
        stripped[k] = ''; // never prefill a secret into an editable input
      }
      setTokensSet(setFlags);
      setSettings(prev => ({
        ...prev,
        ...stripped,
      }));
    };

    (async () => {
      try {
        const saved = await settingsApi.get();
        if (cancelled || !saved) return;
        applySettings(saved);
      } catch (e) {
        console.error('Failed to load settings from API', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSave = () => {
    try {
      // Persist to API only — secrets are never written to localStorage.
      settingsApi.update(settings).then(() => {
        setIsSaved(true);
        setError(null);
        toast.success('Paramètres enregistrés avec succès ! 💾');
        setTimeout(() => setIsSaved(false), 3000);
      }).catch(() => {
        setError('Erreur lors de la sauvegarde des paramètres');
        toast.error('Erreur lors de la sauvegarde');
      });
    } catch (e) {
      setError('Erreur lors de la sauvegarde des paramètres');
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-white/5 ring-1 ring-white/10">
          <SettingsIcon size={24} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Paramètres d'Intégration</h1>
          <p className="text-white/40 text-sm">Configurez vos accès aux plateformes publicitaires et d'IA</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-black uppercase tracking-tighter text-white/30 mb-1">Gemini AI</p>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", tokensSet.geminiApiKey ? "bg-emerald-500" : "bg-white/10")} />
            <span className="text-xs font-bold text-white">{tokensSet.geminiApiKey ? "Connecté" : "Déconnecté"}</span>
          </div>
        </div>
        <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-black uppercase tracking-tighter text-white/30 mb-1">Facebook</p>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", tokensSet.facebookAdsToken ? "bg-emerald-500" : "bg-white/10")} />
            <span className="text-xs font-bold text-white">{tokensSet.facebookAdsToken ? "Connecté" : "Déconnecté"}</span>
          </div>
        </div>
        <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-black uppercase tracking-tighter text-white/30 mb-1">TikTok</p>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", tokensSet.tiktokAdsToken ? "bg-emerald-500" : "bg-white/10")} />
            <span className="text-xs font-bold text-white">{tokensSet.tiktokAdsToken ? "Connecté" : "Déconnecté"}</span>
          </div>
        </div>
        <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-black uppercase tracking-tighter text-white/30 mb-1">Google</p>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", tokensSet.googleAdsDeveloperToken ? "bg-emerald-500" : "bg-white/10")} />
            <span className="text-xs font-bold text-white">{tokensSet.googleAdsDeveloperToken ? "Connecté" : "Déconnecté"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Workspace Info */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Informations Générales</h2>
              <p className="text-white/40 text-xs">Personnalisez votre espace de travail</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Nom du Workspace</label>
              <input 
                type="text"
                value={settings.workspaceName}
                onChange={(e) => setSettings({...settings, workspaceName: e.target.value})}
                placeholder="Ex: My E-com Agency..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* AI & Content Platforms */}
        <div className="space-y-4">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/20 ml-1">IA & Génération de Contenu</h3>
           <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Key size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Google Gemini API</h2>
                <p className="text-white/40 text-xs">Clé API pour la génération de contenu et analyses stratégiques</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Clé API Gemini (v1.5 Pro/Flash)</label>
                <input 
                  type="password"
                  value={settings.geminiApiKey || ''}
                  onChange={(e) => setSettings({...settings, geminiApiKey: e.target.value})}
                  placeholder={tokensSet.geminiApiKey ? '•••••••• (configuré — laisser vide pour conserver)' : 'Introduisez votre clé API AI Studio...'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                />
                <div className="mt-4 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                   <p className="text-[10px] text-indigo-300 leading-relaxed italic">
                     <strong>Note :</strong> Cette clé alimente toute la génération IA (images, vidéos, copy, analyses…). Elle est chiffrée et ne quitte jamais le serveur.
                   </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Paid Advertising Platforms */}
        <div className="space-y-4">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/20 ml-1">Plateformes Publicitaires (Ads)</h3>
           
           <div className="grid grid-cols-1 gap-6">
              {/* Facebook Ads Integration */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 border-l-4 border-l-blue-600"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Facebook size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Facebook & Instagram Ads</h2>
                    <p className="text-white/40 text-xs">Publication automatique & Tracking de conversions</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Ad Account ID</label>
                    <input 
                      type="text"
                      value={settings.facebookAccountId || ''}
                      onChange={(e) => setSettings({...settings, facebookAccountId: e.target.value})}
                      placeholder="Ex: act_123456789..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">System User Access Token</label>
                    <input 
                      type="password"
                      value={settings.facebookAdsToken || ''}
                      onChange={(e) => setSettings({...settings, facebookAdsToken: e.target.value})}
                      placeholder={tokensSet.facebookAdsToken ? '•••••••• (configuré — laisser vide pour conserver)' : 'EAAG...'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                    />
                  </div>
                </div>
              </motion.div>

              {/* TikTok Ads Integration */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass-card p-6 border-l-4 border-l-black"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-black/40 text-white border border-white/10">
                    <div className="w-5 h-5 flex items-center justify-center font-black text-[10px]">TT</div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">TikTok For Business</h2>
                    <p className="text-white/40 text-xs">Synchronisation des audiences et KPIs TikTok</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Advertiser ID</label>
                    <input 
                      type="text"
                      value={settings.tiktokAccountId || ''}
                      onChange={(e) => setSettings({...settings, tiktokAccountId: e.target.value})}
                      placeholder="Ex: 70123456789..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Marketing API Access Token</label>
                    <input 
                      type="password"
                      value={settings.tiktokAdsToken || ''}
                      onChange={(e) => setSettings({...settings, tiktokAdsToken: e.target.value})}
                      placeholder={tokensSet.tiktokAdsToken ? '•••••••• (configuré — laisser vide pour conserver)' : 'Ex: tt_at_...'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                    />
                  </div>
                </div>
              </motion.div>
              {/* Google Ads Integration */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 border-l-4 border-l-blue-400"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-blue-400/10 text-blue-400">
                    <Layout size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Google Ads Intelligence</h2>
                    <p className="text-white/40 text-xs">Accédez à votre compte Google Ads (Customer ID)</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Customer ID</label>
                    <input 
                      type="text"
                      value={settings.googleAdsCustomerId || ''}
                      onChange={(e) => setSettings({...settings, googleAdsCustomerId: e.target.value})}
                      placeholder="123-456-7890"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Developer Token</label>
                    <input 
                      type="password"
                      value={settings.googleAdsDeveloperToken || ''}
                      onChange={(e) => setSettings({...settings, googleAdsDeveloperToken: e.target.value})}
                      placeholder={tokensSet.googleAdsDeveloperToken ? '•••••••• (configuré — laisser vide pour conserver)' : 'Votre Token Développeur...'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Snapchat Ads Integration */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass-card p-6 border-l-4 border-l-yellow-400"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-yellow-400/10 text-yellow-400">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Snapchat Ads Manager</h2>
                    <p className="text-white/40 text-xs">Connectez votre compte Snapchat Business</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Ad Account ID</label>
                    <input 
                      type="text"
                      value={settings.snapAccountId || ''}
                      onChange={(e) => setSettings({...settings, snapAccountId: e.target.value})}
                      placeholder="Ex: d45b-..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">API Access Token</label>
                    <input 
                      type="password"
                      value={settings.snapAdsToken || ''}
                      onChange={(e) => setSettings({...settings, snapAdsToken: e.target.value})}
                      placeholder={tokensSet.snapAdsToken ? '•••••••• (configuré — laisser vide pour conserver)' : 'snap_at_...'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
                    />
                  </div>
                </div>
              </motion.div>
           </div>
        </div>

        {/* Global Tokens & Custom APIs */}
        <div className="space-y-4">
           <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/20 ml-1">Sécurité & Tokens Personnalisés</h3>
           <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                <Key size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Authentification Applicative</h2>
                <p className="text-white/40 text-xs">Gérez vos jetons d'accès et clés de service tiers</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Token API Personnalisé (Webhooks)</label>
                <input 
                  type="password"
                  value={settings.customApiToken || ''}
                  onChange={(e) => setSettings({...settings, customApiToken: e.target.value})}
                  placeholder={tokensSet.customApiToken ? '•••••••• (configuré — laisser vide pour conserver)' : 'Introduisez votre jeton secret...'}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all font-mono"
                />
                <p className="mt-2 text-[10px] text-white/30 italic">Votre token est chiffré et stocké côté serveur. Il n'est jamais réaffiché.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 min-h-[40px]">
            <AnimatePresence mode="wait">
              {isSaved && (
                <motion.div 
                  key="save-success"
                  initial={{ opacity: 0, x: -10, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: 10, filter: 'blur(10px)' }}
                  className="flex items-center gap-2 text-emerald-400 text-sm font-medium"
                >
                  <CheckCircle2 size={16} />
                  <span>Paramètres enregistrés avec succès</span>
                </motion.div>
              )}
              {error && (
                <motion.div 
                  key="save-error"
                  initial={{ opacity: 0, x: -10, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: 10, filter: 'blur(10px)' }}
                  className="flex items-center gap-2 text-red-400 text-sm font-medium"
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={cn(
              "flex items-center gap-2 px-8 py-4 font-bold rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
              isSaved ? "bg-emerald-500/20 text-emerald-400 shadow-none" : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
            )}
          >
            {isSaved ? <CheckCircle2 size={20} /> : <Save size={20} />}
            {isSaved ? "Enregistré" : "Sauvegarder les Paramètres"}
          </button>
        </div>
      </div>
    </div>
  );
}
