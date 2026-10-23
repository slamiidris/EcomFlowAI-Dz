import { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Download,
  Camera,
  Monitor,
  Maximize,
  Smartphone,
  Square as SquareIcon,
  Layout,
  X,
  Package,
  Palette,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateProductImage, generateSectionImage } from '../services/gemini';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { addToHistory } from '../lib/history';
import { fileToUploadDataUrl } from '../lib/imageCompress';
import { IMAGE_PROVIDER_NAMES, KEEPS_PRODUCT, isAspectRatio, type ImageProvider } from '../lib/imageProviders';
import { imaginedProductPrompt, productPhotoPrompt, type PhotoStyle } from '../lib/productPhotoPrompt';
import { preferencesApi } from '../services/api';
import { chosenImageProvider, imageFromService } from '../services/imageService';
import PageHeader from './PageHeader';
import PromptField from './PromptField';
import { ImageDrop } from './ui/primitives';
import '../i18n/images';

/** the reference photo is sent to the image model: large enough for its details, light enough to upload */
const REFERENCE_MAX = 1536;

export default function ProductImageGen() {
  const toast = useToast();
  const { t } = useLanguage();
  const [productName, setProductName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [style, setStyle] = useState<PhotoStyle>('lifestyle');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<ImageProvider | null>(null);

  useEffect(() => {
    let alive = true;
    void chosenImageProvider().then((p) => alive && setProvider(p));
    return () => { alive = false; };
  }, []);

  // Load last restored or generated image from the API on mount (localStorage as fallback)
  useEffect(() => {
    let cancelled = false;
    const applySaved = (parsed: any) => {
      setResult(parsed.result || parsed.img || (typeof parsed === 'string' ? parsed : null));
      if (parsed.productName) setProductName(parsed.productName);
      if (parsed.style) setStyle(parsed.style);
      if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
    };

    (async () => {
      try {
        const prefs = await preferencesApi.get();
        if (cancelled) return;
        if (prefs?.lastImage) {
          applySaved(prefs.lastImage);
          return;
        }
      } catch (e) {
        console.error('Failed to load last image from API', e);
      }
      // Fallback to localStorage
      const saved = localStorage.getItem('dzads_last_generated_image');
      if (saved) {
        try {
          applySaved(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // `prompt` is what the photo-less request has always sent to the model; the rest is the interface text
  const styles: { id: PhotoStyle; name: string; desc: string; longDesc: string; icon: string; prompt: string }[] = [
    { id: 'lifestyle', name: t('imgStyleLifestyle', 'Lifestyle'), desc: t('imgStyleLifestyleDesc', 'En situation réelle'), longDesc: t('imgStyleLifestyleLong', 'Le produit en scène dans son environnement naturel : le client se projette.'), icon: '🏠', prompt: 'En situation réelle' },
    { id: 'minimalist', name: t('imgStyleMinimal', 'Minimaliste'), desc: t('imgStyleMinimalDesc', 'Focus produit épuré'), longDesc: t('imgStyleMinimalLong', 'Fond neutre et lumière douce : parfait pour un catalogue, sans rien qui distrait.'), icon: '✨', prompt: 'Focus produit épuré' },
    { id: 'high-tech', name: t('imgStylePremium', 'Premium'), desc: t('imgStylePremiumDesc', 'Studio sophistiqué'), longDesc: t('imgStylePremiumLong', 'Lumière contrastée, reflets maîtrisés et textures riches : une image haut de gamme.'), icon: '💎', prompt: 'Studio sophistiqué' },
    { id: 'creative', name: t('imgStyleCreative', 'Créatif'), desc: t('imgStyleCreativeDesc', 'Artistique et coloré'), longDesc: t('imgStyleCreativeLong', "Compositions audacieuses et couleurs vives pour capter l'attention tout de suite."), icon: '🎨', prompt: 'Artistique & Coloré' },
  ];

  const currentStyle = styles.find(s => s.id === style);

  const takePhoto = async (files: File[]) => {
    if (!files[0]) return;
    try {
      setPhoto(await fileToUploadDataUrl(files[0], { maxDimension: REFERENCE_MAX, quality: 0.9 }));
    } catch {
      setError(t('imgFailed', "La photo n'a pas pu être créée."));
    }
  };

  const handleGenerate = async () => {
    if (!productName && !photo) return;
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      // with the seller's photo, the model stages that exact product; without, it imagines one from the name.
      // Gemini unless the seller chose another service in Paramètres.
      const service = await chosenImageProvider();
      setProvider(service);
      const ratio = isAspectRatio(aspectRatio) ? aspectRatio : '1:1';
      let img: string;
      if (service === 'gemini') {
        img = photo
          ? await generateSectionImage(productPhotoPrompt({ name: productName, style, aspectRatio }), photo, aspectRatio)
          : await generateProductImage(productName, currentStyle?.prompt || '', aspectRatio);
      } else if (photo && !KEEPS_PRODUCT[service]) {
        throw new Error(t('imgServiceNoPhoto', 'Le service choisi ne sait pas partir de ta photo : retire-la, ou choisis Gemini, OpenAI ou FLUX dans Paramètres.'));
      } else {
        img = await imageFromService({
          prompt: photo ? productPhotoPrompt({ name: productName, style, aspectRatio }) : imaginedProductPrompt({ name: productName, style, aspectRatio }),
          reference: photo,
          aspectRatio: ratio,
        });
      }
      setResult(img);
      toast.success(t('imgDone', 'Photo créée.'));
      const label = productName || t('imgPhotoAlt', 'Photo du produit');

      // Store to centralized history
      addToHistory('image', label, img, `Style: ${currentStyle?.prompt ?? style} | Aspect Ratio: ${aspectRatio}`, {
        productName,
        style,
        aspectRatio,
      });

      // Update active cache
      localStorage.setItem('dzads_last_generated_image', JSON.stringify({
        result: img,
        productName,
        style,
        aspectRatio
      }));
      // Persist to the server API (fire-and-forget)
      preferencesApi.update({ lastImage: { result: img, productName, style, aspectRatio } }).catch(() => {});
    } catch (err: any) {
      console.error(err);
      toast.error(t('imgFailed', "La photo n'a pas pu être créée."));
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
        setError(t('imgQuota', 'Quota Gemini épuisé (429). Réessaie dans quelques minutes.'));
      } else {
        setError(err.message || t('imgErrorGeneric', 'Erreur pendant la création de la photo. Vérifie ta connexion.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `${(productName || 'photo').replace(/\s+/g, '_')}_dzads.png`;
    link.click();
    toast.success(t('imgDownloadStarted', 'Téléchargement lancé.'));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader section="images" title={t('tabImages', 'Studio photos produit')} subtitle={t('imgSubtitle', 'Mets ton vrai produit en scène : lifestyle, fond épuré, studio premium ou créatif.')} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="ui-card p-6 space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              role="alert"
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium relative group"
            >
              <button
                type="button"
                onClick={() => setError(null)}
                aria-label={t('imgCloseError', 'Fermer le message')}
                className="absolute top-2 end-2 opacity-20 hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              <p className="pe-6">{error}</p>
            </motion.div>
          )}

          <div>
            <p className="block text-xs font-semibold text-fg-faint mb-3">{t('imgPhotoLabel', 'La photo de ton produit')}</p>
            {photo ? (
              <div className="flex items-center gap-3">
                <img src={photo} alt={t('imgPhotoAlt', 'Photo du produit')} className="size-20 rounded-xl border border-fg/10 object-cover" />
                <button type="button" onClick={() => setPhoto(null)} className="btn-dz-secondary !min-h-9 !px-3 !py-1.5 !text-[13px]">
                  <X size={14} /> {t('imgPhotoRemove', 'Retirer la photo')}
                </button>
              </div>
            ) : (
              <>
                <ImageDrop onFiles={(files) => void takePhoto(files)} multiple={false} compact label={t('imgPhotoLabel', 'La photo de ton produit')} hint={t('imgPhotoHint', "JPG, PNG ou WebP · l'IA garde ton produit tel qu'il est")} />
                <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-warning-ink">
                  <Info size={14} className="mt-px shrink-0" aria-hidden="true" />
                  {t('imgNoPhotoWarn', "Sans photo, l'IA imagine un produit d'après son nom : il ne ressemblera pas forcément au tien. Ajoute ta photo pour montrer ton vrai produit.")}
                </p>
              </>
            )}
          </div>

          <PromptField
            label={t('imgNameLabel', 'Ton produit (nom ou description)')}
            icon={<Package size={12} className="text-purple-400" />}
            value={productName}
            onChange={setProductName}
            placeholder={t('imgNamePlaceholder', 'Ex : montre connectée noire, sac à main en cuir…')}
            badgeText="PROMPT"
          />

          <div>
            <p className="block text-xs font-semibold text-fg-faint mb-3 flex items-center gap-2">
              <Palette size={10} className="text-purple-500" />
              {t('imgStyleLabel', 'Style de la photo')}
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {styles.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  aria-pressed={style === s.id}
                  className={cn(
                    "p-4 rounded-2xl border text-start transition-all relative overflow-hidden group",
                    style === s.id
                      ? "bg-purple-600/20 border-purple-500 text-fg shadow-xl shadow-purple-500/20"
                      : "bg-fg/[0.03] border-fg/10 text-fg-muted hover:bg-fg/10 hover:text-fg"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold">{s.name}</p>
                    <span className="text-lg" aria-hidden="true">{s.icon}</span>
                  </div>
                  <p className="text-xs opacity-60 leading-tight">{s.desc}</p>
                  {style === s.id && (
                    <motion.div
                      layoutId="active-bg"
                      className="absolute inset-0 bg-fg/10 pointer-events-none"
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {currentStyle && (
                <motion.div
                  key={currentStyle.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className={cn(
                    "p-4 rounded-xl border relative overflow-hidden transition-all duration-300",
                    style === 'lifestyle' && "bg-orange-500/10 border-orange-500/20",
                    style === 'minimalist' && "bg-gray-500/10 border-gray-500/20",
                    style === 'high-tech' && "bg-primary/10 border-dz-emerald/20",
                    style === 'creative' && "bg-pink-500/10 border-pink-500/20"
                  )}
                >
                  {/* Decorative Mood element */}
                  <div className={cn(
                    "absolute -end-4 -top-4 w-16 h-16 blur-2xl opacity-40 rounded-full",
                    style === 'lifestyle' && "bg-orange-500",
                    style === 'minimalist' && "bg-white",
                    style === 'high-tech' && "bg-primary",
                    style === 'creative' && "bg-pink-500"
                  )} />

                  <div className="flex items-start gap-3 relative z-10">
                    <div className={cn(
                      "p-2 rounded-lg bg-fg/5",
                      style === 'lifestyle' && "text-orange-400",
                      style === 'minimalist' && "text-fg-muted",
                      style === 'high-tech' && "text-dz-emerald",
                      style === 'creative' && "text-pink-400"
                    )}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-fg-muted mb-1">{t('imgStyleGuide', 'Le style {name}', { name: currentStyle.name })}</p>
                      <p className="text-xs text-fg leading-relaxed font-medium">{currentStyle.longDesc}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4 pt-4 border-t border-fg/5">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 bg-purple-500/10 rounded-lg text-purple-400">
                <Layout size={14} />
              </div>
              <p className="text-xs font-semibold text-fg-muted">{t('imgFormatLabel', "Format de l'image")}</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: '16:9', icon: Monitor },
                { id: '1:1', icon: SquareIcon },
                { id: '4:5', icon: Maximize },
                { id: '9:16', icon: Smartphone }
              ].map((ratio) => {
                const Icon = ratio.icon;
                return (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setAspectRatio(ratio.id)}
                    aria-pressed={aspectRatio === ratio.id}
                    className={`p-2 rounded-xl flex flex-col items-center gap-1.5 transition-all border ${
                      aspectRatio === ratio.id
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                        : 'bg-fg/5 border-fg/10 text-fg-muted hover:bg-fg/10'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="text-xs font-semibold" dir="ltr">{ratio.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || (!productName && !photo)}
            className="w-full btn-dz-primary"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Camera className="w-5 h-5" />
                {t('imgGenerate', 'Créer la photo')}
              </>
            )}
          </button>
          {provider && (
            <p className="text-center text-xs text-fg-muted">
              {t('imgMadeWith', 'Créée avec {service}', { service: IMAGE_PROVIDER_NAMES[provider] })} ·{' '}
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('nav-change', { detail: 'settings' }))} className="font-medium text-primary-ink hover:underline">
                {t('imgChangeService', 'changer dans Paramètres')}
              </button>
            </p>
          )}
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className={cn(
            "relative w-full transition-all duration-300 overflow-hidden",
            aspectRatio === '1:1' && 'aspect-square',
            aspectRatio === '16:9' && 'aspect-[16/9]',
            aspectRatio === '4:5' && 'aspect-[4/5]',
            aspectRatio === '9:16' && 'aspect-[9/16]'
          )}>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  role="status"
                  className="absolute inset-0 ui-card flex flex-col items-center justify-center text-center p-8 z-10"
                >
                  <div className="w-16 h-16 relative mb-4">
                    <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-fg font-medium">{t('imgWorking', "L'IA prépare ta photo…")}</p>
                  <p className="text-xs text-fg-muted mt-2 italic">{t('imgFormatName', 'Format {ratio}', { ratio: aspectRatio })}</p>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full relative group shadow-2xl shadow-purple-500/20"
                >
                  <img
                    src={result}
                    alt={productName || t('imgPhotoAlt', 'Photo du produit')}
                    className="w-full h-full object-cover rounded-2xl border border-fg/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold transition-transform"
                    >
                      <Download className="w-5 h-5" />
                      {t('imgDownload', 'Télécharger')}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="w-full h-full ui-card border-dashed flex flex-col items-center justify-center p-8 text-center text-fg-faint">
                  <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                  <h3 className="text-fg-muted font-medium mb-1">{t('imgFormatName', 'Format {ratio}', { ratio: aspectRatio })}</h3>
                  <p className="text-xs max-w-[200px]">{t('imgEmptyText', 'Ta photo apparaîtra ici.')}</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
