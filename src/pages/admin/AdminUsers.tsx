import { useEffect, useMemo, useState } from 'react';
import { Search, Shield, ShieldOff, Trash2, Eye, Crown, RotateCcw, Users, Loader2, FileText, Package, MessageSquare, Layers, Check, Download, Settings, Infinity } from 'lucide-react';
import { adminApi, type AdminUser, type UserDetail } from '../../services/admin';
import { isImageProof, isPdfProof, useBlobUrl } from '../../lib/proof';
import { AdminCard, EmptyState, Field, LoadingBlock, Modal, StatusBadge, inputCls } from './AdminUI';
import { cn } from '../../lib/utils';

const DURATION_PRESETS = [1, 3, 7, 15, 30, 90];

/** Renders an image/PDF payment proof with optional download. */
function PaymentProofDisplay({ dataUrl }: { dataUrl: string | null | undefined }) {
  const blobUrl = useBlobUrl(dataUrl);
  const isImg = isImageProof(dataUrl);
  const isPdf = isPdfProof(dataUrl);

  if (!dataUrl || (!isImg && !isPdf)) return null;

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-mono uppercase tracking-wider text-white/35">Preuve de paiement</p>
      {isImg ? (
        <img src={blobUrl ?? undefined} alt="Preuve" className="rounded-xl border border-white/[0.06] max-h-64 object-contain" />
      ) : isPdf ? (
        <div className="space-y-2">
          <iframe
            src={blobUrl ?? undefined}
            title="Preuve (PDF)"
            className="w-full h-[40vh] min-h-[300px] rounded-xl border border-white/[0.06]"
          />
          <div className="flex items-center gap-2">
            <a
              href={blobUrl ?? ''}
              download="preuve.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white/70 text-[12px] font-semibold hover:bg-white/[0.1] transition-colors cursor-pointer"
            >
              <Download size={14} /> Télécharger
            </a>
            <span className="text-[11px] text-white/30">Clique pour ouvrir/télécharger le PDF</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [planModal, setPlanModal] = useState<AdminUser | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { setUsers(await adminApi.users()); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  const run = async (id: string, fn: () => Promise<unknown>) => {
    setBusy(id);
    try { await fn(); await load(); } catch (err) { console.error(err); } finally { setBusy(null); }
  };

  const openDetail = async (user: AdminUser) => {
    setDetailLoading(true);
    setDetail(null);
    try { setDetail(await adminApi.userDetail(user.id)); } catch (err) { console.error(err); } finally { setDetailLoading(false); }
  };

  return (
    <div className="space-y-5">
      <AdminCard
        title="Gestion des utilisateurs"
        icon={Users}
        action={
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className={cn(inputCls, 'pl-9 w-52 sm:w-64 py-2')}
            />
          </div>
        }
      >
        {loading ? (
          <LoadingBlock />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} title="Aucun utilisateur trouvé" hint="Ajuste ta recherche." />
        ) : (
          <div className="overflow-x-auto -mx-5 sm:-mx-6">
            <table className="w-full text-left text-[13px] min-w-[720px]">
              <thead>
                <tr className="text-[10px] font-mono uppercase tracking-wider text-white/30 border-b border-white/[0.06]">
                  <th className="px-5 sm:px-6 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="px-4 py-3">Inscrit le</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 sm:px-6 py-3">
                      <p className="font-semibold text-white">{u.name}</p>
                      <p className="text-[11px] text-white/35">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-dz-dinar uppercase">{u.plan || '—'}</span>
                        <StatusBadge status={u.planStatus} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.isAdmin ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-dz-emerald"><Shield size={12} /> Admin</span>
                      ) : (
                        <span className="text-[11px] text-white/30">Utilisateur</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/40">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openDetail(u)} title="Voir détails" className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><Eye size={15} /></button>
                        <button onClick={() => setPlanModal(u)} title="Activer un plan" className="p-2 rounded-lg text-white/40 hover:text-dz-gold hover:bg-white/10 transition-colors cursor-pointer"><Crown size={15} /></button>
                        <button onClick={() => run(u.id, () => adminApi.toggleAdmin(u.id))} disabled={busy === u.id} title={u.isAdmin ? 'Retirer admin' : 'Rendre admin'} className="p-2 rounded-lg text-white/40 hover:text-dz-emerald hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40">
                          {busy === u.id ? <Loader2 size={15} className="animate-spin" /> : u.isAdmin ? <ShieldOff size={15} /> : <Shield size={15} />}
                        </button>
                        <button onClick={() => { if (window.confirm(`Réinitialiser le plan de ${u.name} ?`)) run(u.id, () => adminApi.resetPlan(u.id)); }} title="Réinitialiser le plan" className="p-2 rounded-lg text-white/40 hover:text-amber-400 hover:bg-white/10 transition-colors cursor-pointer"><RotateCcw size={15} /></button>
                        <button onClick={() => { if (window.confirm(`Supprimer définitivement ${u.name} (${u.email}) ? Toutes ses données seront effacées.`)) run(u.id, () => adminApi.deleteUser(u.id)); }} title="Supprimer" className="p-2 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Detail modal */}
      <Modal open={detail !== null || detailLoading} onClose={() => setDetail(null)} title="Détails de l'utilisateur" wide>
        {detailLoading || !detail ? (
          <LoadingBlock label="Chargement du profil…" />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-dz-emerald/30 to-dz-gold/30 border border-white/10 flex items-center justify-center font-bold text-lg text-white">
                {detail.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-display font-semibold text-white text-lg">{detail.name}</p>
                <p className="text-[12px] text-white/40">{detail.email}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[11px] font-mono text-dz-dinar uppercase">{detail.plan || '—'}</span>
                <StatusBadge status={detail.planStatus} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Générations', value: detail._count.generationHistory, icon: FileText },
                { label: 'Produits', value: detail._count.productCatalog, icon: Package },
                { label: 'Chats', value: detail._count.chatSessions, icon: MessageSquare },
                { label: 'LPs', value: detail._count.lpSessions, icon: Layers },
                { label: 'OTPs', value: detail._count.emailOtps, icon: Check },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                  <s.icon size={14} className="mx-auto text-dz-emerald mb-1.5" />
                  <p className="font-display font-bold text-lg text-white">{s.value}</p>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-white/30">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/35">Abonnement</p>
                <p>Début: <span className="text-white/60">{detail.planActiveFrom ? new Date(detail.planActiveFrom).toLocaleDateString('fr-FR') : '—'}</span></p>
                <p>Expire: <span className="text-white/60">{detail.planExpiresAt ? new Date(detail.planExpiresAt).toLocaleDateString('fr-FR') : detail.plan === 'lifetime' ? '∞ (à vie)' : '—'}</span></p>
                <p>Méthode: <span className="text-white/60">{detail.paymentMethod || '—'}</span></p>
                <p>Soumis: <span className="text-white/60">{detail.paymentSubmittedAt ? new Date(detail.paymentSubmittedAt).toLocaleString('fr-FR') : '—'}</span></p>
                {detail.paymentNote && <p>Note: <span className="text-white/60">{detail.paymentNote}</span></p>}
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/35">Préférences</p>
                <p>Langue: <span className="text-white/60">{detail.userPreferences?.language || 'fr'}</span></p>
                <p>Thème: <span className="text-white/60">{detail.userPreferences?.theme || 'dark'}</span></p>
                <p>Workspace: <span className="text-white/60">{detail.apiSettings?.workspaceName || '—'}</span></p>
                <p>Inscrit le: <span className="text-white/60">{new Date(detail.createdAt).toLocaleDateString('fr-FR')}</span></p>
              </div>
            </div>

            <PaymentProofDisplay dataUrl={detail.paymentProof} />

            <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
              <button onClick={() => { if (window.confirm(`Réinitialiser le plan de ${detail.name} ?`)) { adminApi.resetPlan(detail.id).then(() => { setDetail(null); load(); }); } }} className="btn-dz-secondary flex-1 text-[13px]"><RotateCcw size={14} /> Réinitialiser le plan</button>
              <button onClick={() => adminApi.toggleAdmin(detail.id).then(() => { openDetail({ id: detail.id } as AdminUser); load(); })} className="btn-dz-secondary flex-1 text-[13px]">
                {detail.isAdmin ? <ShieldOff size={14} /> : <Shield size={14} />} {detail.isAdmin ? 'Retirer admin' : 'Rendre admin'}
              </button>
              <button onClick={() => { if (window.confirm(`Supprimer définitivement ${detail.name} ?`)) adminApi.deleteUser(detail.id).then(() => { setDetail(null); load(); }); }} className="btn-dz-danger flex-1 text-[13px]"><Trash2 size={14} /> Supprimer</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Set plan modal */}
      <Modal open={planModal !== null} onClose={() => setPlanModal(null)} title={`Activer un plan — ${planModal?.name ?? ''}`}>
        {planModal && <SetPlanForm user={planModal} onDone={() => { setPlanModal(null); load(); }} />}
      </Modal>
    </div>
  );
}

function SetPlanForm({ user, onDone }: { user: AdminUser; onDone: () => void }) {
  const [preset, setPreset] = useState<number | 'custom' | 'lifetime'>(30);
  const [customDays, setCustomDays] = useState(7);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const days = preset === 'custom' ? customDays : (preset === 'lifetime' ? 0 : preset);
  const label = preset === 'lifetime' ? 'à vie' : `${days} jour${days > 1 ? 's' : ''}`;
  const planId = preset === 'lifetime' ? 'lifetime' : preset === 30 ? 'monthly' : preset === 90 ? 'quarterly' : 'custom';

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await adminApi.setPlan(user.id, { plan: planId, days: preset === 'lifetime' ? undefined : days });
      onDone();
    } catch (err: any) {
      setError(err?.message || 'Erreur.');
    } finally {
      setSaving(false);
    }
  };

  const chipCls = (active: boolean) => cn(
    'rounded-xl border px-2.5 py-2.5 text-center transition-all cursor-pointer flex-1 min-w-[74px]',
    active ? 'bg-dz-emerald/10 border-dz-emerald/40 text-dz-emerald' : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:border-white/20'
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {DURATION_PRESETS.map(d => (
          <button key={d} type="button" onClick={() => setPreset(d)} className={chipCls(preset === d)}>
            <Crown size={13} className="mx-auto mb-1" />
            <span className="text-[11px] font-semibold">{d}j</span>
          </button>
        ))}
        <button type="button" onClick={() => setPreset('custom')} className={chipCls(preset === 'custom')}>
          <Settings size={13} className="mx-auto mb-1" />
          <span className="text-[11px] font-semibold">Perso</span>
        </button>
        <button type="button" onClick={() => setPreset('lifetime')} className={chipCls(preset === 'lifetime')}>
          <Infinity size={13} className="mx-auto mb-1" />
          <span className="text-[11px] font-semibold">À vie</span>
        </button>
      </div>

      {preset === 'custom' && (
        <Field label="Durée en jours (ex: 1, 7, 45)">
          <input type="number" min={1} max={3650} value={customDays} onChange={e => setCustomDays(Math.max(1, Number(e.target.value) || 1))} className={inputCls} />
        </Field>
      )}

      <p className="text-[11px] text-white/30">
        Accès actif immédiatement — <span className="text-dz-emerald font-semibold">{label}</span>.
      </p>

      {error && <p className="text-[12px] text-rose-400">{error}</p>}
      <div className="flex gap-2">
        <button onClick={submit} disabled={saving} className="btn-dz-primary flex-1 disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Activer {label}
        </button>
        <button onClick={onDone} className="btn-dz-secondary">Annuler</button>
      </div>
    </div>
  );
}