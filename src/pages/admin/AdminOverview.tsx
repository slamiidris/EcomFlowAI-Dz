import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Clock, FileText, Check, X, Eye, CreditCard, Megaphone, Flame, Loader2, Download } from 'lucide-react';
import { adminApi, type AdminStats, type PendingPayment } from '../../services/admin';
import { isImageProof, isPdfProof, useBlobUrl } from '../../lib/proof';
import { AdminCard, StatCard, LoadingBlock, EmptyState, StatusBadge } from './AdminUI';

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<PendingPayment | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const proofUrl = useBlobUrl(selectedProof?.paymentProof);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([adminApi.stats(), adminApi.pendingPayments()]);
      setStats(s);
      setPending(p);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminApi.approve(userId);
      setPending(prev => prev.filter(p => p.id !== userId));
      loadData();
    } catch (err) { console.error(err); } finally { setActionLoading(null); }
  };

  const handleReject = async (userId: string) => {
    if (!window.confirm('Rejeter ce paiement ?')) return;
    setActionLoading(userId);
    try {
      await adminApi.reject(userId);
      setPending(prev => prev.filter(p => p.id !== userId));
      loadData();
    } catch (err) { console.error(err); } finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Utilisateurs" value={stats.totalUsers} icon={Users} color="text-dz-emerald" />
          <StatCard label="Abonnés actifs" value={stats.activeSubs} icon={Crown} color="text-dz-gold" />
          <StatCard label="En attente" value={stats.pendingPayments} icon={Clock} color="text-amber-400" />
          <StatCard label="Générations" value={stats.totalGenerations} icon={FileText} color="text-sky-400" />
          <StatCard label="Méthodes de paiement" value={stats.paymentMethods} icon={CreditCard} color="text-emerald-400" />
          <StatCard label="Annonces" value={stats.announcements} icon={Megaphone} color="text-violet-400" />
          <StatCard label="Offres en vedette" value={stats.hotDeals} icon={Flame} color="text-orange-400" />
        </div>
      )}

      <AdminCard title="Paiements en attente" icon={Clock}>
        {loading ? (
          <LoadingBlock />
        ) : pending.length === 0 ? (
          <EmptyState icon={Check} title="Aucun paiement en attente" hint="Tout est à jour." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map(p => (
              <div key={p.id} className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white text-[15px]">{p.name}</p>
                    <p className="text-[12px] text-white/40">{p.email}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-dz-dinar/10 text-dz-dinar border border-dz-dinar/20">{p.plan}</span>
                </div>
                <div className="space-y-1.5 text-[12px] text-white/50 mb-4">
                  <p>Méthode: <span className="text-white/70 font-semibold">{p.paymentMethod || 'Non spécifié'}</span></p>
                  <p>Soumis: <span className="text-white/70">{p.paymentSubmittedAt ? new Date(p.paymentSubmittedAt).toLocaleDateString('fr-FR') : '—'}</span></p>
                </div>
                {p.paymentProof && (isImageProof(p.paymentProof) ? (
                  <button onClick={() => setSelectedProof(p)} className="w-full mb-3 block rounded-xl overflow-hidden border border-white/[0.08] hover:border-dz-emerald/40 transition-all cursor-pointer group text-left">
                    <img src={p.paymentProof} alt={`Preuve — ${p.name}`} className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform" />
                    <span className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-white/50 bg-white/[0.03] group-hover:text-white/80 group-hover:bg-white/[0.05]">
                      <Eye size={12} /> Agrandir
                    </span>
                  </button>
                ) : isPdfProof(p.paymentProof) ? (
                  <button onClick={() => setSelectedProof(p)} className="w-full mb-3 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[12px] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2">
                    <FileText size={14} /> Voir la preuve (PDF)
                  </button>
                ) : (
                  <p className="text-[11px] text-white/30 mb-3">Preuve non lisible</p>
                ))}
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
      </AdminCard>

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
                <p>Statut: <StatusBadge status={selectedProof.planStatus} /></p>
              </div>
              {isImageProof(selectedProof.paymentProof) ? (
                <img src={proofUrl ?? undefined} alt="Preuve" className="w-full rounded-xl border border-white/[0.06] max-h-[60vh] object-contain" />
              ) : isPdfProof(selectedProof.paymentProof) ? (
                <iframe src={proofUrl ?? undefined} title="Preuve (PDF)" className="w-full h-[60vh] rounded-xl border border-white/[0.06]" />
              ) : (
                <p className="text-white/40 text-center py-8">Preuve non disponible</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                <button onClick={() => { handleApprove(selectedProof.id); setSelectedProof(null); }} className="flex-1 min-w-[120px] py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-2"><Check size={16} /> Approuver</button>
                <button onClick={() => { handleReject(selectedProof.id); setSelectedProof(null); }} className="flex-1 min-w-[120px] py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"><X size={16} /> Rejeter</button>
                {proofUrl && (
                  <a href={proofUrl} download={isPdfProof(selectedProof.paymentProof) ? 'preuve.pdf' : 'preuve.png'} className="flex-1 min-w-[120px] py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white/70 font-semibold hover:bg-white/[0.1] transition-all flex items-center justify-center gap-2">
                    <Download size={16} /> Télécharger
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
