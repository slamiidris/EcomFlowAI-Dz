import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, ShoppingBag, Package, DollarSign,
  Camera, Wand2, Radar, Calculator, Bot,
  Clock, Sparkles, X,
  Image as ImageIcon, Video, Layout,
  Download, Copy, Check, ExternalLink,
  Loader2, ChevronDown, ChevronUp,
  MessageSquare, Calendar,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { HistoryItem, getHistory, addToHistory } from '../lib/history';
import { historyApi, dashboardApi, type DashboardSummary } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { generateLandingPageCopy } from '../services/gemini';

function relativeTime(ts: number, t: (key: string, fallback?: string) => string): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('timeJustNow', "à l'instant");
  if (mins < 60) return t('timeMinsAgo', `il y a ${mins}min`);
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('timeHoursAgo', `il y a ${hours}h`);
  const days = Math.floor(hours / 24);
  if (days < 7) return t('timeDaysAgo', `il y a ${days}j`);
  return new Date(ts).toLocaleDateString('fr-FR');
}

// ---- Pipeline Types ----
type PipelineTool = { icon: LucideIcon; label: string; tab: string };
type PipelineStageType = { id: string; name: string; subtitle: string; tools: PipelineTool[] };

// ---- Pipeline Stage Card ----
function PipelineStage({ stage, index }: { stage: PipelineStageType; index: number }) {
  return (
    <div className="surface-card p-4 cursor-pointer hover:bg-dz-hover transition-all group">
      {/* Stage number + dot connector */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-dz-emerald/15 border border-dz-emerald/30 flex items-center justify-center">
          <span className="text-[10px] font-bold text-dz-emerald">{index + 1}</span>
        </div>
        {index < 5 && <div className="flex-1 h-px bg-white/[0.06] hidden lg:block" />}
      </div>

      <h3 className="font-display font-semibold text-[13px] text-white mb-1">{stage.name}</h3>
      <p className="text-[10px] text-white/30 mb-3">{stage.subtitle}</p>

      {/* Tool icons */}
      <div className="flex gap-1.5 flex-wrap">
        {stage.tools.map(tool => (
          <button
            key={tool.tab}
            onClick={(e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('nav-change', { detail: tool.tab }));
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-dz-emerald/30 hover:bg-white/[0.06] transition-all"
          >
            <tool.icon size={11} className="text-white/40 group-hover:text-dz-emerald transition-colors" />
            <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- Activity Row (timeline-style feed item) ----
function ActivityRow({ item, isLast, onOpen, onDelete }: {
  item: HistoryItem;
  isLast: boolean;
  onOpen: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useLanguage();

  const typeConfig = {
    image: { icon: ImageIcon, color: 'text-sky-400', dot: 'bg-sky-400' },
    script: { icon: Video, color: 'text-dz-emerald', dot: 'bg-dz-emerald' },
    landing_page: { icon: Layout, color: 'text-dz-amber', dot: 'bg-dz-amber' },
  };
  const cfg = typeConfig[item.type] || typeConfig.image;

  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center">
        <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', cfg.dot)} />
        {!isLast && <div className="w-px flex-1 bg-white/[0.06] my-1" />}
      </div>
      <div className={cn('flex-1 min-w-0 pb-3', isLast && 'pb-0')}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[12px] text-white/75 font-medium truncate group-hover:text-white transition-colors">{item.title}</p>
          <span className="text-[10px] text-white/25 shrink-0 font-mono">{relativeTime(item.timestamp || Date.now(), t)}</span>
        </div>
        {item.previewText && <p className="text-[10px] text-white/30 truncate mt-0.5">{item.previewText}</p>}
        <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onOpen(item)} className="text-[10px] text-dz-emerald hover:text-dz-gold transition-colors font-semibold">
            {t('dashOpen', 'Ouvrir')}
          </button>
          <button onClick={() => onDelete(item.id)} className="text-[10px] text-white/20 hover:text-rose-400 transition-colors">
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Activity Timeline (right sidebar) ----
function ActivityTimeline({ items, onOpen, onDelete, onClear }: {
  items: HistoryItem[];
  onOpen: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}) {
  const { t } = useLanguage();

  return (
    <section className="surface-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display font-semibold text-[14px] text-white">{t('dashActivityRecent', 'Activité Récente')}</h3>
        <div className="flex-1 h-px bg-white/[0.06]" />
        {items.length > 0 && (
          <button onClick={onClear} className="text-[10px] text-white/25 hover:text-rose-400 transition-colors">
            {t('dashClearHistory', 'Vider')}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-2">
            <Sparkles size={16} className="text-white/15" />
          </div>
          <p className="text-[12px] text-white/35">{t('dashHistoryEmpty', 'Aucune activité')}</p>
          <p className="text-[10px] text-white/20 mt-0.5">{t('dashHistoryEmptyHint', 'Commence par explorer le pipeline')}</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {items.slice(0, 6).map((item, i) => (
            <ActivityRow key={item.id} item={item} isLast={i === Math.min(items.length, 6) - 1} onOpen={onOpen} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}

// ---- Trending Products Widget (top sellers from catalog) ----
function TrendingProductsWidget({ products }: { products: DashboardSummary['topProducts'] }) {
  const { t } = useLanguage();

  return (
    <section className="surface-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display font-semibold text-[14px] text-white">{t('dashTrendingTitle', 'Produits Top')}</h3>
        <div className="flex-1 h-px bg-white/[0.06]" />
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('nav-change', { detail: 'catalog' }))}
          className="text-[10px] text-dz-emerald hover:text-dz-gold transition-colors cursor-pointer"
        >
          {t('dashViewAll', 'Tout voir')} →
        </button>
      </div>

      {products.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-2">
            <ShoppingBag size={16} className="text-white/15" />
          </div>
          <p className="text-[12px] text-white/35">{t('dashNoProducts', 'Aucun produit')}</p>
          <p className="text-[10px] text-white/20 mt-0.5">{t('dashNoProductsHint', 'Ajoute des produits au catalogue')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
              <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
                <ShoppingBag size={14} className="text-dz-emerald" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-white truncate">{product.name}</p>
                <p className="text-[10px] text-white/30">{product.category}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] font-bold text-emerald-400">{product.sales} {t('dashSalesUnit', 'ventes')}</p>
                <p className="text-[10px] text-white/25">{(product.estimatedRevenue / 1000).toFixed(1)}K DA</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ---- History Detail Modal ----
function HistoryDetailModal({ item, onClose, onRestore }: {
  item: HistoryItem;
  onClose: () => void;
  onRestore: (item: HistoryItem) => void;
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const flashCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const headerIcon =
    item.type === 'image'
      ? { icon: ImageIcon, color: 'text-sky-400', bg: 'bg-sky-400/10', label: t('dashImage', 'Image') }
      : item.type === 'script'
        ? { icon: Video, color: 'text-dz-emerald', bg: 'bg-dz-emerald/10', label: t('dashScript', 'Script') }
        : { icon: Layout, color: 'text-dz-amber', bg: 'bg-dz-amber/10', label: t('dashLanding', 'Landing') };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto surface-card rounded-3xl p-6 md:p-8 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brass accent line */}
        <div className="h-0.5 bg-linear-to-r from-dz-gold to-dz-emerald rounded-full mb-6" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/10 transition-all"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pr-10">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', headerIcon.bg)}>
            <headerIcon.icon size={18} className={headerIcon.color} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-semibold text-lg text-white truncate">{(item as any).name || item.title}</h3>
              <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded', headerIcon.bg, headerIcon.color)}>{headerIcon.label}</span>
            </div>
            <p className="text-[11px] text-white/40 flex items-center gap-1 mt-0.5">
              <Clock size={11} />
              {t('dashGenerated', 'Généré')} {relativeTime(item.timestamp, t)}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-6">
          {/* 1. IMAGE TEMPLATE */}
          {item.type === 'image' && (() => {
            const imgData = item.payload;
            const imgSrc = imgData.result || imgData.img || (typeof imgData === 'string' ? imgData : null);

            const downloadImage = () => {
              if (!imgSrc) return;
              const itemTitle = (item as any).name || item.title || 'creation';
              const link = document.createElement('a');
              link.href = imgSrc;
              link.download = `dzads-studio-${itemTitle.replace(/\s+/g, '_')}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            const copyPrompt = () => {
              navigator.clipboard.writeText(imgData.productName || (item as any).name || item.title || '');
              flashCopied();
            };

            return (
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/5 max-h-[420px] flex items-center justify-center p-2">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={(item as any).name || item.title}
                      referrerPolicy="no-referrer"
                      className="max-h-[400px] object-contain rounded-xl shadow-2xl"
                    />
                  ) : (
                    <div className="py-20 text-center text-white/40">{t('dashMissingImage', "Données de l'image manquantes")}</div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.01] border border-white/5 rounded-2xl p-5">
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-dz-emerald uppercase tracking-wider">{t('dashSpecs', 'Spécifications AI')}</h4>
                    <div>
                      <span className="text-[10px] text-white/30 uppercase font-bold">{t('dashProduct', 'Produit')}</span>
                      <p className="text-sm font-semibold text-white">{imgData.productName || (item as any).name || item.title}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/30 uppercase font-bold">{t('dashStyle', 'Style visuel')}</span>
                      <p className="text-sm font-semibold text-white capitalize">{imgData.style || 'Lifestyle'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/30 uppercase font-bold">{t('dashRatio', "Format d'image (Ratio)")}</span>
                      <p className="text-sm font-semibold text-white">{imgData.aspectRatio || '1:1'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end gap-3 md:border-l md:border-white/5 md:pl-6">
                    <button onClick={downloadImage} className="btn-dz-primary">
                      <Download size={14} />
                      <span>{t('dashDownloadImage', "Télécharger l'image")}</span>
                    </button>
                    <button onClick={copyPrompt} className="btn-dz-secondary">
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copied ? t('dashNameCopied', 'Nom Copié !') : t('dashCopyName', 'Copier le Nom')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2. SCRIPT TEMPLATE */}
          {item.type === 'script' && (() => {
            const scriptData = item.payload;
            const actualResult = scriptData.result || scriptData.payload || scriptData;
            const scenes = actualResult.scenes || [];

            const copyScriptText = () => {
              const formatted = `TITLE: ${actualResult.title || (item as any).name || item.title}\n\n` +
                scenes.map((s: any, idx: number) => `SCENE ${idx + 1} (${s.time || '5s'}):\n[VISUEL]: ${s.visual}\n[AUDIO]: ${s.audio}\n`).join("\n");
              navigator.clipboard.writeText(formatted);
              flashCopied();
            };

            return (
              <div className="space-y-6">
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 mb-4 gap-3">
                    <div>
                      <span className="text-[10px] text-dz-emerald font-black uppercase tracking-wider">{t('dashBrief', 'Brief Stratégique')}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{actualResult.title || (item as any).name || item.title}</h4>
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
                      <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">{t('dashAngle', 'Angle Marketing Ciblé')}</span>
                      <p className="text-xs text-white/80 mt-1 leading-relaxed">{scriptData.painPoint || t('dashDefaultAngle', 'Présentation directe des bénéfices produit')}</p>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4">
                      <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">{t('dashVoice', 'Audience & Direction Vocale')}</span>
                      <p className="text-xs text-white/80 mt-1 leading-relaxed font-semibold text-dz-emerald">
                        🗣️ {actualResult.marketingStrategy?.voiceoverTone || t('dashDefaultVoice', 'Ton UGC naturel, chaleureux et persuasif')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scenes Timeline */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">
                    {t('dashScenes', 'Découpage Scénique')} ({scenes.length} {scenes.length !== 1 ? t('dashScenesCount', 'scènes') : t('dashSceneCount', 'scène')})
                  </h4>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {scenes.map((scene: any, idx: number) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex gap-4 items-start hover:border-white/10 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-dz-emerald/10 text-dz-emerald border border-dz-emerald/20 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t('dashScene', 'Scène')} {idx + 1}</span>
                            <span className="text-[10px] font-bold text-dz-emerald bg-dz-emerald/5 border border-dz-emerald/10 px-1.5 py-0.5 rounded-md">{scene.time || "5s"}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            <div>
                              <span className="text-[9px] font-black uppercase text-white/40 tracking-wider">{t('dashVisualInstr', 'Instructions Visuelles')}</span>
                              <p className="text-xs text-white/80 mt-0.5 bg-black/20 p-2 rounded-lg border border-white/5">{scene.visual}</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-black uppercase text-dz-emerald tracking-wider flex items-center gap-1">🗣️ {t('dashAudio', 'Audio / Voix-Off (Darija)')}</span>
                              <p className="text-xs text-white mt-0.5 bg-dz-emerald/5 p-2 rounded-lg border border-dz-emerald/10 font-medium italic">"{scene.audio}"</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex justify-end gap-3 border-t border-white/5">
                  <button onClick={copyScriptText} className="btn-dz-primary">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? t('dashScriptCopied', 'Texte Copié !') : t('dashCopyScript', 'Copier le Script')}</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 3. LANDING PAGE TEMPLATE */}
          {item.type === 'landing_page' && (() => {
            const lpState = item.payload.state;
            const sections = lpState.lpData?.sections || [];

            const copyLandingStructure = () => {
              navigator.clipboard.writeText(JSON.stringify(lpState.lpData, null, 2));
              flashCopied();
            };

            return (
              <div className="space-y-6">
                <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 mb-4 gap-3">
                    <div>
                      <span className="text-[10px] text-dz-amber font-black uppercase tracking-wider">{t('dashLpCopy', 'Copie de Structure Landing Page')}</span>
                      <h4 className="text-base font-bold text-white mt-0.5">{lpState.productName || (item as any).name || item.title}</h4>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/80 capitalize">
                        🎨 {t('dashStyle', 'Style')}: {lpState.designStyle || t('dashModern', 'Moderne')}
                      </span>
                      <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/80 capitalize">
                        💬 {t('dashTone', 'Ton')}: {lpState.tone || t('dashPersuasive', 'Persuasif')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4">
                      <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">{t('dashBrand', 'Marque')}</span>
                      <p className="text-xs text-white/85 mt-1 font-semibold">{lpState.brand || t('dashGeneric', 'Générique')}</p>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4">
                      <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">{t('dashFunnel', "Stratégie d'entonnoir")}</span>
                      <p className="text-xs text-white/85 mt-1 font-semibold capitalize">{lpState.funnelStrategy?.replace(/_/g, ' ') || "AIDA"}</p>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4">
                      <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">{t('dashLanguage', 'Langue de rédaction')}</span>
                      <p className="text-xs text-white/85 mt-1 font-semibold capitalize">{lpState.language === 'ar' ? t('dashArabic', 'Arabe (Darija)') : t('dashFrench', 'Français')}</p>
                    </div>
                  </div>
                </div>

                {/* Sections Blueprint */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">
                    {t('dashLpStructure', 'Structure Rédactionnelle')} ({sections.length} {t('dashSections', 'Sections')})
                  </h4>
                  <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                    {sections.map((section: any, idx: number) => (
                      <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex gap-4 hover:border-white/10 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-dz-amber/10 text-dz-amber border border-dz-amber/20 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t('dashSection', 'Section')} {idx + 1} • {section.sectionType || t('dashContent', 'Contenu')}</span>
                            {section.narrativeRole && (
                              <span className="text-[9px] font-bold text-dz-amber bg-dz-amber/5 border border-dz-amber/10 px-2 py-0.5 rounded-full capitalize">{section.narrativeRole}</span>
                            )}
                          </div>
                          <div className="space-y-1.5 pt-1">
                            <h5 className="text-xs font-bold text-white leading-relaxed">{section.headline || section.title || t('dashSectionTitle', 'Titre de section')}</h5>
                            {section.subheadline && (
                              <p className="text-[11px] text-white/50">{section.subheadline}</p>
                            )}
                            {section.bulletPoints && Array.isArray(section.bulletPoints) && section.bulletPoints.length > 0 && (
                              <ul className="text-xs space-y-1 pt-1.5 pl-1">
                                {section.bulletPoints.map((bp: string, bIdx: number) => (
                                  <li key={bIdx} className="text-white/70 flex items-start gap-1.5 leading-relaxed">
                                    <span className="text-dz-amber select-none">•</span>
                                    <span>{bp}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {section.ctaText && (
                              <div className="pt-2">
                                <span className="text-[9px] bg-dz-amber/10 text-dz-amber px-2.5 py-1 rounded-md border border-dz-amber/15 font-bold uppercase tracking-wider">
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
                  <button onClick={copyLandingStructure} className="btn-dz-primary">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? t('dashStructureCopied', 'Structure Copiée !') : t('dashCopyStructure', 'Copier la Structure JSON')}</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-6 border-t border-white/5 flex justify-end gap-3">
          <button onClick={() => { onRestore(item); onClose(); }} className="btn-dz-secondary">
            <ExternalLink size={14} />
            <span>{t('dashOpenInGenerator', 'Ouvrir dans le générateur')}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- Quick Landing Page Generator ----
function QuickLpGenerator({ onOpenInEditor }: { onOpenInEditor: (lpData: any, title: string) => void }) {
  const { t } = useLanguage();
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!productName.trim()) return;
    setGenerating(true);
    setError('');
    setResult(null);
    try {
      const data = await generateLandingPageCopy({
        name: productName.trim(),
        description: description.trim() || `Produit e-commerce: ${productName.trim()}`,
        targetAudience: 'Consommateurs algériens',
        targetMarket: 'Algérie',
        language: 'Français',
        funnelStrategy: 'AIDA',
        numSections: 6,
        tone: 'Professionnel et convaincant',
        pageType: 'COD',
        colorPalette: ['#d4a44c', '#08080a', '#f4f4f5'],
      });
      setResult(data);
      // Save to history
      addToHistory('landing_page', `LP: ${productName}`, { state: { lpData: data } }, `Structure: ${data.sections?.length || 0} sections`);
      historyApi.create({ type: 'landing_page', title: `LP: ${productName}`, payload: { state: { lpData: data } }, previewText: `${data.sections?.length || 0} sections générées` }).catch(() => {});
    } catch (err: any) {
      setError(err.message || t('dashLpError', 'Erreur lors de la génération.'));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="surface-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-dz-emerald/10 border border-dz-emerald/20 flex items-center justify-center">
            <Wand2 size={16} className="text-dz-emerald" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-[15px] text-white">{t('dashLpTitle', 'Générateur de Landing Page IA')}</h2>
            <p className="text-[11px] text-white/30">{t('dashLpSubtitle', 'Décris ton produit — l\'IA génère la structure complète')}</p>
          </div>
        </div>
        {result && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/60 transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? t('dashLpCollapse', 'Masquer') : t('dashLpExpand', 'Voir le résultat')}
          </button>
        )}
      </div>

      {/* Input Form */}
      <div className="space-y-3">
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-white/40 mb-1.5">
            {t('dashLpProductName', 'Nom du produit')}
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder={t('dashLpProductNamePh', 'Ex: Smart Watch Ultra 2, Hachoir Manuel 3 Lames...')}
            className="input-dz text-sm"
            disabled={generating}
          />
        </div>
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-white/40 mb-1.5">
            {t('dashLpDescription', 'Description (optionnel)')}
          </label>
          <textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('dashLpDescriptionPh', 'Décris le produit, ses avantages, ton cible...')}
            rows={2}
            className="input-dz text-sm resize-none"
            disabled={generating}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[12px] text-rose-300">
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!productName.trim() || generating}
          className="btn-dz-primary w-full disabled:opacity-50 disabled:pointer-events-none"
        >
          {generating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t('dashLpGenerating', 'Génération en cours...')}
            </>
          ) : (
            <>
              <Wand2 size={16} />
              {t('dashLpGenerate', 'Générer la Landing Page')}
            </>
          )}
        </button>
      </div>

      {/* Result Preview */}
      <AnimatePresence>
        {result && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-5 pt-5 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-sm text-white">
                  {result.title || t('dashLpResult', 'Structure générée')}
                </h3>
                <span className="text-[10px] font-mono text-white/30">
                  {result.sections?.length || 0} {t('dashLpSections', 'sections')}
                </span>
              </div>

              {/* Sections list */}
              <div className="space-y-2 mb-4">
                {result.sections?.slice(0, 6).map((section: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="w-6 h-6 rounded-md bg-dz-emerald/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-dz-emerald">{i + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-white truncate">{section.step || section.title}</p>
                      <p className="text-[11px] text-white/35 truncate mt-0.5">{section.title || section.narrativeRole}</p>
                      {section.cta?.variations?.[0] && (
                        <p className="text-[10px] text-dz-emerald/60 mt-1 truncate">CTA: "{section.cta.variations[0].text}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Color palette */}
              {result.colorPalette?.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-mono text-white/30">{t('dashLpPalette', 'Palette')}:</span>
                  <div className="flex gap-1">
                    {result.colorPalette.map((color: string, i: number) => (
                      <div key={i} className="w-5 h-5 rounded-md border border-white/10" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onOpenInEditor(result, `LP: ${productName}`)}
                  className="btn-dz-primary flex-1 text-sm"
                >
                  <ExternalLink size={14} />
                  {t('dashLpOpenEditor', 'Ouvrir dans l\'éditeur')}
                </button>
                <button
                  onClick={() => {
                    const json = JSON.stringify(result, null, 2);
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `DzAds_LP_${productName.replace(/\s+/g, '_')}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="btn-dz-secondary px-4"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ---- Dashboard Home ----
export default function DashboardHome() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [dashData, setDashData] = useState<DashboardSummary | null>(null);

  // Load dashboard KPIs from the product catalog API on mount.
  useEffect(() => {
    dashboardApi.summary().then(setDashData).catch(() => {});
  }, []);

  // Load history from the API on mount (localStorage fallback) and listen for updates.
  useEffect(() => {
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
        if (!cancelled) setHistoryItems(getHistory());
      }
    };

    const handleHistoryUpdate = (e: any) => {
      if (e.detail) setHistoryItems(e.detail);
    };

    window.addEventListener('dzads_history_updated', handleHistoryUpdate);
    loadHistory();

    return () => {
      cancelled = true;
      window.removeEventListener('dzads_history_updated', handleHistoryUpdate);
    };
  }, []);

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
    if (window.confirm(t('dashClearConfirm', "Êtes-vous sûr de vouloir vider tout votre historique de génération ?"))) {
      setHistoryItems([]);
      historyApi.clear().catch(() => {});
    }
  };

  const handleOpenItem = (item: HistoryItem) => setSelectedItem(item);

  const handleOpenInGenerator = (item: HistoryItem) => {
    handleRestoreItem(item);
    setSelectedItem(null);
  };

  const handleOpenLpInEditor = (lpData: any, title: string) => {
    // Save to LP sessions and navigate to the full editor
    const sessionId = `lp_${Date.now()}`;
    const session = { id: sessionId, title, updatedAt: Date.now(), state: { lpData } };
    const sessions = JSON.parse(localStorage.getItem('dzads_lp_sessions') || '[]');
    sessions.push(session);
    localStorage.setItem('dzads_lp_sessions', JSON.stringify(sessions));
    localStorage.setItem('dzads_lp_last_active_id', sessionId);
    window.dispatchEvent(new CustomEvent('nav-change', { detail: 'landing' }));
  };

  const kpis = dashData ? [
    {
      label: t('dashKpiProducts', 'Produits'),
      value: String(dashData.totalProducts),
      change: String(dashData.activeProducts),
      changeLabel: t('dashKpiActive', 'actifs'),
      icon: ShoppingBag,
    },
    {
      label: t('dashKpiSales', 'Ventes Totales'),
      value: String(dashData.totalSales),
      change: dashData.stockAlertCount > 0 ? `${dashData.stockAlertCount}` : '✓',
      changeLabel: dashData.stockAlertCount > 0 ? t('dashKpiStockAlert', 'alertes stock') : t('dashKpiStockOk', 'stock OK'),
      icon: TrendingUp,
    },
    {
      label: t('dashKpiRevenue', 'Revenus Estimés'),
      value: `${Math.round(dashData.estimatedRevenue / 1000)}K DA`,
      change: `${Math.round(dashData.avgConfRate * 100)}%`,
      changeLabel: t('dashKpiConfRate', 'taux confirmation'),
      icon: DollarSign,
    },
    {
      label: t('dashKpiDelivery', 'Taux Livraison'),
      value: `${Math.round(dashData.avgDelivRate * 100)}%`,
      change: dashData.lowStockProducts.length > 0 ? `${dashData.lowStockProducts.length}` : '✓',
      changeLabel: dashData.lowStockProducts.length > 0 ? t('dashKpiLowStock', 'ruptures') : t('dashKpiStockOk', 'stock OK'),
      icon: Package,
    },
  ] : [
    // Fallback while loading
    { label: t('dashKpiProducts', 'Produits'), value: '...', change: '', changeLabel: t('dashKpiLoading', 'chargement'), icon: ShoppingBag },
    { label: t('dashKpiSales', 'Ventes Totales'), value: '...', change: '', changeLabel: t('dashKpiLoading', 'chargement'), icon: TrendingUp },
    { label: t('dashKpiRevenue', 'Revenus Estimés'), value: '...', change: '', changeLabel: t('dashKpiLoading', 'chargement'), icon: DollarSign },
    { label: t('dashKpiDelivery', 'Taux Livraison'), value: '...', change: '', changeLabel: t('dashKpiLoading', 'chargement'), icon: Package },
  ];

  const pipelineStages: PipelineStageType[] = [
    {
      id: 'find',
      name: t('dashStageFind', 'Trouver'),
      subtitle: t('dashStageFindSub', 'Produits tendance'),
      tools: [
        { icon: Radar, label: t('dashToolScout', 'Scout'), tab: 'scout' },
        { icon: TrendingUp, label: t('dashToolTrends', 'Tendances'), tab: 'trends' },
        { icon: ShoppingBag, label: t('dashToolCatalog', 'Catalogue'), tab: 'catalog' },
      ],
    },
    {
      id: 'analyze',
      name: t('dashStageAnalyze', 'Analyser'),
      subtitle: t('dashStageAnalyzeSub', 'Validation IA'),
      tools: [
        { icon: Bot, label: t('dashToolConsultant', 'Consultant'), tab: 'analyzer' },
      ],
    },
    {
      id: 'create',
      name: t('dashStageCreate', 'Créer'),
      subtitle: t('dashStageCreateSub', 'Contenu & visuels'),
      tools: [
        { icon: Camera, label: t('dashToolPhotos', 'Photos'), tab: 'images' },
        { icon: Video, label: t('dashToolVideo', 'Vidéo'), tab: 'video' },
        { icon: MessageSquare, label: t('dashToolDarja', 'Darja'), tab: 'darja' },
      ],
    },
    {
      id: 'build',
      name: t('dashStageBuild', 'Construire'),
      subtitle: t('dashStageBuildSub', 'Landing pages'),
      tools: [
        { icon: Wand2, label: t('dashToolLpGen', 'LP Generator'), tab: 'landing' },
        { icon: Layout, label: t('dashToolAssembler', 'Assembleur'), tab: 'assembler' },
      ],
    },
    {
      id: 'calculate',
      name: t('dashStageCalc', 'Calculer'),
      subtitle: t('dashStageCalcSub', 'Marges & profit'),
      tools: [
        { icon: Calculator, label: t('dashToolMarge', 'Marge COD'), tab: 'calculator' },
      ],
    },
    {
      id: 'launch',
      name: t('dashStageLaunch', 'Lancer'),
      subtitle: t('dashStageLaunchSub', 'Planification'),
      tools: [
        { icon: Calendar, label: t('dashToolCalendar', 'Calendrier'), tab: 'calendar' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-[-0.02em]">
            {t('dashGreeting', 'Salam,')} {user?.name?.split(' ')[0] || 'Ahmed'} 👋
          </h1>
          <p className="text-[13px] text-white/40 mt-0.5">{t('dashSubtitle', "Ton business de dropshipping en un coup d'œil")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 text-[11px] font-mono text-white/40">
            <span className="w-1.5 h-1.5 rounded-full bg-dz-emerald animate-pulse" />
            {t('dashMarketLive', 'Marché DZ : Live')}
          </span>
        </div>
      </div>

      {/* 2. Business Health Bar */}
      <div className="surface-card p-4 flex items-center justify-between gap-4 flex-wrap">
        {kpis.map(kpi => (
          <div key={kpi.label} className="flex items-center gap-3 min-w-[140px]">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
              <kpi.icon size={14} className="text-dz-emerald" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-white/35 uppercase">{kpi.label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-lg font-bold text-white">{kpi.value}</span>
                <span className="text-[10px] font-bold text-emerald-400">{kpi.change}</span>
                {kpi.changeLabel && <span className="text-[9px] text-white/25">{kpi.changeLabel}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. The Pipeline */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-display font-semibold text-[15px] text-white">{t('dashPipelineTitle', 'Pipeline Dropshipping')}</h2>
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[10px] font-mono text-white/25">{t('dashPipelineStages', '6 étapes')}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipelineStages.map((stage, i) => (
            <PipelineStage key={stage.id} stage={stage} index={i} />
          ))}
        </div>
      </section>

      {/* 4. Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* LEFT */}
        <div className="space-y-6 min-w-0">
          <QuickLpGenerator onOpenInEditor={handleOpenLpInEditor} />
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <ActivityTimeline
            items={historyItems}
            onOpen={handleOpenItem}
            onDelete={handleDeleteItem}
            onClear={handleClearHistory}
          />
          <TrendingProductsWidget products={dashData?.topProducts || []} />
        </div>
      </div>

      {/* History Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <HistoryDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onRestore={handleOpenInGenerator}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
