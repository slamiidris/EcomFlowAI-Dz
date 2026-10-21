import { registerTranslations } from './registry';
import type { TranslationDictionary } from './types';

// the product photo studio (ProductImageGen)
export const imagesTranslations: TranslationDictionary = {
  imgSubtitle: {
    fr: "Mets ton vrai produit en scène : lifestyle, fond épuré, studio premium ou créatif.",
    ar: "اعرض منتجك الحقيقي في مشهد جديد: واقعي، خلفية بسيطة، استوديو فاخر أو إبداعي.",
    en: "Stage your real product: lifestyle, clean background, premium studio or creative.",
  },
  imgPhotoLabel: {
    fr: "La photo de ton produit",
    ar: "صورة منتجك",
    en: "Your product photo",
  },
  imgPhotoHint: {
    fr: "JPG, PNG ou WebP · l'IA garde ton produit tel qu'il est",
    ar: "JPG أو PNG أو WebP · يحافظ الذكاء الاصطناعي على منتجك كما هو",
    en: "JPG, PNG or WebP · the AI keeps your product as it is",
  },
  imgPhotoAlt: {
    fr: "Photo du produit",
    ar: "صورة المنتج",
    en: "Product photo",
  },
  imgPhotoRemove: {
    fr: "Retirer la photo",
    ar: "إزالة الصورة",
    en: "Remove the photo",
  },
  imgNoPhotoWarn: {
    fr: "Sans photo, l'IA imagine un produit d'après son nom : il ne ressemblera pas forcément au tien. Ajoute ta photo pour montrer ton vrai produit.",
    ar: "بدون صورة، يتخيّل الذكاء الاصطناعي منتجاً من اسمه فقط وقد لا يشبه منتجك. أضف صورتك لتُظهر منتجك الحقيقي.",
    en: "Without a photo, the AI imagines a product from its name: it may not look like yours. Add your photo to show your real product.",
  },
  imgNameLabel: {
    fr: "Ton produit (nom ou description)",
    ar: "منتجك (الاسم أو الوصف)",
    en: "Your product (name or description)",
  },
  imgNamePlaceholder: {
    fr: "Ex : montre connectée noire, sac à main en cuir…",
    ar: "مثال: ساعة ذكية سوداء، حقيبة يد جلدية…",
    en: "E.g. black smartwatch, leather handbag…",
  },
  imgStyleLabel: {
    fr: "Style de la photo",
    ar: "أسلوب الصورة",
    en: "Photo style",
  },
  imgStyleGuide: {
    fr: "Le style {name}",
    ar: "أسلوب {name}",
    en: "The {name} style",
  },
  imgStyleLifestyle: { fr: "Lifestyle", ar: "نمط الحياة", en: "Lifestyle" },
  imgStyleLifestyleDesc: { fr: "En situation réelle", ar: "في الاستعمال الحقيقي", en: "In real use" },
  imgStyleLifestyleLong: {
    fr: "Le produit en scène dans son environnement naturel : le client se projette.",
    ar: "المنتج في بيئته الطبيعية: يتخيّل الزبون نفسه وهو يستعمله.",
    en: "The product in its natural setting: the buyer pictures themselves using it.",
  },
  imgStyleMinimal: { fr: "Minimaliste", ar: "بسيط", en: "Minimalist" },
  imgStyleMinimalDesc: { fr: "Focus produit épuré", ar: "تركيز على المنتج", en: "Clean product focus" },
  imgStyleMinimalLong: {
    fr: "Fond neutre et lumière douce : parfait pour un catalogue, sans rien qui distrait.",
    ar: "خلفية محايدة وإضاءة ناعمة: مثالي للكتالوج بدون أي تشتيت.",
    en: "Neutral background and soft light: perfect for a catalogue, nothing to distract.",
  },
  imgStylePremium: { fr: "Premium", ar: "فاخر", en: "Premium" },
  imgStylePremiumDesc: { fr: "Studio sophistiqué", ar: "استوديو راقٍ", en: "Sophisticated studio" },
  imgStylePremiumLong: {
    fr: "Lumière contrastée, reflets maîtrisés et textures riches : une image haut de gamme.",
    ar: "إضاءة متباينة وانعكاسات مدروسة وملمس غني: صورة راقية.",
    en: "Contrasted light, controlled reflections and rich textures: a high-end picture.",
  },
  imgStyleCreative: { fr: "Créatif", ar: "إبداعي", en: "Creative" },
  imgStyleCreativeDesc: { fr: "Artistique et coloré", ar: "فني وملوّن", en: "Artistic and colourful" },
  imgStyleCreativeLong: {
    fr: "Compositions audacieuses et couleurs vives pour capter l'attention tout de suite.",
    ar: "تكوينات جريئة وألوان زاهية تجذب الانتباه فوراً.",
    en: "Bold compositions and vivid colours that catch the eye at once.",
  },
  imgFormatLabel: {
    fr: "Format de l'image",
    ar: "مقاس الصورة",
    en: "Image format",
  },
  imgGenerate: {
    fr: "Créer la photo",
    ar: "أنشئ الصورة",
    en: "Create the photo",
  },
  imgWorking: {
    fr: "L'IA prépare ta photo…",
    ar: "الذكاء الاصطناعي يحضّر صورتك…",
    en: "The AI is preparing your photo…",
  },
  imgFormatName: {
    fr: "Format {ratio}",
    ar: "مقاس {ratio}",
    en: "{ratio} format",
  },
  imgEmptyText: {
    fr: "Ta photo apparaîtra ici.",
    ar: "ستظهر صورتك هنا.",
    en: "Your photo will appear here.",
  },
  imgDownload: {
    fr: "Télécharger",
    ar: "تحميل",
    en: "Download",
  },
  imgDone: {
    fr: "Photo créée.",
    ar: "تم إنشاء الصورة.",
    en: "Photo created.",
  },
  imgDownloadStarted: {
    fr: "Téléchargement lancé.",
    ar: "بدأ التحميل.",
    en: "Download started.",
  },
  imgFailed: {
    fr: "La photo n'a pas pu être créée.",
    ar: "تعذّر إنشاء الصورة.",
    en: "The photo could not be created.",
  },
  imgQuota: {
    fr: "Quota Gemini épuisé (429). Réessaie dans quelques minutes.",
    ar: "نفدت حصة Gemini (429). أعد المحاولة بعد بضع دقائق.",
    en: "Gemini quota used up (429). Try again in a few minutes.",
  },
  imgErrorGeneric: {
    fr: "Erreur pendant la création de la photo. Vérifie ta connexion.",
    ar: "حدث خطأ أثناء إنشاء الصورة. تحقّق من اتصالك.",
    en: "Error while creating the photo. Check your connection.",
  },
  imgCloseError: {
    fr: "Fermer le message",
    ar: "إغلاق الرسالة",
    en: "Close the message",
  },
  imgServiceNoPhoto: {
    fr: "Le service choisi ne sait pas partir de ta photo : retire-la, ou choisis Gemini, OpenAI ou FLUX dans Paramètres.",
    ar: "الخدمة المختارة لا تستطيع الانطلاق من صورتك: أزلها، أو اختر Gemini أو OpenAI أو FLUX في الإعدادات.",
    en: "The chosen service cannot start from your photo: remove it, or choose Gemini, OpenAI or FLUX in Settings.",
  },
  imgMadeWith: {
    fr: "Créée avec {service}",
    ar: "تُنشأ بواسطة {service}",
    en: "Made with {service}",
  },
  imgChangeService: {
    fr: "changer dans Paramètres",
    ar: "غيّرها في الإعدادات",
    en: "change in Settings",
  },
};

registerTranslations('images', imagesTranslations);
