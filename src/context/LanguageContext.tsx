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
    fr: "DZ-Commerce OS • Suite E-Com",
    ar: "نظام DZ-Commerce OS • منصة التجارة الإلكترونية",
    en: "DZ-Commerce OS • E-Com Suite",
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
    fr: "📸 Studio Photos Produit E-Com",
    ar: "📸 إستوديو صور المنتجات والتصوير",
    en: "📸 E-Com Product Photo Studio",
  },
  tabDashboard: {
    fr: "📊 Dashboard Ventes & KPI E-Commerce",
    ar: "📊 لوحة تحليلات ومبيعات المتجر",
    en: "📊 E-Commerce Analytics & Sales",
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
    fr: "🍱 Constructeur de Landing Page E-Com",
    ar: "🍱 مُصمم ومنشئ صفحات الهبوط",
    en: "🍱 E-Com Landing Page Builder",
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
    fr: "🗓️ Calendrier de Contenu E-Com",
    ar: "🗓️ تقويم محتوى التجارة الإلكترونية",
    en: "🗓️ E-Com Content Calendar",
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
    en: "E-Com Page Builder",
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
  }
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
