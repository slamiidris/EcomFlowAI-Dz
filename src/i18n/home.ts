import { registerTranslations } from './registry';
import type { TranslationDictionary } from './types';

// home: the public home page (loaded with it, not by the app).
export const homeTranslations: TranslationDictionary = {
  homeNavHow: {
    fr: "Comment ça marche",
    ar: "كيف يعمل",
    en: "How it works",
  },
  homeNavStudios: {
    fr: "Studios",
    ar: "الاستوديوهات",
    en: "Studios",
  },
  homeNavPricing: {
    fr: "Tarifs",
    ar: "الأسعار",
    en: "Pricing",
  },
  homeNavFaq: {
    fr: "Questions fréquentes",
    ar: "أسئلة شائعة",
    en: "FAQ",
  },
  homeHeroHeadline: {
    fr: "Une photo. Toute la campagne.",
    ar: "صورة واحدة. حملة كاملة.",
    en: "One photo. A whole campaign.",
  },
  homeHeroSide: {
    fr: "Pensé pour la vente en paiement à la livraison en Algérie. Chaque campagne garde ses photos, son brief et toutes ses versions, et rien n’est publié sans ton accord.",
    ar: "مصمَّم للبيع بالدفع عند الاستلام في الجزائر. تحتفظ كل حملة بصورها وملخّصها وكل نسخها، ولا يُنشر شيء دون موافقتك.",
    en: "Built for cash-on-delivery selling in Algeria. Every campaign keeps its photos, its brief and every version, and nothing goes live without your approval.",
  },
  homeHeroFacts: {
    fr: "En bref",
    ar: "باختصار",
    en: "In short",
  },
  homeStatWilayas: {
    fr: "wilayas dans chaque formulaire de commande",
    ar: "ولاية في كل استمارة طلب",
    en: "wilayas in every order form",
  },
  homeStatFormats: {
    fr: "formats vidéo, de la story au plein écran",
    ar: "صيغ فيديو، من الستوري إلى الشاشة الكاملة",
    en: "video formats, from story to widescreen",
  },
  homeStatLangs: {
    fr: "langues : arabe, français et anglais",
    ar: "لغات: العربية والفرنسية والإنجليزية",
    en: "languages: Arabic, French and English",
  },
  homeMenu: {
    fr: "Menu",
    ar: "القائمة",
    en: "Menu",
  },
  homeHeroLead: {
    fr: "Dépose les photos de ton produit. EcomFlow AI écrit la landing page, le script vidéo et les publicités, aux couleurs de ta marque, en arabe, en français ou en anglais.",
    ar: "ضع صور منتجك، ويكتب EcomFlow AI صفحة الهبوط وسيناريو الفيديو والإعلانات بألوان علامتك، بالعربية أو الفرنسية أو الإنجليزية.",
    en: "Drop in your product photos. EcomFlow AI writes the landing page, the video script and the ads in your brand colors, in Arabic, French or English.",
  },
  homeCtaStart: {
    fr: "Créer mon compte",
    ar: "إنشاء حسابي",
    en: "Create my account",
  },
  homeCtaHow: {
    fr: "Voir le parcours",
    ar: "شاهد المسار",
    en: "See the workflow",
  },
  homePriceTitle: {
    fr: "Un abonnement, tous les studios.",
    ar: "اشتراك واحد، كل الاستوديوهات.",
    en: "One plan, every studio.",
  },
  homePriceSub: {
    fr: "Tu paies localement, tu envoies le justificatif depuis l’app, et un admin active ton accès.",
    ar: "تدفع محلياً، وترسل إثبات الدفع من التطبيق، ثم يفعّل المشرف وصولك.",
    en: "Pay locally, send the receipt from the app, and an admin turns on your access.",
  },
  homePriceFeat1: {
    fr: "Landing pages, vidéos et publicités",
    ar: "صفحات الهبوط والفيديوهات والإعلانات",
    en: "Landing pages, videos and ads",
  },
  homePriceFeat2: {
    fr: "Identité de marque et bibliothèque de fichiers",
    ar: "هوية العلامة ومكتبة الملفات",
    en: "Brand kit and file library",
  },
  homePriceFeat3: {
    fr: "Calcul de marge COD et constructeur de page",
    ar: "حاسبة أرباح COD وباني الصفحات",
    en: "COD margin calculator and page builder",
  },
  homePriceSubscribe: {
    fr: "Choisir ce plan",
    ar: "اختر هذه الخطة",
    en: "Choose this plan",
  },
  homePriceKeyNote: {
    fr: "La génération utilise ta propre clé Gemini (Google AI Studio). La clé gratuite suffit pour les textes ; les images et les clips vidéo IA demandent la facturation Google.",
    ar: "يستخدم الإنشاء مفتاح Gemini الخاص بك (Google AI Studio). المفتاح المجاني يكفي للنصوص، أما الصور ولقطات الفيديو بالذكاء الاصطناعي فتتطلب تفعيل الفوترة لدى Google.",
    en: "Generation uses your own Gemini key (Google AI Studio). The free key covers text; AI images and video clips need Google billing.",
  },
  homeFaq1Q: {
    fr: "Faut-il savoir designer ou écrire des pubs ?",
    ar: "هل يجب أن أعرف التصميم أو كتابة الإعلانات؟",
    en: "Do I need design or copywriting skills?",
  },
  homeFaq1A: {
    fr: "Non. Tu fournis les photos et quelques informations, puis tu relis et ajustes ce que l’IA propose.",
    ar: "لا. تقدّم الصور وبعض المعلومات، ثم تراجع ما يقترحه الذكاء الاصطناعي وتعدّله.",
    en: "No. You provide the photos and a few details, then review and adjust what the AI suggests.",
  },
  homeFaq2Q: {
    fr: "Quelle clé IA faut-il ?",
    ar: "ما مفتاح الذكاء الاصطناعي المطلوب؟",
    en: "Which AI key do I need?",
  },
  homeFaq2A: {
    fr: "Une clé Gemini, créée gratuitement sur Google AI Studio. Elle est enregistrée chiffrée dans ton compte et n’est jamais réaffichée en entier.",
    ar: "مفتاح Gemini تنشئه مجاناً على Google AI Studio. يُحفظ مشفّراً في حسابك ولا يُعرض كاملاً مرة أخرى.",
    en: "A Gemini key, created for free in Google AI Studio. It is stored encrypted in your account and never shown in full again.",
  },
  homeFaq3Q: {
    fr: "Mes publicités partent-elles toutes seules ?",
    ar: "هل تُنشر إعلاناتي تلقائياً؟",
    en: "Do my ads go live on their own?",
  },
  homeFaq3A: {
    fr: "Non. Tu télécharges tes contenus et tu les publies toi-même, quand tu veux.",
    ar: "لا. تحمّل محتوياتك وتنشرها بنفسك، متى شئت.",
    en: "No. You download your content and publish it yourself, whenever you want.",
  },
  homeFaq3AMeta: {
    fr: "Non. Tu télécharges tes contenus, ou tu crées la campagne depuis l’app : elle reste en pause tant que tu ne l’as pas activée.",
    ar: "لا. تحمّل محتوياتك، أو تنشئ الحملة من التطبيق: تبقى متوقفة ما لم تفعّلها.",
    en: "No. You download your content, or create the campaign from the app: it stays paused until you turn it on.",
  },
  homeFaq4Q: {
    fr: "Comment se passe le paiement ?",
    ar: "كيف يتم الدفع؟",
    en: "How does payment work?",
  },
  homeFaq4A: {
    fr: "Tu choisis un plan, tu paies avec l’un des moyens indiqués, puis tu envoies le justificatif depuis l’app. Un admin le vérifie et active ton accès.",
    ar: "تختار خطة، وتدفع بإحدى الطرق المعروضة، ثم ترسل إثبات الدفع من التطبيق. يتحقق منه المشرف ويفعّل وصولك.",
    en: "Pick a plan, pay with one of the listed methods, then send the receipt from the app. An admin checks it and turns on your access.",
  },
  homeFaq5Q: {
    fr: "Dans quelles langues ?",
    ar: "بأي لغات؟",
    en: "In which languages?",
  },
  homeFaq5A: {
    fr: "L’interface et les contenus générés existent en arabe, en français et en anglais. Chaque campagne choisit sa propre langue.",
    ar: "الواجهة والمحتوى المُنشأ متوفران بالعربية والفرنسية والإنجليزية، ولكل حملة لغتها الخاصة.",
    en: "The interface and the generated content come in Arabic, French and English. Each campaign picks its own language.",
  },
  homeFaq6Q: {
    fr: "Mes données sont-elles séparées de celles des autres ?",
    ar: "هل بياناتي منفصلة عن بيانات الآخرين؟",
    en: "Is my data kept apart from other accounts?",
  },
  homeFaq6A: {
    fr: "Oui. Chaque campagne, fichier et connexion appartient à ton compte, et le serveur vérifie le propriétaire à chaque requête.",
    ar: "نعم. كل حملة وملف واتصال يخص حسابك، ويتحقق الخادم من المالك في كل طلب.",
    en: "Yes. Every campaign, file and connection belongs to your account, and the server checks the owner on every request.",
  },
  homeFinalTitle: {
    fr: "Ton prochain produit mérite une vraie campagne.",
    ar: "منتجك القادم يستحق حملة حقيقية.",
    en: "Your next product deserves a real campaign.",
  },
  homeFinalText: {
    fr: "Crée ton compte, ajoute ta clé Gemini et lance ta première campagne à partir d’une photo.",
    ar: "أنشئ حسابك، وأضف مفتاح Gemini، وابدأ حملتك الأولى من صورة واحدة.",
    en: "Create your account, add your Gemini key and start your first campaign from a single photo.",
  },
  homeFooterTagline: {
    fr: "Campagnes e-commerce assistées par l’IA, pensées pour l’Algérie.",
    ar: "حملات تجارة إلكترونية بمساعدة الذكاء الاصطناعي، مصممة للجزائر.",
    en: "AI-assisted e-commerce campaigns, built for Algeria.",
  },
  homeMenuClose: {
    fr: "Fermer le menu",
    ar: "إغلاق القائمة",
    en: "Close menu",
  },
  homeNavLabel: {
    fr: "Sections",
    ar: "الأقسام",
    en: "Sections",
  },
  homeHeroAi: {
    fr: "Propulsé par l’intelligence artificielle",
    ar: "مدعوم بالذكاء الاصطناعي",
    en: "Powered by artificial intelligence",
  },
  homeAiBadge: {
    fr: "Fait par l’IA",
    ar: "ذكاء اصطناعي",
    en: "Made by AI",
  },
  homeHowKicker: {
    fr: "Propulsé par l’IA",
    ar: "يعمل بالذكاء الاصطناعي",
    en: "Powered by AI",
  },
  homeHowTitle: {
    fr: "Trois étapes, et l’IA fait le reste.",
    ar: "ثلاث خطوات، والذكاء الاصطناعي يتكفّل بالباقي.",
    en: "Three steps, and the AI does the rest.",
  },
  homeHowStep1Title: {
    fr: "Ajoute la photo de ton produit",
    ar: "أضف صورة منتجك",
    en: "Add your product photo",
  },
  homeHowStep1Text: {
    fr: "Une seule photo suffit. L’IA lit le produit et remplit le brief pour toi.",
    ar: "صورة واحدة تكفي. يتعرّف الذكاء الاصطناعي على المنتج ويملأ الملخّص بدلاً منك.",
    en: "One photo is enough. The AI reads the product and fills in the brief for you.",
  },
  homeHowStep2Title: {
    fr: "L’IA écrit et dessine",
    ar: "الذكاء الاصطناعي يكتب ويصمّم",
    en: "The AI writes and designs",
  },
  homeHowStep2Text: {
    fr: "Textes, script, visuels : tout est créé en quelques secondes, aux couleurs de ta marque.",
    ar: "النصوص والسيناريو والتصاميم: كل شيء يُنشأ في ثوانٍ، بألوان علامتك.",
    en: "Copy, script, visuals: everything is created in seconds, in your brand colors.",
  },
  homeHowStep3Title: {
    fr: "Reçois ta campagne prête",
    ar: "استلم حملتك جاهزة",
    en: "Get your campaign ready",
  },
  homeHowStep3Text: {
    fr: "Landing page, vidéo et publicités, à relire, retoucher et publier.",
    ar: "صفحة هبوط وفيديو وإعلانات، تراجعها وتعدّلها ثم تنشرها.",
    en: "Landing page, video and ads, to review, tweak and publish.",
  },
  homeHowToolsTitle: {
    fr: "Tous tes outils, propulsés par l’IA",
    ar: "كل أدواتك، بالذكاء الاصطناعي",
    en: "All your tools, powered by AI",
  },
  homeHowPhotoStudio: {
    fr: "Studio photo produit",
    ar: "استوديو صور المنتجات",
    en: "Product photo studio",
  },
};

registerTranslations('home', homeTranslations);
