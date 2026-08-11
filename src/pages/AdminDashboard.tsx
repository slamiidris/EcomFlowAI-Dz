import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LayoutDashboard, Users, Key, CreditCard, Megaphone, Flame, Coins, Phone, ArrowLeft, PlaySquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import AdminOverview from './admin/AdminOverview';
import AdminUsers from './admin/AdminUsers';
import AdminApis from './admin/AdminApis';
import AdminPayments from './admin/AdminPayments';
import AdminAnnouncements from './admin/AdminAnnouncements';
import AdminHotDeals from './admin/AdminHotDeals';
import AdminGuides from './admin/AdminGuides';
import AdminPricing from './admin/AdminPricing';
import AdminContacts from './admin/AdminContacts';

type AdminTab = 'overview' | 'users' | 'apis' | 'payments' | 'pricing' | 'announcements' | 'deals' | 'guides' | 'contacts';

const TABS: { id: AdminTab; label: string; icon: typeof Users }[] = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'apis', label: 'APIs', icon: Key },
  { id: 'payments', label: 'Paiements', icon: CreditCard },
  { id: 'pricing', label: 'Tarifs', icon: Coins },
  { id: 'announcements', label: 'Annonces', icon: Megaphone },
  { id: 'deals', label: 'Offres Hot', icon: Flame },
  { id: 'guides', label: 'Guides Vidéo', icon: PlaySquare },
  { id: 'contacts', label: 'Contacts', icon: Phone },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');

  if (user?.isAdmin !== true) {
    return (
      <div className="min-h-screen bg-dz-green flex items-center justify-center">
        <div className="text-center">
          <Shield size={48} className="mx-auto text-white/15 mb-4" />
          <h1 className="font-display text-2xl font-bold text-white mb-2">Accès refusé</h1>
          <p className="text-white/40">Cette page est réservée aux administrateurs.</p>
          <a href="/" className="inline-block mt-6 text-[13px] text-white/40 hover:text-white transition-colors">← Retour au site</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dz-green p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Shield size={26} className="text-dz-emerald shrink-0" />
              Admin Dashboard
            </h1>
            <p className="text-white/40 text-sm mt-1 truncate">Gestion complète de la plateforme</p>
          </div>
          <a href="/" className="shrink-0 text-[13px] text-white/40 hover:text-white transition-colors flex items-center gap-1.5">
            <ArrowLeft size={14} /> Retour au site
          </a>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer border',
                  active
                    ? 'bg-linear-to-r from-dz-gold/15 to-dz-emerald/15 text-white border-dz-emerald/30'
                    : 'text-white/45 border-white/[0.06] hover:bg-white/[0.04] hover:text-white'
                )}
              >
                <t.icon size={15} className={active ? 'text-dz-emerald' : ''} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Active section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'overview' && <AdminOverview />}
            {tab === 'users' && <AdminUsers />}
            {tab === 'apis' && <AdminApis />}
            {tab === 'payments' && <AdminPayments />}
            {tab === 'pricing' && <AdminPricing />}
            {tab === 'announcements' && <AdminAnnouncements />}
            {tab === 'deals' && <AdminHotDeals />}
            {tab === 'guides' && <AdminGuides />}
            {tab === 'contacts' && <AdminContacts />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
