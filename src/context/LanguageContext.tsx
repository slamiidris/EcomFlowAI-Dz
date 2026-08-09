import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { preferencesApi } from '../services/api';

export type Language = 'fr' | 'ar' | 'en';

export interface TranslationDictionary {
  [key: string]: {
    fr: string;
    ar: string;
    en: string;
  };
}

// Common translations dictionary across the platform
export const translations: TranslationDictionary = {
  // Topbar & Header
  platformName: {
    fr: "EcomFlow AI • Plateforme Marketing E-Commerce",
    ar: "EcomFlow AI • منصة تسويق التجارة الإلكترونية",
    en: "EcomFlow AI • AI-Powered Ecommerce Marketing",
  },
  ecomStoreLabel: {
    fr: "Boutique COD Algérie",
    ar: "متجر الدفع عند الاستلام (COD)",
    en: "Algeria COD Store",
  },
  salesToday: {
    fr: "Commandes du Jour",
    ar: "طلبات اليوم",
    en: "Today's Orders",
  },
  revenueToday: {
    fr: "Chiffre d'Affaires",
    ar: "المبيعات اليومية",
    en: "Daily Revenue",
  },
  deliveryRate: {
    fr: "Taux de Livraison",
    ar: "نسبة التوصيل",
    en: "Delivery Rate",
  },
  roasMetric: {
    fr: "ROAS Pubs",
    ar: "العائد على الإعلانات",
    en: "Ad ROAS",
  },
  winningProductsCount: {
    fr: "Produits Gagnants",
    ar: "المنتجات الرابحة",
    en: "Winning Products",
  },
  lightMode: {
    fr: "Clair",
    ar: "نهار",
    en: "Light",
  },
  darkMode: {
    fr: "Sombre",
    ar: "ليل",
    en: "Dark",
  },
  selectLanguage: {
    fr: "Choisir la langue",
    ar: "اختر اللغة",
    en: "Select Language",
  },
  quickSwitch: {
    fr: "Bascule rapide",
    ar: "تبديل سريع",
    en: "Quick Switch",
  },
  appVersion: {
    fr: "Version v2.4.0",
    ar: "الإصدار v2.4.0",
    en: "Version v2.4.0",
  },
  latestVersionMsg: {
    fr: "Vous utilisez la dernière version (v2.4.0) !",
    ar: "أنت تستخدم أحدث تحديث للتطبيق (v2.4.0)!",
    en: "You are running the latest app update (v2.4.0)!",
  },
  
  // Tabs Title in Topbar
  tabImages: {
    fr: "📸 Studio Photos Produit",
    ar: "📸 إستوديو صور المنتجات والتصوير",
    en: "📸 Product Photo Studio",
  },
  tabDashboard: {
    fr: "📊 Dashboard Ventes & KPI",
    ar: "📊 لوحة تحليلات ومبيعات المتجر",
    en: "📊 Analytics & Sales Dashboard",
  },
  tabVideo: {
    fr: "🎬 Générateur de Créatifs Pubs Vidéo",
    ar: "🎬 صانع الإعلانات المباشرة بالفيديو",
    en: "🎬 Video Ad Creatives Generator",
  },
  tabLanding: {
    fr: "⚡ Tunnel de Vente & Copywriting LP",
    ar: "⚡ كاتب محتوى صفحات وصفحات الهبوط",
    en: "⚡ Sales Funnel & LP Copywriter",
  },
  tabAssembler: {
    fr: "🍱 Constructeur de Landing Page",
    ar: "🍱 مُصمم ومنشئ صفحات الهبوط",
    en: "🍱 Landing Page Builder",
  },
  tabCalculator: {
    fr: "🧮 Calculateur de Marge COD & Profit",
    ar: "🧮 حاسبة أرباح وتكاليف التوصيل COD",
    en: "🧮 COD Margin & Profit Calculator",
  },
  tabTrends: {
    fr: "📈 Détecteur de Produits Gagnants (Winning Products)",
    ar: "📈 كاشف المنتجات الرابحة واتجاهات السوق",
    en: "📈 Winning Products & Market Trends",
  },
  tabSettings: {
    fr: "⚙️ Configuration Boutique & Pixels",
    ar: "⚙️ إعدادات المتجر والبكسل",
    en: "⚙️ Store & Pixel Settings",
  },
  tabDarja: {
    fr: "📝 Générateur d'Annonces Darja",
    ar: "📝 مولد إعلانات الدارجة",
    en: "📝 Darija Ad Copy Generator",
  },
  tabAnalyzer: {
    fr: "🤖 Consultant Expert IA (Analyse Produit)",
    ar: "🤖 مستشار الخبراء بالذكاء الاصطناعي لتحليل المنتجات",
    en: "🤖 AI Expert Product Consultant",
  },
  tabCatalog: {
    fr: "📦 Catalogue & Gestion Produits",
    ar: "📦 كتالوج وإدارة المنتجات",
    en: "📦 Product Catalog & Management",
  },
  tabScout: {
    fr: "🔍 Scout de Produits Telegram",
    ar: "🔍 مستكشف منتجات التلغرام",
    en: "🔍 Telegram Product Scout",
  },
  tabCalendar: {
    fr: "🗓️ Calendrier de Contenu",
    ar: "🗓️ تقويم محتوى التجارة الإلكترونية",
    en: "🗓️ Content Calendar",
  },

  // Sidebar Menu Items
  menuPhotos: {
    fr: "Studio Photos Produit",
    ar: "استوديو صور المنتجات",
    en: "Product Photo Studio",
  },
  menuDashboard: {
    fr: "Tableau de Bord Ventes",
    ar: "لوحة المبيعات والأرباح",
    en: "Sales Dashboard",
  },
  menuVideo: {
    fr: "Pubs Vidéo & TikTok Ads",
    ar: "إعلانات الفيديو وتيكتوك",
    en: "Video & TikTok Ads",
  },
  menuLanding: {
    fr: "Tunnels de Vente LP",
    ar: "صفحات الهبوط للبيع",
    en: "Sales Funnels & LPs",
  },
  menuAssembler: {
    fr: "Constructeur de LP",
    ar: "باني صفحات الهبوط",
    en: "Page Builder",
  },
  menuCalculator: {
    fr: "Calculateur Marge COD",
    ar: "حاسبة أرباح الشحن COD",
    en: "COD Margin Calculator",
  },
  menuTrends: {
    fr: "Produits Gagnants",
    ar: "المنتجات الأكثر مبيعاً",
    en: "Winning Products",
  },
  menuSettings: {
    fr: "Boutique & Pixels",
    ar: "إعدادات المتجر",
    en: "Store Settings",
  },
  menuDarja: {
    fr: "Annonces Darja",
    ar: "إعلانات الدارجة",
    en: "Darija Ads",
  },
  menuAnalyzer: {
    fr: "Consultant IA Produit",
    ar: "مستشار المنتجات بالذكاء الاصطناعي",
    en: "AI Product Consultant",
  },
  menuCatalog: {
    fr: "Catalogue Produits",
    ar: "كتالوج المنتجات",
    en: "Product Catalog",
  },
  menuScout: {
    fr: "Scout Telegram",
    ar: "ماسح التلغرام",
    en: "Telegram Scout",
  },
  menuCalendar: {
    fr: "Calendrier Contenu",
    ar: "تقويم المحتوى",
    en: "Content Calendar",
  },
  menuReorderText: {
    fr: "👉 Glisser pour trier",
    ar: "👉 اسحب لإعادة الترتيب",
    en: "👉 Drag to reorder",
  },
  menuToolsText: {
    fr: "Menu Outils",
    ar: "قائمة الأدوات",
    en: "Tools Menu",
  },
  menuOrganize: {
    fr: "Organiser",
    ar: "تنظيم",
    en: "Organize",
  },
  menuDone: {
    fr: "Terminer",
    ar: "تم",
    en: "Done",
  },
  logout: {
    fr: "Déconnexion",
    ar: "تسجيل الخروج",
    en: "Logout",
  },

  // Sidebar subscription
  sidebarSubActive: {
    fr: "Abonnement actif",
    ar: "الاشتراك نشط",
    en: "Active subscription",
  },
  sidebarSubDaysLeft: {
    fr: "jours restants",
    ar: "يوم متبقي",
    en: "days left",
  },
  sidebarSubLifetime: {
    fr: "Accès à vie",
    ar: "وصول مدى الحياة",
    en: "Lifetime access",
  },
  sidebarSubExpired: {
    fr: "Expiré",
    ar: "منتهي الصلاحية",
    en: "Expired",
  },
  sidebarSubNoPlan: {
    fr: "Aucun abonnement",
    ar: "لا يوجد اشتراك",
    en: "No active plan",
  },
  sidebarSubUpgrade: {
    fr: "Voir les plans",
    ar: "عرض الخطط",
    en: "View plans",
  },
  sidebarSubOf: {
    fr: "de",
    ar: "من",
    en: "of",
  },

  // Common Actions
  generate: {
    fr: "Générer",
    ar: "إنشاء",
    en: "Generate",
  },
  download: {
    fr: "Télécharger",
    ar: "تحميل",
    en: "Download",
  },
  copy: {
    fr: "Copier",
    ar: "نسخ",
    en: "Copy",
  },
  copied: {
    fr: "Copié !",
    ar: "تم النسخ!",
    en: "Copied!",
  },
  restore: {
    fr: "Restaurer",
    ar: "استرجاع",
    en: "Restore",
  },
  delete: {
    fr: "Supprimer",
    ar: "حذف",
    en: "Delete",
  },
  clearHistory: {
    fr: "Vider l'historique",
    ar: "مسح السجل",
    en: "Clear History",
  },
  historyTitle: {
    fr: "Historique des Générations AI",
    ar: "سجل الإنشاءات بالذكاء الاصطناعي",
    en: "AI Generations History",
  },
  historyDesc: {
    fr: "Consultez, téléchargez et restaurez rapidement vos 10 dernières créations.",
    ar: "استعرض وحمل واسترجع أحدث 10 إبداعات لك بسرعة.",
    en: "Review, download, and quickly restore your 10 latest creations.",
  },
  noHistory: {
    fr: "Aucune génération récente",
    ar: "لا يوجد سجل إنشاءات حديث",
    en: "No recent generations",
  },
  langChanged: {
    fr: "Langue changée en Français 🇫🇷",
    ar: "تم تغيير اللغة إلى العربية 🇩🇿",
    en: "Language changed to English 🇬🇧",
  },

  // Auth pages
  authBack: {
    fr: "Retour à l'accueil",
    ar: "العودة إلى الرئيسية",
    en: "Back to home",
  },
  authSecure: {
    fr: "Connexion sécurisée · code à 6 chiffres",
    ar: "اتصال آمن · رمز من 6 أرقام",
    en: "Secure login · 6-digit code",
  },
  authEmail: {
    fr: "Adresse email",
    ar: "البريد الإلكتروني",
    en: "Email address",
  },
  authPassword: {
    fr: "Mot de passe",
    ar: "كلمة المرور",
    en: "Password",
  },
  authName: {
    fr: "Nom complet",
    ar: "الاسم الكامل",
    en: "Full name",
  },
  authNamePlaceholder: {
    fr: "Ahmed Benali",
    ar: "أحمد بن علي",
    en: "Ahmed Benali",
  },
  authConfirmPassword: {
    fr: "Confirmer le mot de passe",
    ar: "تأكيد كلمة المرور",
    en: "Confirm password",
  },
  authLoginTitle: {
    fr: "Bienvenue 👋",
    ar: "مرحباً بعودتك 👋",
    en: "Welcome back 👋",
  },
  authLoginSubtitle: {
    fr: "Connecte-toi à ton espace e-commerce. Un code à 6 chiffres te sera envoyé.",
    ar: "سجّل الدخول إلى مساحة التجارة الإلكترونية الخاصة بك. سيتم إرسال رمز من 6 أرقام إليك.",
    en: "Sign in to your e-commerce workspace. A 6-digit code will be sent to you.",
  },
  authRegisterTitle: {
    fr: "Créer un compte",
    ar: "إنشاء حساب",
    en: "Create account",
  },
  authRegisterSubtitle: {
    fr: "Commence gratuitement et débloque les 12 outils IA pour ton e-commerce.",
    ar: "ابدأ مجاناً وافتح أدوات الذكاء الاصطناعي الـ 12 لمتجارتك الإلكترونية.",
    en: "Start free and unlock all 12 AI tools for your e-commerce.",
  },
  authLoginBtn: {
    fr: "Se connecter",
    ar: "تسجيل الدخول",
    en: "Sign in",
  },
  authRegisterBtn: {
    fr: "Créer mon compte",
    ar: "إنشاء حسابي",
    en: "Create my account",
  },
  authNoAccount: {
    fr: "Pas encore de compte ?",
    ar: "ليس لديك حساب بعد؟",
    en: "Don't have an account?",
  },
  authCreateAccount: {
    fr: "Créer un compte",
    ar: "إنشاء حساب",
    en: "Create one",
  },
  authHaveAccount: {
    fr: "Déjà un compte ?",
    ar: "لديك حساب بالفعل؟",
    en: "Already have an account?",
  },
  authSignIn: {
    fr: "Se connecter",
    ar: "تسجيل الدخول",
    en: "Sign in",
  },
  authOr: {
    fr: "ou",
    ar: "أو",
    en: "or",
  },
  authGoogle: {
    fr: "Continuer avec Google",
    ar: "المتابعة عبر جوجل",
    en: "Continue with Google",
  },
  authVerifyTitle: {
    fr: "Vérifie ton email",
    ar: "تحقق من بريدك الإلكتروني",
    en: "Verify your email",
  },
  authOtpSentTo: {
    fr: "Code envoyé à",
    ar: "تم إرسال الرمز إلى",
    en: "Code sent to",
  },
  authVerifyBtn: {
    fr: "Vérifier le code",
    ar: "تحقق من الرمز",
    en: "Verify code",
  },
  authVerifying: {
    fr: "Vérification…",
    ar: "جارٍ التحقق…",
    en: "Verifying…",
  },
  authVerified: {
    fr: "Email vérifié ! Connexion…",
    ar: "تم التحقق من البريد! جارٍ تسجيل الدخول…",
    en: "Email verified! Signing in…",
  },
  authResend: {
    fr: "Renvoyer le code",
    ar: "إعادة إرسال الرمز",
    en: "Resend code",
  },
  authResendIn: {
    fr: "Renvoyer dans",
    ar: "إعادة الإرسال خلال",
    en: "Resend in",
  },
  authNoCode: {
    fr: "Tu n'as rien reçu ?",
    ar: "لم يصلك شيء؟",
    en: "Didn't get it?",
  },
  authChangeEmail: {
    fr: "Ce n'est pas mon email — revenir",
    ar: "هذا ليس بريدي — العودة",
    en: "Not my email — go back",
  },
  authDevHint: {
    fr: "Mode dév : le code est affiché dans la console du serveur.",
    ar: "وضع التطوير: يظهر الرمز في سجل الخادم.",
    en: "Dev mode: the code is printed in the server console.",
  },
  authLoginOtpNote: {
    fr: "Code de connexion · valable 10 minutes",
    ar: "رمز الدخول · صالح لمدة 10 دقائق",
    en: "Login code · valid for 10 minutes",
  },
  authPleaseWait: {
    fr: "Envoi du code…",
    ar: "جارٍ إرسال الرمز…",
    en: "Sending code…",
  },
  authResent: {
    fr: "Nouveau code envoyé !",
    ar: "تم إرسال رمز جديد!",
    en: "New code sent!",
  },
  authShowPw: {
    fr: "Afficher le mot de passe",
    ar: "إظهار كلمة المرور",
    en: "Show password",
  },
  authHidePw: {
    fr: "Masquer le mot de passe",
    ar: "إخفاء كلمة المرور",
    en: "Hide password",
  },
  authErrFill: {
    fr: "Remplis tous les champs.",
    ar: "املأ جميع الحقول.",
    en: "Please fill in all fields.",
  },
  authErrGeneric: {
    fr: "Une erreur est survenue.",
    ar: "حدث خطأ ما.",
    en: "Something went wrong.",
  },
  authErrCode: {
    fr: "Entre le code complet à 6 chiffres.",
    ar: "أدخل الرمز الكامل المكوّن من 6 أرقام.",
    en: "Enter the full 6-digit code.",
  },
  authErrCodeInvalid: {
    fr: "Code invalide ou expiré.",
    ar: "رمز غير صالح أو منتهي الصلاحية.",
    en: "Invalid or expired code.",
  },
  authPwShort: {
    fr: "Le mot de passe doit contenir au moins 8 caractères.",
    ar: "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.",
    en: "Password must be at least 8 characters.",
  },
  authPwMismatch: {
    fr: "Les mots de passe ne correspondent pas.",
    ar: "كلمتا المرور غير متطابقتين.",
    en: "Passwords do not match.",
  },
  authForgotPassword: {
    fr: "Mot de passe oublié ?",
    ar: "نسيت كلمة المرور؟",
    en: "Forgot password?",
  },
  authErrName: {
    fr: "Entre ton nom.",
    ar: "أدخل اسمك.",
    en: "Enter your name.",
  },
  authErrEmail: {
    fr: "Adresse email invalide.",
    ar: "بريد إلكتروني غير صالح.",
    en: "Invalid email address.",
  },
  authTerms: {
    fr: "En créant un compte, tu acceptes les conditions d'utilisation.",
    ar: "بإنشاء حساب، أنت توافق على شروط الاستخدام.",
    en: "By creating an account you agree to the Terms.",
  },
  // Auth brand panel
  authBrandSubtitle: {
    fr: "Plateforme Marketing E-Commerce",
    ar: "منصة تسويق التجارة الإلكترونية",
    en: "AI-Powered Ecommerce Marketing",
  },
  authBrandBadge: {
    fr: "✦ Plateforme Marketing E-Commerce",
    ar: "✦ منصة تسويق التجارة الإلكترونية",
    en: "✦ AI-Powered Ecommerce Marketing",
  },
  authBrandHeadlineA: {
    fr: "Transformez votre produit en",
    ar: "حوّل منتجك إلى",
    en: "Turn your product into",
  },
  authBrandHeadlineB: {
    fr: "campagne marketing complète.",
    ar: "حملة تسويقية كاملة.",
    en: "a full marketing campaign.",
  },
  authBrandDesc: {
    fr: "EcomFlow AI analyse votre produit, identifie les meilleurs angles marketing et génère landing pages, créations publicitaires, visuels et vidéos — en quelques minutes.",
    ar: "EcomFlow AI يحلل منتجك، ويكتشف أفضل الزوايا التسويقية، ثم ينشئ صفحات هبوط، إعلانات، تصاميم وفيديوهات تسويقية خلال دقائق.",
    en: "EcomFlow AI analyzes your product, finds the best marketing angles, and generates landing pages, ad creatives, visuals, and videos — all in minutes.",
  },
  authBrandFeature1: {
    fr: "⚡ Landing Pages IA",
    ar: "⚡ صفحات هبوط بالذكاء الاصطناعي",
    en: "⚡ AI Landing Pages",
  },
  authBrandFeature2: {
    fr: "🎨 Créations Publicitaires",
    ar: "🎨 تصاميم إعلانية",
    en: "🎨 Ad Creatives",
  },
  authBrandFeature3: {
    fr: "🎬 Vidéos Marketing",
    ar: "🎬 فيديوهات تسويقية",
    en: "🎬 Marketing Videos",
  },
  authBrandFooter: {
    fr: "© 2026 EcomFlow AI — Marketing e-commerce propulsé par l'IA",
    ar: "© 2026 EcomFlow AI — تسويق إلكتروني بالذكاء الاصطناعي",
    en: "© 2026 EcomFlow AI — AI-powered ecommerce marketing",
  },
  // Forgot password
  fpTitle: {
    fr: "Réinitialiser le mot de passe",
    ar: "إعادة تعيين كلمة المرور",
    en: "Reset your password",
  },
  fpEmailSubtitle: {
    fr: "Entre ton email, on t'envoie un code à 6 chiffres.",
    ar: "أدخل بريدك الإلكتروني وسنرسل لك رمزاً من 6 أرقام.",
    en: "Enter your email and we'll send you a 6-digit code.",
  },
  fpStepEmail: {
    fr: "Email",
    ar: "البريد",
    en: "Email",
  },
  fpStepCode: {
    fr: "Code",
    ar: "الرمز",
    en: "Code",
  },
  fpStepPassword: {
    fr: "Mot de passe",
    ar: "كلمة المرور",
    en: "Password",
  },
  fpContinue: {
    fr: "Continuer",
    ar: "متابعة",
    en: "Continue",
  },
  fpSending: {
    fr: "Envoi du code…",
    ar: "جارٍ الإرسال…",
    en: "Sending…",
  },
  fpCodeSentTo: {
    fr: "Code envoyé à",
    ar: "تم إرسال الرمز إلى",
    en: "Code sent to",
  },
  fpCodeNote: {
    fr: "Ce code ne sert qu'à réinitialiser ton mot de passe.",
    ar: "هذا الرمز مخصص لإعادة تعيين كلمة المرور فقط.",
    en: "This code is only for resetting your password.",
  },
  fpNewPwSubtitle: {
    fr: "8 caractères minimum.",
    ar: "8 أحرف على الأقل.",
    en: "At least 8 characters.",
  },
  fpNewPassword: {
    fr: "Nouveau mot de passe",
    ar: "كلمة المرور الجديدة",
    en: "New password",
  },
  fpResetBtn: {
    fr: "Réinitialiser le mot de passe",
    ar: "إعادة تعيين كلمة المرور",
    en: "Reset password",
  },
  fpResetting: {
    fr: "Réinitialisation…",
    ar: "جارٍ إعادة التعيين…",
    en: "Resetting…",
  },
  fpResetSuccess: {
    fr: "Mot de passe réinitialisé ! Connecte-toi avec ton nouveau mot de passe.",
    ar: "تمت إعادة تعيين كلمة المرور! سجّل الدخول بكلمة المرور الجديدة.",
    en: "Password reset! Sign in with your new password.",
  },
  fpBackToLogin: {
    fr: "Retour à la connexion",
    ar: "العودة إلى تسجيل الدخول",
    en: "Back to sign in",
  },
  fpChangeEmail: {
    fr: "Ce n'est pas mon email — changer",
    ar: "تغيير البريد",
    en: "Not my email",
  },
  fpErrEmail: {
    fr: "Entre ton adresse email.",
    ar: "أدخل بريدك الإلكتروني.",
    en: "Enter your email address.",
  },
  fpErrPwShort: {
    fr: "Le mot de passe doit contenir au moins 8 caractères.",
    ar: "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.",
    en: "Password must be at least 8 characters.",
  },
  fpErrPwMismatch: {
    fr: "Les mots de passe ne correspondent pas.",
    ar: "كلمتا المرور غير متطابقتين.",
    en: "Passwords do not match.",
  },
  fpErrTokenExpired: {
    fr: "Le lien a expiré. Recommence depuis le début.",
    ar: "انتهت صلاحية الرابط. ابدأ من جديد.",
    en: "Link expired. Start over.",
  },
  fpErrGeneric: {
    fr: "Une erreur est survenue.",
    ar: "حدث خطأ ما.",
    en: "Something went wrong.",
  },
  // Password strength
  pwWeak: {
    fr: "Faible",
    ar: "ضعيفة",
    en: "Weak",
  },
  pwMedium: {
    fr: "Moyen",
    ar: "متوسطة",
    en: "Medium",
  },
  pwStrong: {
    fr: "Fort",
    ar: "قوية",
    en: "Strong",
  },
  pwVeryStrong: {
    fr: "Très fort",
    ar: "قوية جداً",
    en: "Very strong",
  },
  pwHint: {
    fr: "Mélange majuscules, minuscules, chiffres et symboles.",
    ar: "امزج الأحرف الكبيرة والصغيرة والأرقام والرموز.",
    en: "Mix uppercase, lowercase, numbers and symbols.",
  },
  authPwPlaceholder: {
    fr: "8 caractères minimum",
    ar: "8 أحرف على الأقل",
    en: "At least 8 characters",
  },
  authEmailPlaceholder: {
    fr: "vous@exemple.com",
    ar: "you@example.com",
    en: "you@example.com",
  },
  // Dashboard
  dashGreeting: {
    fr: "Salam,",
    ar: "مرحباً،",
    en: "Hello,",
  },
  dashSubtitle: {
    fr: "Centre de commandement e-commerce",
    ar: "مركز قيادة التجارة الإلكترونية",
    en: "E-commerce command center",
  },
  dashMarketLive: {
    fr: "Marché DZ : Live",
    ar: "السوق الجزائري : مباشر",
    en: "DZ Market: Live",
  },
  dashKpiConversion: {
    fr: "Taux Conversion",
    ar: "معدل التحويل",
    en: "Conversion Rate",
  },
  dashKpiProducts: {
    fr: "Produits Gagnants",
    ar: "المنتجات الرابحة",
    en: "Winning Products",
  },
  dashKpiDelivery: {
    fr: "Taux Livraison",
    ar: "معدل التوصيل",
    en: "Delivery Rate",
  },
  dashKpiRevenue: {
    fr: "Revenus COD",
    ar: "إيرادات الدفع عند الاستلام",
    en: "COD Revenue",
  },
  dashKpiActive: {
    fr: "actifs",
    ar: "نشط",
    en: "active",
  },
  dashKpiSales: {
    fr: "Ventes Totales",
    ar: "إجمالي المبيعات",
    en: "Total Sales",
  },
  dashKpiLoading: {
    fr: "chargement",
    ar: "جارٍ التحميل",
    en: "loading",
  },
  dashKpiConfRate: {
    fr: "taux confirmation",
    ar: "معدل التأكيد",
    en: "conf. rate",
  },
  dashKpiStockAlert: {
    fr: "alertes stock",
    ar: "تنبيهات المخزون",
    en: "stock alerts",
  },
  dashKpiStockOk: {
    fr: "stock OK",
    ar: "المخزون جيد",
    en: "stock OK",
  },
  dashKpiLowStock: {
    fr: "ruptures",
    ar: "نقص",
    en: "low stock",
  },
  dashTrendingTitle: {
    fr: "Produits Top",
    ar: "المنتجات الرائجة",
    en: "Top Products",
  },
  dashViewAll: {
    fr: "Tout voir",
    ar: "عرض الكل",
    en: "View all",
  },
  dashNoProducts: {
    fr: "Aucun produit",
    ar: "لا منتجات",
    en: "No products",
  },
  dashNoProductsHint: {
    fr: "Ajoute des produits au catalogue",
    ar: "أضف منتجات للكتالوج",
    en: "Add products to catalog",
  },
  dashSalesUnit: {
    fr: "ventes",
    ar: "مبيعات",
    en: "sales",
  },
  dashKpiVsLastMonth: {
    fr: "vs mois dernier",
    ar: "مقارنة بالشهر الماضي",
    en: "vs last month",
  },
  dashKpiThisWeek: {
    fr: "cette semaine",
    ar: "هذا الأسبوع",
    en: "this week",
  },
  dashKpiVsAvg: {
    fr: "vs moyenne",
    ar: "مقارنة بالمتوسط",
    en: "vs average",
  },
  dashKpiThisMonth: {
    fr: "ce mois",
    ar: "هذا الشهر",
    en: "this month",
  },
  dashQuickActions: {
    fr: "Accès Rapide",
    ar: "وصول سريع",
    en: "Quick Actions",
  },
  dashActionStudio: {
    fr: "Studio Photo",
    ar: "استوديو الصور",
    en: "Photo Studio",
  },
  dashActionStudioSub: {
    fr: "Visuels HD produits",
    ar: "صور عالية الدقة للمنتجات",
    en: "HD product visuals",
  },
  dashActionVideo: {
    fr: "Pubs Vidéo",
    ar: "إعلانات الفيديو",
    en: "Video Ads",
  },
  dashActionVideoSub: {
    fr: "Scripts & storyboards",
    ar: "سكريبتات وقصص مرئية",
    en: "Scripts & storyboards",
  },
  dashActionLanding: {
    fr: "Landing Pages",
    ar: "صفحات الهبوط",
    en: "Landing Pages",
  },
  dashActionLandingSub: {
    fr: "Tunnels de vente",
    ar: "قنوات البيع",
    en: "Sales funnels",
  },
  dashActionScout: {
    fr: "Scout Telegram",
    ar: "مستكشف تلغرام",
    en: "Telegram Scout",
  },
  dashActionScoutSub: {
    fr: "Produits tendance",
    ar: "منتجات رائجة",
    en: "Trending products",
  },
  dashActionCalc: {
    fr: "Calculateur Marge",
    ar: "حاسبة الأرباح",
    en: "Margin Calculator",
  },
  dashActionCalcSub: {
    fr: "Profit & ROAS",
    ar: "الأرباح والعائد",
    en: "Profit & ROAS",
  },
  dashActionConsultant: {
    fr: "Consultant IA",
    ar: "مستشار الذكاء الاصطناعي",
    en: "AI Consultant",
  },
  dashActionConsultantSub: {
    fr: "Analyse produit",
    ar: "تحليل المنتجات",
    en: "Product analysis",
  },
  dashHistory: {
    fr: "Historique Récent",
    ar: "السجل الأخير",
    en: "Recent History",
  },
  dashHistoryEmpty: {
    fr: "Aucune génération récente",
    ar: "لا توجد إنشاءات حديثة",
    en: "No recent generations",
  },
  dashHistoryEmptyHint: {
    fr: "Crée ton premier visuel, script ou landing page.",
    ar: "أنشئ أول صورة أو سكريبت أو صفحة هبوط.",
    en: "Create your first visual, script, or landing page.",
  },
  dashClearHistory: {
    fr: "Vider",
    ar: "مسح",
    en: "Clear",
  },
  dashOpen: {
    fr: "Ouvrir",
    ar: "فتح",
    en: "Open",
  },
  dashImage: {
    fr: "Image",
    ar: "صورة",
    en: "Image",
  },
  dashScript: {
    fr: "Script",
    ar: "سكريبت",
    en: "Script",
  },
  dashLanding: {
    fr: "Landing",
    ar: "هبوط",
    en: "Landing",
  },
  // Dashboard LP Generator
  dashLpTitle: {
    fr: "Générateur de Landing Page IA",
    ar: "مولد صفحات الهبوط بالذكاء الاصطناعي",
    en: "AI Landing Page Generator",
  },
  dashLpSubtitle: {
    fr: "Décris ton produit — l'IA génère la structure complète",
    ar: "صف منتجك — الذكاء الاصطناعي ينشئ البنية الكاملة",
    en: "Describe your product — AI generates the full structure",
  },
  dashLpProductName: {
    fr: "Nom du produit",
    ar: "اسم المنتج",
    en: "Product name",
  },
  dashLpProductNamePh: {
    fr: "Ex: Smart Watch Ultra 2, Hachoir Manuel 3 Lames...",
    ar: "مثال: ساعة ذكية ألترا 2، شفرات حلاقة يدوية...",
    en: "Ex: Smart Watch Ultra 2, Manual Chopper 3 Blades...",
  },
  dashLpDescription: {
    fr: "Description (optionnel)",
    ar: "الوصف (اختياري)",
    en: "Description (optional)",
  },
  dashLpDescriptionPh: {
    fr: "Décris le produit, ses avantages, ton cible...",
    ar: "صف المنتج ومميزاته والجمهور المستهدف...",
    en: "Describe the product, its advantages, your target...",
  },
  dashLpGenerating: {
    fr: "Génération en cours...",
    ar: "جارٍ التوليد...",
    en: "Generating...",
  },
  dashLpGenerate: {
    fr: "Générer la Landing Page",
    ar: "توليد صفحة الهبوط",
    en: "Generate Landing Page",
  },
  dashLpError: {
    fr: "Erreur lors de la génération.",
    ar: "خطأ أثناء التوليد.",
    en: "Generation error.",
  },
  dashLpResult: {
    fr: "Structure générée",
    ar: "البنية المولّدة",
    en: "Generated structure",
  },
  dashLpSections: {
    fr: "sections",
    ar: "أقسام",
    en: "sections",
  },
  dashLpPalette: {
    fr: "Palette",
    ar: "لوحة الألوان",
    en: "Palette",
  },
  dashLpOpenEditor: {
    fr: "Ouvrir dans l'éditeur",
    ar: "فتح في المحرر",
    en: "Open in editor",
  },
  dashLpCollapse: {
    fr: "Masquer",
    ar: "إخفاء",
    en: "Hide",
  },
  dashLpExpand: {
    fr: "Voir le résultat",
    ar: "عرض النتيجة",
    en: "Show result",
  },

  // Page builder
  pbUploadTitle: {
    fr: "Dépose tes sections ici",
    ar: "أسقط الأقسام هنا",
    en: "Drop your sections here",
  },
  pbUploadHint: {
    fr: "Images de landing page (PNG, JPG, WebP)",
    ar: "صور صفحة الهبوط (PNG, JPG, WebP)",
    en: "Landing page images (PNG, JPG, WebP)",
  },
  pbUploadBtn: {
    fr: "Importer des Sections",
    ar: "استيراد الأقسام",
    en: "Import Sections",
  },
  pbSections: {
    fr: "sections",
    ar: "أقسام",
    en: "sections",
  },
  pbMerge: {
    fr: "Fusionner",
    ar: "دمج",
    en: "Merge",
  },
  pbReset: {
    fr: "Réinitialiser",
    ar: "إعادة تعيين",
    en: "Reset",
  },
  pbReady: {
    fr: "Chef-d'œuvre prêt !",
    ar: "العمل جاهز!",
    en: "Masterpiece ready!",
  },
  pbDesktop: {
    fr: "Bureau",
    ar: "سطح المكتب",
    en: "Desktop",
  },
  pbMobile: {
    fr: "Mobile",
    ar: "موبايل",
    en: "Mobile",
  },
  pbDownload: {
    fr: "Télécharger",
    ar: "تحميل",
    en: "Download",
  },
  pbRemove: {
    fr: "Supprimer",
    ar: "حذف",
    en: "Remove",
  },
  pbRemoveAll: {
    fr: "Tout supprimer",
    ar: "حذف الكل",
    en: "Remove all",
  },
  pbRenameHint: {
    fr: "Double-clic pour renommer",
    ar: "انقر مرتين لإعادة التسمية",
    en: "Double-click to rename",
  },
  pbDragHint: {
    fr: "Glisser pour réorganiser",
    ar: "اسحب لإعادة الترتيب",
    en: "Drag to reorder",
  },

  // Landing page (EcomFlow AI)
  lpNavFeatures: {
    fr: "Fonctionnalités",
    ar: "المميزات",
    en: "Features",
  },
  lpNavHow: {
    fr: "Comment ça marche",
    ar: "كيف يعمل",
    en: "How It Works",
  },
  lpNavPricing: {
    fr: "Tarifs",
    ar: "الأسعار",
    en: "Pricing",
  },
  lpNavLogin: {
    fr: "Se connecter",
    ar: "تسجيل الدخول",
    en: "Log in",
  },
  lpNavGetStarted: {
    fr: "Créer un compte",
    ar: "ابدأ الآن",
    en: "Get Started",
  },
  lpBadge: {
    fr: "MARKETING E-COMMERCE PAR L'IA",
    ar: "تسويق إلكتروني بالذكاء الاصطناعي",
    en: "AI-POWERED ECOMMERCE MARKETING",
  },
  lpHeadline: {
    fr: "Transformez votre produit en campagne prête à vendre.",
    ar: "حوّل منتجك إلى حملة جاهزة للبيع.",
    en: "Turn Your Product Into a Sales-Ready Campaign.",
  },
  lpHeadlineHighlight: {
    fr: "Du produit à la vente. Propulsé par l'IA.",
    ar: "من المنتج إلى البيع... بالذكاء الاصطناعي.",
    en: "From Product to Sales. Powered by AI.",
  },
  lpDesc: {
    fr: "Importez votre produit et laissez EcomFlow AI l'analyser, trouver les meilleurs angles marketing puis générer landing pages, créations publicitaires, visuels et vidéos — en quelques minutes.",
    ar: "ارفع صورة منتجك، ودع EcomFlow AI يحللها، ويكتشف أفضل الزوايا التسويقية، ثم ينشئ لك صفحات هبوط، إعلانات، تصاميم وفيديوهات تسويقية خلال دقائق.",
    en: "Upload your product and let EcomFlow AI analyze it, find the best marketing angles, and generate landing pages, ad creatives, visuals, and videos — all in minutes.",
  },
  lpCtaPrimary: {
    fr: "Commencer gratuitement",
    ar: "ابدأ مجانًا",
    en: "Start Creating for Free",
  },
  lpCtaSecondary: {
    fr: "Voir comment ça marche",
    ar: "شاهد كيف يعمل",
    en: "See How It Works",
  },
  lpTrust: {
    fr: "Aucune compétence en design requise • Propulsé par l'IA • Conçu pour l'e-commerce",
    ar: "بدون خبرة في التصميم • بالذكاء الاصطناعي • مصمم للتجارة الإلكترونية",
    en: "No design skills required • AI-powered • Built for ecommerce",
  },
  lpMockUrl: {
    fr: "app.ecomflow.ai/dashboard",
    ar: "app.ecomflow.ai/dashboard",
    en: "app.ecomflow.ai/dashboard",
  },
  lpKpiProducts: {
    fr: "Produits",
    ar: "المنتجات",
    en: "Products",
  },
  lpKpiAnalysis: {
    fr: "Analyse IA",
    ar: "التحليل بالذكاء الاصطناعي",
    en: "AI Analysis",
  },
  lpKpiLanding: {
    fr: "Landing Pages",
    ar: "صفحات الهبوط",
    en: "Landing Pages",
  },
  lpKpiCampaigns: {
    fr: "Campagnes",
    ar: "الحملات",
    en: "Campaigns",
  },
  lpPipelineLabel: {
    fr: "Du produit à la campagne",
    ar: "من المنتج إلى الحملة",
    en: "Product to Campaign",
  },
  lpChartLabel: {
    fr: "Assets marketing cette semaine",
    ar: "أصول التسويق هذا الأسبوع",
    en: "Marketing assets this week",
  },
  lpActivityLabel: {
    fr: "Activité récente",
    ar: "النشاط الأخير",
    en: "Recent activity",
  },
  lpStrip: {
    fr: "De l'image produit à la landing page, aux créas, aux vidéos et à une campagne prête à lancer.",
    ar: "من المنتج إلى صفحة هبوط، إعلانات، فيديوهات، وحملة جاهزة للإطلاق.",
    en: "From product image to landing page, ad creatives, videos, and a launch-ready campaign.",
  },
  lpFeatLabel: {
    fr: "TOUT CE QU'IL FAUT POUR VENDRE",
    ar: "كل ما تحتاجه لبيع منتجك",
    en: "EVERYTHING YOU NEED TO SELL",
  },
  lpFeatTitleA: {
    fr: "D'un produit à une ",
    ar: "من منتج واحد إلى ",
    en: "From One Product to a Complete ",
  },
  lpFeatTitleB: {
    fr: "campagne marketing complète.",
    ar: "حملة تسويقية كاملة.",
    en: "Marketing Campaign.",
  },
  lpFeatDesc: {
    fr: "EcomFlow AI transforme les informations de votre produit en ressources marketing pour attirer vos clients et booster vos ventes.",
    ar: "EcomFlow AI يحوّل معلومات منتجك إلى كل الأدوات التسويقية التي تحتاجها لجذب العملاء وزيادة المبيعات.",
    en: "EcomFlow AI turns your product information into the marketing assets you need to attract customers and drive sales.",
  },
  lpFeat1Title: {
    fr: "Landing Pages IA",
    ar: "صفحات هبوط بالذكاء الاصطناعي",
    en: "AI Landing Pages",
  },
  lpFeat1Desc: {
    fr: "Générez des landing pages optimisées pour la conversion, conçues autour de votre produit, de votre audience et de votre angle marketing.",
    ar: "أنشئ صفحات هبوط احترافية ومصممة لزيادة التحويلات، بناءً على منتجك وجمهورك وأفضل زاوية تسويقية.",
    en: "Generate conversion-focused landing pages built around your product, audience, and marketing angle.",
  },
  lpFeat2Title: {
    fr: "Créations Publicitaires IA",
    ar: "تصاميم إعلانية بالذكاء الاصطناعي",
    en: "AI Ad Creatives",
  },
  lpFeat2Desc: {
    fr: "Créez des visuels publicitaires et des textes professionnels qui font ressortir votre produit.",
    ar: "أنشئ تصاميم ونصوص إعلانية احترافية تجعل منتجك أكثر جذبًا للعملاء.",
    en: "Create professional advertising visuals and copy designed to make your product stand out.",
  },
  lpFeat3Title: {
    fr: "Vidéos Marketing IA",
    ar: "فيديوهات تسويقية بالذكاء الاصطناعي",
    en: "AI Marketing Videos",
  },
  lpFeat3Desc: {
    fr: "Transformez les images et informations de votre produit en vidéos publicitaires engageantes, prêtes pour vos campagnes.",
    ar: "حوّل صور ومعلومات منتجك إلى فيديوهات إعلانية جذابة وجاهزة لحملاتك.",
    en: "Turn product images and information into engaging video creatives ready for your campaigns.",
  },
  lpFeat4Title: {
    fr: "Assistant Marketing IA",
    ar: "مساعد التسويق بالذكاء الاصطناعي",
    en: "AI Marketing Assistant",
  },
  lpFeat4Desc: {
    fr: "Analysez votre produit, découvrez ses points forts, identifiez votre audience et générez les meilleurs angles marketing.",
    ar: "حلّل منتجك، اكتشف نقاط قوته، حدد جمهورك، واقترح أفضل الزوايا التسويقية.",
    en: "Analyze your product, discover selling points, identify your audience, and generate winning marketing angles.",
  },
  lpHowLabel: {
    fr: "COMMENT ÇA MARCHE",
    ar: "كيف يعمل؟",
    en: "HOW IT WORKS",
  },
  lpHowTitle: {
    fr: "De l'image produit à une campagne prête à vendre.",
    ar: "من صورة المنتج إلى حملة جاهزة للبيع.",
    en: "From Product Image to Sales Campaign.",
  },
  lpStep1Title: {
    fr: "Importez votre produit",
    ar: "ارفع منتجك",
    en: "Upload Your Product",
  },
  lpStep1Desc: {
    fr: "Ajoutez une image produit et quelques informations de base.",
    ar: "أضف صورة المنتج وبعض المعلومات الأساسية.",
    en: "Add a product image and basic information.",
  },
  lpStep2Title: {
    fr: "L'IA l'analyse",
    ar: "دع الذكاء الاصطناعي يحلله",
    en: "AI Analyzes It",
  },
  lpStep2Desc: {
    fr: "EcomFlow AI identifie votre audience, vos points forts et vos meilleurs angles marketing.",
    ar: "EcomFlow AI يحدد جمهورك، نقاط قوة المنتج، وأفضل الزوايا التسويقية.",
    en: "EcomFlow AI identifies your audience, selling points, and strongest marketing angles.",
  },
  lpStep3Title: {
    fr: "Créez votre landing page",
    ar: "أنشئ صفحة الهبوط",
    en: "Build Your Landing Page",
  },
  lpStep3Desc: {
    fr: "Générez une landing page professionnelle conçue autour de votre produit.",
    ar: "أنشئ صفحة هبوط احترافية مصممة حول منتجك.",
    en: "Generate a professional landing page designed around your product.",
  },
  lpStep4Title: {
    fr: "Créez annonces & vidéos",
    ar: "أنشئ الإعلانات والفيديوهات",
    en: "Create Ads & Videos",
  },
  lpStep4Desc: {
    fr: "Générez des visuels, des textes publicitaires et des vidéos marketing en quelques minutes.",
    ar: "أنشئ التصاميم، النصوص الإعلانية والفيديوهات خلال دقائق.",
    en: "Generate visuals, ad copy, and marketing videos in minutes.",
  },
  lpStep5Title: {
    fr: "Lancez votre campagne",
    ar: "أطلق حملتك",
    en: "Launch Your Campaign",
  },
  lpStep5Desc: {
    fr: "Prenez vos contenus prêts à l'emploi et commencez à vendre.",
    ar: "استخدم محتواك الجاهز وابدأ البيع.",
    en: "Take your ready-to-use assets and start selling.",
  },
  lpPriceLabel: {
    fr: "Paiement en DZD · activation manuelle",
    ar: "الدفع بالدينار · تفعيل يدوي",
    en: "Payment in DZD · manual activation",
  },
  lpPriceTitleA: {
    fr: "Des plans simples, ",
    ar: "خطط بسيطة ",
    en: "Simple plans, ",
  },
  lpPriceTitleB: {
    fr: "en DZD",
    ar: "بالدينار",
    en: "in DZD",
  },
  lpPriceSub: {
    fr: "1 mois pour tester · 3 mois pour lancer · à vie pour dominer.",
    ar: "شهر للتجربة · 3 أشهر للإطلاق · مدى الحياة للسيطرة.",
    en: "1 month to try · 3 months to launch · lifetime to dominate.",
  },
  lpPriceFeature1: {
    fr: "Accès à tous les 12 outils IA",
    ar: "الوصول إلى جميع أدوات الذكاء الاصطناعي الـ12",
    en: "Access to all 12 AI tools",
  },
  lpPriceFeature2: {
    fr: "Mises à jour incluses",
    ar: "تحديثات مجانية مشمولة",
    en: "Free updates included",
  },
  lpPriceFeature3: {
    fr: "Support direct",
    ar: "دعم مباشر",
    en: "Direct support",
  },
  lpPricePopular: {
    fr: "Le plus choisi",
    ar: "الأكثر اختيارًا",
    en: "Most popular",
  },
  lpPriceCta: {
    fr: "S'abonner",
    ar: "اشترك",
    en: "Subscribe",
  },
  lpPriceNote: {
    fr: "Après paiement, envoyez la facture (PDF / photo) à l'admin — accès activé manuellement sous 24h.",
    ar: "بعد الدفع، أرسل الفاتورة (PDF / صورة) إلى المشرف — يتم تفعيل الوصول يدويًا خلال 24 ساعة.",
    en: "After payment, send the receipt (PDF / photo) to the admin — access activated manually within 24h.",
  },
  lpCtaTitle: {
    fr: "Votre prochain produit mérite un meilleur marketing.",
    ar: "منتجك القادم يستحق تسويقًا أفضل.",
    en: "Your Next Winning Product Deserves Better Marketing.",
  },
  lpCtaDesc: {
    fr: "Arrêtez de passer des heures à créer vos contenus marketing. Laissez EcomFlow AI s'occuper du travail.",
    ar: "لا تضيع ساعات في إعداد المحتوى التسويقي. دع EcomFlow AI يتولى المهمة.",
    en: "Stop spending hours creating marketing assets. Let EcomFlow AI do the heavy lifting.",
  },
  lpCtaButton: {
    fr: "Commencer gratuitement",
    ar: "ابدأ مجانًا",
    en: "Start Creating for Free",
  },
  lpFooter: {
    fr: "© 2026 EcomFlow AI — Marketing e-commerce propulsé par l'IA",
    ar: "© 2026 EcomFlow AI — تسويق إلكتروني بالذكاء الاصطناعي",
    en: "© 2026 EcomFlow AI — AI-powered ecommerce marketing",
  },
  lpFooterMeta: {
    fr: "v2.4.0 · IA · Conçu pour l'e-commerce",
    ar: "v2.4.0 · بالذكاء الاصطناعي · مصمم للتجارة الإلكترونية",
    en: "v2.4.0 · AI-powered · Built for ecommerce",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  cycleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'dzads_language';
const LANG_ORDER: Language[] = ['fr', 'ar', 'en'];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as Language;
      if (saved && (saved === 'fr' || saved === 'ar' || saved === 'en')) {
        return saved;
      }
    }
    return 'fr';
  });

  const dir: 'ltr' | 'rtl' = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, language);
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
    }
  }, [language, dir]);

  // Dual-write: persist the language to the server API (fire-and-forget).
  useEffect(() => {
    preferencesApi.update({ language }).catch(() => {});
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const cycleLanguage = useCallback(() => {
    setLanguageState(prev => {
      const currentIndex = LANG_ORDER.indexOf(prev);
      const nextIndex = (currentIndex + 1) % LANG_ORDER.length;
      return LANG_ORDER[nextIndex];
    });
  }, []);

  const t = (key: string, fallback?: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, cycleLanguage, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
