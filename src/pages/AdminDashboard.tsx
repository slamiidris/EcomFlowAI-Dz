import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Clock, FileText, Check, X, Eye, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface PendingPayment {
  id: string;
  name: string;
  email: string;
  plan: string;
  planStatus: string;
  paymentProof: string | null;
  paymentMethod: string | null;
  paymentSubmittedAt: string | null;
  planSelectedAt: string | null;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  activeSubs: number;
  pendingPayments: number;
  totalGenerations: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<PendingPayment | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/admin/pending-payments').then(r => r.json()),
      ]);
      setStats(statsRes);
      setPending(Array.isArray(pendingRes) ? pendingRes : []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await fetch(`/api/admin/approve/${userId}`, { method: 'POST' });
      setPending(prev => prev.filter(p => p.id !== userId));
      loadData();
    } catch (err) { console.error('Approve error:', err); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (userId: string) => {
    if (!window.confirm('Rejeter ce paiement ?')) return;
    setActionLoading(userId);
    try {
      await fetch(`/api/admin/reject/${userId}`, { method: 'POST' });
      setPending(prev => prev.filter(p => p.id !== userId));
      loadData();
    } catch (err) { console.error('Reject error:', err); }
    finally { setActionLoading(null); }
  };

  if (user?.isAdmin !== true) {
    return (
      <div className="min-h-screen bg-dz-green flex items-center justify-center">
        <div className="text-center">
          <Shield size={48} className="mx-auto text-white/15 mb-4" />
          <h1 className="font-display text-2xl font-bold text-white mb-2">Accès refusé</h1>
          <p className="text-white/40">Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dz-green p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
              <Shield size={28} className="text-dz-emerald" />
              Admin Dashboard
            </h1>
            <p className="text-white/40 text-sm mt-1">Gestion des abonnements et utilisateurs</p>
          </div>
          <a href="/" className="text-[13px] text-white/40 hover:text-white transition-colors">← Retour au site</a>
        </div>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'text-dz-emerald' },
              { label: 'Abonnés actifs', value: stats.activeSubs, icon: Crown, color: 'text-dz-gold' },
              { label: 'En attente', value: stats.pendingPayments, icon: Clock, color: 'text-amber-400' },
              { label: 'Générations', value: stats.totalGenerations, icon: FileText, color: 'text-sky-400' },
            ].map(stat => (
              <div key={stat.label} className="surface-card p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <stat.icon size={18} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-[11px] font-mono uppercase text-white/35">{stat.label}</p>
                    <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="surface-card p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={18} className="text-amber-400" />
            <h2 className="font-display font-semibold text-lg text-white">Paiements en attente</h2>
            <span className="ml-auto text-[11px] font-mono text-white/30">{pending.length} en attente</span>
          </div>

          {loading ? (
            <div className="py-12 text-center"><Loader2 size={24} className="mx-auto text-white/20 animate-spin" /></div>
          ) : pending.length === 0 ? (
            <div className="py-12 text-center"><Check size={24} className="mx-auto text-emerald-400/40 mb-3" /><p className="text-sm text-white/40">Aucun paiement en attente</p></div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pending.map(p => (
                <div key={p.id} className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div><p className="font-semibold text-white text-[15px]">{p.name}</p><p className="text-[12px] text-white/40">{p.email}</p></div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-dz-dinar/10 text-dz-dinar border border-dz-dinar/20">{p.plan}</span>
                  </div>
                  <div className="space-y-1.5 text-[12px] text-white/50 mb-4">
                    <p>Méthode: <span className="text-white/70 font-semibold">{p.paymentMethod || 'Non spécifié'}</span></p>
                    <p>Soumis: <span className="text-white/70">{p.paymentSubmittedAt ? new Date(p.paymentSubmittedAt).toLocaleDateString('fr-FR') : '—'}</span></p>
                  </div>
                  {p.paymentProof && (
                    <button onClick={() => setSelectedProof(p)} className="w-full mb-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[12px] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2">
                      <Eye size={14} /> Voir la preuve
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(p.id)} disabled={actionLoading === p.id} className="flex-1 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[12px] font-semibold hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-1 disabled:opacity-50">
                      {actionLoading === p.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Approuver
                    </button>
                    <button onClick={() => handleReject(p.id)} disabled={actionLoading === p.id} className="flex-1 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[12px] font-semibold hover:bg-rose-500/20 transition-all flex items-center justify-center gap-1 disabled:opacity-50">
                      <X size={12} /> Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <AnimatePresence>
          {selectedProof && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProof(null)}>
              <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }} className="w-full max-w-2xl surface-card rounded-3xl p-6 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-lg text-white">Preuve — {selectedProof.name}</h3>
                  <button onClick={() => setSelectedProof(null)} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"><X size={18} /></button>
                </div>
                <div className="text-[13px] text-white/50 mb-4 space-y-1">
                  <p>Email: <span className="text-white/70">{selectedProof.email}</span></p>
                  <p>Plan: <span className="text-dz-dinar font-semibold">{selectedProof.plan}</span></p>
                  <p>Méthode: <span className="text-white/70">{selectedProof.paymentMethod}</span></p>
                </div>
                {selectedProof.paymentProof?.startsWith('data:image') ? (
                  <img src={selectedProof.paymentProof} alt="Preuve" className="w-full rounded-xl border border-white/[0.06] max-h-[60vh] object-contain" />
                ) : selectedProof.paymentProof?.startsWith('data:application/pdf') ? (
                  <iframe src={selectedProof.paymentProof} className="w-full h-[60vh] rounded-xl border border-white/[0.06]" />
                ) : (
                  <p className="text-white/40 text-center py-8">Preuve non disponible</p>
                )}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => { handleApprove(selectedProof.id); setSelectedProof(null); }} className="flex-1 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-2"><Check size={16} /> Approuver</button>
                  <button onClick={() => { handleReject(selectedProof.id); setSelectedProof(null); }} className="flex-1 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"><X size={16} /> Rejeter</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
