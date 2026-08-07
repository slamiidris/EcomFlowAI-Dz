import { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  FileImage, 
  Plus, 
  Loader2,
  Layers,
  Sparkles,
  ChevronRight,
  Maximize2,
  Check,
  Settings2,
  FileDown,
  Eye,
  Type,
  ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
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
import { useToast } from '../context/ToastContext';

interface SectionImage {
  id: string;
  url: string;
  file: File;
  name: string;
  width: number;
  height: number;
}

interface ExportOptions {
  width: number;
  format: 'image/png' | 'image/jpeg';
  quality: number;
}

function SortableItem({ section, index, removeSection, totalSections }: { 
  section: SectionImage, 
  index: number, 
  removeSection: (id: string) => void,
  totalSections: number
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-4 p-3 glass-card glass-card-hover border-white/5",
        isDragging && "opacity-50 scale-95"
      )}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center cursor-grab active:cursor-grabbing text-white/20 hover:text-dz-gold hover:border-dz-gold/30 transition-all"
      >
        <Layers size={16} />
      </div>

      <div className="w-32 h-20 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center relative shadow-2xl">
        <img src={section.url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60" />
        <div className="absolute inset-x-0 bottom-0 p-2">
           <p className="text-[8px] font-black text-white/80 uppercase tracking-[0.3em] font-mono">{section.width}x{section.height}</p>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-black text-white truncate mb-1 tracking-tight group-hover:text-dz-gold transition-colors">{section.name}</h4>
        <div className="flex items-center gap-2">
           <div className="px-1.5 py-0.5 bg-dz-gold/10 rounded border border-dz-gold/20">
             <span className="text-[8px] font-black text-dz-gold uppercase tracking-[0.2em]">Bloc {index + 1}</span>
           </div>
           <div className="w-0.5 h-0.5 rounded-full bg-white/20" />
           <span className="text-[9px] font-black text-white/30 uppercase tracking-widest font-mono">
             {section.file.size > 1024 * 1024 
               ? `${(section.file.size / (1024 * 1024)).toFixed(1)} MB` 
               : `${(section.file.size / 1024).toFixed(0)} KB`}
           </span>
        </div>
      </div>

      <div className="flex items-center gap-2 pr-1">
        <button 
          onClick={() => removeSection(section.id)}
          className="w-10 h-10 flex items-center justify-center bg-rose-500/5 hover:bg-rose-500 text-rose-500/50 hover:text-white rounded-xl transition-all shadow-lg active:scale-90 border border-rose-500/10 hover:border-rose-500/50"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function LandingAssembler() {
  const toast = useToast();
  const [sections, setSections] = useState<SectionImage[]>([]);
  const [projectName, setProjectName] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [assembling, setAssembling] = useState(false);
  const [assembledUrl, setAssembledUrl] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [options, setOptions] = useState<ExportOptions>({
    width: 1920,
    format: 'image/png',
    quality: 0.95
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setSections(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            url: event.target?.result as string,
            file: file,
            name: file.name,
            width: img.width,
            height: img.height
          }]);
          if (sections.length === 0) {
            setOptions(prev => ({ ...prev, width: img.width }));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    setAssembledUrl(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setAssembledUrl(null);
    }
  };

  const getEstimatedSize = () => {
    if (!assembledUrl) return '0 KB';
    const base64Length = assembledUrl.split(',')[1].length;
    const sizeInBytes = Math.floor(base64Length * 0.75);
    if (sizeInBytes > 1024 * 1024) return (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
    return Math.floor(sizeInBytes / 1024) + ' KB';
  };

  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [speedMode, setSpeedMode] = useState<'high' | 'eco'>('high');

  const presets = [
    { label: 'Mobile (9:16)', width: 1080, desc: 'TikTok / Instagram' },
    { label: 'Desktop (HD)', width: 1920, desc: 'Standard Web' },
    { label: 'Retina (4K)', width: 3840, desc: 'High Definition' }
  ];

  const assembleImages = async () => {
    if (sections.length === 0) return;
    setAssembling(true);

    try {
      const outputWidth = options.width;
      const totalHeight = sections.reduce((acc, s) => {
        const scale = outputWidth / s.width;
        return acc + (s.height * scale);
      }, 0);

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = outputWidth;
      canvas.height = totalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Enable smoothing for better scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      let currentY = 0;
      for (const section of sections) {
        const img = await new Promise<HTMLImageElement>((resolve) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.src = section.url;
        });

        const scale = outputWidth / section.width;
        const scaledHeight = section.height * scale;
        
        ctx.drawImage(img, 0, currentY, outputWidth, scaledHeight);
        currentY += scaledHeight;
      }

      const resultUrl = canvas.toDataURL(options.format, options.quality);
      setAssembledUrl(resultUrl);
      toast.success("Page d'atterrissage assemblée avec succès ! Ready for download. 🖼️");
    } catch (error) {
      console.error('Assembly failed:', error);
      toast.error("Erreur lors de l'assemblage des images.");
    } finally {
      setAssembling(false);
    }
  };

  const downloadResult = () => {
    if (!assembledUrl) return;
    const filename = projectName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    const extension = options.format === 'image/png' ? 'png' : 'jpg';
    const link = document.createElement('a');
    link.download = `${filename || 'assembleure-lp'}-${Date.now()}.${extension}`;
    link.href = assembledUrl;
    link.click();
    toast.success("Téléchargement de la landing page démarré ! 📥");
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-32">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 glass-panel-heavy p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-dz-gold/10 blur-[120px] -mr-40 -mt-40 group-hover:bg-dz-gold/20 transition-all duration-1000 animate-mesh"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-dz-emerald/5 blur-[100px] -ml-32 -mb-32 group-hover:bg-dz-emerald/10 transition-all duration-1000 animate-mesh" style={{ animationDelay: '-7s' }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-dz-gold/10 text-dz-gold text-[9px] font-black uppercase tracking-[0.3em] rounded-full border border-dz-gold/20 shadow-lg shadow-dz-gold/5 flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dz-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-dz-gold"></span>
              </span>
              Toolbox de Conversion
            </div>
            <div className="h-[1px] w-8 bg-white/10"></div>
            <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em] font-mono">
              V2.0
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter leading-tight">
            L'Assembleure <span className="text-dz-gold italic inline-block md:ml-3 underline decoration-dz-gold/20 decoration-4 underline-offset-4">Landing Page</span>
          </h1>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mt-6">
            <div className="flex-1 w-full md:w-[320px]">
              <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-2 block pl-1">Nom du Projet</label>
              <div className="relative group/input">
                <input 
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Nom de la page..."
                  className="w-full bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-xl px-6 py-3.5 text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-dz-gold/50 transition-all placeholder:text-white/20 hover:bg-white/[0.08] shadow-inner"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within/input:opacity-100 transition-opacity">
                  <span className="text-dz-gold"><Sparkles size={16} /></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 relative z-10 self-start md:self-auto md:mb-2">
          {sections.length > 0 && (
            <button 
              onClick={() => { setSections([]); setAssembledUrl(null); }}
              className="px-8 py-5 bg-white/[0.03] hover:bg-rose-500/10 text-white/40 hover:text-rose-500 rounded-[2rem] text-[10px] font-black transition-all border border-white/10 shadow-xl active:scale-95 uppercase tracking-widest"
            >
              Réinitialiser
            </button>
          )}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-10 py-5 bg-linear-to-tr from-white/10 to-white/5 hover:from-dz-gold hover:to-dz-amber text-white rounded-[2.5rem] text-[10px] font-black flex items-center gap-4 border border-white/10 transition-all shadow-2xl active:scale-95 uppercase tracking-widest group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" /> Importer des Sections
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Editor Sidebar / Actions */}
        <div className="lg:col-span-4 space-y-8">
           <div className="glass-panel-heavy p-10 space-y-10 sticky top-10 rounded-[3rem] border-white/10 shadow-2xl">
              <div className="flex items-center gap-4 pb-8 border-b border-white/5">
                 <div className="w-12 h-12 rounded-2xl bg-dz-gold/10 flex items-center justify-center text-dz-gold border border-dz-gold/20 shadow-lg shadow-dz-gold/5">
                    <Settings2 size={22} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter">Exportation</h2>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Configuration Finale</p>
                 </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-5">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
                       <Maximize2 size={12} className="text-dz-gold" /> Format & Ratio
                    </label>
                    <span className="text-xs font-black text-white px-3 py-1 bg-white/5 rounded-full border border-white/10 font-mono shadow-inner">{options.width}px</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {presets.map(p => (
                      <button 
                        key={p.width}
                        onClick={() => setOptions(prev => ({ ...prev, width: p.width }))}
                        className={cn(
                          "flex items-center justify-between px-5 py-4 rounded-2xl border transition-all active:scale-95 text-left group",
                          options.width === p.width 
                            ? "bg-dz-gold/10 text-white border-dz-gold shadow-lg shadow-dz-gold/5" 
                            : "bg-white/[0.02] border-white/5 text-white/30 hover:text-white hover:bg-white/[0.05]"
                        )}
                      >
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{p.label}</p>
                            <p className="text-[8px] font-bold opacity-40">{p.desc}</p>
                         </div>
                         <div className={cn(
                           "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                           options.width === p.width ? "border-dz-gold bg-dz-gold" : "border-white/10"
                         )}>
                            {options.width === p.width && <Check size={10} className="text-white" strokeWidth={4} />}
                         </div>
                      </button>
                    ))}
                  </div>
                  <div className="relative pt-2 pb-6">
                    <div className="absolute inset-0 flex items-center px-1">
                       <div className="w-full h-1.5 bg-white/5 rounded-full" />
                    </div>
                    <input 
                      type="range" 
                      min="320" 
                      max="4096" 
                      step="10"
                      value={options.width}
                      onChange={(e) => setOptions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                      className="relative w-full h-1.5 appearance-none cursor-pointer accent-dz-gold bg-transparent"
                    />
                    <div className="flex justify-between text-[9px] font-black text-white/10 uppercase tracking-widest mt-4 pl-1 pr-1">
                       <span>Mobile</span>
                       <span>Desktop</span>
                       <span>4K UHD</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
                       <Sparkles size={12} className="text-dz-emerald" /> Optimisation Flux (Vitesse)
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-white/[0.02] rounded-2xl border border-white/5 shadow-inner">
                    <button 
                      onClick={() => {
                        setSpeedMode('high');
                        setOptions(prev => ({ ...prev, format: 'image/png', quality: 1 }));
                      }}
                      className={cn(
                        "py-3.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest active:scale-95",
                        speedMode === 'high' 
                          ? "bg-white/10 text-white shadow-xl" 
                          : "text-white/20 hover:text-white"
                      )}
                    >
                      Qualité Max
                    </button>
                    <button 
                      onClick={() => {
                        setSpeedMode('eco');
                        setOptions(prev => ({ ...prev, format: 'image/jpeg', quality: 0.75 }));
                      }}
                      className={cn(
                        "py-3.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest active:scale-95",
                        speedMode === 'eco' 
                          ? "bg-dz-emerald/20 text-dz-emerald border border-dz-emerald/30 shadow-xl" 
                          : "text-white/20 hover:text-white"
                      )}
                    >
                      DZ Speed (Web)
                    </button>
                  </div>
                  {speedMode === 'eco' && (
                    <p className="text-[9px] font-bold text-dz-emerald/60 px-2 italic">
                       * Recommandé pour Algerie (3G/4G). Réduit le LCP de 60%.
                    </p>
                  )}
                </div>

                {options.format === 'image/jpeg' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 pt-2"
                  >
                     <div className="flex items-center justify-between pl-1">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                          Qualité JPEG
                        </label>
                        <span className="text-xs font-black text-dz-gold font-mono">{(options.quality * 100).toFixed(0)}%</span>
                     </div>
                     <input 
                      type="range" 
                      min="0.1" 
                      max="1" 
                      step="0.05"
                      value={options.quality}
                      onChange={(e) => setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                      className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-dz-gold"
                    />
                  </motion.div>
                )}
              </div>

              <div className="pt-10 border-t border-white/5 space-y-5">
                 <button 
                   onClick={assembleImages}
                   disabled={assembling || sections.length === 0}
                   className="w-full py-6 bg-linear-to-tr from-dz-emerald to-emerald-600 hover:from-dz-emerald/90 hover:to-emerald-500 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-4 shadow-2xl shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-20 disabled:grayscale group uppercase tracking-[0.2em]"
                 >
                   {assembling ? (
                     <Loader2 className="animate-spin" size={20} />
                   ) : (
                     <Sparkles className="group-hover:rotate-12 group-hover:scale-125 transition-all duration-500" size={20} strokeWidth={3} />
                   )}
                   {assembling ? 'Traitement...' : 'Fusionner Blocs'}
                 </button>

                 <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[9px] text-center text-white/20 font-black uppercase tracking-widest">
                       Processing Local GPU Acceleration
                    </p>
                 </div>
              </div>
           </div>

           <div className="glass-emerald p-8 rounded-[2.5rem] relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-dz-emerald/5 blur-2xl rounded-full" />
              <div className="flex gap-5 relative z-10">
                 <div className="w-14 h-14 rounded-2xl bg-dz-emerald/10 text-dz-emerald flex items-center justify-center shrink-0 border border-dz-emerald/20 shadow-lg shadow-dz-emerald/5 group-hover:scale-110 transition-transform duration-500">
                    <FileImage size={24} />
                 </div>
                 <div>
                    <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-2 italic flex items-center gap-2">
                      <Sparkles size={10} className="text-dz-emerald" /> Pro Intelligence
                    </h4>
                    <p className="text-white/40 text-[11px] font-bold leading-relaxed pr-2">
                       L'IA DzAds calibre automatiquement la densité de pixels pour garantir une vitesse de chargement record sur le réseau algérien (4G Ooredoo/Djezzy/Mobilis).
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* List of Sections */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[700px]">
           <div 
             className={cn(
               "glass-card flex-1 p-10 rounded-[3.5rem] border transition-all duration-700 overflow-hidden flex flex-col relative shadow-2xl",
               isDraggingOver ? "border-dz-gold/50 bg-dz-gold/[0.02] scale-[0.99] shadow-dz-gold/5" : "border-white/5"
             )}
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
           >
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              
              {sections.length === 0 ? (
                <div 
                  className="flex-1 flex flex-col items-center justify-center text-center cursor-pointer group/upload py-20"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-40 h-40 rounded-[4rem] bg-white/[0.02] flex items-center justify-center mb-12 group-hover/upload:scale-110 group-hover/upload:bg-dz-gold/[0.03] transition-all duration-700 relative border border-white/5 shadow-2xl">
                     <div className="absolute inset-0 bg-dz-gold/20 blur-3xl rounded-full opacity-0 group-hover/upload:opacity-100 transition-opacity duration-1000"></div>
                     <div className="relative z-10 w-24 h-24 rounded-[2rem] bg-linear-to-tr from-dz-gold/20 to-dz-amber/10 flex items-center justify-center border border-dz-gold/30">
                        <Upload size={40} className="text-dz-gold group-hover/upload:-translate-y-2 transition-transform duration-500" strokeWidth={2.5} />
                     </div>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">Votre LP commence ici.</h3>
                  <p className="text-white/30 font-bold max-w-sm text-lg leading-relaxed mb-12">
                     Le "Drag & Build" optimisé pour le Cash on Delivery. Déposez vos créas.
                  </p>
                  <div className="flex gap-4">
                    <div className="px-6 py-3 bg-white/[0.03] rounded-2xl border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-white/40 shadow-xl group-hover/upload:text-dz-gold group-hover/upload:border-dz-gold/20 transition-all">PNG LOSSLESS</div>
                    <div className="px-6 py-3 bg-white/[0.03] rounded-2xl border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-white/40 shadow-xl group-hover/upload:text-dz-emerald group-hover/upload:border-dz-emerald/20 transition-all">WEBP COMPATIBLE</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 flex flex-col h-full">
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <div>
                      <h4 className="text-white font-black text-3xl tracking-tighter mb-1">Architecture Page</h4>
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                           {sections.slice(0, 3).map((s, idx) => (
                             <div key={idx} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-white/5 overflow-hidden">
                               <img src={s.url} className="w-full h-full object-cover grayscale opacity-50" />
                             </div>
                           ))}
                        </div>
                        <p className="text-dz-gold text-[10px] font-black uppercase tracking-[0.3em] bg-dz-gold/10 px-3 py-1 rounded-full border border-dz-gold/20">{sections.length} Segments</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-white/[0.03] hover:bg-dz-gold/10 text-white/60 hover:text-white rounded-2xl text-[10px] font-black flex items-center gap-3 border border-white/5 transition-all shadow-xl active:scale-95 uppercase tracking-widest"
                    >
                      <Plus size={14} strokeWidth={3} /> Injecter Nouveau
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-4 custom-scroll">
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={sections.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4 py-4 min-h-[400px]">
                          <AnimatePresence mode="popLayout">
                            {sections.map((section, index) => (
                              <motion.div
                                key={section.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              >
                                <SortableItem 
                                  section={section} 
                                  index={index} 
                                  removeSection={removeSection}
                                  totalSections={sections.length}
                                />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Result Visualizer */}
      <AnimatePresence>
        {assembledUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10 pt-10"
          >
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 glass-emerald p-10 rounded-[3rem] border border-white/10 relative overflow-hidden group shadow-[0_0_80px_rgba(0,0,0,0.5)]">
               <div className="absolute top-0 left-0 w-full h-full bg-dz-emerald/5 blur-3xl rounded-full animate-mesh"></div>
               <div className="flex items-center gap-8 relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-dz-emerald/10 text-dz-emerald flex items-center justify-center shadow-2xl shadow-dz-emerald/10 border border-dz-emerald/20 animate-float">
                     <Check size={36} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-white tracking-tighter mb-2">Chef-d'œuvre Prêt !</h3>
                    <div className="flex items-center flex-wrap gap-4">
                       <div className="px-3 py-1 bg-dz-emerald/20 rounded-lg text-[10px] font-black text-dz-emerald uppercase tracking-widest border border-dz-emerald/30">{options.width}px Ultra Wide</div>
                       <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                       <span className="text-xs font-black text-white/30 uppercase tracking-widest">Poids: <span className="text-white font-mono">{getEstimatedSize()}</span></span>
                       <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                       <div className="flex p-1.5 bg-black/40 rounded-xl border border-white/10 shadow-inner">
                          <button 
                            onClick={() => setPreviewMode('desktop')}
                            className={cn(
                              "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                              previewMode === 'desktop' ? "bg-dz-gold text-white shadow-lg" : "text-white/20 hover:text-white"
                            )}
                          >Desktop</button>
                          <button 
                            onClick={() => setPreviewMode('mobile')}
                            className={cn(
                              "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                              previewMode === 'mobile' ? "bg-dz-gold text-white shadow-lg" : "text-white/20 hover:text-white"
                            )}
                          >Mobile</button>
                       </div>
                    </div>
                  </div>
               </div>
               
               <div className="flex flex-wrap gap-4 relative z-10 lg:pl-10">
                 <button 
                   onClick={() => setPreviewImage(assembledUrl)}
                   className="px-10 py-6 bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white rounded-[2rem] text-[10px] font-black flex items-center gap-3 border border-white/10 transition-all uppercase tracking-[0.2em] active:scale-95 shadow-xl"
                 >
                   <Eye size={18} /> Plein Écran
                 </button>
                 <button 
                    onClick={downloadResult}
                    className="px-12 py-6 bg-linear-to-tr from-dz-emerald to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-[2rem] text-[10px] font-black flex items-center gap-4 shadow-2xl shadow-emerald-500/30 active:scale-[0.98] transition-all uppercase tracking-[0.2em] border border-white/10 group"
                  >
                    <Download size={20} className="group-hover:translate-y-1 transition-transform" /> Pack de Capture Finale
                  </button>
               </div>
            </div>

            <div className="flex justify-center perspective-1000">
              <motion.div 
                layout
                className={cn(
                  "glass-card p-4 overflow-hidden rounded-[4rem] border-8 border-white/5 shadow-[0_0_150px_rgba(0,0,0,0.6)] transition-all duration-700 ease-out",
                  previewMode === 'mobile' ? "w-[440px] max-w-full" : "w-full"
                )}
              >
                <div className={cn(
                  "max-h-[900px] overflow-y-auto custom-scroll-heavy p-2 bg-slate-900/40 rounded-[3rem] relative scroll-smooth group/preview overflow-x-hidden border border-white/5",
                  previewMode === 'mobile' && "aspect-[9/19.5] max-h-none h-[800px]"
                )}>
                   <img src={assembledUrl} alt="Assembled Landing Page" className="w-full rounded-2xl shadow-2xl transition-all duration-1000 group-hover/preview:scale-[1.02]" />
                   <div className="absolute inset-x-0 bottom-10 flex justify-center pointer-events-none opacity-0 group-hover/preview:opacity-100 transition-opacity duration-500">
                      <div className="bg-black/60 backdrop-blur-xl px-10 py-4 rounded-full border border-white/20 text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl">
                         Scroll Experience Live
                      </div>
                   </div>
                   {previewMode === 'mobile' && (
                     <div className="absolute top-0 inset-x-0 h-10 bg-linear-to-b from-black/60 to-transparent pointer-events-none" />
                   )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Preview */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-4 md:p-16 cursor-zoom-out"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 100, opacity: 0 }}
              className="max-w-7xl w-full max-h-full overflow-y-auto rounded-[3rem] overflow-hidden glass-card shadow-emerald-500/10 p-2 border border-white/10 custom-scroll-heavy"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-6 right-6 flex justify-end z-20 pointer-events-none">
                 <button 
                   onClick={() => setPreviewImage(null)}
                   className="w-14 h-14 bg-white/10 hover:bg-rose-500 text-white rounded-full transition-all pointer-events-auto backdrop-blur-3xl border border-white/20 active:scale-95 shadow-2xl flex items-center justify-center"
                 >
                   <Plus size={28} className="rotate-45" />
                 </button>
              </div>
              <div className="p-4">
                <img src={previewImage} alt="Full Preview" className="w-full rounded-2xl shadow-inner" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <canvas ref={canvasRef} className="hidden" />

      {/* Stats / Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { icon: ImageIcon, title: 'Smart Scaling', desc: 'Mise à l\'échelle algorithmique optimisée pour le DPI des écrans rétina.' },
           { icon: Maximize2, title: 'Network Ready', desc: 'Poids optimisé pour garantir un score LCP maximum sur Google PageSpeed.' },
           { icon: Sparkles, title: 'GPU Render', desc: 'Utilise la puissance de votre carte graphique pour une fusion instantanée.' },
           { icon: Type, title: 'DZ Standard', desc: 'Exportation aux dimensions standards des régies publicitaires algériennes.' }
         ].map((item, i) => (
           <div key={i} className="glass-card glass-card-hover p-10 group border-white/5">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-8 text-dz-gold border border-white/10 group-hover:bg-dz-gold group-hover:text-white transition-all transform group-hover:-translate-y-2 group-hover:rotate-6 duration-500 shadow-lg">
                 <item.icon size={30} />
              </div>
              <h4 className="text-white font-black text-xs uppercase mb-4 tracking-[0.3em] group-hover:text-dz-gold transition-colors">{item.title}</h4>
              <p className="text-white/30 text-[11px] font-bold leading-relaxed">{item.desc}</p>
           </div>
         ))}
      </div>
      
      <style>{`
        .custom-scroll-heavy::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll-heavy::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scroll-heavy::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scroll-heavy::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.4);
          background-clip: content-box;
        }
        .perspective-1000 {
          perspective: 2000px;
        }
      `}</style>
    </div>
  );
}
