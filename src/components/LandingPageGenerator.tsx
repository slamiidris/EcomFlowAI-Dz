import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Copy, 
  Check, 
  FileText, 
  Download, 
  Layout, 
  Image as ImageIcon, 
  X,
  ChevronDown,
  ChevronUp,
  Settings2,
  ListOrdered,
  Mic2,
  Palette,
  Flag,
  Languages,
  Maximize,
  Monitor,
  Smartphone,
  Square as SquareIcon,
  RotateCcw,
  Target,
  Zap,
  History,
  MessageSquare,
  Search,
  Trash2,
  Plus,
  Archive,
  ChevronRight,
  GripVertical,
  Tag,
  User,
  Package,
  PenTool,
  Car,
  Bus,
  Plane,
  Briefcase,
  Heart,
  Flame,
  Home,
  Star,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CopyCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { generateLandingPageCopy, translateToArabic, analyzeProductAnglesFromImage, completeProductAnalysisWithAngle } from '../services/gemini';
import LPVisualMockup from './LPVisualMockup';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { addToHistory } from '../lib/history';
import PromptField from './PromptField';

interface LPSession {
  id: string;
  title: string;
  updatedAt: number;
  state: {
    productName: string;
    productNameAr: string;
    brand: string;
    category: string;
    productType: string;
    targetAudience: string;
    colorPalette: string;
    selectedPaletteId: string | null;
    sellingPoints: string;
    description: string;
    marketingAngle: string;
    nicheAngle?: string;
    funnelStrategy: string;
    numSections: number;
    tone: string;
    designStyle: string;
    visualStyle: string;
    pageType: string;
    targetMarket: string;
    language: string;
    aspectRatio: string;
    lpData: any | null;
  }
}

interface SortableSectionProps {
  id: string;
  section: any;
  index: number;
  totalSections?: number;
  updateSectionField: (index: number, field: string, value: any) => void;
  selectedCtaIndex: Record<number, number>;
  handleCtaChange: (sectionIndex: number, variationIndex: number) => void;
  deleteSection: (index: number) => void;
  moveSection?: (index: number, direction: 'up' | 'down') => void;
  duplicateSection?: (index: number) => void;
}

const SortableSection = ({
  id,
  section,
  index,
  totalSections = 0,
  updateSectionField,
  selectedCtaIndex,
  handleCtaChange,
  deleteSection,
  moveSection,
  duplicateSection
}: SortableSectionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  const toast = useToast();
  const s = section;
  const i = index;
  const isHero = i === 0 || s.step?.toLowerCase().includes('hero') || s.narrativeRole?.toLowerCase().includes('hook');

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      <div className={`overflow-hidden group transition-all rounded-[1.8rem] sm:rounded-[2rem] border ${
        isHero 
          ? 'bg-emerald-600/10 border-emerald-500/40 shadow-2xl shadow-emerald-500/10' 
          : 'bg-white/5 border-white/10 hover:border-emerald-500/30'
      }`}>
        <div className={`p-3.5 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b ${
          isHero ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button 
              {...attributes} 
              {...listeners}
              className="p-1.5 text-white/30 hover:text-emerald-400 transition-colors cursor-grab active:cursor-grabbing shrink-0"
              title="سحب لإعادة الترتيب"
            >
              <GripVertical size={18} />
            </button>

            {/* Section Number Badge */}
            <div className="flex items-center justify-center px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-mono font-black text-xs shadow-inner shrink-0">
              <span className="text-[9px] font-sans font-extrabold uppercase mr-1 text-emerald-300">قسم</span>
              <span>#{i + 1}</span>
            </div>

            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isHero ? 'bg-emerald-500 text-white shadow-lg' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <Layout size={16} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${isHero ? 'text-emerald-400' : 'text-emerald-400'}`}>{s.step?.split('—').pop()?.trim() || 'SECTION'}</span>
                <span className={`text-[8px] sm:text-[9px] font-black px-1.5 rounded uppercase tracking-tighter ${
                  isHero ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/40'
                }`}>{s.narrativeRole}</span>
                {isCollapsed && (
                  <span className="text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    مصغّر
                  </span>
                )}
              </div>
              <h3 className={`font-black tracking-tight ${isHero ? 'text-white text-base sm:text-xl font-arabic drop-shadow-sm' : 'text-white text-sm sm:text-base'}`}>
                <input 
                  value={s.title}
                  onChange={(e) => updateSectionField(i, 'title', e.target.value)}
                  dir="rtl"
                  className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-emerald-500/20 rounded px-1 -ml-1 w-full placeholder:text-white/20 text-right truncate"
                />
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-auto shrink-0 bg-black/30 sm:bg-transparent p-1 sm:p-0 rounded-xl border border-white/5 sm:border-none">
            {/* Quick Up/Down controls for mobile */}
            {moveSection && (
              <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-xl p-0.5">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => moveSection(i, 'up')}
                  className="p-1.5 text-white/50 hover:text-emerald-400 disabled:opacity-20 rounded-lg hover:bg-white/10 transition-all"
                  title="تحريك القسم للأعلى"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={totalSections > 0 && i === totalSections - 1}
                  onClick={() => moveSection(i, 'down')}
                  className="p-1.5 text-white/50 hover:text-emerald-400 disabled:opacity-20 rounded-lg hover:bg-white/10 transition-all"
                  title="تحريك القسم للأسفل"
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            )}

            {duplicateSection && (
              <button
                type="button"
                onClick={() => duplicateSection(i)}
                className="p-1.5 text-white/50 hover:text-emerald-400 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                title="نسخ القسم (مضاعفة)"
              >
                <CopyCheck size={14} />
              </button>
            )}

            {/* Collapse / Expand Button */}
            <button 
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 text-xs font-black border ${
                isCollapsed 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 shadow-md' 
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={isCollapsed ? "توسيع الحقل" : "تصغير الحقل"}
            >
              {isCollapsed ? (
                <>
                  <ChevronDown size={14} className="text-emerald-400" />
                  <span className="text-[10px] sm:text-[11px] font-bold">توسيع</span>
                </>
              ) : (
                <>
                  <ChevronUp size={14} className="text-emerald-400" />
                  <span className="text-[10px] sm:text-[11px] font-bold">تصغير</span>
                </>
              )}
            </button>

            <button 
              onClick={() => deleteSection(i)}
              className="p-1.5 sm:p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              title="Supprimer cette section"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="p-3 sm:p-5 md:p-6">
            <div className="space-y-3 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 bg-black/40 rounded-lg sm:rounded-xl border border-white/5 gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[8.5px] sm:text-[9.5px] font-black text-white/40 uppercase tracking-wider">Prompt IA de la Section</p>
                  </div>
                  <button 
                    onClick={() => {
                      const promptToCopy = s.prompt || (typeof s.imagePrompt === 'object' ? JSON.stringify(s.imagePrompt, null, 2) : '');
                      navigator.clipboard.writeText(promptToCopy);
                      toast.success("Prompt copié ! 📋");
                    }}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-md sm:rounded-lg text-[9px] sm:text-[10.5px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-500/15 active:scale-95 shrink-0"
                  >
                    <Copy size={11} className="sm:size-[12px]" /> Copier le Prompt
                  </button>
                </div>

                {s.cta && (
                  <div className="p-2.5 sm:p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl sm:rounded-2xl space-y-2.5 sm:space-y-3.5 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-[8px] sm:text-[9px] text-emerald-400 font-black uppercase tracking-wider">Optimisation Conversion</p>
                        <h4 className="text-white font-bold text-[11px] sm:text-xs">Choisissez votre angle de CTA</h4>
                      </div>
                      <div className="flex p-0.5 bg-black/50 rounded-lg border border-white/10 backdrop-blur-md overflow-x-auto max-w-full">
                        {(s.cta.variations || []).map((v: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleCtaChange(i, idx)}
                            className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-md text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 ${
                              (selectedCtaIndex[i] || 0) === idx 
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                                : 'bg-transparent text-white/40 hover:text-white/70'
                            }`}
                          >
                            {v.type === 'urgency' ? '⚡ Urgence' : v.type === 'benefit' ? '🎁 Bénéfice' : '✅ Direct'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-center py-0.5">
                      <motion.div 
                        key={selectedCtaIndex[i] || 0}
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="w-full max-w-xs sm:max-w-sm px-3 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-500/20 text-center cursor-pointer active:scale-95 transition-transform"
                      >
                        <span className="font-arabic relative z-10 leading-snug">
                          {s.cta.variations ? s.cta.variations[selectedCtaIndex[i] || 0]?.text : (s.cta.text || s.cta)}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function LandingPageGenerator() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const [sessions, setSessions] = useState<LPSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const [productName, setProductName] = useState('');
  const [productNameAr, setProductNameAr] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [productType, setProductType] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [colorPalette, setColorPalette] = useState('');
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);
  const [sellingPoints, setSellingPoints] = useState('');
  const [description, setDescription] = useState('');
  const [marketingAngle, setMarketingAngle] = useState('');
  const [nicheAngle, setNicheAngle] = useState('');
  const [suggestedNicheAngles, setSuggestedNicheAngles] = useState<Array<{id: string, label: string, desc: string, icon: string}>>([
    { id: 'السيارات (Automobiles)', label: 'السيارات', desc: 'Voitures', icon: 'car' },
    { id: 'الحافلات (Transport)', label: 'الحافلات', desc: 'Autobus', icon: 'bus' },
    { id: 'الطائرات (Aviation)', label: 'الطائرات', desc: 'Avions', icon: 'plane' },
    { id: 'المنزل (Maison)', label: 'المنزل', desc: 'Maison', icon: 'home' }
  ]);
  const [funnelStrategy, setFunnelStrategy] = useState<string>('AIDA');
  
  // Advanced parameters
  const [numSections, setNumSections] = useState(8);
  const [tone, setTone] = useState('Vendeur / Persuasif');
  const [designStyle, setDesignStyle] = useState('Moderne / Minimaliste');
  const [visualStyle, setVisualStyle] = useState('Lifestyle');
  const [pageType, setPageType] = useState('Landing Page Classique');
  const [targetMarket, setTargetMarket] = useState('Algérie (58 wilayas)');
  const [language, setLanguage] = useState('Arabe / Darija Algérienne');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const resetAdvanced = () => {
    setNumSections(6);
    setTone('Vendeur / Persuasif');
    setDesignStyle('Moderne / Minimaliste');
    setVisualStyle('Lifestyle');
    setPageType('Landing Page Classique');
    setTargetMarket('Algérie (58 wilayas)');
    setLanguage('Arabe / Darija Algérienne');
  };

  const [images, setImages] = useState<Array<{ data: string, mimeType: string }>>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [storedImagesData, setStoredImagesData] = useState<Array<{ data: string, mimeType: string }>>([]);

  // Getters for backwards compatibility
  const imagePreview = imagePreviews[0] || null;
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [pendingAngleSelection, setPendingAngleSelection] = useState(false);
  const [completingAnalysis, setCompletingAnalysis] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [result, setResult] = useState('');
  const [lpData, setLpData] = useState<any>(null);
  const [mobileViewTab, setMobileViewTab] = useState<'settings' | 'result'>('settings');
  const [layoutMode, setLayoutMode] = useState<'structure' | 'mockup'>('structure');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedCtaIndex, setSelectedCtaIndex] = useState<Record<number, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLpData((prev: any) => {
        if (!prev) return prev;
        
        const oldIndex = prev.sections.findIndex((s: any) => (s.id || s.title) === active.id);
        const newIndex = prev.sections.findIndex((s: any) => (s.id || s.title) === over.id);
        
        const newSections = arrayMove(prev.sections, oldIndex, newIndex);
        
        // Update steps and prompts dynamically
        const updatedSections = newSections.map((section: any, index: number) => {
          const total = newSections.length;
          const displayIndex = index + 1;
          const paddedIndex = displayIndex.toString().padStart(2, '0');
          
          // Update step label (e.g., "Étape 01 — HERO")
          let newStep = section.step || "";
          if (newStep.includes("Étape")) {
            newStep = newStep.replace(/Étape \d+/, `Étape ${paddedIndex}`);
          } else {
            // Fallback if step doesn't follow pattern
            const parts = newStep.split('—');
            if (parts.length > 1) {
              newStep = `Étape ${paddedIndex} — ${parts[1].trim()}`;
            }
          }

          // Update prompt (e.g., "SECTION [1]/[6]")
          let newPrompt = section.prompt || "";
          newPrompt = newPrompt.replace(/SECTION \d+\/\d+/, `SECTION ${displayIndex}/${total}`);
          newPrompt = newPrompt.replace(/SECTION \[\d+\]\/\[\d+\]/, `SECTION [${displayIndex}]/[${total}]`);
          
          // Update technical params in prompt if any mapping to index exists
          newPrompt = newPrompt.replace(/SECTION \[\d+\]\/\[\d+\]/g, `SECTION [${displayIndex}]/[${total}]`);

          return {
            ...section,
            step: newStep,
            prompt: newPrompt
          };
        });

        return { ...prev, sections: updatedSections };
      });
    }
  };

  // Load sessions on mount
  useEffect(() => {
    const saved = localStorage.getItem('dzads_lp_sessions');
    const lastActiveId = localStorage.getItem('dzads_lp_last_active_id');
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all restored sections have IDs for dnd-kit
        const migrated = parsed.map((session: LPSession) => ({
          ...session,
          state: {
            ...session.state,
            lpData: session.state.lpData ? {
              ...session.state.lpData,
              sections: session.state.lpData.sections?.map((s: any, idx: number) => ({
                ...s,
                id: s.id || `restored-${idx}-${Date.now()}`
              })) || []
            } : null
          }
        }));
        setSessions(migrated);
        
        if (lastActiveId) {
          const lastSession = migrated.find((s: LPSession) => s.id === lastActiveId);
          if (lastSession) {
            restoreSession(lastSession);
          }
        }
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    localStorage.setItem('dzads_lp_sessions', JSON.stringify(sessions));
    if (currentSessionId) {
      localStorage.setItem('dzads_lp_last_active_id', currentSessionId);
    }
  }, [sessions, currentSessionId]);

  // Periodic auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveCurrentSession();
    }, 30000);
    return () => clearInterval(interval);
  }, [productName, lpData, brand, category, description]); // Trigger auto-save on main field changes

  const saveCurrentSession = () => {
    if (!productName && !brand && !lpData) return;

    const sessionId = currentSessionId || Date.now().toString();
    if (!currentSessionId) setCurrentSessionId(sessionId);

    const newState: LPSession['state'] = {
      productName, productNameAr, brand, category, productType, 
      targetAudience, colorPalette, selectedPaletteId, sellingPoints,
      description, marketingAngle, nicheAngle, funnelStrategy, numSections,
      tone, designStyle, visualStyle, pageType, targetMarket, 
      language, aspectRatio, lpData
    };

    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      return [{
        id: sessionId,
        title: productName || "Sans Titre",
        updatedAt: Date.now(),
        state: newState
      }, ...filtered];
    });
  };

  const restoreSession = (session: LPSession) => {
    const s = session.state;
    setProductName(s.productName || '');
    setProductNameAr(s.productNameAr || '');
    setBrand(s.brand || '');
    setCategory(s.category || '');
    setProductType(s.productType || '');
    setTargetAudience(s.targetAudience || '');
    setColorPalette(s.colorPalette || '');
    setSelectedPaletteId(s.selectedPaletteId);
    setSellingPoints(s.sellingPoints || '');
    setDescription(s.description || '');
    setMarketingAngle(s.marketingAngle || '');
    setNicheAngle(s.nicheAngle || '');
    setFunnelStrategy(s.funnelStrategy || 'AIDA');
    setNumSections(s.numSections || 6);
    setTone(s.tone || 'Vendeur / Persuasif');
    setDesignStyle(s.designStyle || 'Moderne / Minimaliste');
    setVisualStyle(s.visualStyle || 'Lifestyle');
    setPageType(s.pageType || 'Landing Page Classique');
    setTargetMarket(s.targetMarket || 'Algérie (58 wilayas)');
    setLanguage(s.language || 'Arabe / Darija Algérienne');
    setAspectRatio(s.aspectRatio || '16:9');
    setLpData(s.lpData);
    setCurrentSessionId(session.id);
  };

  const loadSession = (session: LPSession) => {
    restoreSession(session);
    setActiveTab('editor');
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
  };

  const startNewSession = () => {
    setCurrentSessionId(null);
    setProductName('');
    setProductNameAr('');
    setBrand('');
    setCategory('');
    setProductType('');
    setTargetAudience('');
    setColorPalette('');
    setSelectedPaletteId(null);
    setSellingPoints('');
    setDescription('');
    setMarketingAngle('');
    setNicheAngle('');
    setFunnelStrategy('AIDA');
    resetAdvanced();
    setLpData(null);
    removeAllImages();
    setActiveTab('editor');
  };

  const PALETTE_PRESETS = [
    { id: 'luxe', name: 'Luxe / Premium', colors: ['#000000', '#C5A059', '#FFFFFF'], label: 'Premium Noir & Or' },
    { id: 'dz-royal', name: 'DZ Royal', colors: ['#02774B', '#FFFFFF', '#D11028'], label: 'Identité Algérienne' },
    { id: 'tech', name: 'High-Tech', colors: ['#020617', '#06B6D4', '#FFFFFF'], label: 'Futuriste Cyber' },
    { id: 'natural', name: 'Bio / Naturel', colors: ['#064E3B', '#F5F5DC', '#78350F'], label: 'Éco-Responsable' },
    { id: 'vibrant', name: 'DTC / Pop', colors: ['#7C3AED', '#EC4899', '#FFFFFF'], label: 'Jeune & Dynamique' },
    { id: 'oasis', name: 'Oasis Desert', colors: ['#D97706', '#3B82F6', '#10B981'], label: 'Sable & Eau' },
    { id: 'midnight', name: 'Rose Midnight', colors: ['#111827', '#E11D48', '#F3F4F6'], label: 'Vibe Nocturne' },
    { id: 'minimal', name: 'Minimaliste', colors: ['#F9FAFB', '#111827', '#6B7280'], label: 'Clean Modern' },
    { id: 'urgency', name: 'Flash Sale', colors: ['#DC2626', '#000000', '#F97316'], label: 'Conversion Rapide' },
  ];

  const handleSelectPalette = (palette: typeof PALETTE_PRESETS[0]) => {
    setSelectedPaletteId(palette.id);
    setColorPalette(palette.colors.join(', '));
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const currentCount = images.length;
    const maxAllowed = 5 - currentCount;

    if (maxAllowed <= 0) {
      toast.error("لقد وصلت إلى الحد الأقصى (5 صور كحد أقصى). يمكنك حذف صورة لإضافة غيرها.");
      return;
    }

    const filesToProcess = fileArray.slice(0, maxAllowed);
    if (fileArray.length > maxAllowed) {
      toast.info(`تم اختيار أول ${maxAllowed} صور فقط لأن الحد الأقصى هو 5 صور.`);
    }

    try {
      const readPromises = filesToProcess.map(file => {
        return new Promise<{ imageData: { data: string, mimeType: string }, preview: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve({
              imageData: { data: base64String, mimeType: file.type },
              preview: reader.result as string
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const results = await Promise.all(readPromises);
      const newImageDataList = results.map(r => r.imageData);
      const newPreviewList = results.map(r => r.preview);

      const updatedImages = [...images, ...newImageDataList];
      const updatedPreviews = [...imagePreviews, ...newPreviewList];

      setImages(updatedImages);
      setImagePreviews(updatedPreviews);

      // Start auto-analysis (Step 1: Detect basic details and suggest niche marketing angles using ALL uploaded images)
      setAnalyzing(true);
      setPendingAngleSelection(false);
      setCompletingAnalysis(false);
      setError(null);

      toast.success(`تم تحميل ${updatedImages.length} صور للتحليل الشامل بالذكاء الاصطناعي 🎯`);

      const analysis = await analyzeProductAnglesFromImage(updatedImages);
      if (analysis) {
        setProductName(analysis.name || '');
        setBrand(analysis.brand || '');
        setCategory(analysis.category || '');
        if (analysis.suggestedNicheAngles && Array.isArray(analysis.suggestedNicheAngles) && analysis.suggestedNicheAngles.length > 0) {
          setSuggestedNicheAngles(analysis.suggestedNicheAngles);
        }
        
        // Save image data to state and wait for user selection
        setStoredImagesData(updatedImages);
        setPendingAngleSelection(true);
        toast.success("تم تحليل جميع الصور بنجاح! اختر الزاوية التسويقية المناسبة لمواصلة إنشاء صفحة الهبوط. 🎯");
      } else {
        setError("L'analyse préliminaire des images a échoué (Quota Gemini épuisé ou erreur technique).");
      }
    } catch (err: any) {
      console.error("Analysis failed:", err);
      const errorStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err) || "");
      const isQuota = 
        errorStr.includes("429") || 
        errorStr.includes("RESOURCE_EXHAUSTED") || 
        errorStr.includes("quota") ||
        errorStr.toLowerCase().includes("exceeded") ||
        errorStr.includes("QUOTA_EXCEEDED") ||
        err?.status === "RESOURCE_EXHAUSTED" ||
        errorStr.toLowerCase().includes("limit reached");
      
      if (isQuota) {
        setError("Quota Gemini épuisé. L'IA est surchargée ou vous avez atteint votre limite temporaire (Erreur 429). Veuillez patienter 1 minute ou remplir manuellement.");
      } else {
        setError("Erreur lors de l'analyse des images. Veuillez vérifier votre connexion.");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectNicheAngleAndComplete = async (angleId: string) => {
    if (storedImagesData.length === 0) return;
    setNicheAngle(angleId);
    setPendingAngleSelection(false);
    setCompletingAnalysis(true);
    setError(null);
    try {
      const basicInfo = { name: productName, brand, category };
      const fullAnalysis = await completeProductAnalysisWithAngle(storedImagesData, angleId, basicInfo);
      if (fullAnalysis) {
        if (fullAnalysis.nameAr) {
          setProductNameAr(fullAnalysis.nameAr);
        } else if (productName) {
          try {
            const translated = await translateToArabic(productName);
            setProductNameAr(translated);
          } catch (e) {
            setProductNameAr(productName);
          }
        }
        setProductType(fullAnalysis.type || '');
        setTargetAudience(fullAnalysis.targetAudience || '');
        setColorPalette(fullAnalysis.colorPalette?.join(', ') || '');
        setSellingPoints(fullAnalysis.sellingPoints?.join('\n') || '');
        setDescription(fullAnalysis.briefDescription || '');
        if (fullAnalysis.marketingAngle) setMarketingAngle(fullAnalysis.marketingAngle);
        if (fullAnalysis.funnelStrategy) setFunnelStrategy(fullAnalysis.funnelStrategy);
        if (fullAnalysis.tone) setTone(fullAnalysis.tone);
        if (fullAnalysis.designStyle) setDesignStyle(fullAnalysis.designStyle);
        if (fullAnalysis.pageType) setPageType(fullAnalysis.pageType);
        
        toast.success("Analyse 360° terminée ! Toutes les données ont été optimisées selon vos photos et votre angle. 🚀");
      } else {
        setError("La finalisation de l'analyse a échoué.");
      }
    } catch (err: any) {
      console.error("Complete analysis failed:", err);
      setError("Une erreur est survenue lors de la finalisation de l'analyse.");
    } finally {
      setCompletingAnalysis(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!analyzing) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (analyzing) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);

    setImages(updatedImages);
    setImagePreviews(updatedPreviews);
    setStoredImagesData(updatedImages);

    if (updatedImages.length === 0) {
      setPendingAngleSelection(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setMainImage = (index: number) => {
    if (index === 0 || index >= images.length) return;
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    const [selectedImg] = newImages.splice(index, 1);
    const [selectedPrev] = newPreviews.splice(index, 1);

    newImages.unshift(selectedImg);
    newPreviews.unshift(selectedPrev);

    setImages(newImages);
    setImagePreviews(newPreviews);
    setStoredImagesData(newImages);
    toast.success("تم تعيين هذه الصورة كصورة رئيسية (#1) 🌟");
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const newPreviews = [...imagePreviews];

    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    [newPreviews[index], newPreviews[targetIndex]] = [newPreviews[targetIndex], newPreviews[index]];

    setImages(newImages);
    setImagePreviews(newPreviews);
    setStoredImagesData(newImages);
    toast.success("تم تغيير موقع الصورة 🔄");
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!lpData) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lpData.sections.length) return;

    const newSections = [...lpData.sections];
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setLpData({ ...lpData, sections: newSections });
    toast.success("تم تغيير موقع القسم بنجاح 🔄");
  };

  const duplicateSection = (index: number) => {
    if (!lpData) return;
    const sectionToClone = lpData.sections[index];
    const clonedSection = {
      ...sectionToClone,
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${sectionToClone.title} (نسخة)`
    };
    const newSections = [...lpData.sections];
    newSections.splice(index + 1, 0, clonedSection);
    setLpData({ ...lpData, sections: newSections });
    toast.success("تمت مضاعفة القسم بنجاح 📋");
  };

  const removeAllImages = () => {
    setImages([]);
    setImagePreviews([]);
    setStoredImagesData([]);
    setPendingAngleSelection(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!productName) return;
    setLoading(true);
    setError(null);
    try {
      const productData = {
        name: productName,
        brand,
        category,
        productType,
        targetAudience,
        colorPalette: colorPalette.split(',').map(c => c.trim()).filter(c => c),
        sellingPoints: sellingPoints.split('\n').map(s => s.trim()).filter(s => s),
        description,
        marketingAngle,
        nicheAngle,
        funnelStrategy,
        numSections,
        tone,
        designStyle,
        visualStyle,
        pageType,
        targetMarket,
        language
      };
      const data = await generateLandingPageCopy(productData, images.length > 0 ? images : undefined, aspectRatio);
      if (data && data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
        // Add unique IDs to sections for dnd-kit
        const sectionsWithIds = data.sections.map((section: any, idx: number) => ({
          ...section,
          id: `section-${idx}-${Date.now()}`
        }));
        const finalData = { ...data, sections: sectionsWithIds };
        setLpData(finalData);
        setResult(JSON.stringify(finalData, null, 2));
        setMobileViewTab('result');
        toast.success("Landing page générée avec succès ! 🚀");

        // Record to centralized history
        const sessionId = currentSessionId || Date.now().toString();
        const historyPayload = {
          id: sessionId,
          title: productName,
          updatedAt: Date.now(),
          state: {
            productName, productNameAr, brand, category, productType, 
            targetAudience, colorPalette, selectedPaletteId, sellingPoints,
            description, marketingAngle, nicheAngle, funnelStrategy, numSections,
            tone, designStyle, visualStyle, pageType, targetMarket, 
            language, aspectRatio, lpData: finalData
          }
        };

        addToHistory(
          'landing_page',
          productName,
          historyPayload,
          `Marque: ${brand || 'N/A'} | Catégorie: ${category || 'Générique'}`,
          {
            productName,
            brand,
            category,
          }
        );
      } else {
        throw new Error("Failed to generate meaningful content or quota reached. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur de génération. Veuillez essayer de nouveau.");
      const errorStr = typeof err === 'string' ? err : (err?.message || JSON.stringify(err) || "");
      const isQuota = 
        errorStr.includes("429") || 
        errorStr.includes("RESOURCE_EXHAUSTED") || 
        errorStr.includes("quota") ||
        errorStr.toLowerCase().includes("exceeded") ||
        errorStr.includes("QUOTA_EXCEEDED") ||
        err?.status === "RESOURCE_EXHAUSTED" ||
        errorStr.toLowerCase().includes("limit reached");
      
      if (isQuota || errorStr.includes("QUOTA_EXCEEDED")) {
        setError("Quota Gemini épuisé. L'API est surchargée ou vous avez atteint votre limite temporaire. Veuillez patienter 1 à 2 minutes avant de réessayer.");
      } else {
        setError("Une erreur est survenue lors de la génération. Veuillez vérifier votre connexion et réessayer.");
      }
    } finally {
      setLoading(false);
      saveCurrentSession();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Structure copiée dans le presse-papiers ! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(lpData, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `DzAds_Landing_${productName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(element);
    element.click();
    toast.success("Fichier JSON exporté ! 📥");
  };

  const updateSectionField = (index: number, field: string, value: any) => {
    if (!lpData) return;
    const newSections = [...lpData.sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setLpData({ ...lpData, sections: newSections });
  };

  const deleteSection = (index: number) => {
    if (!lpData) return;
    const newSections = lpData.sections.filter((_: any, idx: number) => idx !== index);
    setLpData({ ...lpData, sections: newSections });
  };

  const addSection = () => {
    if (!lpData) return;
    const newSection = {
      id: `custom-${Date.now()}`,
      step: `Section ${lpData.sections.length + 1} — NOUVELLE`,
      narrativeRole: '⚡ CONVERSION',
      title: 'قسم جديد مخصص للتحويل',
      content: 'اكتب محتوى القسم التسويقي الخاص بك هنا لجذب اهتمام زوار موقعك...',
      cta: {
        variations: [
          { text: 'اضغط هنا للطلب المباشر', type: 'direct' },
          { text: 'استفد من العرض اليوم', type: 'urgency' },
          { text: 'أريد الحصول على المنتج', type: 'benefit' }
        ],
        subtext: 'الدفع عند الاستلام | الشحن مجاني لـ 58 ولاية'
      },
      prompt: 'High resolution product commercial shot, clean design aesthetic --ar 16:9',
      badges: ['NOUVEAU', 'CONVERSION']
    };
    setLpData({ ...lpData, sections: [...lpData.sections, newSection] });
  };

  const handleCtaChange = (sectionIndex: number, variationIndex: number) => {
    if (!lpData) return;
    
    const section = lpData.sections[sectionIndex];
    if (!section.cta || !section.cta.variations) return;
    
    const newCtaText = section.cta.variations[variationIndex].text;
    
    // Update local state for selection index
    setSelectedCtaIndex(prev => ({ ...prev, [sectionIndex]: variationIndex }));

    // Prepare updated sections
    const newSections = [...lpData.sections];
    let newPrompt = section.prompt || '';
    
    // Use regex to replace the CTA text in the structured prompt
    // 1. CTA visible : "..."
    newPrompt = newPrompt.replace(/CTA visible : ".*?"/g, `CTA visible : "${newCtaText}"`);
    // 2. **CTA bouton :** "..."
    newPrompt = newPrompt.replace(/\*\*CTA bouton :\*\* ".*?"/g, `**CTA bouton :** "${newCtaText}"`);
    // 3. Pattern inside the Image Generator prompt "CTA: '...'"
    newPrompt = newPrompt.replace(/CTA: ".*?"/g, `CTA: "${newCtaText}"`);

    // Update section object
    newSections[sectionIndex] = { 
      ...section, 
      prompt: newPrompt,
      // Also update imagePrompt if structured fields exist
      imagePrompt: section.imagePrompt ? {
        ...section.imagePrompt,
        textInstructions: section.imagePrompt.textInstructions?.replace(/CTA: ".*?"/g, `CTA: "${newCtaText}"`) 
                          || section.imagePrompt.textInstructions
      } : section.imagePrompt
    };
    
    setLpData({ ...lpData, sections: newSections });
  };

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6">
        <div>
          <h1 className="text-sm sm:text-xl md:text-2xl font-bold text-white mb-0.5 sm:mb-1.5 flex items-center gap-1.5 sm:gap-2.5 tracking-tight">
            <div className="p-1 sm:p-1.5 bg-emerald-500/20 rounded-lg shrink-0">
              <FileText className="text-emerald-400 size-3.5 sm:size-4.5 md:size-5" />
            </div>
            <span>Générateur de Landing Page</span>
          </h1>
          <p className="text-[9.5px] sm:text-[11px] md:text-xs text-white/50 px-0.5">Structurez vos pages de vente pour maximiser les commandes COD.</p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 flex-nowrap shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex bg-white/5 p-0.5 sm:p-1 rounded-lg sm:rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab('editor')}
              className={cn(
                "flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-1 sm:py-2 text-[8.5px] sm:text-xs font-black uppercase tracking-wider transition-all rounded sm:rounded-xl whitespace-nowrap cursor-pointer",
                activeTab === 'editor' 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <Zap className="size-2.5 sm:size-3.5" />
              <span>Générateur</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "flex items-center gap-1 sm:gap-2 px-2 sm:px-5 py-1 sm:py-2 text-[8.5px] sm:text-xs font-black uppercase tracking-wider transition-all rounded sm:rounded-xl whitespace-nowrap cursor-pointer",
                activeTab === 'history' 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <History className="size-2.5 sm:size-3.5" />
              <span>Historique ({sessions.length})</span>
            </button>
          </div>
          
          <button
            onClick={startNewSession}
            className="px-2 py-1 sm:p-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-emerald-400 rounded-lg sm:rounded-2xl border border-white/10 transition-all flex items-center gap-1 sm:gap-1.5 group cursor-pointer whitespace-nowrap shrink-0"
            title="Nouveau projet"
          >
            <Plus className="size-3 sm:size-4 group-hover:rotate-90 transition-transform" />
            <span className="text-[8.5px] sm:text-[10px] font-black uppercase tracking-wider">Nouveau</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'history' ? (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white">Vos archives stratégiques</h2>
                  <p className="text-xs text-white/40">Retrouvez toutes vos structures de landing pages passées.</p>
                </div>
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input 
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Rechercher par produit, marque ou catégorie..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {sessions.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-6 bg-white/5 rounded-full">
                    <Archive size={48} className="text-white/10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-bold">Aucune archive disponible</p>
                    <p className="text-white/30 text-sm">Commencez à générer des structures pour les voir apparaître ici.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('editor')}
                    className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Créer ma première LP
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions
                    .filter(s => 
                      s.title.toLowerCase().includes(historySearch.toLowerCase()) || 
                      s.state.brand.toLowerCase().includes(historySearch.toLowerCase()) ||
                      s.state.category.toLowerCase().includes(historySearch.toLowerCase())
                    )
                    .map((session) => (
                      <motion.div
                        key={session.id}
                        layoutId={session.id}
                        onClick={() => loadSession(session)}
                        className={cn(
                          "glass-card p-5 cursor-pointer group hover:border-emerald-500/50 transition-all relative overflow-hidden",
                          currentSessionId === session.id ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-white/10"
                        )}
                      >
                        <div className="flex flex-col h-full space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                              <Layout size={20} />
                            </div>
                            <button
                              onClick={(e) => deleteSession(session.id, e)}
                              className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <div className="space-y-1">
                            <h3 className="text-white font-bold truncate group-hover:text-emerald-400 transition-colors uppercase tracking-tight text-sm">
                              {session.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                                {session.state.brand || "Marque inconnue"}
                              </span>
                              <div className="w-1 h-1 rounded-full bg-white/10" />
                              <span className="text-[10px] text-emerald-400/60 font-black uppercase tracking-widest">
                                {session.state.category || "DIVERS"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                            <div className="flex items-center gap-2">
                              <History size={12} className="text-white/20" />
                              <span className="text-[10px] text-white/20">
                                {new Date(session.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <ChevronRight size={16} className="text-white/20 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                        
                        {currentSessionId === session.id && (
                          <div className="absolute top-0 right-0 p-2">
                            <div className="bg-emerald-500 w-2 h-2 rounded-full shadow-lg shadow-emerald-500/50" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col space-y-4"
          >
            {/* Mobile View Tab Switcher - Strictly for mobile screens (< lg), desktop stays untouched */}
            <div className="lg:hidden flex bg-black/60 p-0.5 sm:p-1 rounded-lg sm:rounded-2xl border border-white/10 text-xs font-bold gap-0.5 sm:gap-1 shadow-xl backdrop-blur-md sticky top-0 z-30">
              <button
                type="button"
                onClick={() => setMobileViewTab('settings')}
                className={`flex-1 py-1 sm:py-2.5 px-1.5 sm:px-3 rounded sm:rounded-xl transition-all flex items-center justify-center gap-1 text-[9.5px] sm:text-xs font-arabic ${
                  mobileViewTab === 'settings' 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black shadow-md shadow-emerald-500/20' 
                    : 'text-white/50 hover:text-white bg-white/5'
                }`}
              >
                <Sparkles size={11} className={mobileViewTab === 'settings' ? 'text-yellow-300' : ''} />
                <span>1. إعدادات المنتج والبرومبت</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileViewTab('result')}
                className={`flex-1 py-1 sm:py-2.5 px-1.5 sm:px-3 rounded sm:rounded-xl transition-all flex items-center justify-center gap-1 text-[9.5px] sm:text-xs font-arabic ${
                  mobileViewTab === 'result' 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black shadow-md shadow-emerald-500/20' 
                    : 'text-white/50 hover:text-white bg-white/5'
                }`}
              >
                <Layout size={11} className={mobileViewTab === 'result' ? 'text-emerald-300' : ''} />
                <span>2. المعاينة والهيكل {lpData?.sections?.length ? `(${lpData.sections.length})` : ''}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8">
              <div className={`lg:col-span-5 glass-card p-3 sm:p-6 space-y-3 sm:space-y-6 h-fit ${mobileViewTab === 'settings' ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center gap-2.5 mb-1 sm:mb-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
              <Sparkles size={16} className="sm:size-[18px]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">Paramètres du Produit</h2>
          </div>
          <div className="space-y-4">
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

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    صور المنتج (حتى 5 صور للتحليل الشامل)
                  </label>
                  {imagePreviews.length > 0 && (
                    <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {imagePreviews.length}/5 صور
                    </span>
                  )}
                </div>
                {imagePreviews.length > 0 && (
                  <button
                    type="button"
                    onClick={removeAllImages}
                    className="text-[9px] font-black text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider"
                  >
                    مسح الكل
                  </button>
                )}
              </div>
              
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative overflow-hidden border-2 border-dashed rounded-xl sm:rounded-3xl transition-all duration-500 p-2 sm:p-4 ${
                  isDragging ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01] shadow-2xl shadow-emerald-500/20' : 
                  imagePreviews.length > 0 ? 'border-emerald-500/30 bg-black/40 shadow-xl shadow-black/50' : 'border-white/5 hover:border-emerald-500/30 bg-white/5 cursor-pointer'
                } ${(analyzing || completingAnalysis) ? 'opacity-80 cursor-wait' : ''}`}
                onClick={() => {
                  if (imagePreviews.length === 0 && !analyzing && !completingAnalysis) {
                    fileInputRef.current?.click();
                  }
                }}
              >
                {/* Background Shimmer Effect */}
                <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-transparent to-purple-500/5 opacity-50 pointer-events-none" />
                
                {analyzing && (
                  <div className="absolute inset-0 z-20 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center gap-2 sm:gap-4 p-2">
                    <div className="relative">
                      <Loader2 className="animate-spin text-emerald-400 size-6 sm:size-8" />
                      <div className="absolute inset-0 blur-lg bg-emerald-400/20 animate-pulse" />
                    </div>
                    <div className="text-center space-y-0.5 sm:space-y-1">
                      <p className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-wider animate-pulse">تحليل الصور بالذكاء الاصطناعي ({imagePreviews.length} صور)...</p>
                      <p className="text-[7.5px] sm:text-[8px] text-white/40 uppercase font-bold tracking-tighter">استخراج التفاصيل والزوايا التسويقية الرائجة</p>
                    </div>
                  </div>
                )}

                {completingAnalysis && (
                  <div className="absolute inset-0 z-20 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center gap-2 sm:gap-4 p-2">
                    <div className="relative">
                      <Loader2 className="animate-spin text-blue-400 size-6 sm:size-8" />
                      <div className="absolute inset-0 blur-lg bg-blue-400/20 animate-pulse" />
                    </div>
                    <div className="text-center space-y-0.5 sm:space-y-1">
                      <p className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-wider animate-pulse">Optimisation (Étape 2)...</p>
                      <p className="text-[7.5px] sm:text-[8px] text-white/40 uppercase font-bold tracking-tighter">Création de la structure selon l'angle choisi</p>
                    </div>
                  </div>
                )}

                {imagePreviews.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-3 relative z-10">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group/img aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-lg">
                          <img 
                            src={preview} 
                            alt={`Product preview ${index + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                          />
                          
                          {/* Always-visible Main Photo Badge if index === 0 */}
                          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10 group-hover/img:opacity-0 transition-opacity">
                            <span className={`text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 sm:px-2 rounded-md sm:rounded-lg backdrop-blur-md shadow-md flex items-center gap-0.5 sm:gap-1 font-arabic ${
                              index === 0 
                                ? 'bg-emerald-500 text-white font-extrabold border border-emerald-400' 
                                : 'bg-black/80 text-white/80 border border-white/10'
                            }`}>
                              {index === 0 ? '🌟 الرئيسية' : `#${index + 1}`}
                            </span>
                          </div>

                          {/* Hover action bar for quick controls */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity p-1 sm:p-2 flex flex-col justify-between z-20">
                            <div className="flex items-center justify-between">
                              {index > 0 ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMainImage(index);
                                  }}
                                  className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-[7px] sm:text-[8px] rounded sm:rounded-lg shadow-md flex items-center gap-0.5 font-arabic transition-all"
                                  title="تعيين كصورة رئيسية للصفحة"
                                >
                                  <Star size={8} className="fill-white" />
                                  <span>الرئيسية</span>
                                </button>
                              ) : (
                                <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-emerald-500 text-white font-black text-[7px] sm:text-[8px] rounded sm:rounded-lg shadow-md flex items-center gap-0.5 font-arabic">
                                  <Star size={8} className="fill-white" />
                                  <span>الرئيسية</span>
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(index);
                                }}
                                className="p-1 sm:p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded sm:rounded-lg backdrop-blur-md transition-all shadow-md"
                                title="حذف هذه الصورة"
                              >
                                <X size={10} />
                              </button>
                            </div>

                            {/* Move Left / Move Right buttons for instant swapping */}
                            <div className="flex items-center justify-between bg-black/80 rounded-lg p-0.5 sm:p-1 border border-white/10 backdrop-blur-md">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveImage(index, 'left');
                                }}
                                className="p-0.5 sm:p-1 bg-white/10 hover:bg-emerald-500/50 text-white disabled:opacity-20 rounded transition-all"
                                title="تحريك لليسار"
                              >
                                <ArrowLeft size={10} />
                              </button>

                              <span className="text-[8px] sm:text-[9px] font-mono text-emerald-300 font-black">#{index + 1}</span>

                              <button
                                type="button"
                                disabled={index === imagePreviews.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveImage(index, 'right');
                                }}
                                className="p-0.5 sm:p-1 bg-white/10 hover:bg-emerald-500/50 text-white disabled:opacity-20 rounded transition-all"
                                title="تحريك لليمين"
                              >
                                <ArrowRight size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {imagePreviews.length < 5 && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="aspect-square rounded-xl sm:rounded-2xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 flex flex-col items-center justify-center p-1 sm:p-2 cursor-pointer transition-all text-emerald-400 group/add"
                        >
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover/add:scale-110 transition-transform">
                            <Plus size={14} className="sm:size-[18px]" />
                          </div>
                          <span className="text-[8px] sm:text-[9px] font-black mt-0.5 sm:mt-1 text-center">إضافة صورة</span>
                          <span className="text-[6.5px] sm:text-[7px] text-white/40">({5 - imagePreviews.length} متبقية)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-white/40 pt-1 border-t border-white/5 px-1">
                      <span>💡 تم تحليل {imagePreviews.length} من 5 صور</span>
                      {imagePreviews.length < 5 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="text-emerald-400 hover:underline font-bold"
                        >
                          + إضافة المزيد
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 text-center p-3 sm:p-6 space-y-1.5 sm:space-y-3">
                    <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-3xl bg-linear-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto shadow-xl group-hover/dropzone:scale-110 transition-transform duration-500">
                      <ImageIcon className="size-4 sm:size-7" />
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <p className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider sm:tracking-[0.15em]">اسحب حتى 5 صور لمنتجك هنا</p>
                      <p className="text-[8px] sm:text-[9px] text-white/40 uppercase font-bold tracking-widest leading-tight sm:leading-relaxed max-w-[280px] mx-auto">
                        الذكاء الاصطناعي سيحلل جميع الزوايا والتفاصيل لاستخراج أفضل استراتيجية تسويقية
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] sm:text-[9px] text-emerald-400 font-black">
                      <Sparkles size={9} className="sm:size-[10px]" />
                      <span>تحليل 360° من زوايا متعددة (حتى 5 صور)</span>
                    </div>
                  </div>
                )}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </div>
            </div>

            {pendingAngleSelection && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-slate-950 border-2 border-blue-500 rounded-3xl space-y-5 shadow-[0_0_30px_rgba(59,130,246,0.15)] text-white animate-fade-in relative overflow-hidden"
              >
                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col items-center text-center space-y-2 relative z-10">
                  <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
                    <Sparkles size={12} className="animate-pulse text-blue-400" />
                    الخطوة 2: تحديد زاوية تسويق المنتج للمبيعات
                  </div>
                  <h3 className="text-sm font-black text-white tracking-wide">
                    Choisissez la meilleure perspective pour votre produit :
                  </h3>
                  <p className="text-[10px] text-slate-400 max-w-md leading-relaxed">
                    💡 الزاوية التسويقية هي الفكرة الأساسية أو طريقة الاستعمال التي سنقنع بها المشتري. اختيارك سيقوم بتوجيه الذكاء الاصطناعي لكتابة صفحة الهبوط بالكامل وفقاً لهذا السياق.
                  </p>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-3 flex gap-3 items-start relative z-10">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                    <Target size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-blue-300">كيف تختار؟ (💡 Guide rapide)</p>
                    <p className="text-[9px] text-slate-300 leading-normal">
                      إذا كان منتجك عبارة عن شاحن سيارة، اختيار <b>"السيارات"</b> يركز على الراحة أثناء القيادة. بينما اختيار <b>"الرحلات"</b> سيركز على التخييم والسفر الطويل. اختر الأكثر ملائمة لجمهورك المستهدف!
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 relative z-10 scrollbar-thin scrollbar-thumb-white/10">
                  {suggestedNicheAngles.map((n) => {
                    let IconComponent = Sparkles;
                    let iconColorClass = "text-blue-400 bg-blue-500/10 border-blue-500/20";
                    let hoverGlowClass = "hover:border-blue-400 hover:shadow-blue-500/10";
                    
                    const iName = n.icon?.toLowerCase();
                    if (iName === 'car') {
                      IconComponent = Car;
                      iconColorClass = "text-sky-400 bg-sky-500/10 border-sky-500/20";
                      hoverGlowClass = "hover:border-sky-400 hover:shadow-sky-500/10";
                    } else if (iName === 'bus') {
                      IconComponent = Bus;
                      iconColorClass = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
                      hoverGlowClass = "hover:border-cyan-400 hover:shadow-cyan-500/10";
                    } else if (iName === 'plane') {
                      IconComponent = Plane;
                      iconColorClass = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
                      hoverGlowClass = "hover:border-indigo-400 hover:shadow-indigo-500/10";
                    } else if (iName === 'home') {
                      IconComponent = Home;
                      iconColorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                      hoverGlowClass = "hover:border-emerald-400 hover:shadow-emerald-500/10";
                    } else if (iName === 'briefcase') {
                      IconComponent = Briefcase;
                      iconColorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                      hoverGlowClass = "hover:border-amber-400 hover:shadow-amber-500/10";
                    } else if (iName === 'heart') {
                      IconComponent = Heart;
                      iconColorClass = "text-rose-400 bg-rose-500/10 border-rose-500/20";
                      hoverGlowClass = "hover:border-rose-400 hover:shadow-rose-500/10";
                    } else if (iName === 'flame') {
                      IconComponent = Flame;
                      iconColorClass = "text-orange-400 bg-orange-500/10 border-orange-500/20";
                      hoverGlowClass = "hover:border-orange-400 hover:shadow-orange-500/10";
                    }

                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectNicheAngleAndComplete(n.id);
                        }}
                        className={`p-3.5 bg-slate-900/90 border border-slate-800 text-white rounded-2xl flex items-center gap-3 transition-all active:scale-[0.98] group/btn shadow-md hover:bg-slate-800/80 cursor-pointer ${hoverGlowClass}`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover/btn:scale-110 ${iconColorClass}`}>
                          <IconComponent size={16} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-[12px] font-bold font-arabic leading-snug text-white group-hover/btn:text-blue-200 truncate">
                            {n.label}
                          </p>
                          <p className="text-[8px] uppercase tracking-wider text-slate-400 font-medium truncate">
                            {n.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="text-center pt-2 flex justify-center relative z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingAngleSelection(false);
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest bg-white/5 hover:bg-white/10 px-5 py-2 rounded-full border border-white/10 cursor-pointer"
                  >
                    Sauter l'étape & Utiliser les valeurs génériques ➔
                  </button>
                </div>
              </motion.div>
            )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PromptField
                  label="Nom du produit (Français) / Prompt"
                  icon={<Package size={12} className="text-emerald-500" />}
                  value={productName}
                  onChange={setProductName}
                  placeholder="Ex: Hachoir Pro 3000w - Le hacheur multifonction ultime"
                  badgeText="PROMPT"
                />

                <PromptField
                  label="Nom du produit (Arabe/Darija)"
                  icon={<Languages size={12} className="text-blue-500" />}
                  value={productNameAr}
                  onChange={setProductNameAr}
                  placeholder="اسم المنتج بالكامل (EX: طحانة كهربائية احترافية - أصلية)"
                  dir="rtl"
                  badgeText="DARIJA"
                />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PromptField
                  label="Branding / Marque"
                  icon={<Flag size={12} className="text-emerald-500" />}
                  value={brand}
                  onChange={setBrand}
                  placeholder="Ex: SilverCrest, Tiba, ou 'Importation Premium'"
                />

                <PromptField
                  label="Catégorie de Marché"
                  icon={<Tag size={12} className="text-indigo-400" />}
                  value={category}
                  onChange={setCategory}
                  placeholder="Ex: Cuisine & Maison, Beauté, Bricolage..."
                />
             </div>

             <PromptField
                label="Format du Produit (Bundle / Pack)"
                icon={<Layout size={12} className="text-indigo-400" />}
                value={productType}
                onChange={setProductType}
                placeholder="Ex: Appareil Électroménager, Pack de 2-3 pièces, Kit complet avec accessoires..."
             />

             <PromptField
                label="Public Cible & Avatar Client Ideal"
                icon={<User size={12} className="text-orange-400" />}
                value={targetAudience}
                onChange={setTargetAudience}
                placeholder="Ex: Femmes au foyer (30-50 ans), Jeunes technophiles, Amateurs de cuisine..."
             />

             <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Palette de Couleurs (HEX)</label>
                  <div className="flex items-center gap-2">
                    {colorPalette.split(',').map((c, i) => (
                      <div 
                        key={i} 
                        className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: c.trim() }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PALETTE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPalette(p)}
                      className={cn(
                        "p-2 rounded-xl border transition-all flex flex-col items-center gap-1.5 group relative overflow-hidden",
                        selectedPaletteId === p.id 
                          ? "bg-white/10 border-white/20 ring-1 ring-white/20" 
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                      )}
                    >
                      <div className="flex -space-x-1">
                        {p.colors.map((c, idx) => (
                          <div 
                            key={idx} 
                            className="w-4 h-4 rounded-full border border-black/40 ring-1 ring-white/10 shadow-lg" 
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-tighter transition-colors text-center px-1",
                        selectedPaletteId === p.id ? "text-white" : "text-white/40 group-hover:text-white/60"
                      )}>
                        {p.label}
                      </span>
                      {selectedPaletteId === p.id && (
                        <motion.div 
                          layoutId="activePalette"
                          className="absolute inset-0 bg-white/5 pointer-events-none"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input 
                    value={colorPalette}
                    onChange={(e) => {
                      setColorPalette(e.target.value);
                      setSelectedPaletteId(null);
                    }}
                    placeholder="Ex: #000000, #FFD700, #FFFFFF"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-white/10 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20">
                    <Palette size={14} />
                  </div>
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Stratégie de Funnel (Framework)</label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {[
                  { id: 'AIDA', label: 'AIDA', desc: 'Attention/Désir' },
                  { id: 'PAS', label: 'PAS', desc: 'Problème/Solution' },
                  { id: 'FAB', label: 'FAB', desc: 'Bénéfices/Vantage' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFunnelStrategy(s.id)}
                    className={`p-1.5 sm:p-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all ${
                      funnelStrategy === s.id 
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs font-black">{s.label}</span>
                    <span className="text-[7px] sm:text-[8px] uppercase tracking-tighter opacity-60 text-center truncate w-full">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <PromptField
              label="Points Forts Stratégiques (Un par ligne)"
              icon={<Target size={12} className="text-emerald-400" />}
              value={sellingPoints}
              onChange={setSellingPoints}
              placeholder="Ex: Lames en acier inoxydable 304&#10;Nettoyage ultra-rapide&#10;Moteur silencieux & puissant"
              isTextArea
              rows={3}
              badgeText="BÉNÉFICES"
            />

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2">
                  <Sparkles size={10} className="text-blue-500" />
                  Angle Marketing (Psychologie de vente)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Luxe Accessible', label: 'Luxe', desc: 'Prestige' },
                    { id: 'Urgence maximale', label: 'Urgence', desc: 'Last chance' },
                    { id: 'Solution miracle', label: 'Solution', desc: 'Problem solver' },
                    { id: 'Confiance & Famille', label: 'Confiance', desc: 'Trust/Family' },
                    { id: 'Style & Tendance', label: 'Tendance', desc: 'Trendy/Vibe' },
                    { id: 'Économie / Offre Or', label: 'Promo', desc: 'Best price' }
                  ].map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setMarketingAngle(a.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all ${
                        marketingAngle === a.id 
                          ? 'bg-blue-500 border-blue-400 text-white shadow-lg' 
                          : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-[10px] font-black">{a.label}</span>
                      <span className="text-[8px] uppercase tracking-tighter opacity-60 text-center">{a.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <PromptField
                label="Rationale / Angle Précis (Accroche)"
                icon={<PenTool size={12} className="text-blue-500" />}
                value={marketingAngle}
                onChange={setMarketingAngle}
                placeholder="Ex: Idéal pour les familles nombreuses qui veulent gagner du temps en cuisine..."
                isTextArea
                rows={2}
                badgeText="ACCROCHE"
              />
            </div>

            <PromptField
              label="Context Marketing / Brieffing Prompt"
              icon={<MessageSquare size={12} className="text-emerald-500" />}
              value={description}
              onChange={setDescription}
              placeholder="Ex: C'est le hachoir le plus puissant du marché algérien cette année, disponible en promo exclusive..."
              isTextArea
              rows={3}
              badgeText="BRIEFFING"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-blue-500/10 rounded-lg text-blue-400">
                <Palette size={14} />
              </div>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Style Visuel des Images (IA)</label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'Lifestyle', label: 'Lifestyle', desc: 'Usage quotidien' },
                { id: 'Minimalist', label: 'Minimaliste', desc: 'Épuré & Zen' },
                { id: 'High-Tech', label: 'High-Tech', desc: 'Futuriste / Pro' },
                { id: 'Creative', label: 'Créatif', desc: 'Artistique / Wow' },
                { id: 'Natural', label: 'Naturel', desc: 'Extérieur / Bio' },
                { id: 'Studio', label: 'Studio', desc: 'Produit Pur' }
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setVisualStyle(style.id)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all ${
                    visualStyle === style.id 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[9px] font-black">{style.label}</span>
                  <span className="text-[7px] uppercase tracking-tighter opacity-60 text-center">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Layout size={14} />
              </div>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Format des visuels stratégiques (AI)</label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: '16:9', label: 'Paysage', sub: 'Desktop', icon: Monitor },
                { id: '1:1', label: 'Carré', sub: 'Insta/FB', icon: SquareIcon },
                { id: '4:5', label: 'Portrait', sub: 'Feed Ads', icon: Maximize },
                { id: '9:16', label: 'Story', sub: 'TikTok/Reels', icon: Smartphone }
              ].map((ratio) => {
                const Icon = ratio.icon;
                return (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`p-2.5 sm:p-3 rounded-2xl flex flex-col items-center gap-1.5 sm:gap-2 transition-all border group relative ${
                      aspectRatio === ratio.id
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl shadow-emerald-500/20'
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    <Icon size={16} className={aspectRatio === ratio.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black leading-none">{ratio.id}</span>
                      <span className="text-[7px] uppercase tracking-tighter opacity-60 mt-0.5 font-bold">{ratio.label}</span>
                    </div>
                    {aspectRatio === ratio.id && (
                      <motion.div 
                        layoutId="activeRatio"
                        className="absolute inset-0 bg-white/10 rounded-2xl pointer-events-none"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[8px] text-white/20 italic text-center">Tous les prompts d'images seront optimisés pour ce ratio.</p>
          </div>

          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all group flex-1"
              >
                <Settings2 size={16} className="text-white/40 group-hover:text-emerald-400 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Paramètres Avancés</span>
                <ChevronDown size={14} className={`text-white/20 ml-auto transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>
              {showAdvanced && (
                <button 
                  onClick={resetAdvanced}
                  className="ml-2 p-2 text-white/20 hover:text-red-400 transition-colors"
                  title="Réinitialiser"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 p-1">
                    {/* Sections */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 ml-1">
                        <ListOrdered size={10} className="text-emerald-400" />
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Sections</label>
                      </div>
                      <input 
                        type="number"
                        min={3}
                        max={12}
                        value={numSections}
                        onChange={(e) => setNumSections(parseInt(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                      />
                    </div>

                    {/* Tone */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 ml-1">
                        <Mic2 size={10} className="text-purple-400" />
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Ton / Style</label>
                      </div>
                      <select 
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none"
                      >
                        <option value="Vendeur / Persuasif">📣 Persuasif</option>
                        <option value="Sophistiqué / Luxe">✨ Luxe / Élite</option>
                        <option value="Urgent / Direct">⚡ Flash / Urgence</option>
                        <option value="Amical / Proche">🤝 Familier</option>
                        <option value="Technique / Expert">🔬 Expert / Scientifique</option>
                        <option value="Minimaliste">🌑 Minimal</option>
                      </select>
                    </div>

                    {/* Design Style */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 ml-1">
                        <Palette size={10} className="text-blue-400" />
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Style Design</label>
                      </div>
                      <select 
                        value={designStyle}
                        onChange={(e) => setDesignStyle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none"
                      >
                        <option value="Moderne / Minimaliste">Moderne</option>
                        <option value="Brutalisme / Bold">Brutaliste</option>
                        <option value="Apple Style / Clean">Apple Clean</option>
                        <option value="Retro / Vintage">Vintage</option>
                        <option value="Web3 / Futuriste">Futuriste</option>
                        <option value="DTC / Coloré">DTC Vibrant</option>
                      </select>
                    </div>

                    {/* Page Type */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 ml-1">
                        <Layout size={10} className="text-orange-400" />
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Type de Page</label>
                      </div>
                      <select 
                        value={pageType}
                        onChange={(e) => setPageType(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none"
                      >
                        <option value="Landing Page Classique">L.P. Classique</option>
                        <option value="Page de Vente Longue">Sales Page</option>
                        <option value="Page de Capture (Lead)">Squeeze Page</option>
                        <option value="Advertorial / Article">Advertorial</option>
                        <option value="One Page Checkout">Checkout Page</option>
                      </select>
                    </div>

                    {/* Market */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 ml-1">
                        <Target size={10} className="text-red-400" />
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Marché Cible</label>
                      </div>
                      <select 
                        value={targetMarket}
                        onChange={(e) => setTargetMarket(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none"
                      >
                        <option value="Algérie (58 wilayas)">🇩🇿 Algérie</option>
                        <option value="Maroc">🇲🇦 Maroc</option>
                        <option value="Tunisie">🇹🇳 Tunisie</option>
                        <option value="France / Europe">🇪🇺 France / Europe</option>
                        <option value="Sénégal / Côte d'Ivoire">🌍 Afrique Ouest</option>
                        <option value="GCC (Arabie, UAE)">🇸🇦 GCC / Moyen Orient</option>
                      </select>
                    </div>

                    {/* Language */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 ml-1">
                        <Languages size={10} className="text-sky-400" />
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/40">Langue</label>
                      </div>
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none"
                      >
                        <option value="Arabe / Darija Algérienne">🇩🇿 Arabe / Darija</option>
                        <option value="Français">🇫🇷 Français</option>
                        <option value="Anglais">🇺🇸 Anglais</option>
                        <option value="Arabe Littéraire">🇸🇦 Arabe Classique</option>
                        <option value="Mixte (Français/Darija)">🗣️ Mixte Fr/Dz</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !productName}
            className="w-full btn-dz-primary"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Sparkles size={16} className="group-hover:rotate-12 transition-transform animate-pulse text-yellow-300" />
                <span>توليد صفحة الهبوط السحرية ✨</span>
              </>
            )}
          </button>
        </div>

        <div className={`lg:col-span-7 glass-card flex flex-col min-h-[350px] sm:min-h-[450px] overflow-hidden ${mobileViewTab === 'result' ? 'block' : 'hidden lg:block'}`}>
          <div className="p-2.5 sm:p-4 border-b border-white/10 bg-white/5 flex flex-wrap gap-2 sm:gap-4 justify-between items-center">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest">Structure Landing Page</span>
              {lpData && (
                <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/5 text-[8px] sm:text-[9px] font-bold">
                  <button 
                    onClick={() => setLayoutMode('structure')}
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded transition-all uppercase tracking-wider ${layoutMode === 'structure' ? 'bg-emerald-500 text-white font-black' : 'text-white/40 hover:text-white/70 font-bold'}`}
                  >
                    Éditeur Structure
                  </button>
                  <button 
                    onClick={() => setLayoutMode('mockup')}
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded transition-all uppercase tracking-wider ${layoutMode === 'mockup' ? 'bg-indigo-500 text-white font-black' : 'text-white/40 hover:text-white/70 font-bold'}`}
                  >
                    Maquette Live 📱
                  </button>
                </div>
              )}
            </div>
            {result && (
              <div className="flex gap-1.5 sm:gap-2">
                <button 
                  onClick={handleExport}
                  className="text-white/60 hover:text-white transition-colors flex items-center gap-1 text-[10px] sm:text-xs bg-white/5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/10"
                >
                  <Download size={12} className="sm:size-[14px]" />
                  Exporter
                </button>
                <button 
                  onClick={handleCopy}
                  className="text-white/60 hover:text-white transition-colors flex items-center gap-1 text-[10px] sm:text-xs bg-white/5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/10"
                >
                  {copied ? <Check size={12} className="text-emerald-400 sm:size-[14px]" /> : <Copy size={12} className="sm:size-[14px]" />}
                  {copied ? 'Copié' : 'Copier'}
                </button>
              </div>
            )}
          </div>
          <div className="p-3 sm:p-6 md:p-8 flex-1 text-white/80 overflow-y-auto leading-relaxed markdown-body">
            {lpData ? (
              <AnimatePresence mode="wait">
                {layoutMode === 'mockup' ? (
                  <motion.div
                    key="visual-mockup"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <LPVisualMockup 
                      productName={productNameAr || productName}
                      sections={lpData.sections}
                      colorPalette={lpData.colorPalette}
                      imagePreview={imagePreview}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="structure-editor"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-4 sm:space-y-6">
                      {imagePreview && (
                        <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] rounded-xl sm:rounded-[2.5rem] bg-linear-to-br from-emerald-500/10 via-purple-500/5 to-transparent border border-white/10 overflow-hidden mb-4 sm:mb-8 group/hero-preview">
                          <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full scale-75 opacity-50 flex items-center justify-center p-4 sm:p-8 z-0" />
                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/60 to-transparent z-10" />
                          
                          <div className="relative z-20 w-full h-full flex items-center justify-center p-3 sm:p-6">
                             <img 
                              src={imagePreview} 
                              alt="Analyzed Product" 
                              className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover/hero-preview:scale-105 transition-transform duration-1000" 
                            />
                          </div>
                          
                          <div className="absolute bottom-2 left-3 sm:bottom-4 sm:left-6 z-30 flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                              <Sparkles size={12} className="sm:size-[14px]" />
                            </div>
                            <div>
                              <p className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-wider sm:tracking-[0.2em]">{lpData.productName}</p>
                              <p className="text-[7.5px] sm:text-[8px] text-white/40 uppercase font-bold tracking-tighter">Visuel Hero Sélectionné</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-3 sm:pb-6 gap-3">
                        <div className="flex flex-col min-w-0">
                          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">{lpData.productName}</h2>
                          <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                            <span className="text-[8px] sm:text-[10px] text-white/40 uppercase tracking-widest">Workflow Conversion DZ</span>
                            <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
                            <span className="text-[8px] sm:text-[10px] text-emerald-400/60 font-black uppercase tracking-widest">{lpData.sections.length} SECTIONS</span>
                          </div>
                        </div>
                        <div className="flex items-center sm:items-end gap-2 shrink-0 self-start sm:self-auto flex-wrap">
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                             Structure Stratégique
                          </span>
                          {lpData.colorPalette && (
                            <div className="flex items-center gap-2 sm:gap-3 bg-white/5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl border border-white/10 group/colors">
                               <div className="flex -space-x-1">
                                 {lpData.colorPalette?.map((c: string, idx: number) => (
                                   <div 
                                     key={idx} 
                                     className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-black/40 ring-1 ring-white/20 shadow-lg cursor-help relative group/swatch" 
                                     style={{ backgroundColor: c }}
                                     title={c}
                                   >
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/swatch:opacity-100 transition-opacity pointer-events-none bg-black text-[8px] font-mono px-2 py-1 rounded whitespace-nowrap border border-white/10 z-50">
                                        {c}
                                      </div>
                                   </div>
                                 ))}
                               </div>
                               <div className="w-px h-3 bg-white/10" />
                               <button
                                 onClick={() => {
                                   navigator.clipboard.writeText(lpData.colorPalette.join(', '));
                                 }}
                                 className="text-[7.5px] sm:text-[8px] text-white/30 uppercase font-black tracking-widest hover:text-emerald-400 transition-colors flex items-center gap-1"
                               >
                                  <Copy size={9} className="sm:size-[10px]" /> <span className="hidden sm:inline">Copier Palette</span>
                               </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {lpData.generalNotes && (
                        <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl">
                            <p className="text-[8px] sm:text-[9px] uppercase font-black text-emerald-400/60 tracking-wider sm:tracking-[0.2em] mb-1 sm:mb-2">Direction Artistique & Marketing</p>
                            <p className="text-[11px] sm:text-xs text-white/60 italic leading-relaxed">{lpData.generalNotes}</p>
                        </div>
                      )}
                      
                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext 
                          items={lpData.sections.map((s: any) => s.id || s.title)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3 sm:space-y-6">
                            {lpData.sections.map((s: any, i: number) => (
                              <SortableSection 
                                key={s.id || i}
                                id={s.id || s.title}
                                section={s}
                                index={i}
                                totalSections={lpData.sections.length}
                                updateSectionField={updateSectionField}
                                selectedCtaIndex={selectedCtaIndex}
                                handleCtaChange={handleCtaChange}
                                deleteSection={deleteSection}
                                moveSection={moveSection}
                                duplicateSection={duplicateSection}
                              />
                            ))}

                            <button
                              onClick={addSection}
                              className="w-full bg-white/5 hover:bg-white/10 hover:border-emerald-500/35 text-white/60 hover:text-white border border-dashed border-white/10 py-3 sm:py-5 rounded-xl sm:rounded-[2rem] transition-all flex items-center justify-center gap-2 text-[10px] sm:text-xs uppercase font-black tracking-widest mt-3 sm:mt-4"
                            >
                              <Plus size={14} className="sm:size-[16px]" />
                              Ajouter une section de vente
                            </button>
                          </div>
                        </SortableContext>
                      </DndContext>

                      <div className="p-4 sm:p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl sm:rounded-[2.5rem] relative overflow-hidden group text-right">
                          <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Sparkles size={40} className="sm:size-[80px] text-emerald-400" />
                          </div>
                          <div className="relative z-10">
                            <h4 className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5 sm:mb-3">Notes Stratégiques Finales</h4>
                            <p className="text-xs sm:text-sm text-white/80 italic leading-relaxed font-medium max-w-2xl font-arabic" dir="rtl">{lpData.generalNotes}</p>
                          </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 select-none">
                <FileText size={64} strokeWidth={1} className="mb-4" />
                <p className="text-sm">La structure optimisée apparaîtra ici.</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </motion.div>
    )}
    </AnimatePresence>
  </div>
);
}
