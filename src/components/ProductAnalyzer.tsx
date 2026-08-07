import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Loader2, Sparkles, Image as ImageIcon, X, TrendingUp, BarChart3, Scale, Layout, Megaphone, Video, Banknote, Search, Link as LinkIcon, FileText, Copy, Check, ChevronDown, ChevronUp, Download, History, Plus, Trash2, Archive, ChevronRight, Target, Camera, Settings, ArrowLeftRight, ShieldCheck, ShoppingBag, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createExpertChat, analyzeMarket, compareWithCompetitor, generateLandingPageCopy, generateDarjaAds, generateVideoAdScript, generatePricingStrategy, generateProductPageOptimizations, analyzeProductFromImage } from '../services/gemini';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

interface BriefVisual {
  step?: string;
  type?: string;
  dimensions?: string;
  objective?: string;
  title?: string;
  badges?: string[];
  prompt: string;
  negativePrompt?: string;
  narrativeRole?: string;
  marketingAngle?: string;
  mood?: string;
  background?: string;
  composition?: string;
  hookType?: string;
  params?: string;
  colorPalette?: string[] | { primary: string; secondary: string; background: string };
  cta?: string | { text: string; subtext?: string };
  textOverlay?: {
    headline: string;
    subtext: string;
    position: string;
    style: string;
    hook?: string;
  };
  personnage?: {
    description: string;
    expression: string;
    tenue: string;
    pose: string;
  };
  marketingContext?: {
    usp: string;
    painPoint: string;
    emotion: string;
    audience: string;
    message: string;
  };
  designerNotes?: string;
  darijaText?: string;
}

interface PricingTier {
  label: string;
  amount: string;
  psychology: string;
  profitMargin: string;
}

interface BundlingStrategy {
  offerName: string;
  composition: string;
  price: string;
  savings: string;
}

interface UpsellingTactic {
  product: string;
  price: string;
  pitch: string;
}

interface ConversionTactic {
  lever: string;
  description: string;
}

interface MarketingBriefData {
  title: string;
  platform?: string;
  productName: string;
  category?: string;
  visuals?: BriefVisual[];
  sections?: any[];
  scenes?: any[];
  pricingTiers?: PricingTier[];
  bundlingStrategies?: BundlingStrategy[];
  upsellingTactics?: UpsellingTactic[];
  conversionTactics?: ConversionTactic[];
  generalNotes: string;
}

function MarketingBrief({ data }: { data: MarketingBriefData }) {
  const [copiedAll, setCopiedAll] = useState(false);

  const copyMarkdown = () => {
    let md = `# ${data.title}\n\n`;
    md += `**Produit:** ${data.productName}\n`;
    if (data.category) md += `**Catégorie:** ${data.category}\n`;
    md += `\n`;
    
    if (data.pricingTiers) {
      md += `## Tarification\n`;
      data.pricingTiers.forEach(t => {
        md += `### ${t.label}: ${t.amount}\n`;
        md += `* **Psychologie:** ${t.psychology}\n`;
        md += `* **Marge:** ${t.profitMargin}\n\n`;
      });
    }

    if (data.bundlingStrategies) {
      md += `## Offres de Pack\n`;
      data.bundlingStrategies.forEach(b => {
        md += `### ${b.offerName}: ${b.price}\n`;
        md += `* **Composition:** ${b.composition}\n`;
        md += `* **Économie:** ${b.savings}\n\n`;
      });
    }
    
    if (data.visuals) {
      md += `## Stratégie Visuelle (Prompts Ads)\n\n`;
      data.visuals.forEach((v, i) => {
        md += `### AD VARIANT #${i + 1}: ${v.step || v.title || 'Visuel'}\n`;
        md += `- **Rôle narratif:** ✅ ${v.narrativeRole || 'N/A'}\n`;
        md += `- **Dimensions:** ${v.dimensions || '1080x1350'}\n`;
        md += `- **Mood / Ambiance:** ${v.mood || 'N/A'}\n`;
        md += `- **Fond:** ${v.background || 'N/A'}\n`;
        md += `- **Composition:** ${v.composition || 'N/A'}\n`;
        md += `- **Angle marketing:** ${v.marketingAngle || 'N/A'}\n`;
        md += `- **Hook type:** ${v.hookType || 'N/A'}\n`;
        md += `> ⚠️ **MODE : image_to_image**\n`;
        md += `> 📦 **Input image :** L'objet/produit depuis l'image en pièce jointe\n`;
        md += `> 💡 Intègre le produit réel dans cette scène. Ombres de contact et reflets naturels.\n\n`;
        
        md += `**Prompt (Image Generator) :**\n`;
        md += `{\n`;
        md += `  "mode": "image_to_image",\n`;
        md += `  "input_image": "the object from the attached image"\n`;
        md += `}\n\n`;
        
        md += `${v.prompt}\n\n`;

        if (v.marketingContext) {
          md += `[MARKETING CONTEXT]\n`;
          md += `USP: ${v.marketingContext.usp}\n`;
          md += `Pain Point: ${v.marketingContext.painPoint}\n`;
          md += `Emotion: ${v.marketingContext.emotion}\n`;
          md += `Audience: ${v.marketingContext.audience}\n`;
          md += `Message: ${v.marketingContext.message}\n`;
          md += `[/MARKETING CONTEXT]\n\n`;
        }

        md += `**Negative:** ${v.negativePrompt || 'no plastic skin, no blurry text, no AI artifacts'}\n`;
        md += `**Params:** ${v.params || `dimensions: ${v.dimensions} | style: ${v.mood} | background: ${v.background}`}\n\n`;

        if (v.textOverlay) {
          md += `**📝 Text Overlay 🇫🇷 :**\n`;
          md += `- Headline: "${v.textOverlay.headline}"\n`;
          md += `- Subtext: "${v.textOverlay.subtext}"\n`;
          md += `- Position: ${v.textOverlay.position}\n`;
          md += `- Style: ${v.textOverlay.style}\n`;
          md += `- Hook: ${v.textOverlay.hook || v.hookType || 'N/A'}\n`;
          md += `- ⚡ Lisible en 0.3s sur mobile — bold, high contrast\n\n`;
        }

        if (v.personnage) {
          md += `**👤 Personnage :**\n`;
          md += `- ${v.personnage.description}\n`;
          md += `- Expression: ${v.personnage.expression}\n`;
          md += `- Tenue: ${v.personnage.tenue}\n`;
          md += `- Pose: ${v.personnage.pose}\n\n`;
        }

        if (v.designerNotes) {
          md += `> 💡 Notes designer : ${v.designerNotes}\n\n`;
        }

        md += `✅ **ACTION :** Génère ce visuel publicitaire.\n`;
        md += `🔄 **Montre-moi le résultat pour validation.**\n\n`;
        md += `---\n\n`;
      });
    }
    if (data.sections) {
      md += `## Structure de Vente (Landing Page)\n\n`;
      data.sections.forEach((s, i) => {
        md += `### SECTION #${i + 1}: ${s.step || s.title || 'Étape'}\n`;
        md += `- **Angle Marketing:** 🎯 ${s.marketingAngle || 'N/A'}\n`;
        md += `- **Ambiance / Mood:** ${s.mood || 'N/A'}\n`;
        md += `- **Composition Layout:** ${s.composition || 'N/A'}\n`;
        
        if (typeof s.colorPalette === 'object' && !Array.isArray(s.colorPalette)) {
            md += `- **Palette de couleurs:** Primaire: ${s.colorPalette.primary} | Secondaire: ${s.colorPalette.secondary} | Fond: ${s.colorPalette.background}\n`;
        }
        
        md += `\n### 📝 Contenu de la Section\n`;
        md += `**Titre:** ${s.title}\n`;
        md += `**Texte:** ${s.content}\n\n`;

        if (s.comparisonTable && Array.isArray(s.comparisonTable)) {
          md += `#### 📊 Tableau Comparatif\n`;
          md += `| Caractéristique | Notre Produit | Concurrence |\n`;
          md += `| :--- | :---: | :---: |\n`;
          s.comparisonTable.forEach((row: any) => {
            md += `| ${row.feature} | ${row.product} | ${row.competitor} |\n`;
          });
          md += `\n`;
        }

        if (s.guaranteeDetails) {
          md += `#### 🛡️ Garantie / Réassurance\n`;
          md += `**${s.guaranteeDetails.title}**\n`;
          md += `${s.guaranteeDetails.description}\n\n`;
        }
        
        md += `**CTA (Appel à l'action):** ${typeof s.cta === 'string' ? s.cta : s.cta?.text || 'N/A'}\n`;
        const rassurance = (typeof s.cta === 'object' && s.cta?.subtext) ? s.cta.subtext : "✅ Paiement à la livraison | 📦 Livraison 58 Wilayas";
        md += `*Rassurance: ${rassurance}*\n\n`;
        
        md += `> 📦 **Brief Visuel IA :**\n`;
        md += `> Prompt technique en anglais pour cette section :\n`;
        md += `> "${s.prompt}"\n`;
        if (s.negativePrompt) md += `> *Negative: ${s.negativePrompt}*\n`;
        md += `\n`;

        if (s.badges) {
            md += `**Badges de confiance:** ${s.badges.join(' | ')}\n`;
        }
        
        md += `\n---\n\n`;
      });
    }
    navigator.clipboard.writeText(md);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const getIcon = () => {
    if (data.pricingTiers) return <Banknote className="w-5 h-5 text-white" />;
    if (data.scenes) return <Video className="w-5 h-5 text-white" />;
    return <Layout className="w-5 h-5 text-white" />;
  };

  const getColor = () => {
    if (data.pricingTiers) return "bg-emerald-500";
    if (data.scenes) return "bg-purple-500";
    return "bg-orange-500";
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl text-gray-900 message-brief">
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", getColor())}>
             {getIcon()}
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-none mb-1">{data.title}</h3>
            <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 bg-gray-900 text-white rounded text-[10px] font-bold truncate max-w-[150px]">
                 {data.productName}
               </span>
               {data.category && (
                 <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold border border-indigo-200">
                   {data.category}
                 </span>
               )}
               <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px] font-bold">
                 {data.pricingTiers ? "Stratégie Prix" : 
                  data.scenes ? `${data.scenes.length} Scènes Vidéo` :
                  `${data.visuals?.length || 0} Visuels ${data.sections ? `• ${data.sections.length} Sections` : ''}`}
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
           <button 
             onClick={copyMarkdown}
             className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-indigo-200 rounded-lg text-[10px] font-bold text-gray-600 transition-all shadow-sm whitespace-nowrap"
           >
             {copiedAll ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
             {copiedAll ? "Copié !" : "Copier MD"}
           </button>
           <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:border-indigo-200 rounded-lg text-[10px] font-bold text-gray-600 transition-all shadow-sm whitespace-nowrap">
             <Download size={12} />
             PDF
           </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4 bg-[#f8f9fa] max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {data.pricingTiers && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.pricingTiers.map((tier, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-emerald-500 mb-1">{tier.label}</p>
                  <p className="text-2xl font-black text-gray-900 mb-1">{tier.amount} <span className="text-xs">DA</span></p>
                  <p className="text-xs text-gray-600 leading-relaxed italic">{tier.psychology}</p>
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400">MARGE EST.</span>
                    <span className="text-[10px] font-bold text-emerald-600">{tier.profitMargin}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
                 <TrendingUp size={14} className="text-indigo-500" />
                 <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Offres de Bundling (Packs)</h4>
               </div>
               <div className="p-4 space-y-3">
                 {data.bundlingStrategies?.map((bundle, i) => (
                   <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                     <div className="min-w-0">
                       <p className="font-bold text-gray-900 text-sm whitespace-nowrap">{bundle.offerName}</p>
                       <p className="text-[10px] text-gray-500 truncate">{bundle.composition}</p>
                     </div>
                     <div className="text-right shrink-0">
                       <p className="font-black text-emerald-600 text-sm">{bundle.price} DA</p>
                       <p className="text-[9px] font-bold text-red-500">ÉCO: {bundle.savings}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-3 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
                 <Sparkles size={14} className="text-orange-500" />
                 <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider">Tactiques d'Upselling</h4>
               </div>
               <div className="p-4 grid grid-cols-1 gap-3">
                 {data.upsellingTactics?.map((tactic, i) => (
                   <div key={i} className="p-3 rounded-xl bg-white border border-orange-100 shadow-sm flex flex-col gap-1">
                     <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-900 text-xs">{tactic.product}</p>
                        <p className="font-bold text-orange-600 text-xs">+{tactic.price} DA</p>
                     </div>
                     <p className="text-[10px] text-gray-500 italic leading-snug">{tactic.pitch}</p>
                   </div>
                 ))}
               </div>
            </div>

            <div className="bg-indigo-900 rounded-2xl p-4 text-white shadow-xl">
               <div className="flex items-center gap-2 mb-3">
                 <BarChart3 size={16} className="text-indigo-400" />
                 <h4 className="text-xs font-bold uppercase tracking-wider">Tactiques de Conversion DZ</h4>
               </div>
               <div className="space-y-3">
                 {data.conversionTactics?.map((tactic, i) => (
                   <div key={i} className="flex items-start gap-2">
                     <div className="mt-1 w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                     <div className="min-w-0">
                       <p className="text-[11px] font-bold text-indigo-200 uppercase tracking-tighter">{tactic.lever}</p>
                       <p className="text-xs text-gray-300 leading-normal">{tactic.description}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {data.visuals && data.visuals.map((visual, i) => (
          <BriefVisualCardUI key={i} visual={visual} index={i} />
        ))}
        
        {data.sections && data.sections.map((section, i) => (
          <BriefSectionCardUI key={i} section={section} />
        ))}

        {data.scenes && data.scenes.map((scene: any, i: number) => (
          <BriefVideoScriptCardUI key={i} scene={scene} index={i} />
        ))}
        
        <div className="p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
          <p className="text-xs text-gray-500 italic flex items-start gap-4">
            <Bot size={18} className="mt-0.5 shrink-0 text-indigo-400" />
            <span className="leading-relaxed">{data.generalNotes}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function BriefSectionCardUI({ section }: { section: any }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const getFullSectionBrief = () => {
    let md = `### 📜 SECTION : ${section.title}\n`;
    md += `- **Angle Marketing:** 🎯 ${section.marketingAngle || 'N/A'}\n`;
    md += `- **Rôle narratif:** ${section.narrativeRole || 'N/A'}\n`;
    md += `- **Composition:** ${section.composition || 'N/A'}\n\n`;
    
    md += `**📝 CONTENU :**\n`;
    md += `${section.content}\n\n`;
    
    const ctaText = typeof section.cta === 'string' ? section.cta : section.cta?.text || 'N/A';
    const ctaSubtext = typeof section.cta === 'object' && section.cta?.subtext ? section.cta.subtext : "Paiement à la livraison | Livraison 58 Wilayas";
    
    md += `**🔘 CTA (Bouton) :**\n`;
    md += `- Texte: "${ctaText}"\n`;
    md += `- Subtext/Rassurance: "${ctaSubtext}"\n`;
    md += `- *Note: Toujours inclure 58 Wilayas et COD*\n\n`;
    
    md += `**🖼️ BRIEF VISUEL :**\n`;
    md += `"${section.prompt}"\n`;
    if (section.negativePrompt) md += `*Negative:* ${section.negativePrompt}\n`;
    
    return md;
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(getFullSectionBrief());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="p-5 flex items-center justify-between gap-4 bg-gray-50/80 border-b border-gray-100">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
             <Layout className="text-white w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-1 bg-gray-900 text-[10px] font-black text-white rounded-lg tracking-wider shadow-sm uppercase">{section.step?.split('—').pop()?.trim() || section.type || 'Section'}</span>
              <span className="px-2.5 py-1 bg-white text-indigo-600 border border-indigo-200 rounded-lg text-[10px] font-black uppercase tracking-tight shadow-sm">
                {section.narrativeRole || section.objective}
              </span>
              {section.badges?.map((badge: string, i: number) => (
                <span key={i} className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm",
                  badge === 'HOOK' ? "bg-orange-100 text-orange-600 border border-orange-200" :
                  badge === 'BENEFIT' ? "bg-emerald-100 text-emerald-600 border border-emerald-200" :
                  badge === 'TRUST' || badge === 'COD_VERIFIED' ? "bg-blue-100 text-blue-600 border border-blue-200" :
                  badge === '58_WILAYAS' ? "bg-purple-100 text-purple-600 border border-purple-200" :
                  badge === 'URGENCY' ? "bg-red-100 text-red-600 border border-red-200" :
                  "bg-indigo-100 text-indigo-600 border border-indigo-200"
                )}>
                  {badge.replace('_', ' ')}
                </span>
              ))}
            </div>
            <h4 className="text-gray-900 font-black text-lg truncate tracking-tight">{section.title}</h4>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={copyPrompt}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black transition-all shadow-xl active:scale-95 whitespace-nowrap"
          >
            {copied ? <Check size={16} /> : <FileText size={16} />}
            {copied ? "Copié !" : "Copier Brief"}
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2.5 bg-white border border-gray-100 hover:bg-gray-50 rounded-2xl text-gray-400 transition-all shadow-sm"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white"
          >
            <div className="p-6 space-y-8">
              {/* Core Attributes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {section.composition && (
                    <div className="group p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-200/40">
                       <p className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest">Composition du Layout</p>
                       <p className="text-sm text-gray-900 font-black">{section.composition}</p>
                    </div>
                 )}
                 {section.colorPalette && (
                    <div className="group p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-200/40">
                       <p className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest">Palette de Couleurs</p>
                       <div className="flex gap-2">
                          {typeof section.colorPalette === 'object' && !Array.isArray(section.colorPalette) ? (
                            <>
                              <div className="w-6 h-6 rounded-lg border-2 border-white shadow-md" style={{ backgroundColor: section.colorPalette.primary }} title="Primaire" />
                              <div className="w-6 h-6 rounded-lg border-2 border-white shadow-md" style={{ backgroundColor: section.colorPalette.secondary }} title="Secondaire" />
                              <div className="w-6 h-6 rounded-lg border-2 border-white shadow-md" style={{ backgroundColor: section.colorPalette.background }} title="Fond" />
                            </>
                          ) : Array.isArray(section.colorPalette) ? (
                            section.colorPalette.map((c: string, i: number) => (
                              <div key={i} className="w-6 h-6 rounded-lg border-2 border-white shadow-md" style={{ backgroundColor: c }} />
                            ))
                          ) : null}
                       </div>
                    </div>
                 )}
              </div>

              {/* Marketing Angle Hero Section */}
              {section.marketingAngle && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-600 rounded-[2rem] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" />
                  <div className="p-6 border border-blue-100/50 rounded-[2rem] relative z-10 flex gap-5 items-start">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 shrink-0">
                      <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase font-black text-blue-400 mb-2 tracking-widest">Angle Marketing Stratégique</p>
                      <p className="text-sm text-gray-900 font-bold leading-relaxed">{section.marketingAngle}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Content */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40" />
                  <p className="text-[11px] uppercase font-black text-gray-900 tracking-widest">Contenu Suggéré (Textes)</p>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed font-semibold bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-inner">
                   <div className="markdown-body">
                     <Markdown>{section.content}</Markdown>
                   </div>
                </div>

                {/* Comparison Table */}
                {section.comparisonTable && section.comparisonTable.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 px-2">
                       <ArrowLeftRight size={14} className="text-indigo-500" />
                       <p className="text-[11px] uppercase font-black text-gray-900 tracking-widest">Tableau Comparatif (Supériorité)</p>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                      <table className="w-full text-xs text-right" dir="rtl">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="p-3 font-black text-gray-400 uppercase tracking-tighter text-right">Caractéristique</th>
                            <th className="p-3 font-black text-indigo-600 uppercase tracking-tighter text-center">Notre Produit</th>
                            <th className="p-3 font-black text-gray-400 uppercase tracking-tighter text-center">Concurrence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {section.comparisonTable.map((row: any, ridx: number) => (
                            <tr key={ridx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-3 font-bold text-gray-800 font-arabic">{row.feature}</td>
                              <td className="p-3 text-center text-indigo-600 font-bold font-arabic">{row.product}</td>
                              <td className="p-3 text-center text-gray-400 font-arabic">{row.competitor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Guarantee Details */}
                {section.guaranteeDetails && (
                  <div className="mt-6 p-5 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-start gap-4">
                    <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm shrink-0">
                      <ShieldCheck size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-gray-900 font-arabic text-right" dir="rtl">{section.guaranteeDetails.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed font-arabic text-right" dir="rtl">{section.guaranteeDetails.description}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Premium CTA Section */}
              {section.cta && (
                <div className="shadow-xl shadow-indigo-900/5 rounded-[2.5rem] overflow-hidden border border-indigo-100">
                   <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <Megaphone size={18} className="text-indigo-200" />
                       <h5 className="text-[11px] font-black uppercase tracking-widest">Appel à l'Action (CTA Landing)</h5>
                     </div>
                     <span className="text-[10px] font-black px-3 py-1 bg-white/20 rounded-full border border-white/20">HIGH CONVERSION</span>
                   </div>
                   <div className="p-6 bg-white space-y-6">
                     <button className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-500/30 text-lg flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform">
                       <span>{typeof section.cta === 'string' ? section.cta : section.cta.text}</span>
                     </button>
                     
                     <div className="flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm">
                           <Check size={14} className="text-emerald-600" />
                           <span className="text-xs font-black uppercase tracking-tight">
                             {typeof section.cta === 'object' && section.cta.subtext ? section.cta.subtext : "Paiement à la livraison | Livraison 58 Wilayas"}
                           </span>
                        </div>
                        <p className="mt-3 text-[10px] text-gray-400 font-black uppercase tracking-widest">Vérification du colis à la réception garantie ✅</p>
                     </div>
                   </div>
                </div>
              )}

              {/* Technical Code Editor Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
                    <p className="text-[11px] uppercase font-black text-gray-900 tracking-widest">Technical Preview Brief (AI Engine)</p>
                  </div>
                </div>
                
                <div className="relative group shadow-2xl shadow-indigo-900/10">
                  <div className="p-6 bg-gray-900 rounded-[2rem] font-mono text-xs leading-relaxed relative overflow-hidden border border-gray-800">
                    <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/5 opacity-60">
                       <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                       </div>
                       <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black ml-auto">Visual Brief v2.0</span>
                    </div>
                    
                    <div className="space-y-5 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-4 custom-code-scroll">
                       <div className="text-indigo-300 font-bold mb-2">/* SECTION PROMPT */</div>
                       <div className="text-emerald-300 whitespace-pre-wrap leading-relaxed">{section.prompt}</div>
                       
                       {section.negativePrompt && (
                         <div className="pt-5 mt-5 border-t border-white/5">
                            <div className="text-rose-400 font-bold mb-2 uppercase text-[10px] tracking-widest">Negative Injection</div>
                            <p className="text-gray-500 italic font-medium">{section.negativePrompt}</p>
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[11px] font-black text-gray-900 tracking-widest uppercase">Section validée pour Landing</span>
               </div>
               <button 
                 onClick={copyPrompt}
                 className="group flex items-center gap-2 text-[11px] font-black text-indigo-600 hover:text-indigo-400 transition-all"
               >
                 <span>{copied ? "Brief Copié !" : "Copier Brief Complet"}</span>
                 <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BriefVideoScriptCardUI({ scene, index }: { scene: any; index: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyScene = () => {
    let md = `🎬 SCÈNE #${index + 1} — ${scene.step} (${scene.time})\n`;
    md += `📍 VISUEL: ${scene.visual}\n`;
    md += `🎙️ AUDIO: ${scene.audio}\n`;
    md += `📝 OVERLAY: ${scene.overlay}\n`;
    md += `🎯 ANGLE: ${scene.marketingAngle}\n`;
    md += `🤖 PROMPT IA: ${scene.prompt}\n`;
    
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="p-5 flex items-center justify-between gap-4 bg-gray-50/80 border-b border-gray-100">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/20">
             <Video className="text-white w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-1 bg-gray-900 text-[10px] font-black text-white rounded-lg tracking-wider shadow-sm uppercase">{scene.time}</span>
              <span className="px-2.5 py-1 bg-white text-purple-600 border border-purple-200 rounded-lg text-[10px] font-black uppercase tracking-tight shadow-sm">
                {scene.step}
              </span>
              <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-tight shadow-sm">
                SCÈNE {index + 1}
              </span>
            </div>
            <h4 className="text-gray-900 font-black text-lg truncate tracking-tight">{scene.marketingAngle || 'Détails Scène'}</h4>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={copyScene}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-black transition-all shadow-xl active:scale-95 whitespace-nowrap"
          >
            {copied ? <Check size={16} /> : <FileText size={16} />}
            {copied ? "Scène Copiée !" : "Copier Scène"}
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2.5 bg-white border border-gray-100 hover:bg-gray-50 rounded-2xl text-gray-400 transition-all shadow-sm"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white"
          >
            <div className="p-6 space-y-8">
              {/* Production Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-lg shadow-purple-500/40" />
                    <p className="text-[11px] uppercase font-black text-gray-900 tracking-widest text-wrap">Scénographie & Visuel</p>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100 min-h-[100px]">
                    <p className="text-sm text-gray-900 font-bold leading-relaxed">{scene.visual}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40" />
                    <p className="text-[11px] uppercase font-black text-gray-900 tracking-widest">Audio & Voiceover (DZ/FR)</p>
                  </div>
                  <div className="p-5 bg-blue-50 border border-blue-100 rounded-[1.5rem] min-h-[100px]">
                    <p className="text-sm text-blue-900 font-black leading-relaxed italic">"{scene.audio}"</p>
                  </div>
                </div>
              </div>

              {/* Text Overlay Section */}
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-600 rounded-[2rem] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" />
                <div className="p-6 border border-indigo-100/50 rounded-[2rem] relative z-10 flex gap-5 items-start">
                  <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 shrink-0">
                    <Megaphone size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase font-black text-indigo-400 mb-2 tracking-widest text-wrap">Texte à l'écran (Overlay)</p>
                    <p className="text-xl font-black text-gray-900 tracking-tight">"{scene.overlay}"</p>
                  </div>
                </div>
              </div>

              {/* Technical AI Prompt */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
                    <p className="text-[11px] uppercase font-black text-gray-900 tracking-widest">Technical Scene Reference Brief</p>
                  </div>
                </div>
                
                <div className="relative group shadow-2xl shadow-purple-900/10">
                  <div className="p-6 bg-gray-900 rounded-[2rem] font-mono text-xs leading-relaxed relative overflow-hidden border border-gray-800">
                    <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/5 opacity-60">
                       <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                       </div>
                       <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black ml-auto">Video Engine Ref v1.0</span>
                    </div>
                    
                    <div className="space-y-5 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-4 custom-code-scroll">
                       <div className="text-purple-300 font-bold mb-2">/* SCENE AI PROMPT */</div>
                       <div className="text-emerald-300 whitespace-pre-wrap leading-relaxed">{scene.prompt}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-[11px] font-black text-gray-900 tracking-widest uppercase">Scène prête pour tournage/montage</span>
               </div>
               <button 
                 onClick={copyScene}
                 className="group flex items-center gap-2 text-[11px] font-black text-purple-600 hover:text-purple-400 transition-all font-sans"
               >
                 <span>{copied ? "Scène Copiée !" : "Copier Brief Scène"}</span>
                 <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BriefVisualCardUI({ visual, index }: { visual: BriefVisual; index: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const getFullPromptString = () => {
    let md = `- **Rôle narratif:** ✅ ${visual.narrativeRole || 'SOLUTION — Product in action'}\n`;
    md += `- **Dimensions:** ${visual.dimensions || '1080x1350'}\n`;
    md += `- **Mood / Ambiance:** ${visual.mood || 'N/A'}\n`;
    md += `- **Fond:** ${visual.background || 'N/A'}\n`;
    md += `- **Composition:** ${visual.composition || 'N/A'}\n`;
    md += `- **Angle marketing:** ${visual.marketingAngle || 'N/A'}\n`;
    md += `- **Hook type:** ${visual.hookType || 'N/A'}\n`;
    md += `> ⚠️ **MODE : image_to_image**\n`;
    md += `> 📦 **Input image :** L'objet/produit depuis l'image en pièce jointe\n`;
    md += `> 💡 Intègre le produit réel dans cette scène. Ombres de contact et reflets naturels.\n\n`;
    
    md += `**Prompt (Image Generator) :**\n`;
    md += `{\n`;
    md += `  "mode": "image_to_image",\n`;
    md += `  "input_image": "the object from the attached image"\n`;
    md += `}\n\n`;
    
    md += `${visual.prompt}\n\n`;

    if (visual.marketingContext) {
      md += `[MARKETING CONTEXT]\n`;
      md += `USP: ${visual.marketingContext.usp}\n`;
      md += `Pain Point: ${visual.marketingContext.painPoint}\n`;
      md += `Emotion: ${visual.marketingContext.emotion}\n`;
      md += `Audience: ${visual.marketingContext.audience}\n`;
      md += `Message: ${visual.marketingContext.message}\n`;
      md += `[/MARKETING CONTEXT]\n\n`;
    }

    md += `**Negative:** ${visual.negativePrompt || 'no plastic skin, no blurry text, no AI artifacts'}\n`;
    md += `**Params:** ${visual.params || `dimensions: ${visual.dimensions} | style: ${visual.mood} | background: ${visual.background}`}\n\n`;

    if (visual.textOverlay) {
      md += `**📝 Text Overlay 🇫🇷 :**\n`;
      md += `- Headline: "${visual.textOverlay.headline}"\n`;
      md += `- Subtext: "${visual.textOverlay.subtext}"\n`;
      md += `- Position: ${visual.textOverlay.position}\n`;
      md += `- Style: ${visual.textOverlay.style}\n`;
      md += `- Hook: ${visual.textOverlay.hook || visual.hookType || 'N/A'}\n`;
      md += `- ⚡ Lisible en 0.3s sur mobile — bold, high contrast\n\n`;
    }

    if (visual.personnage) {
      md += `**👤 Personnage :**\n`;
      md += `- ${visual.personnage.description}\n`;
      md += `- Expression: ${visual.personnage.expression}\n`;
      md += `- Tenue: ${visual.personnage.tenue}\n`;
      md += `- Pose: ${visual.personnage.pose}\n\n`;
    }

    if (visual.designerNotes) {
      md += `> 💡 Notes designer : ${visual.designerNotes}\n\n`;
    }

    md += `✅ **ACTION :** Génère ce visuel publicitaire.\n`;
    md += `🔄 **Montre-moi le résultat pour validation.**\n`;
    return md;
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(getFullPromptString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="p-5 flex items-center justify-between gap-4 bg-gray-50/80 border-b border-gray-100">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/20">
             <ImageIcon className="text-white w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-1 bg-gray-900 text-[10px] font-black text-white rounded-lg tracking-wider shadow-sm uppercase">{visual.dimensions || '1080x1350'}</span>
              <span className="px-2.5 py-1 bg-white text-orange-600 border border-orange-200 rounded-lg text-[10px] font-black uppercase tracking-tight shadow-sm">
                {visual.narrativeRole || 'Static Ad'}
              </span>
              <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-tight shadow-sm">
                VARIANT {index + 1}
              </span>
            </div>
            <h4 className="text-gray-900 font-black text-lg truncate tracking-tight">{visual.step || visual.title || `AD VARIANT #${index + 1}`}</h4>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={copyPrompt}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black transition-all shadow-xl active:scale-95 whitespace-nowrap"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copié !" : "Copier Prompt"}
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2.5 bg-white border border-gray-100 hover:bg-gray-50 rounded-2xl text-gray-400 transition-all shadow-sm"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white"
          >
            <div className="p-6 space-y-8">
              {/* Core Attributes Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="group p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-200/40">
                    <p className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest">Mood</p>
                    <p className="text-sm text-gray-900 font-black">{visual.mood || 'Cinematic'}</p>
                 </div>
                 <div className="group p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-200/40">
                    <p className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest">Fond</p>
                    <p className="text-sm text-gray-900 font-black truncate">{visual.background || 'N/A'}</p>
                 </div>
                 <div className="group p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-200/40">
                    <p className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest">Hook</p>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase">{visual.hookType || 'Curiosity'}</span>
                 </div>
                 <div className="group p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-gray-200/40">
                    <p className="text-[10px] uppercase font-black text-gray-400 mb-2 tracking-widest">Couleurs</p>
                    <div className="flex gap-2">
                       {Array.isArray(visual.colorPalette) && visual.colorPalette.slice(0, 3).map((c, i) => (
                          <div key={i} className="w-5 h-5 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: c }} />
                       ))}
                    </div>
                 </div>
              </div>

              {/* Angle Marketing Hero Section */}
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-600 rounded-[2rem] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" />
                <div className="p-6 border border-indigo-100/50 rounded-[2rem] relative z-10 flex gap-5 items-start">
                   <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 shrink-0">
                     <TrendingUp size={20} className="text-white" />
                   </div>
                   <div>
                     <p className="text-[11px] uppercase font-black text-indigo-400 mb-2 tracking-widest">Angle Marketing Stratégique</p>
                     <p className="text-sm text-gray-900 font-bold leading-relaxed">{visual.marketingAngle}</p>
                     <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-indigo-100 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <p className="text-[11px] text-indigo-700 font-bold"><span className="opacity-50">Composition :</span> {visual.composition}</p>
                     </div>
                   </div>
                </div>
              </div>

              {/* Split Details Section */}
              {visual.personnage && (
                <div className="bg-orange-50/30 border border-orange-100/50 rounded-[2rem] p-6">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 bg-orange-100 rounded-xl">
                       <User size={18} className="text-orange-600" />
                     </div>
                     <h5 className="text-[11px] font-black uppercase text-gray-900 tracking-widest">Personnage & Casting</h5>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-4">
                        <p className="text-sm text-gray-900 font-bold leading-relaxed">{visual.personnage.description}</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                       <div className="p-3 bg-white rounded-2xl shadow-sm border border-orange-100">
                         <span className="text-gray-400 font-black uppercase text-[9px] block mb-1">Expression</span>
                         <span className="text-xs text-gray-900 font-bold">{visual.personnage.expression}</span>
                       </div>
                       <div className="p-3 bg-white rounded-2xl shadow-sm border border-orange-100">
                         <span className="text-gray-400 font-black uppercase text-[9px] block mb-1">Casting</span>
                         <span className="text-xs text-gray-900 font-bold">{visual.personnage.tenue}</span>
                       </div>
                     </div>
                   </div>
                </div>
              )}

              {/* Technical Code Editor Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
                    <p className="text-[11px] uppercase font-black text-gray-900 tracking-widest">Technical Brief for AI Engine</p>
                  </div>
                  <button 
                    onClick={copyPrompt}
                    className="text-[11px] font-black text-indigo-600 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} /> Copier prompt complet
                  </button>
                </div>
                
                <div className="relative group shadow-2xl shadow-indigo-900/10">
                  <div className="p-6 bg-gray-900 rounded-[2rem] font-mono text-xs leading-relaxed relative overflow-hidden border border-gray-800">
                    <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/5 opacity-60">
                       <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                       </div>
                       <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black ml-auto">Diffusion Engine 4.0</span>
                    </div>
                    
                    <div className="space-y-5 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-4 custom-code-scroll">
                       <div className="text-indigo-300 font-bold mb-2">/* BASE PROMPT */</div>
                       <div className="text-emerald-300 whitespace-pre-wrap leading-relaxed">{visual.prompt}</div>
                       
                       <div className="pt-5 mt-5 border-t border-white/5">
                          <div className="text-rose-400 font-bold mb-2 uppercase text-[10px] tracking-widest">Negative Prompt Injection</div>
                          <p className="text-gray-500 italic font-medium">{visual.negativePrompt || 'no plastic skin, no blurry text, no AI artifacts'}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Text Overlay */}
              {visual.textOverlay && (
                <div className="shadow-xl shadow-orange-900/5 rounded-[2.5rem] overflow-hidden border border-orange-100">
                   <div className="p-4 bg-orange-600 text-white flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <Megaphone size={18} className="text-orange-200" />
                       <h5 className="text-[11px] font-black uppercase tracking-widest">Publicité : Accroches & Visuels</h5>
                     </div>
                     <span className="text-[10px] font-black px-3 py-1 bg-white/20 rounded-full border border-white/20">58 WILAYAS COD</span>
                   </div>
                   <div className="p-6 bg-white space-y-6">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1 space-y-2">
                          <p className="text-[10px] uppercase font-black text-orange-400 tracking-widest">Headline Darija / FR</p>
                          <p className="text-2xl font-black text-gray-900 leading-tight pr-10">"{visual.textOverlay.headline}"</p>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-black rounded-lg border border-orange-100 shadow-sm">
                            <Sparkles size={12} />
                            {visual.textOverlay.subtext}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100 flex flex-col items-center justify-center min-w-[120px] shadow-inner">
                           <span className="text-[9px] font-black text-gray-400 uppercase mb-1.5 tracking-tighter">Typographie</span>
                           <span className="text-xs font-black text-orange-600 uppercase text-center leading-none">{visual.textOverlay.style}</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100 transition-all hover:bg-orange-50/50">
                           <p className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-widest">Positionnement</p>
                           <p className="text-xs font-black text-gray-900">{visual.textOverlay.position}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100 transition-all hover:bg-orange-50/50">
                           <p className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 tracking-widest">Psychologie de l'accroche</p>
                           <p className="text-xs font-black text-orange-900 uppercase tracking-tighter">{visual.textOverlay.hook || visual.hookType || 'N/A'}</p>
                        </div>
                     </div>
                   </div>
                </div>
              )}
              
              {/* Designer Signature Notes */}
              {visual.designerNotes && (
                 <div className="flex items-start gap-4 p-5 bg-yellow-50/80 border border-yellow-200/50 rounded-[2rem] text-xs text-gray-600 italic shadow-inner">
                    <div className="p-2 bg-white rounded-xl shadow-sm shrink-0 mt-0.5">
                      <Sparkles size={16} className="text-yellow-600" />
                    </div>
                    <p className="leading-relaxed"><span className="font-black text-yellow-900 not-italic uppercase text-[10px] tracking-widest mr-2">Note de l'Expert Marketing :</span> {visual.designerNotes}</p>
                 </div>
              )}
            </div>

            <div className="px-8 py-5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-black text-gray-900 tracking-widest uppercase">Variant prêt pour production</span>
               </div>
               <button 
                 onClick={copyPrompt}
                 className="group flex items-center gap-2 text-[11px] font-black text-indigo-600 hover:text-indigo-400 transition-all"
               >
                 <span>{copied ? "Prompt Copié !" : "Copier Brief Complet"}</span>
                 <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface Message {
  role: 'user' | 'model' | 'system';
  content: string;
  image?: string;
  timestamp?: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export default function ProductAnalyzer() {
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Salam ! Je suis votre consultant expert en E-commerce. Quel produit souhaitez-vous analyser aujourd'hui pour optimiser vos ventes sur le marché algérien ? Vous pouvez également m'envoyer une photo du produit pour une analyse visuelle immédiate.", timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isAnalyzingMarket, setIsAnalyzingMarket] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isComparingUrl, setIsComparingUrl] = useState(false);
  
  // Product Analysis Auto-fill state
  const [detectedProduct, setDetectedProduct] = useState<{
    name: string;
    nameAr: string;
    category: string;
    sellingPoints: string[];
    colorPalette: string[];
  } | null>(null);
  const [showDetectedInfo, setShowDetectedInfo] = useState(false);
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
  const [isGeneratingPricing, setIsGeneratingPricing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [comparisonStep, setComparisonStep] = useState<'idle' | 'waiting_competitor' | 'waiting_url'>('idle');
  const [chat, setChat] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIndex(index);
    setTimeout(() => setCopiedMessageIndex(null), 2000);
  };

  useEffect(() => {
    try {
      // Load sessions from localStorage
      const saved = localStorage.getItem('ecommerce_expert_sessions');
      const lastActiveId = localStorage.getItem('ecommerce_expert_last_active_session_id');
      
      let initialSessions: ChatSession[] = [];
      if (saved) {
        initialSessions = JSON.parse(saved);
        setSessions(initialSessions);
      }

      // Restore last active session if exists
      if (lastActiveId && initialSessions.length > 0) {
        const lastSession = initialSessions.find(s => s.id === lastActiveId);
        if (lastSession) {
          setMessages(lastSession.messages);
          setCurrentSessionId(lastSession.id);
          
          // Map internal messages to Gemini history format
          const history = lastSession.messages.map(m => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }));
          
          const newChat = createExpertChat(history);
          setChat(newChat);
          return;
        }
      }

      const newChat = createExpertChat();
      setChat(newChat);
    } catch (error) {
      console.error("Failed to initialize chat:", error);
    }
  }, []);

  // Save sessions and last active session ID to localStorage
  useEffect(() => {
    localStorage.setItem('ecommerce_expert_sessions', JSON.stringify(sessions));
    if (currentSessionId) {
      localStorage.setItem('ecommerce_expert_last_active_session_id', currentSessionId);
    } else {
      localStorage.removeItem('ecommerce_expert_last_active_session_id');
    }
  }, [sessions, currentSessionId]);

  // Periodic auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveCurrentSession();
    }, 30000);
    return () => clearInterval(interval);
  }, [messages, currentSessionId]);

  // Update current session in history
  const saveCurrentSession = () => {
    if (messages.length <= 1) return; // Don't save empty/initial chats

    const sessionTitle = messages.find(m => m.role === 'user')?.content.substring(0, 40) || "Nouvelle Analyse";
    const sessionId = currentSessionId || Date.now().toString();

    if (!currentSessionId) {
      setCurrentSessionId(sessionId);
    }

    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      return [{
        id: sessionId,
        title: sessionTitle + (sessionTitle.length >= 40 ? '...' : ''),
        messages: messages,
        updatedAt: Date.now()
      }, ...filtered];
    });
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setActiveTab('chat');
    
    // Re-initialize chat with history
    const history = session.messages.map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    const newChat = createExpertChat(history);
    setChat(newChat);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
  };

  const startNewChat = () => {
    saveCurrentSession();
    setCurrentSessionId(null);
    setMessages([{ role: 'model', content: "Salam ! Quel nouveau produit ou stratégie souhaitez-vous aborder ?", timestamp: Date.now() }]);
    setChat(createExpertChat());
    setActiveTab('chat');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // Auto-save on message change
    if (messages.length > 1) {
      const timer = setTimeout(saveCurrentSession, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Content = reader.result as string;
        setSelectedImage(base64Content);
        
        // Auto-analyze product if image is selected
        setIsAnalyzingImage(true);
        try {
          const base64Data = base64Content.split(',')[1];
          const mimeType = base64Content.split(',')[0].split(':')[1].split(';')[0];
          
          const analysis = await analyzeProductFromImage({ data: base64Data, mimeType });
          if (analysis) {
            setDetectedProduct({
              name: analysis.name || '',
              nameAr: analysis.nameAr || '',
              category: analysis.category || '',
              sellingPoints: analysis.sellingPoints || [],
              colorPalette: analysis.colorPalette || []
            });
            setShowDetectedInfo(true);
          }
        } catch (error) {
          console.error("AI Analysis failed:", error);
        } finally {
          setIsAnalyzingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading || !chat) return;

    if (comparisonStep === 'waiting_competitor' || comparisonStep === 'waiting_url') {
      const competitorInfo = inputValue;
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || "Produit actuel";
      
      const isUrl = comparisonStep === 'waiting_url';
      setMessages(prev => [...prev, { 
      role: 'user', 
      content: isUrl ? `URL du concurrent : ${competitorInfo}` : `Détails du concurrent : ${competitorInfo}`,
      timestamp: Date.now()
    }]);
    setInputValue('');
    setIsComparing(true);
    if (isUrl) setIsComparingUrl(true);
    setComparisonStep('idle');

    try {
      let result = "";
      if (isUrl) {
        setMessages(prev => [...prev, { role: 'system', content: "Extraction des informations de l'URL en cours...", timestamp: Date.now() }]);
        result = await compareWithCompetitor(lastUserMsg, `URL du produit : ${competitorInfo}. Analyse ce produit à partir de cette URL (ou de tes connaissances si l'URL est connue) et compare-le avec mon produit.`);
      } else {
        result = await compareWithCompetitor(lastUserMsg, competitorInfo);
      }
      setMessages(prev => [...prev, { role: 'model', content: result, timestamp: Date.now() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Erreur lors de la comparaison. Réessayez.", timestamp: Date.now() }]);
      } finally {
        setIsComparing(false);
        setIsComparingUrl(false);
      }
      return;
    }

    const userMessage = inputValue;
    const currentImage = selectedImage;
    const productInfo = detectedProduct;
    
    setInputValue('');
    setSelectedImage(null);
    setDetectedProduct(null);
    setShowDetectedInfo(false);
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage, image: currentImage || undefined, timestamp: Date.now() }]);
    setIsLoading(true);
    try {
      let botResponse = "";
      if (currentImage) {
        // Multimodal turn - extract base64 content
        const base64Data = currentImage.split(',')[1];
        const mimeType = currentImage.split(',')[0].split(':')[1].split(';')[0];
        
        // Enhance prompt with detected info if available
        let enhancedPrompt = userMessage || "Analyse ce produit en détail selon la structure d'expert (Identification, Argumentaire, Spécifications techniques, Palette, Styles visuels, Layouts, Plan Marketing, Idées de Contenu, Optimisation CRO)";
        
        if (productInfo) {
          enhancedPrompt = `En me basant sur ces premières informations extraites :\n- Nom : ${productInfo.name} (${productInfo.nameAr})\n- Catégorie : ${productInfo.category}\n- Points forts : ${productInfo.sellingPoints.join(', ')}\n- Palette : ${productInfo.colorPalette.join(', ')}\n\n${enhancedPrompt}`;
        }

        // Construct the parts
        const parts = [
          { text: enhancedPrompt },
          { inlineData: { data: base64Data, mimeType } }
        ];

        // Send message with image
        const result = await chat.sendMessage({ message: parts });
        botResponse = result.text || "Désolé, je n'ai pas pu générer de réponse.";
      } else {
        // Standard text message using the chat object
        const result = await chat.sendMessage({ message: userMessage });
        botResponse = result.text || "Désolé, je n'ai pas pu générer de réponse.";
      }

      setMessages(prev => [...prev, { role: 'model', content: botResponse, timestamp: Date.now() }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err) || "");
      const isQuota = 
        errorStr.includes("429") || 
        errorStr.includes("RESOURCE_EXHAUSTED") || 
        errorStr.includes("quota") ||
        errorStr.toLowerCase().includes("exceeded") ||
        errorStr.includes("QUOTA_EXCEEDED") ||
        err?.status === "RESOURCE_EXHAUSTED" ||
        errorStr.toLowerCase().includes("limit reached");
      
      const errorMessage = isQuota 
        ? "⚠️ **Quota Gemini épuisé.** L'IA a besoin d'une petite pause ou votre limite journalière est atteinte (Erreur 429). Réessayez dans quelques minutes ou demain."
        : "Erreur lors de la communication avec l'expert. Vérifie ta connexion.";
        
      setMessages(prev => [...prev, { role: 'model', content: errorMessage, timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarketAnalysis = async () => {
    if ((!inputValue.trim() && messages.length < 2) || isLoading || isAnalyzingMarket) return;

    const query = inputValue.trim() || messages[messages.length - 1].content;
    setIsAnalyzingMarket(true);
    setMessages(prev => [...prev, { role: 'system', content: `Analyse du marché en cours pour : ${query}...`, timestamp: Date.now() }]);

    try {
      const analysis = await analyzeMarket(query);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: analysis,
        timestamp: Date.now()
      }]);
    } catch (err: any) {
      console.error("Market analysis error:", err);
      const errorStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err) || "");
      const isQuota = 
        errorStr.includes("429") || 
        errorStr.includes("RESOURCE_EXHAUSTED") || 
        errorStr.includes("quota") ||
        errorStr.toLowerCase().includes("exceeded") ||
        errorStr.includes("QUOTA_EXCEEDED") ||
        err?.status === "RESOURCE_EXHAUSTED" ||
        errorStr.toLowerCase().includes("limit reached");
      
      const errorMessage = isQuota 
        ? "⚠️ **Quota Gemini épuisé** lors de l'analyse de marché. L'IA est surchargée ou vous avez atteint votre limite temporaire (Erreur 429). Réessayez dans un moment."
        : "Erreur lors de l'analyse de marché. Réessayez.";
        
      setMessages(prev => [...prev, { role: 'model', content: errorMessage, timestamp: Date.now() }]);
    } finally {
      setIsAnalyzingMarket(false);
    }
  };

  const startComparison = () => {
    setComparisonStep('waiting_competitor');
    setMessages(prev => [...prev, { 
      role: 'model', 
      content: "Je suis prêt pour la comparaison ! Donnez-moi le nom du concurrent et ses principales caractéristiques (prix, offre, point de livraison)." 
    }]);
  };

  const startUrlComparison = () => {
    setComparisonStep('waiting_url');
    setMessages(prev => [...prev, { 
      role: 'model', 
      content: "Veuillez saisir l'URL du produit concurrent. Je vais tenter d'analyser les informations pertinentes pour la comparaison." 
    }]);
  };

  const handlePricingStrategy = async () => {
    if ((!inputValue.trim() && messages.length < 2) || isLoading || isGeneratingPricing) return;

    const query = inputValue.trim() || [...messages].reverse().find(m => m.role === 'user')?.content || "produit";
    setIsGeneratingPricing(true);
    setMessages(prev => [...prev, { role: 'system', content: `Élaboration d'une stratégie de prix stratégique pour : ${query}...`, timestamp: Date.now() }]);

    try {
      const data = await generatePricingStrategy(query, "Non spécifié");
      if (data && data.pricingTiers) {
        setMessages(prev => [...prev, { role: 'model', content: JSON.stringify(data, null, 2), timestamp: Date.now() }]);
      } else {
        throw new Error("Failed to generate pricing strategy or quota reached");
      }
    } catch (err: any) {
      console.error("Pricing strategy error:", err);
      const errorStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err) || "");
      const isQuota = 
        errorStr.includes("429") || 
        errorStr.includes("RESOURCE_EXHAUSTED") || 
        errorStr.includes("quota") ||
        errorStr.toLowerCase().includes("exceeded") ||
        errorStr.includes("QUOTA_EXCEEDED") ||
        err?.status === "RESOURCE_EXHAUSTED" ||
        errorStr.toLowerCase().includes("limit reached");
      
      const errorMessage = isQuota 
        ? "⚠️ **Quota Gemini épuisé** (429). L'IA est surchargée ou vous avez atteint votre limite temporaire. Impossible de générer la stratégie de prix pour le moment."
        : "Erreur lors de la génération de la stratégie de prix. Réessayez.";

      setMessages(prev => [...prev, { role: 'model', content: errorMessage, timestamp: Date.now() }]);
    } finally {
      setIsGeneratingPricing(false);
    }
  };

  const handleMarketingAssets = async (type: 'landing' | 'static' | 'video' | 'optimizations') => {
    if (isLoading || isGeneratingAsset || messages.length < 2) return;

    // Récupérer la dernière analyse faite par l'IA pour l'utiliser comme contexte
    const lastAnalysis = [...messages].reverse().find(m => m.role === 'model')?.content || 
                         [...messages].reverse().find(m => m.role === 'user')?.content || 
                         "Produit sélectionné";

    setIsGeneratingAsset(true);
    
    let label = "";
    if (type === 'landing') label = "Structure Landing Page";
    if (type === 'static') label = "Static Ads";
    if (type === 'video') label = "Vidéo Produit (Script & Visuels)";
    if (type === 'optimizations') label = "Optimisations Page Produit";

    setMessages(prev => [...prev, { role: 'system', content: `Génération d'un ${label} basé sur l'analyse précédente...`, timestamp: Date.now() }]);

    try {
      let data = null;
      if (type === 'landing') {
        data = await generateLandingPageCopy({ name: "Analyse Produit", description: lastAnalysis });
      } else if (type === 'static') {
        data = await generateDarjaAds(lastAnalysis, 'facebook');
      } else if (type === 'video') {
        data = await generateVideoAdScript(lastAnalysis, "Dynamique (UGC)");
      } else if (type === 'optimizations') {
        const text = await generateProductPageOptimizations(lastAnalysis);
        setMessages(prev => [...prev, { role: 'model', content: text, timestamp: Date.now() }]);
        setIsGeneratingAsset(false);
        return;
      }
      
      if (data) {
        setMessages(prev => [...prev, { role: 'model', content: JSON.stringify(data, null, 2), timestamp: Date.now() }]);
      } else {
        throw new Error("Failed to generate content");
      }
    } catch (err: any) {
      console.error(`Marketing asset generation error (${type}):`, err);
      const errorStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err) || "");
      const isQuota = 
        errorStr.includes("429") || 
        errorStr.includes("RESOURCE_EXHAUSTED") || 
        errorStr.includes("quota") ||
        errorStr.toLowerCase().includes("exceeded") ||
        errorStr.includes("QUOTA_EXCEEDED") ||
        err?.status === "RESOURCE_EXHAUSTED" ||
        errorStr.toLowerCase().includes("limit reached");
      
      const errorMessage = isQuota 
        ? "⚠️ **Quota Gemini épuisé** (429). L'IA est surchargée ou vous avez atteint votre limite temporaire. Impossible de générer ces assets marketing pour le moment."
        : "Erreur lors de la génération des suggestions. Réessayez.";

      setMessages(prev => [...prev, { role: 'model', content: errorMessage, timestamp: Date.now() }]);
    } finally {
      setIsGeneratingAsset(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-none">
      <div className="flex items-center justify-between gap-6 shrink-0 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl">
            <MessageSquare className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Expert Consulting DZ <span className="text-indigo-500">AI</span></h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Consultant Stratégique & Analyse Visuelle Multimodale</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hidden sm:flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Stratège Connecté</span>
          </div>
          <button
            onClick={startNewChat}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            <Plus size={16} />
            Nouveau Chat
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/10">
          {/* Tab Switcher */}
          <div className="flex border-b border-white/10 bg-black/20">
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2",
                activeTab === 'chat' 
                  ? "text-indigo-400 border-indigo-500 bg-white/5" 
                  : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/[0.02]"
              )}
            >
              <MessageSquare size={14} />
              Chat Actif
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2",
                activeTab === 'history' 
                  ? "text-indigo-400 border-indigo-500 bg-white/5" 
                  : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/[0.02]"
              )}
            >
              <History size={14} />
              Historique ({sessions.length})
            </button>
          </div>

          {activeTab === 'history' ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
              <div className="p-4 border-b border-white/10 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text"
                    placeholder="Rechercher dans vos conversations passées..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  />
                </div>
                {sessions.length > 0 && (
                   <button 
                     onClick={() => {
                        if (confirm("Voulez-vous vraiment supprimer tout l'historique ?")) {
                           setSessions([]);
                           localStorage.removeItem('ecommerce_expert_sessions');
                        }
                     }}
                     className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 border border-red-500/20 shadow-lg shadow-red-500/5 group"
                   >
                     <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                     Effacer Tout
                   </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {sessions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10">
                    <Archive className="w-12 h-12 text-gray-700 mb-4" />
                    <p className="text-gray-500 text-sm">Aucun historique de conversation.</p>
                    <p className="text-gray-600 text-[10px] mt-1 italic">Vos analyses stratégiques apparaîtront ici.</p>
                  </div>
                ) : sessions.filter(s => s.title.toLowerCase().includes(historySearch.toLowerCase())).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-10">
                    <Search className="w-12 h-12 text-gray-700 mb-4" />
                    <p className="text-gray-500 text-sm">Aucun résultat pour "{historySearch}"</p>
                  </div>
                ) : (
                  sessions.filter(s => s.title.toLowerCase().includes(historySearch.toLowerCase())).map((session) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl cursor-pointer transition-all group relative animate-in fade-in slide-in-from-left-2"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                            <FileText className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-gray-200 truncate">{session.title}</h4>
                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                              {new Date(session.updatedAt).toLocaleString('fr-FR')} • {session.messages.length} messages
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                           <button
                             onClick={(e) => deleteSession(session.id, e)}
                             className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                             title="Supprimer"
                           >
                              <Trash2 size={14} />
                           </button>
                           <ChevronRight size={14} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text"
                    placeholder="Rechercher dans ce chat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  />
                </div>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 hover:bg-white/5 rounded-lg transition-all"
                  >
                    Effacer
                  </button>
                )}
                
                {detectedProduct && (
                  <button
                    onClick={() => setShowDetectedInfo(!showDetectedInfo)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      showDetectedInfo 
                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400" 
                        : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
                    )}
                  >
                    <Target size={14} />
                    {showDetectedInfo ? "Masquer Specs" : "Afficher Specs"}
                  </button>
                )}
              </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
              {messages.length === 1 && messages[0].role === 'model' && (
                <div className="max-w-4xl mx-auto py-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                   <div className="text-center space-y-6">
                      <div className="inline-flex p-5 rounded-[2.5rem] bg-indigo-500/10 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 mb-2">
                         <Bot size={56} className="text-indigo-400" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-4xl font-black text-white tracking-tighter">Consultation Stratégique <span className="text-indigo-500 italic">Elite</span></h3>
                        <p className="text-gray-400 text-base max-w-2xl mx-auto font-medium">L'IA la plus avancée du marché pour dominer le E-commerce en Algérie. Analyse de visuels haute précision, stratégies de pricing localisées et copywriting haute-conversion.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { icon: Camera, title: "Analyse Visuelle", desc: "Envoyez une photo pour extraire les specs et points forts.", color: "indigo" },
                        { icon: TrendingUp, title: "Analyse Marché", desc: "Obtenez les tendances et la compétition locale.", color: "emerald" },
                        { icon: Scale, title: "Comparateur", desc: "Comparez votre offre aux leaders du marché.", color: "orange" },
                        { icon: Megaphone, title: "Stratégie Ads", desc: "Briefs créatifs et scripts vidéo UGC.", color: "purple" }
                      ].map((feature, i) => (
                        <div key={i} className="p-5 bg-white/[0.03] border border-white/5 rounded-[2rem] hover:bg-white/[0.05] transition-all cursor-default group">
                           <div className={cn(
                             "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-lg",
                             feature.color === 'indigo' ? "bg-indigo-500/20 text-indigo-400" :
                             feature.color === 'emerald' ? "bg-emerald-500/20 text-emerald-400" :
                             feature.color === 'orange' ? "bg-orange-500/20 text-orange-400" :
                             "bg-purple-500/20 text-purple-400"
                           )}>
                              <feature.icon size={20} />
                           </div>
                           <h4 className="text-sm font-bold text-white mb-1">{feature.title}</h4>
                           <p className="text-[10px] text-gray-500 leading-relaxed">{feature.desc}</p>
                        </div>
                      ))}
                   </div>

                   <div className="p-6 bg-indigo-600/10 border border-indigo-600/20 rounded-[2.5rem] flex items-center gap-5">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-indigo-600/20">
                         <Sparkles size={24} className="text-white" />
                      </div>
                      <div>
                         <p className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-1">Démarrage Rapide</p>
                         <p className="text-[10px] text-gray-400 leading-relaxed italic">"Salam, peux-tu analyser ce produit pour le marché algérien ?" — Envoyez simplement le nom ou une photo.</p>
                      </div>
                   </div>
                </div>
              )}

              {messages.filter(msg => 
                msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (msg.role === 'user' && searchTerm === '')
              ).map((message, index) => {
                // If we show the welcome screen, we don't show the initial model message twice
                if (messages.length === 1 && message.role === 'model' && index === 0) return null;
                
                return (
                    <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    key={index}
                    className={cn(
                      "flex gap-4 max-w-[95%] lg:max-w-[90%] xl:max-w-[85%] relative group/msg",
                      message.role === 'user' ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                  {/* Message Actions */}
                  {message.role !== 'system' && (
                    <div className={cn(
                      "absolute -top-4 opacity-0 group-hover/msg:opacity-100 transition-all z-20 flex gap-2",
                      message.role === 'user' ? "right-14" : "left-14"
                    )}>
                      <button 
                        onClick={() => copyToClipboard(message.content, index)}
                        className="p-1 px-3 bg-gray-900 border border-white/10 rounded-full text-[10px] font-black text-gray-400 hover:text-white flex items-center gap-1.5 shadow-xl backdrop-blur-md"
                      >
                        {copiedMessageIndex === index ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                        {copiedMessageIndex === index ? "Copié" : "Copier"}
                      </button>
                    </div>
                  )}

                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                    message.role === 'user' 
                      ? "bg-indigo-600 shadow-indigo-600/20" 
                      : message.role === 'system'
                        ? "bg-gray-800 border border-white/10"
                        : "bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl shadow-black/20"
                  )}>
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : message.role === 'system' ? (
                       <Settings className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Bot className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>
                  <div className={cn(
                    "relative p-4 md:p-5 rounded-[2rem] text-sm leading-relaxed space-y-4 shadow-2xl",
                    message.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/10" 
                      : message.role === 'system'
                        ? "bg-indigo-500/5 text-indigo-300 italic border border-indigo-500/20 py-2 px-6 rounded-full"
                        : "bg-white/[0.03] text-gray-200 border border-white/10 rounded-tl-none backdrop-blur-md shadow-black/40 markdown-body"
                  )}>
                    {message.image && (
                      <div className="relative group overflow-hidden rounded-2xl mb-2">
                        <img 
                          src={message.image} 
                          alt="Product" 
                          className="max-w-full h-auto max-h-[300px] object-contain bg-black/20"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                              <Search size={20} />
                           </button>
                        </div>
                      </div>
                    )}
                    {(() => {
                      if (message.role === 'model' && (message.content.trim().startsWith('{') || message.content.trim().includes('```json'))) {
                        try {
                          let jsonStr = message.content.trim();
                          if (jsonStr.includes('```json')) {
                            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
                          } else if (jsonStr.includes('```')) {
                             jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
                          }
                          const data = JSON.parse(jsonStr);
                          if (data.title && (data.visuals || data.sections || data.pricingTiers)) {
                            return <MarketingBrief data={data} />;
                          }
                        } catch (e) {
                          // fallback to markdown
                        }
                      }
                      return message.content && <Markdown>{message.content}</Markdown>;
                    })()}

                    {message.timestamp && (
                      <div className={cn(
                        "text-[9px] font-black uppercase tracking-widest mt-2",
                        message.role === 'user' ? "text-indigo-200/50 text-right" : "text-white/20"
                      )}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}

                    {message.role === 'model' && !isLoading && index === messages.length - 1 && !message.content.includes('{') && (
                      <div className="mt-8 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-2 mb-5">
                           <div className="p-1 px-2.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 flex items-center gap-2">
                              <Sparkles size={12} className="text-indigo-400" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-300">Boost de Production AI</span>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button 
                            onClick={() => handleMarketingAssets('landing')}
                            className="group flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/50 rounded-2xl transition-all text-left shadow-lg"
                          >
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-inner">
                              <Layout size={22} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-white leading-none mb-1.5 uppercase tracking-tighter">Architecture Landing</p>
                              <p className="text-[10px] text-white/30 font-medium leading-tight">La structure gagnante pour ton produit</p>
                            </div>
                            <ChevronRight size={14} className="ml-auto text-white/10 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                          </button>

                      <button 
                        onClick={handlePricingStrategy}
                        className="group flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/50 rounded-2xl transition-all text-left shadow-lg"
                      >
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-inner">
                          <Banknote size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white leading-none mb-1.5 uppercase tracking-tighter">Stratégie de Prix</p>
                          <p className="text-[10px] text-white/30 font-medium leading-tight">Calcul de rentabilité COD opti</p>
                        </div>
                        <ChevronRight size={14} className="ml-auto text-white/10 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </button>

                      <button 
                        onClick={() => handleMarketingAssets('static')}
                        className="group flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-sky-500/10 border border-white/5 hover:border-sky-500/50 rounded-2xl transition-all text-left shadow-lg"
                      >
                        <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform shadow-inner">
                          <Megaphone size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white leading-none mb-1.5 uppercase tracking-tighter">Creative Brief Ads</p>
                          <p className="text-[10px] text-white/30 font-medium leading-tight">Briefs pour tes visuels statiques</p>
                        </div>
                        <ChevronRight size={14} className="ml-auto text-white/10 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                      </button>

                      <button 
                        onClick={() => handleMarketingAssets('video')}
                        className="group flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/50 rounded-2xl transition-all text-left shadow-lg"
                      >
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-inner">
                          <Video size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white leading-none mb-1.5 uppercase tracking-tighter">Brief Script Vidéo</p>
                          <p className="text-[10px] text-white/30 font-medium leading-tight">Script UGC & Studio complet</p>
                        </div>
                        <ChevronRight size={14} className="ml-auto text-white/10 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
          {isLoading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-500/20 animate-pulse">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="bg-white/5 p-5 rounded-2xl rounded-tl-none border border-white/10 shadow-2xl flex items-center gap-4">
                <div className="flex gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                </div>
                <span className="text-xs text-white/40 font-medium font-mono uppercase tracking-widest animate-pulse">L'expert réfléchit...</span>
              </div>
            </div>
          )}
        </div>

        {selectedImage && (
          <div className="px-4 py-2 bg-black/40 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover rounded-lg border border-white/20" />
                {isAnalyzingImage && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center rounded-lg">
                    <Loader2 size={16} className="text-indigo-400 animate-spin" />
                  </div>
                )}
                <button 
                  onClick={() => {
                    setSelectedImage(null);
                    setDetectedProduct(null);
                    setShowDetectedInfo(false);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                >
                  <X size={12} />
                </button>
              </div>
              <div>
                <p className="text-xs text-gray-200 font-bold">{isAnalyzingImage ? "Analyse IA en cours..." : "Photo prête à être analysée"}</p>
                <p className="text-[10px] text-gray-500">Extraction auto des specs produits activée</p>
              </div>
            </div>
            
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Lancer l'Analyse Visuelle
            </button>
          </div>
        )}

        <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-xl relative">
           {/* Quick Actions Popup / Indicator */}
           <div className="absolute -top-12 left-0 right-0 px-4 pointer-events-none">
              <div className="flex justify-center gap-2">
                 {inputValue.length > 5 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-indigo-600/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-xl flex items-center gap-2"
                    >
                      <Sparkles size={10} className="text-white animate-pulse" />
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">IA Prête à analyser</span>
                    </motion.div>
                 )}
              </div>
           </div>

          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageSelect}
            />
            
            <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded-2xl p-1 shadow-inner">
               <button
                 onClick={() => fileInputRef.current?.click()}
                 className="p-3 text-gray-400 hover:text-indigo-400 hover:bg-white/5 rounded-xl transition-all relative group"
                 title="Ajouter une image"
               >
                 <ImageIcon size={20} />
                 <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md text-white text-[9px] font-black py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all border border-white/10 shadow-2xl pointer-events-none uppercase tracking-widest">
                   Upload Photo
                 </span>
               </button>

               <div className="w-px h-6 bg-white/5 mx-1" />

               <button
                 onClick={handleMarketAnalysis}
                 disabled={isLoading || isAnalyzingMarket}
                 className="p-3 text-gray-400 hover:text-emerald-400 hover:bg-white/5 rounded-xl transition-all group relative"
                 title="Analyse de Marché & Prix"
               >
                 {isAnalyzingMarket ? <Loader2 size={20} className="animate-spin text-emerald-400" /> : <BarChart3 size={20} />}
                 <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md text-white text-[9px] font-black py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all border border-white/10 shadow-2xl pointer-events-none uppercase tracking-widest">
                   Analyse Marché
                 </span>
               </button>

               <button
                 onClick={startComparison}
                 disabled={isLoading || isComparing}
                 className="p-3 text-gray-400 hover:text-orange-400 hover:bg-white/5 rounded-xl transition-all group relative"
                 title="Comparer avec un concurrent"
               >
                 {isComparing && !isComparingUrl ? <Loader2 size={20} className="animate-spin text-orange-400" /> : <Scale size={20} />}
                 <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md text-white text-[9px] font-black py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all border border-white/10 shadow-2xl pointer-events-none uppercase tracking-widest">
                   Comparateur
                 </span>
               </button>

               <button
                 onClick={startUrlComparison}
                 disabled={isLoading || isComparing}
                 className="p-3 text-gray-400 hover:text-blue-400 hover:bg-white/5 rounded-xl transition-all group relative"
                 title="Comparer via URL"
               >
                 {isComparing && isComparingUrl ? <Loader2 size={20} className="animate-spin text-blue-400" /> : <LinkIcon size={20} />}
                 <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md text-white text-[9px] font-black py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all border border-white/10 shadow-2xl pointer-events-none uppercase tracking-widest">
                   Analyse URL
                 </span>
               </button>
            </div>
            
            <div className="flex-1 relative group">
               <input
                 type="text"
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                 placeholder="Demandez une analyse, un script ou envoyez une photo..."
                 className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm shadow-inner group-hover:bg-white/[0.05]"
               />
               <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 <button
                   onClick={handleSend}
                   disabled={isLoading || (!inputValue.trim() && !selectedImage)}
                   className={cn(
                     "p-2.5 rounded-xl transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:active:scale-100",
                     inputValue.trim() || selectedImage ? "bg-indigo-600 text-white shadow-indigo-600/40" : "bg-white/5 text-gray-500"
                   )}
                 >
                   <Send className="w-5 h-5" />
                 </button>
               </div>
            </div>
          </div>
        </div>
          </>
        )}
        </div>

        {/* Product Info Sidebar */}
        <AnimatePresence>
          {showDetectedInfo && detectedProduct && activeTab === 'chat' && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-black/40 border-l border-white/10 overflow-y-auto custom-scrollbar flex flex-col"
            >
              <div className="p-4 border-b border-white/10 bg-indigo-500/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Analyse Produit IA</span>
                </div>
                <button 
                  onClick={() => setShowDetectedInfo(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-6">
                {/* Product Name */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5">
                      <ShoppingBag size={10} />
                      Nom Commercial (Français)
                    </label>
                    <input 
                      value={detectedProduct.name}
                      onChange={(e) => setDetectedProduct({...detectedProduct, name: e.target.value})}
                      placeholder="Ex: Hachoir Intelligent 5-en-1"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5">
                      <Radio size={10} />
                      Nom Adapté (Algeria / Darija)
                    </label>
                    <input 
                      value={detectedProduct.nameAr}
                      onChange={(e) => setDetectedProduct({...detectedProduct, nameAr: e.target.value})}
                      dir="rtl"
                      placeholder="Ex: الهاشوار العجيبة 5 في 1"
                      className="w-full bg-white/10 border border-indigo-500/30 rounded-xl px-3 py-2.5 text-xs text-indigo-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-arabic"
                    />
                    <p className="text-[8px] text-indigo-400/60 italic px-1">Optimisé pour la résonance locale</p>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Niche / Catégorie</label>
                  <input 
                    value={detectedProduct.category}
                    onChange={(e) => setDetectedProduct({...detectedProduct, category: e.target.value})}
                    placeholder="Ex: Électroménager / Cuisine"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                </div>

                {/* Color Palette */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Identité Visuelle (Couleurs)</label>
                    <div className="flex -space-x-1.5">
                      {detectedProduct.colorPalette.map((color, i) => (
                        <div 
                          key={i}
                          className="w-4 h-4 rounded-full border-2 border-black/50 shadow-lg"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detectedProduct.colorPalette.map((color, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-white/5 px-2 py-1.5 rounded-lg border border-white/5 hover:border-white/20 transition-all">
                        <div className="w-2.5 h-2.5 rounded-full shadow-inner" style={{ backgroundColor: color }} />
                        <span className="text-[9px] font-mono text-white/40">{color}</span>
                        <button 
                          onClick={() => {
                            const newPalette = [...detectedProduct.colorPalette];
                            newPalette.splice(i, 1);
                            setDetectedProduct({...detectedProduct, colorPalette: newPalette});
                          }}
                          className="text-white/20 hover:text-red-400 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                        setDetectedProduct({...detectedProduct, colorPalette: [...detectedProduct.colorPalette, randomColor]});
                      }}
                      className="px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/20 text-[10px] text-indigo-400 transition-all"
                    >
                      + Ajouter
                    </button>
                  </div>
                </div>

                {/* Selling Points */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Arguments de vente (Hooks)</label>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-black">AI SUGGESTED</span>
                  </div>
                  <div className="space-y-2">
                    {detectedProduct.sellingPoints.map((point, i) => (
                      <div key={i} className="group relative">
                        <textarea 
                          value={point}
                          onChange={(e) => {
                            const newPoints = [...detectedProduct.sellingPoints];
                            newPoints[i] = e.target.value;
                            setDetectedProduct({...detectedProduct, sellingPoints: newPoints});
                          }}
                          placeholder="Décrivez un avantage clé..."
                          rows={2}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none hover:bg-white/10 transition-all leading-relaxed"
                        />
                        <button 
                          onClick={() => {
                            const newPoints = [...detectedProduct.sellingPoints];
                            newPoints.splice(i, 1);
                            setDetectedProduct({...detectedProduct, sellingPoints: newPoints});
                          }}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white/20 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => setDetectedProduct({...detectedProduct, sellingPoints: [...detectedProduct.sellingPoints, '']})}
                      className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={12} />
                      Ajouter une spécificité
                    </button>
                  </div>
                </div>

                {/* Strategy Integration */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                   <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                      <p className="text-[10px] text-indigo-300 leading-tight">
                        <Sparkles size={10} className="inline mr-1 mb-0.5" />
                        Prêt pour la génération d'actifs marketing DZADS.
                      </p>
                   </div>
                  <button
                    onClick={() => {
                      setInputValue(`Voici un nouveau produit à analyser :\n\n- Nom : ${detectedProduct.name}\n- Catégorie : ${detectedProduct.category}\n- Points de vente : ${detectedProduct.sellingPoints.join(', ')}\n\nPeux-tu élaborer une stratégie marketing complète adaptée au marché algérien ?`);
                      setShowDetectedInfo(false);
                      setSelectedImage(null);
                    }}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]"
                  >
                    Valider & Lancer l'Analyse
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-4 flex gap-4 items-center justify-center">
        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Analyse Visuelle Multimodale Activée
        </span>
      </div>
    </div>
  );
}
