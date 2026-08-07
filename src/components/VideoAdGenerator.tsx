import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Copy, 
  Check, 
  Video, 
  Download, 
  Settings2,
  Monitor,
  Maximize,
  Smartphone,
  Square as SquareIcon,
  Layout,
  X,
  Package,
  List,
  Target,
  Palette,
  ArrowRight,
  ArrowLeft,
  Coins,
  Flame,
  Zap,
  HelpCircle,
  PlayCircle,
  Image as ImageIcon,
  UploadCloud,
  Layers,
  Smile,
  Volume2,
  Truck,
  Tag,
  GripVertical,
  Trash2,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Eye,
  ListOrdered,
  MessageSquare,
  PenTool
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { addToHistory } from '../lib/history';
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
import { generateVideoAdScript, analyzeProductFromImage } from '../services/gemini';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';
import PromptField from './PromptField';

interface SortableSceneCardProps {
  id: string;
  scene: any;
  index: number;
  updateSceneField: (index: number, field: string, value: any) => void;
  deleteScene: (index: number) => void;
}

const SortableSceneCard = ({ 
  id, 
  scene, 
  index, 
  updateSceneField, 
  deleteScene 
}: SortableSceneCardProps) => {
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

  const s = scene;
  const i = index;

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      <div className="overflow-hidden bg-white/5 border border-white/10 hover:border-dz-emerald/30 transition-all rounded-[2rem] shadow-2xl">
        
        {/* Card Header (Drag, Title, Timing, Marketing, Delete) */}
        <div className="p-4 px-5 bg-white/5 flex flex-wrap items-center justify-between gap-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              {...attributes} 
              {...listeners}
              className="p-2 text-white/20 hover:text-dz-emerald transition-colors cursor-grab active:cursor-grabbing shrink-0"
            >
              <GripVertical size={16} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Scène {i + 1}</span>
              <input 
                value={s.step || `Scène ${i + 1}`}
                onChange={(e) => updateSceneField(i, 'step', e.target.value)}
                placeholder="Ex: Le Hook, Résultat..."
                className="bg-transparent text-sm font-black text-white focus:outline-none placeholder:text-white/20 uppercase tracking-wide border-b border-transparent focus:border-dz-emerald/50 max-w-[140px] sm:max-w-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Timing Input */}
            <div className="flex items-center gap-1.5 bg-black/30 border border-white/10 px-2.5 py-1 rounded-xl">
              <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">⏱️</span>
              <input 
                value={s.time || ''}
                onChange={(e) => updateSceneField(i, 'time', e.target.value)}
                placeholder="0-3s"
                className="bg-transparent text-[11px] font-black text-dz-emerald focus:outline-none placeholder:text-dz-emerald/40 w-12 text-center"
              />
            </div>

            {/* Supprimer Scène */}
            <button
              type="button"
              onClick={() => deleteScene(i)}
              className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              title="Supprimer la scène"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Card Body containing fields */}
        <div className="p-5 space-y-4">
          
          {/* Top block: Visual & Actor Direction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-dz-emerald" />
                Visuel & Mise en Scène
              </label>
              <textarea
                value={s.visual || ''}
                onChange={(e) => updateSceneField(i, 'visual', e.target.value)}
                placeholder="Décrivez ce que le spectateur voit à l'écran..."
                rows={3}
                className="w-full bg-black/30 border border-white/10 focus:border-dz-emerald/50 rounded-xl p-3 text-xs text-white/90 leading-relaxed focus:outline-none placeholder:text-white/20 resize-none transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                <Smile size={12} className="text-dz-emerald" />
                Indications Acteur / Créateur
              </label>
              <textarea
                value={s.actorDirection || ''}
                onChange={(e) => updateSceneField(i, 'actorDirection', e.target.value)}
                placeholder="Sourire, ton direct, montre le produit de près..."
                rows={3}
                className="w-full bg-black/30 border border-white/10 focus:border-dz-emerald/50 rounded-xl p-3 text-xs text-white/90 leading-relaxed focus:outline-none placeholder:text-white/20 resize-none transition-all shadow-inner"
              />
            </div>

          </div>

          {/* Middle block: Voice-off (Arabic) & Franco */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 justify-end">
                <MessageSquare size={12} className="text-emerald-400" />
                Voix-Off (Darija / Arabe)
              </label>
              <textarea
                value={s.audio || ''}
                onChange={(e) => updateSceneField(i, 'audio', e.target.value)}
                placeholder="اكتب الكلام الذي سيقال بلهجة مألوفة..."
                rows={3}
                dir="rtl"
                className="w-full bg-emerald-950/20 border border-emerald-500/20 focus:border-emerald-400/60 rounded-xl p-3 text-xs text-emerald-300 font-bold leading-relaxed focus:outline-none placeholder:text-emerald-700/50 resize-none transition-all font-arabic shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                <PenTool size={12} className="text-dz-emerald" />
                Lecture Phonétique (Franco)
              </label>
              <textarea
                value={s.audioFranco || ''}
                onChange={(e) => updateSceneField(i, 'audioFranco', e.target.value)}
                placeholder="Rédigez la prononciation phonétique..."
                rows={3}
                className="w-full bg-black/30 border border-white/10 focus:border-dz-emerald/50 rounded-xl p-3 text-xs text-dz-emerald/90 italic font-mono leading-relaxed focus:outline-none placeholder:text-white/20 resize-none transition-all shadow-inner"
              />
            </div>

          </div>

          {/* Bottom block: Compact Metadata Badges for AI details */}
          {(s.overlay || s.sfxMusic || s.marketingAngle) && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5 text-[11px]">
              {s.overlay && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg font-medium">
                  <Monitor size={11} className="text-blue-400 shrink-0" />
                  <span className="opacity-60 text-[9px] font-bold uppercase">Overlay:</span>
                  <span className="font-bold">{s.overlay}</span>
                </div>
              )}

              {s.sfxMusic && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg font-medium">
                  <Video size={11} className="text-purple-400 shrink-0" />
                  <span className="opacity-60 text-[9px] font-bold uppercase">SFX:</span>
                  <span>{s.sfxMusic}</span>
                </div>
              )}

              {s.marketingAngle && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-dz-gold/10 border border-dz-gold/20 text-dz-gold rounded-lg font-medium ml-auto">
                  <Target size={11} className="text-dz-gold shrink-0" />
                  <span className="opacity-60 text-[9px] font-bold uppercase">Angle:</span>
                  <span className="font-bold">{s.marketingAngle}</span>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default function VideoAdGenerator() {
  const toast = useToast();
  
  // Workflow step control: 1 (Basics), 2 (Marketing Hook/Angle), 3 (Vibe, Format, Target)
  const [activeStep, setActiveStep] = useState(1);
  
  // Step 1: Product Basics
  const [productName, setProductName] = useState('');
  const [features, setFeatures] = useState('');
  const [price, setPrice] = useState('2900 DA');

  // Load restored script from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dzads_last_generated_script');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const actualResult = parsed.result || parsed.payload || parsed;
        if (actualResult && (actualResult.scenes || actualResult.title)) {
          setResult(actualResult);
        }
        if (parsed.productName) setProductName(parsed.productName);
        if (parsed.features) setFeatures(parsed.features);
        if (parsed.price) setPrice(parsed.price);
        if (parsed.painPoint) setPainPoint(parsed.painPoint);
        if (parsed.customAngle) setCustomAngle(parsed.customAngle);
        if (parsed.hookType) setHookType(parsed.hookType);
        if (parsed.targetMarket) setTargetMarket(parsed.targetMarket);
        if (parsed.customTarget) setCustomTarget(parsed.customTarget);
        if (parsed.videoType) setVideoType(parsed.videoType);
        if (parsed.videoDuration) setVideoDuration(parsed.videoDuration);
        if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
      } catch (e) {
        console.error("Failed to restore video script state", e);
      }
    }
  }, []);
  
  // New States for Product Image Upload & Analysis
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Drag and Drop files processing handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez choisir un fichier image (PNG, JPG, JPEG...).");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Content = reader.result as string;
      setProductImage(base64Content);
      setIsAnalyzingImage(true);
      toast.info("Analyse de l'image par l'IA en cours...");
      
      try {
        const base64Data = base64Content.split(',')[1];
        const mimeType = base64Content.split(',')[0].split(':')[1].split(';')[0];
        const analysis = await analyzeProductFromImage({ data: base64Data, mimeType });
        if (analysis) {
          if (analysis.name) setProductName(analysis.name);
          if (analysis.sellingPoints && analysis.sellingPoints.length > 0) {
            setFeatures(analysis.sellingPoints.join(", "));
          }
          toast.success("Produit détecté avec succès ! Détails pré-remplis.");
        }
      } catch (err) {
        console.error("Image analysis error:", err);
        toast.info("L'image a été chargée mais l'analyse IA automatique a échoué. Vous pouvez continuer de remplir les détails.");
      } finally {
        setIsAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProductImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Step 2: Marketing Angle, Target Market & Hook
  const [painPoint, setPainPoint] = useState("Résoudre un problème quotidien fâchant");
  const [customAngle, setCustomAngle] = useState("");
  const [hookType, setHookType] = useState("Direct & Problème (Ex: Si vous souffrez de...)");
  const [targetMarket, setTargetMarket] = useState("Familles et foyers");
  const [customTarget, setCustomTarget] = useState("");

  // Step 3: Video Specifications (Type, Duration & Aspect Ratio)
  const [videoType, setVideoType] = useState('User-Generated Content (UGC)');
  const [videoDuration, setVideoDuration] = useState('30 secondes');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const [sceneViewMode, setSceneViewMode] = useState<'single' | 'list'>('single');
  const [layoutMode, setLayoutMode] = useState<'structure' | 'mockup'>('structure');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackSceneIdx, setCurrentPlaybackSceneIdx] = useState(0);

  // Auto playback of mockup mode
  useEffect(() => {
    let interval: any;
    if (isPlaying && result?.scenes) {
      interval = setInterval(() => {
        setCurrentPlaybackSceneIdx((prev) => {
          if (prev >= result.scenes.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 4000); // 4 seconds per scene
    }
    return () => clearInterval(interval);
  }, [isPlaying, result?.scenes]);

  const updateSceneField = (index: number, field: string, value: any) => {
    if (!result) return;
    const newScenes = [...result.scenes];
    newScenes[index] = { ...newScenes[index], [field]: value };
    setResult({ ...result, scenes: newScenes });
  };

  const deleteScene = (index: number) => {
    if (!result) return;
    const newScenes = result.scenes.filter((_: any, idx: number) => idx !== index);
    setResult({ ...result, scenes: newScenes });
    if (activeSceneIdx >= newScenes.length && newScenes.length > 0) {
      setActiveSceneIdx(newScenes.length - 1);
    }
    if (currentPlaybackSceneIdx >= newScenes.length && newScenes.length > 0) {
      setCurrentPlaybackSceneIdx(newScenes.length - 1);
    }
  };

  const addScene = () => {
    if (!result) return;
    const nextIdx = result.scenes.length;
    const newScene = {
      id: `scene-${Date.now()}`,
      time: `${nextIdx * 5}-${(nextIdx + 1) * 5}s`,
      step: `Scène ${nextIdx + 1} — Ajoutée`,
      visual: "Caméra montre le produit en action dans un plan rapproché.",
      audio: "جربوه اليوم وماراحش تندموا على النتيجة الرائعة !",
      audioFranco: "Djerbouh l'youm ou ma rahkach tendmou ala ennatidja eraiaa !",
      overlay: "Disponible maintenant !",
      actorDirection: "Montre le produit avec un grand sourire face caméra.",
      sfxMusic: "Bruit de transition rapide avec musique d'ambiance joyeuse.",
      marketingAngle: "Rassurance & Action"
    };
    setResult({ ...result, scenes: [...result.scenes, newScene] });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = result.scenes.findIndex((s: any, idx: number) => (s.id || `scene-${idx}`) === active.id);
      const newIndex = result.scenes.findIndex((s: any, idx: number) => (s.id || `scene-${idx}`) === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newScenes = arrayMove(result.scenes, oldIndex, newIndex);
        setResult({ ...result, scenes: newScenes });
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Predefined Target Markets in Algeria
  const targetMarkets = [
    { name: "Familles et foyers", desc: "Idéal pour l'électroménager, ustensiles et organisation." },
    { name: "Femmes et Mamans", desc: "Idéal pour bébé, cosmétiques, beauté et linge." },
    { name: "Jeunes & Geek (18-35 ans)", desc: "Pour les gadgets high-tech, accessoires gaming et mode." },
    { name: "Professionnels & Bricoleurs", desc: "Pour les outils, accessoires auto et appareils pro." },
    { name: "Commerçants & Grossistes", desc: "Pour l'achat en lot, B2B ou opportunités d'affaires." }
  ];

  // Marketing Angle options
  const painPoints = [
    { title: "Résoudre un problème quotidien fâchant", icon: Zap, desc: "Se focalise sur la frustration résolue immédiatement.", color: "text-red-400" },
    { title: "Économiser du temps ou de l'énergie", icon: Flame, desc: "Met en avant l'efficacité de vie et le gain de temps précieux.", color: "text-amber-400" },
    { title: "Prendre soin de sa santé ou bien-être", icon: Sparkles, desc: "Idéal pour cosmétique, bio, massage, confort du corps.", color: "text-emerald-400" },
    { title: "Prestige, luxe & beauté de la maison", icon: Palette, desc: "Pour la déco, vaisselles exclusives, objets esthétiques.", color: "text-indigo-400" },
    { title: "Meilleur rapport qualité-prix f l'Algérie", icon: Coins, desc: "Insiste lourdement sur l'économie et l'offre groupée.", color: "text-purple-400" }
  ];

  // Hook Types options
  const hooks = [
    { name: "Direct & Problème (Ex: Si vous souffrez de...)", key: "problème", desc: "Attaque directement la douleur de l'acheteur." },
    { name: "La Curieuse (Ex: Ma Tratiches had l'astuce f dzyar...)", key: "curiosity", desc: "Crée un effet mystérieux pour retenir les 3 premières secondes." },
    { name: "L'Humoristique ou Interpellante (Ex: Yakhi halla yakhi !)", key: "humor", desc: "Mélange d'humour de rue algérien pour une ultra complicité." },
    { name: "L'Incroyable Résultat (Ex: Regardez ce miracle !)", key: "result", desc: "Commence directement par la transformation visuelle." },
    { name: "L'Urgence Promo (Ex: Le produit le plus demandé en promo !)", key: "promo", desc: "Fait ressentir le syndrome de manque (FOMO)." }
  ];

  // Predefined Video Types
  const videoTypes = [
    { name: "User-Generated Content (UGC)", desc: "Authentique, filmé au smartphone, ton naturel et proche." },
    { name: "Studio Premium & Cinematic", desc: "Plans ultra macro soignés, esthétique haut de gamme." },
    { name: "Démonstration & Test (Crash test)", desc: "Focus sur la performance, démonstration en direct." },
    { name: "Unboxing ASMR & Mystère", desc: "Déballage sensoriel captant l'excitation d'ouverture." },
    { name: "Témoignage Client Réaliste", desc: "Avis d'un acheteur filmé chez lui, rassurer et convertir." }
  ];

  // Predefined Video Durations
  const videoDurations = [
    { id: "15 secondes", desc: "Idéal Instagram Reels & Snapchat" },
    { id: "30 secondes", desc: "Format standard à forte conversion" },
    { id: "45 secondes", desc: "Présentation interactive détaillée" },
    { id: "60 secondes", desc: "Narratif complet avec FAQ & Promo" }
  ];

  const handleGenerate = async () => {
    if (!productName) {
      toast.error("Veuillez saisir le nom de votre produit.");
      setActiveStep(1);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const enrichedContext = `
=== FICHE D'ANALYSE PRODUIT COMPLÈTE ===
Nom commercial du Produit : ${productName}
Description, caractéristiques & points forts : ${features || 'Robot de cuisine multifonctionnel et performant'}
Prix promotionnel conseillé : ${price} (Livraison comprise ou promotion exclusive)

=== CAHIER DES CHARGES PUBLICITAIRE ===
Type de Vidéo (Esthétique) : ${videoType}
Durée ciblée : ${videoDuration}
Format géométrique d'écran : ${aspectRatio}

=== STRATÉGIE MARKETING ET CIBLAGE (DZ) ===
Angle Marketing Majeur : ${painPoint} ${customAngle ? `(Complément personnalisé d'angle : ${customAngle})` : ''}
Marché Ciblé (Audience Idéale en Algérie) : ${targetMarket} ${customTarget ? `(Notes sur l'audience : ${customTarget})` : ''}
Style d'accroche / Hook de départ : ${hookType}
      `.trim();

      const data = await generateVideoAdScript(enrichedContext, videoType, aspectRatio);
      if (data) {
        setResult(data);
        toast.success("Script vidéo généré avec succès ! 🎬");

        // Prepare info payload
        const historyPayload = {
          result: data,
          productName,
          features,
          price,
          painPoint,
          customAngle,
          hookType,
          targetMarket,
          customTarget,
          videoType,
          videoDuration,
          aspectRatio,
        };

        // Add to history
        addToHistory(
          'script',
          productName,
          historyPayload,
          `Format: ${videoType} | Durée: ${videoDuration} | Angle: ${painPoint}`,
          {
            productName,
            videoType,
            videoDuration,
            aspectRatio,
          }
        );

        // Save active cache
        localStorage.setItem('dzads_last_generated_script', JSON.stringify(historyPayload));
      } else {
        throw new Error("Failed to parse script");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Échec de la génération du script.");
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
        setError("Quota Gemini épuisé. L'IA a besoin d'une pause ou votre limite est atteinte (429). Réessayez dans quelques minutes.");
      } else {
        setError("Erreur lors de la génération du script. Veuillez vérifier votre connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Script copié dans le presse-papiers ! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(result, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `DzAds_Brief_${productName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(element);
    element.click();
    toast.success("Brief vidéo exporté ! 📥");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Title Header */}
      <div>
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3 tracking-tight">
          <Video className="text-dz-emerald" /> Générateur de Scripts Vidéo AI
        </h1>
        <p className="text-white/50">Configurez votre produit à travers notre studio créatif guidé, puis laissez l'IA modéliser votre publicité.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Stepped Product Workflow */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Header & Steps Indicator */}
          <div className="glass-card p-6 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="text-[10px] font-black text-white/25 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-lg">PRO WORKFLOW</span>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-dz-emerald/10 rounded-xl text-dz-emerald">
                <Settings2 size={18} />
              </div>
              <h2 className="text-base font-black text-white">Workflow de Création</h2>
            </div>

            {/* Steps Timeline bar */}
            <div className="grid grid-cols-3 items-center relative text-center select-none">
              <div className="absolute left-[15%] right-[15%] top-1/2 h-[2px] bg-white/5 -translate-y-1/2 -z-1" />
              <div className="absolute left-[15%] right-[15%] top-1/2 h-[2px] bg-dz-emerald/20 -translate-y-1/2 -z-1 transition-all duration-500" 
                style={{ width: activeStep === 1 ? '0%' : activeStep === 2 ? '50%' : '100%' }}
              />
              
              {[
                { number: 1, label: "Produit" },
                { number: 2, label: "Finesse Marketing" },
                { number: 3, label: "Vibe & Format" }
              ].map((s) => (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => {
                    if (s.number > 1 && !productName) {
                      toast.error("Veuillez d'abord nommer votre produit à l'étape 1.");
                      return;
                    }
                    setActiveStep(s.number);
                  }}
                  className="flex flex-col items-center gap-2 cursor-pointer outline-none group"
                >
                  <div className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center transition-all duration-300 ${
                    activeStep === s.number 
                      ? 'bg-dz-emerald text-black shadow-lg shadow-dz-emerald/30 scale-110'
                      : activeStep > s.number 
                        ? 'bg-dz-emerald/20 text-dz-emerald border border-dz-emerald/30'
                        : 'bg-white/5 text-white/40 border border-white/10 group-hover:bg-white/10 group-hover:text-white'
                  }`}>
                    {activeStep > s.number ? <Check size={14} /> : s.number}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeStep === s.number ? 'text-dz-emerald font-black scale-105' : 'text-white/40 group-hover:text-white/70'
                  }`}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Step Panels Form Frame */}
          <div className="glass-card p-6 space-y-6 min-h-[460px] flex flex-col justify-between">
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

            <AnimatePresence mode="wait">
              
              {/* --- STEP 1: PRODUCT BASICS --- */}
              {activeStep === 1 && (
                <motion.div
                  key="step-basics"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Image Zone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ImageIcon size={10} className="text-dz-emerald" />
                        Image de votre produit (Facultatif)
                      </span>
                      {productImage && (
                        <button 
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-[9px] hover:text-red-400 uppercase font-black tracking-wider transition-colors cursor-pointer"
                        >
                          Changer l'image
                        </button>
                      )}
                    </label>
                    
                    <input 
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      className="hidden"
                    />

                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => !isAnalyzingImage && fileInputRef.current?.click()}
                      className={`relative border border-dashed rounded-2xl p-4 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden ${
                        isDragging 
                          ? 'border-dz-emerald bg-dz-emerald/10 scale-[1.02]' 
                          : productImage 
                            ? 'border-white/10 bg-black/20 hover:border-white/20' 
                            : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {productImage ? (
                        <div className="relative w-full flex flex-col items-center gap-2">
                          <div className="relative w-28 h-28 rounded-xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
                            <img 
                              src={productImage} 
                              alt="Produit Upload" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {isAnalyzingImage && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                                <Loader2 size={18} className="animate-spin text-dz-emerald" />
                                <span className="text-[8px] font-black uppercase text-white tracking-widest animate-pulse">Analyse AI...</span>
                              </div>
                            )}
                          </div>
                          {!isAnalyzingImage && (
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-bold text-white/40">Image prête</span>
                              <span className="text-[9px] font-black text-dz-emerald uppercase tracking-wider mt-0.5">✨ Données lues par la suite publicitaire</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-2 flex flex-col items-center">
                          <UploadCloud size={28} className={`mb-2 transition-transform duration-300 ${isDragging ? 'scale-110 text-dz-emerald' : 'text-white/35'}`} />
                          <p className="text-xs font-bold text-white/60 mb-1">
                            Glissez-déposez la photo du produit
                          </p>
                          <p className="text-[10px] text-white/30">
                            ou cliquez pour parcourir vos fichiers
                          </p>
                          <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 bg-dz-emerald/10 rounded-full border border-dz-emerald/20">
                            <Sparkles size={10} className="text-dz-emerald animate-pulse" />
                            <span className="text-[9px] font-bold text-dz-emerald uppercase tracking-wider animate-pulse">Analyse auto par IA</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <PromptField
                    label="Nom du produit / Prompt"
                    icon={<Package size={12} className="text-dz-gold" />}
                    value={productName}
                    onChange={setProductName}
                    placeholder="Ex: Hachoir Pro 3000w, Robot de cuisine..."
                    badgeText="PROMPT"
                  />

                  <PromptField
                    label="Caractéristiques et bénéfices (COD)"
                    icon={<List size={12} className="text-dz-emerald" />}
                    value={features}
                    onChange={setFeatures}
                    placeholder="Ex: Puissant moteur, silencieux, 100% cuivre, Facile à laver, Idéal pour préparer le hachis."
                    isTextArea
                    rows={3}
                    badgeText="DÉTAILS"
                    helpText="Vous pouvez aussi cliquer ci-dessous pour pré-remplir les avantages COD."
                  />
                  <div className="text-right">
                    <button 
                      type="button"
                      onClick={() => setFeatures((features ? features + " " : "") + "Moteur puissant, Ultra silencieux, Matériaux robustes de confiance, Livraison Gratuite 58 Wilayas !")}
                      className="text-[9px] font-black uppercase text-dz-emerald hover:underline cursor-pointer"
                    >
                      ⚡ Exemples d'avantages COD
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1 flex items-center gap-2">
                      <Coins size={10} className="text-dz-gold" />
                      Prix de Vente Estimé (En DA)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['1900 DA', '2900 DA', '3900 DA', '4900 DA'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPrice(p)}
                          className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                            price === p 
                              ? 'bg-dz-gold border-dz-gold text-black shadow-md'
                              : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <input 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Saisissez un autre prix ou offre (Ex: Pack de 2 = 6500 DA)"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-dz-emerald/50 transition-all mt-1"
                    />
                  </div>
                </motion.div>
              )}

              {/* --- STEP 2: MARKETING ANGLE & TARGET MARKET --- */}
              {activeStep === 2 && (
                <motion.div
                  key="step-marketing"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 max-h-[460px] overflow-y-auto scrollbar-hide pr-1"
                >
                  {/* Marketing Angle Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 ml-1 flex items-center gap-1.5">
                      <Flame size={12} className="text-red-400 animate-pulse" />
                      1. Angle Marketing Principal
                    </label>
                    <div className="space-y-1 max-h-[140px] overflow-y-auto scrollbar-hide pr-1">
                      {painPoints.map((point) => {
                        const Icon = point.icon;
                        const isSelected = painPoint === point.title;
                        return (
                          <button
                            key={point.title}
                            type="button"
                            onClick={() => setPainPoint(point.title)}
                            className={`w-full text-left p-2 px-3 rounded-xl border transition-all flex items-center gap-2 relative overflow-hidden group ${
                              isSelected 
                                ? 'bg-dz-emerald/15 border-dz-emerald text-white'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                            }`}
                          >
                            <div className={`p-1 rounded-lg ${isSelected ? 'bg-dz-emerald/20 ' + point.color : 'bg-white/5 text-white/40'}`}>
                              <Icon size={12} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold leading-none mb-1 text-white truncate">{point.title}</p>
                              <p className="text-[9px] text-white/40 leading-none truncate">{point.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <PromptField
                      label="Angle spécifique / Prompt sur-mesure"
                      icon={<Flame size={12} className="text-rose-400" />}
                      value={customAngle}
                      onChange={setCustomAngle}
                      placeholder="Commentaire ou angle personnalisé (Ex: Promo fête de l'Aïd...)"
                      badgeText="OPTIONNEL"
                    />
                  </div>

                  {/* Target Market Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-dz-gold ml-1 flex items-center gap-1.5">
                      <Target size={12} className="text-dz-gold" />
                      2. Marché Ciblé (Audience locale)
                    </label>
                    <select 
                      value={targetMarket}
                      onChange={(e) => setTargetMarket(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-dz-emerald/50 transition-all cursor-pointer appearance-none"
                    >
                      {targetMarkets.map((m) => (
                        <option key={m.name} value={m.name} className="bg-slate-900 text-white">
                          {m.name} - {m.desc}
                        </option>
                      ))}
                    </select>
                    <PromptField
                      label="Cible / Audience spécifique"
                      icon={<Target size={12} className="text-dz-gold" />}
                      value={customTarget}
                      onChange={setCustomTarget}
                      placeholder="Démographique ou cible spécifique (Ex: Wilayas du Sud, Femmes de +40 ans...)"
                      badgeText="DÉMOGRAPHIE"
                    />
                  </div>

                  {/* Hook Type selectors */}
                  <div className="space-y-1.5 pb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1 flex items-center gap-1.5">
                      <PlayCircle size={12} className="text-dz-emerald" />
                      3. Accroche Hook de départ (3s)
                    </label>
                    <div className="grid grid-cols-1 gap-1">
                      {hooks.map((h) => {
                        const isSelected = hookType === h.name;
                        return (
                          <button
                            key={h.name}
                            type="button"
                            onClick={() => setHookType(h.name)}
                            className={`w-full text-left p-1.5 px-3 rounded-xl border transition-all text-[11px] flex justify-between items-center ${
                              isSelected 
                                ? 'bg-dz-gold/15 border-dz-gold text-white font-heavy'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                            }`}
                          >
                            <span className="truncate">{h.name}</span>
                            <span className="text-[8px] font-bold uppercase shrink-0 text-white/30 ml-2">{h.key}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- STEP 3: SPECIFICATIONS VIDÉO (TYPE, DURÉE & RATIO) --- */}
              {activeStep === 3 && (
                <motion.div
                  key="step-vibe"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 max-h-[460px] overflow-y-auto scrollbar-hide pr-1"
                >
                  {/* Video Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-dz-emerald ml-1 flex items-center gap-2">
                      <Palette size={12} className="text-dz-emerald" />
                      1. Type de Vidéo attendu
                    </label>
                    <div className="space-y-1">
                      {videoTypes.map((vt) => {
                        const isSelected = videoType === vt.name;
                        return (
                          <button
                            key={vt.name}
                            type="button"
                            onClick={() => setVideoType(vt.name)}
                            className={`w-full text-left p-2 px-3 rounded-xl border transition-all flex justify-between items-center ${
                              isSelected 
                                ? 'bg-dz-emerald/15 border-dz-emerald text-white'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                            }`}
                          >
                            <div className="min-w-0 mr-2">
                              <p className="text-xs font-bold leading-none mb-1 text-white">{vt.name}</p>
                              <p className="text-[9px] text-white/40 leading-none truncate">{vt.desc}</p>
                            </div>
                            {isSelected && <Check size={12} className="text-dz-emerald shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Video Duration Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-dz-gold ml-1 flex items-center gap-2">
                      <Video size={12} className="text-dz-gold" />
                      2. Durée indicative de la vidéo
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {videoDurations.map((vd) => {
                        const isSelected = videoDuration === vd.id;
                        return (
                          <button
                            key={vd.id}
                            type="button"
                            onClick={() => setVideoDuration(vd.id)}
                            className={`p-2 rounded-xl text-left border transition-all ${
                              isSelected
                                ? 'bg-dz-gold/15 border-dz-gold text-white font-heavy shadow-md shadow-dz-gold/10'
                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                            }`}
                          >
                            <p className="text-xs font-bold text-white">{vd.id}</p>
                            <p className="text-[9px] text-white/30 truncate leading-none mt-0.5">{vd.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Aspect Ratio Selector */}
                  <div className="space-y-2 pt-1 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 bg-dz-emerald/10 rounded-lg text-dz-emerald">
                        <Layout size={12} />
                      </div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40">3. Format d'écran publicitaire</label>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: '16:9', label: 'Widescreen', sub: 'YouTube', icon: Monitor },
                        { id: '1:1', label: 'Carré', sub: 'Social', icon: SquareIcon },
                        { id: '4:5', label: 'Portrait', sub: 'Feed', icon: Maximize },
                        { id: '9:16', label: 'Vertical', sub: 'TikTok', icon: Smartphone }
                      ].map((ratio) => {
                        const Icon = ratio.icon;
                        return (
                          <button
                            key={ratio.id}
                            type="button"
                            onClick={() => setAspectRatio(ratio.id)}
                            className={`p-1.5 rounded-xl flex flex-col items-center gap-1 transition-all border ${
                              aspectRatio === ratio.id
                                ? 'bg-dz-emerald border-dz-emerald text-black font-heavy shadow-md shadow-dz-emerald/20'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                            }`}
                          >
                            <Icon size={12} />
                            <span className="text-[10px] font-black">{ratio.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stepper Navigation buttons */}
            <div className="pt-6 border-t border-white/5 flex gap-3 justify-between items-center mt-auto">
              {activeStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep(activeStep - 1)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <ArrowLeft size={14} />
                  <span>Retour</span>
                </button>
              ) : (
                <div />
              )}

              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!productName) {
                      toast.error("Veuillez saisir le nom de votre produit d'abord.");
                      return;
                    }
                    setActiveStep(activeStep + 1);
                  }}
                  className="px-5 py-3.5 bg-dz-emerald text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-dz-emerald/10 cursor-pointer hover:scale-[1.03] active:scale-95 ml-auto"
                >
                  <span>Suivant</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading || !productName}
                  className="px-6 py-4 bg-dz-gold hover:bg-dz-amber text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-2xl shadow-dz-gold/20 active:scale-[0.98] ml-auto cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <>
                      <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
                      <span>Générer Script Ads</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Script Results Rendering and Exporting */}
        <div className="lg:col-span-7 glass-card overflow-hidden flex flex-col min-h-[580px]">
          <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-dz-emerald animate-pulse" />
              Aperçu du Script AI
            </span>
            {result && (
              <div className="flex gap-2">
                <button 
                  onClick={handleExport}
                  className="text-white/60 hover:text-white transition-colors flex items-center gap-1 text-xs bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer"
                >
                  <Download size={14} />
                  Exporter
                </button>
                <button 
                  onClick={handleCopy}
                  className="text-white/60 hover:text-white transition-colors flex items-center gap-1 text-xs bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copied ? 'Copié' : 'Copier'}
                </button>
              </div>
            )}
          </div>
          <div className="p-8 flex-1 text-white/80 overflow-y-auto leading-relaxed space-y-6">
            {result ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-5 gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{result.title}</h3>
                    {result.productName && (
                      <p className="text-xs text-white/50 font-bold">Produit ciblé : <span className="text-white">{result.productName}</span></p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                      {result.visualStyle || "UGC"}
                    </span>
                    <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">
                      🎬 {result.aspectRatio || "9:16"}
                    </span>
                    {result.isUgcEmphasis && (
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                         UGC Optimized
                      </span>
                    )}
                  </div>
                </div>

                {/* Section 1: Cadre Marketing Stratégique et Structure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Funnel & Hook Info */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-dz-gold">
                      <Layers size={14} className="text-dz-gold" />
                      <span className="text-xs font-black uppercase tracking-wider">Structure de Conversion</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 uppercase font-bold text-xs">Méthode Utilisée</span>
                      <p className="text-xs font-black text-white mt-0.5">{result.funnelStructure || "Structure AIDA (Attention - Intérêt - Désir - Action)"}</p>
                    </div>
                    {result.marketingStrategy?.coreHook && (
                      <div>
                        <span className="text-[10px] text-white/40 uppercase font-bold text-xs">Accroche Majeure (3s)</span>
                        <p className="text-xs text-dz-gold italic font-bold">"{result.marketingStrategy.coreHook}"</p>
                      </div>
                    )}
                  </div>

                  {/* Target and Tone Info */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-dz-emerald">
                      <Target size={14} className="text-dz-emerald" />
                      <span className="text-xs font-black uppercase tracking-wider">Ciblage & Direction Vocale</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 uppercase font-bold text-xs">Audience Cible Idéale</span>
                      <p className="text-xs text-white/80">{result.marketingStrategy?.targetAudience || "Acheteurs en ligne réactifs au COD en Algérie"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 uppercase font-bold text-xs">Ton de voix-off</span>
                      <p className="text-xs text-white/80"><span className="font-bold text-dz-emerald">🗣️ {result.marketingStrategy?.voiceoverTone || "Chaleureux, Rassurant et Très Persuasif"}</span></p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Timeline et Découpage des Scènes (Structure / Maquette Live Switcher) */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <PlayCircle size={16} className="text-dz-emerald animate-pulse" />
                      <h4 className="text-sm font-black uppercase tracking-wider text-white/85">Visualisation & Rentabilité Créative</h4>
                    </div>

                    {/* Layout Mode Selector (Aligns with Landing Page Generator layout mode) */}
                    <div className="flex bg-white/[0.03] border border-white/10 p-1 rounded-2xl self-start sm:self-auto shadow-inner">
                      <button
                        type="button"
                        onClick={() => setLayoutMode('structure')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                          layoutMode === 'structure'
                            ? 'bg-dz-emerald text-black shadow-lg font-black'
                            : 'text-white/50 hover:text-white hover:bg-white/5 font-heavy'
                        }`}
                      >
                        <ListOrdered size={12} />
                        Éditeur de Structure
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLayoutMode('mockup');
                          setIsPlaying(false);
                          setCurrentPlaybackSceneIdx(0);
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                          layoutMode === 'mockup'
                            ? 'bg-dz-gold text-black shadow-lg font-black'
                            : 'text-white/50 hover:text-white hover:bg-white/5 font-heavy'
                        }`}
                      >
                        <Smartphone size={12} />
                        Maquette Live 📱
                      </button>
                    </div>
                  </div>

                  {/* EDITABLE STRUCTURE MODE */}
                  {layoutMode === 'structure' ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40 font-bold">Modifiez, réordonnez par glisser-déposer, ou insérez de nouvelles scènes :</span>
                        
                        <div className="flex bg-white/[0.03] border border-white/10 p-0.5 rounded-xl self-start sm:self-auto shadow-inner">
                          <button
                            type="button"
                            onClick={() => setSceneViewMode('single')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              sceneViewMode === 'single'
                                ? 'bg-dz-emerald/25 text-dz-emerald shadow-md font-black'
                                : 'text-white/50 hover:text-white hover:bg-white/5 font-heavy'
                            }`}
                          >
                            Sélection Actrice 🎬
                          </button>
                          <button
                            type="button"
                            onClick={() => setSceneViewMode('list')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              sceneViewMode === 'list'
                                ? 'bg-dz-emerald/25 text-dz-emerald shadow-md font-black'
                                : 'text-white/50 hover:text-white hover:bg-white/5 font-heavy'
                            }`}
                          >
                            Toutes les scènes 🗒️
                          </button>
                        </div>
                      </div>

                      {sceneViewMode === 'single' ? (
                        <div className="space-y-4">
                          {/* Scenes Horizontal Tab Ribbon */}
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide pr-1">
                            {result.scenes?.map((scene: any, idx: number) => {
                              const isActive = idx === activeSceneIdx;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setActiveSceneIdx(idx)}
                                  className={`px-3.5 py-2.5 rounded-xl border text-left cursor-pointer transition-all duration-300 min-w-[90px] flex-shrink-0 flex flex-col justify-between ${
                                    isActive
                                      ? 'bg-dz-emerald/15 border-dz-emerald text-white font-black shadow-lg shadow-dz-emerald/5'
                                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20'
                                  }`}
                                >
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-dz-emerald animate-pulse' : 'text-white/30'}`}>
                                    Scène {idx + 1}
                                  </span>
                                  <span className="text-[10px] font-bold text-white mt-1 leading-none truncate w-full">
                                    {scene.time || `0-${(idx + 1) * 5}s`}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Render sole active scene as full card */}
                          {result.scenes && result.scenes[activeSceneIdx] && (
                            <SortableSceneCard
                              key={result.scenes[activeSceneIdx].id || `scene-${activeSceneIdx}`}
                              id={result.scenes[activeSceneIdx].id || `scene-${activeSceneIdx}`}
                              scene={result.scenes[activeSceneIdx]}
                              index={activeSceneIdx}
                              updateSceneField={updateSceneField}
                              deleteScene={deleteScene}
                            />
                          )}
                        </div>
                      ) : (
                        /* Sortable Drag and drop for All Scenes */
                        result?.scenes ? (
                          <DndContext 
                            sensors={sensors} 
                            collisionDetection={closestCenter} 
                            onDragEnd={handleDragEnd}
                          >
                            <SortableContext 
                              items={result.scenes.map((s: any, idx: number) => s.id || `scene-${idx}`)} 
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="space-y-5">
                                {result.scenes.map((scene: any, idx: number) => (
                                  <SortableSceneCard
                                    key={scene.id || `scene-${idx}`}
                                    id={scene.id || `scene-${idx}`}
                                    scene={scene}
                                    index={idx}
                                    updateSceneField={updateSceneField}
                                    deleteScene={deleteScene}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        ) : (
                          <div className="text-center py-6 text-white/40 text-xs">Aucune scène disponible.</div>
                        )
                      )}

                      {/* Add scene button */}
                      <button
                        type="button"
                        onClick={addScene}
                        className="w-full py-4 bg-white/[0.02] border border-dashed border-white/10 hover:border-dz-emerald hover:bg-dz-emerald/5 hover:text-dz-emerald rounded-3xl text-xs font-black uppercase tracking-widest transition-all text-white/50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                      >
                        <Plus size={14} />
                        Ajouter un Plan / Nouvelle Scène
                      </button>
                    </div>
                  ) : result?.scenes && result.scenes.length > 0 ? (
                    /* LIVE SMARTPHONE VIDEO MOCKUP PLAYER MODE */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        
                        {/* Left: Smartphone Container Mockup */}
                        <div className="md:col-span-6 flex flex-col items-center justify-center">
                          <div className="relative w-[280px] h-[540px] rounded-[3rem] border-4 border-white/20 bg-slate-950 shadow-2xl overflow-hidden flex flex-col justify-between p-3.5 pt-7 select-none">
                            {/* Built-in Speaker / Camera cutout notch */}
                            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white/20 rounded-full mr-2" />
                              <div className="w-8 h-1 bg-white/20 rounded-full" />
                            </div>

                            {/* App container live layout screen */}
                            <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-slate-900 border border-white/5 flex flex-col justify-between">
                              
                              {/* Top video stream gradient and header info */}
                              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent z-10 p-4 flex flex-col justify-between">
                                {/* Timeline indicator bar */}
                                <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                                  <motion.div 
                                    key={currentPlaybackSceneIdx}
                                    initial={{ width: '0%' }}
                                    animate={isPlaying ? { width: '100%' } : { width: '60%' }}
                                    transition={isPlaying ? { duration: 4, ease: "linear" } : { duration: 0.2 }}
                                    className="bg-dz-emerald h-full rounded-full" 
                                  />
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-[9px] font-black uppercase text-white/50 bg-black/40 px-2 py-0.5 rounded-md">LIVE RECAP</span>
                                  <span className="text-[10px] font-mono text-dz-emerald font-bold">
                                    {result.scenes[currentPlaybackSceneIdx]?.time || `${currentPlaybackSceneIdx * 5}s`}
                                  </span>
                                </div>
                              </div>

                              {/* Background simulation under the phone frame */}
                              <div className="absolute inset-0 z-0 flex items-center justify-center bg-radial-gradient">
                                {productImage ? (
                                  <div className="relative w-full h-full">
                                    <img 
                                      src={productImage} 
                                      alt="Product Preview" 
                                      className="w-full h-full object-cover opacity-30 select-none pointer-events-none"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/30" />
                                    <motion.div 
                                      initial={{ scale: 0.9, y: 10 }}
                                      animate={{ scale: 1.0, y: 0 }}
                                      transition={{ duration: 0.5, type: 'spring' }}
                                      key={currentPlaybackSceneIdx}
                                      className="absolute inset-[15%] flex items-center justify-center p-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10"
                                    >
                                      <img 
                                        src={productImage} 
                                        alt="Product Focal" 
                                        className="max-h-full max-w-full object-contain rounded-xl shadow-xl"
                                        referrerPolicy="no-referrer"
                                      />
                                    </motion.div>
                                  </div>
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-[#101918] via-[#051410] to-[#040812] flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute w-36 h-36 rounded-full bg-dz-emerald/10 blur-3xl animate-pulse" />
                                    <div className="absolute w-44 h-44 rounded-full bg-dz-gold/5 blur-3xl" style={{ animationDelay: '2s' }} />
                                    
                                    <div className="p-6 rounded-full bg-white/5 border border-white/10 shadow-2xl flex flex-col items-center justify-center">
                                      <Video size={40} className="text-dz-emerald animate-pulse shrink-0" />
                                      <span className="text-[8px] font-black uppercase text-dz-emerald/50 tracking-widest mt-1">SIMULATION VISUELLE</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Center Screen Animated Overlay Text Overlay */}
                              {result.scenes[currentPlaybackSceneIdx]?.overlay && (
                                <div className="absolute inset-x-4 top-1/4 z-10 flex justify-center text-center">
                                  <motion.div
                                    key={currentPlaybackSceneIdx}
                                    initial={{ scale: 0.8, opacity: 0, y: -5 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    className="bg-black/80 backdrop-blur-xs border border-white/15 rounded-2xl py-2.5 px-4 shadow-2xl relative"
                                  >
                                    <div className="absolute inset-0 rounded-2xl border border-dz-emerald/50 animate-ping opacity-30 pointer-events-none" />
                                    <p className="text-[11px] font-black text-white leading-snug tracking-wider">
                                      🖥️ {result.scenes[currentPlaybackSceneIdx].overlay}
                                    </p>
                                  </motion.div>
                                </div>
                              )}

                              {/* Floating Social UI details */}
                              <div className="absolute right-2 top-1/3 z-20 flex flex-col gap-3 items-center">
                                <div className="w-7 h-7 rounded-full bg-dz-gold/20 border border-dz-gold text-dz-gold flex items-center justify-center text-[10px] font-black shadow-lg">
                                  DZ
                                </div>
                                <div className="flex flex-col items-center">
                                  <button type="button" className="p-1 text-red-500 scale-110 active:scale-90 transition-transform">❤️</button>
                                  <span className="text-[8px] font-black text-white/50 select-none">42.5K</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <button type="button" className="p-1 text-white scale-110 active:scale-95 transition-transform">💬</button>
                                  <span className="text-[8px] font-black text-white/50 select-none">958</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <button type="button" className="p-1 text-white scale-110 active:scale-95 transition-transform">🔗</button>
                                  <span className="text-[8px] font-black text-white/50 select-none">Share</span>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-slate-950 border border-white/20 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
                                  <div className="w-2.5 h-2.5 rounded-full bg-dz-gold border border-black" />
                                </div>
                              </div>

                              {/* Bottom Dynamic Subtitles Captions System */}
                              <div className="absolute inset-x-3 bottom-3 z-10 bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/5">
                                {result.scenes[currentPlaybackSceneIdx]?.step && (
                                  <span className="text-[8px] font-black tracking-widest uppercase text-dz-gold block mb-1">
                                    🎭 {result.scenes[currentPlaybackSceneIdx].step}
                                  </span>
                                )}
                                
                                <p className="text-xs font-bold font-arabic leading-relaxed text-emerald-300 text-right pr-0.5 select-all animate-pulse" dir="rtl">
                                  {result.scenes[currentPlaybackSceneIdx]?.audio || "جاري تشغيل المعاينة المباشرة..."}
                                </p>

                                {result.scenes[currentPlaybackSceneIdx]?.audioFranco && (
                                  <p className="text-[9px] text-white/40 italic leading-tight mt-1 truncate border-t border-white/5 pt-1">
                                    "{result.scenes[currentPlaybackSceneIdx].audioFranco}"
                                  </p>
                                )}
                              </div>

                            </div>
                          </div>

                          {/* Player Control Bar under mockup */}
                          <div className="mt-4 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentPlaybackSceneIdx(prev => Math.max(0, prev - 1));
                                setIsPlaying(false);
                              }}
                              disabled={currentPlaybackSceneIdx === 0}
                              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white hover:text-dz-emerald transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                              title="Scène précédente"
                            >
                              <ArrowLeft size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setIsPlaying(!isPlaying)}
                              className={`p-4 rounded-full border transition-transform duration-200 active:scale-90 flex items-center justify-center cursor-pointer ${
                                isPlaying 
                                  ? 'bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/10' 
                                  : 'bg-dz-emerald text-black border-dz-emerald shadow-lg shadow-dz-emerald/20 hover:scale-105'
                              }`}
                              title={isPlaying ? "Mettre en Pause" : "Lancer la maquette"}
                            >
                              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCurrentPlaybackSceneIdx(prev => Math.min(result.scenes.length - 1, prev + 1));
                                setIsPlaying(false);
                              }}
                              disabled={currentPlaybackSceneIdx === result.scenes.length - 1}
                              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white hover:text-dz-emerald transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                              title="Scène suivante"
                            >
                              <ArrowRight size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCurrentPlaybackSceneIdx(0);
                                setIsPlaying(false);
                              }}
                              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white hover:text-dz-gold transition-all cursor-pointer"
                              title="Réinitialiser la timeline"
                            >
                              <RotateCcw size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Right: Selected Scene Detailed Breakdown Sidebar */}
                        <div className="md:col-span-6 space-y-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase text-white/30 bg-white/5 px-2 py-1 rounded-lg border border-white/10">Sélectionner un plan</span>
                            <span className="text-xs font-black text-dz-gold">
                              {currentPlaybackSceneIdx + 1} / {result.scenes.length}
                            </span>
                          </div>

                          {/* Jump directly to scene line */}
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                            {result.scenes.map((scene: any, idx: number) => {
                              const isSelected = idx === currentPlaybackSceneIdx;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setCurrentPlaybackSceneIdx(idx);
                                    setIsPlaying(false);
                                  }}
                                  className={`w-full text-left p-2.5 px-3.5 rounded-2xl border transition-all text-xs flex justify-between items-center ${
                                    isSelected 
                                      ? 'bg-dz-emerald/15 border-dz-emerald text-white font-heavy'
                                      : 'bg-white/5 border-white/10 text-white/55 hover:bg-white/10 hover:border-white/20'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-dz-emerald animate-ping' : 'bg-white/25'}`} />
                                    <span className="truncate max-w-[140px] uppercase font-bold tracking-tight">{scene.step || `Scène ${idx + 1}`}</span>
                                    <span className="text-[9px] text-white/30 font-bold">{scene.time}</span>
                                  </div>
                                  <span className="text-[9px] font-black text-dz-gold">{scene.marketingAngle || 'Attention'}</span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 space-y-4">
                            {/* Visual Instruction card */}
                            <div className="space-y-1.5">
                              <h5 className="text-[9px] font-black text-dz-emerald uppercase tracking-wider">🎬 Visuel & Réalisation</h5>
                              <p className="text-xs text-white/95 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                                {result.scenes[currentPlaybackSceneIdx]?.visual || "Aucune vision."}
                              </p>
                            </div>

                            {/* Actor indications */}
                            {result.scenes[currentPlaybackSceneIdx]?.actorDirection && (
                              <div className="space-y-1.5">
                                <h5 className="text-[9px] font-black text-white/40 uppercase tracking-wider flex items-center gap-1">
                                  <Smile size={11} className="text-dz-emerald animate-pulse" />
                                  Jeu d'Acteur / Créateur
                                </h5>
                                <p className="text-xs text-white/70 italic leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                                  {result.scenes[currentPlaybackSceneIdx].actorDirection}
                                </p>
                              </div>
                            )}

                            {/* Sound effect block */}
                            {result.scenes[currentPlaybackSceneIdx]?.sfxMusic && (
                              <div className="flex items-center gap-2 bg-dz-gold/5 border border-dz-gold/10 p-3 rounded-xl">
                                <Volume2 size={13} className="text-dz-gold shrink-0" />
                                <div className="min-w-0">
                                  <span className="text-[8px] font-black uppercase text-dz-gold/70 block">Bande Son & Effets</span>
                                  <span className="text-xs text-white/80 leading-none truncate block mt-0.5">
                                    {result.scenes[currentPlaybackSceneIdx].sfxMusic}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-3xl text-white/40 text-xs">
                      Aucune scène disponible pour la maquette live. Générez un scénario complet d'abord.
                    </div>
                  )}
                </div>

                {/* Section 3: Final Call to Action Appels à l'Action & Rassurance (CTA) */}
                {result.ctaSection && (
                  <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/[0.03] border border-emerald-500/20 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-dz-emerald" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Scène Finale & Appel à l'Action (CTA)</h4>
                      </div>
                      {result.ctaSection.priceOnScreen && (
                        <span className="px-3 py-1 bg-dz-gold text-black rounded-lg text-xs font-black shadow-md">
                          💰 Prix visé : {result.ctaSection.priceOnScreen}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm font-bold text-center text-white/95 py-3 px-4 bg-black/40 border border-white/5 rounded-xl italic">
                      🎯 "{result.ctaSection.ctaText}"
                    </p>

                    {result.ctaSection.trustTriggers && result.ctaSection.trustTriggers.length > 0 && (
                      <div className="flex justify-center gap-4 flex-wrap pt-1">
                        {result.ctaSection.trustTriggers.map((trigger: string, tIdx: number) => (
                          <div key={tIdx} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white">
                            <Truck size={12} className="text-dz-emerald" />
                            <span className="font-bold text-[11px]">{trigger}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Section 4: Conseils globaux de Tournage / Montage */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-center">
                    <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Directives de Production</h5>
                    <p className="text-[11px] text-white/65 leading-relaxed italic">{result.generalNotes}</p>
                  </div>

                  {result.productionTips && result.productionTips.length > 0 ? (
                    <div className="md:col-span-2 p-5 bg-white/[0.01] border border-white/5 rounded-2xl">
                      <h5 className="text-[10px] font-black text-dz-emerald uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Sparkles size={12} className="animate-pulse" />
                        Checklist Technique de l'IA pour le Tournage
                      </h5>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {result.productionTips.map((tip: string, id: number) => (
                          <li key={id} className="flex items-start gap-2 bg-black/10 p-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <span className="w-5 h-5 rounded-md bg-dz-emerald/10 text-dz-emerald border border-dz-emerald/20 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                              {id + 1}
                            </span>
                            <span className="text-[10px] text-white/85 leading-tight">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="md:col-span-2 p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-center text-center">
                      <p className="text-xs text-white/40">Aucun checklist additionnelle disponible.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 select-none py-16">
                <Video size={64} strokeWidth={1} className="mb-4 text-white" />
                <p className="text-sm font-bold text-white">Votre script stratégique apparaîtra ici.</p>
                <p className="text-xs mt-1 text-white/70">Complétez le workflow de 3 étapes à gauche pour configurer au mieux vos scènes de vente d'influence.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
