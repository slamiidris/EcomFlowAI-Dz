import { useEffect, useState } from 'react';
import { Flame, Plus, Pencil, Trash2, Loader2, Check, X, ArrowDown, ArrowUp } from 'lucide-react';
import { adminApi, type HotDeal } from '../../services/admin';
import { AdminCard, EmptyState, Field, LoadingBlock, Modal, Toggle, inputCls } from './AdminUI';
import { cn } from '../../lib/utils';

export default function AdminHotDeals() {
  const [items, setItems] = useState<HotDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HotDeal | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { setItems(await adminApi.hotDeals()); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const toggleActive = async (d: HotDeal) => {
    setBusy(d.id);
    try { await adminApi.updateHotDeal(d.id, { active: !d.active }); await load(); } catch (err) { console.error(err); } finally { setBusy(null); }
  };

  const move = async (d: HotDeal, dir: -1 | 1) => {
    const idx = items.findIndex(x => x.id === d.id);
    const swap = items[idx + dir];
    if (!swap) return;
    try {
      await Promise.all([
        adminApi.updateHotDeal(d.id, { sortOrder: swap.sortOrder }),
        adminApi.updateHotDeal(swap.id, { sortOrder: d.sortOrder }),
      ]);
      await load();
    } catch (err) { console.error(err); }
  };

  return (
    <AdminCard
      title="Offres en vedette (Hot Deals)"
      icon={Flame}
      action={
        <button onClick={() => setCreating(true)} className="btn-dz-primary !px-4 !py-2 !text-[12px]">
          <Plus size={14} /> Ajouter
        </button>
      }
    >
      {loading ? (
        <LoadingBlock />
      ) : items.length === 0 ? (
        <EmptyState icon={Flame} title="Aucune offre en vedette" hint="Mets en avant tes produits chauds pour tous les utilisateurs." />
      ) : (
        <div className="space-y-3">
          {items.map((d, i) => (
            <div key={d.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xl shrink-0">{d.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-white text-[14px]">{d.title}</p>
                  {d.badge && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/25 uppercase">{d.badge}</span>}
                  {d.price && <span className="text-[11px] font-mono text-dz-dinar">{d.price}</span>}
                  {!d.active && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-white/30 border border-white/10">Masquée</span>}
                </div>
                {d.description && <p className="text-[11px] text-white/35 truncate mt-0.5">{d.description}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <div className="flex flex-col mr-1">
                  <button onClick={() => move(d, -1)} disabled={i === 0} className="p-0.5 text-white/20 hover:text-white disabled:opacity-20 cursor-pointer"><ArrowUp size={12} /></button>
                  <button onClick={() => move(d, 1)} disabled={i === items.length - 1} className="p-0.5 text-white/20 hover:text-white disabled:opacity-20 cursor-pointer"><ArrowDown size={12} /></button>
                </div>
                <Toggle checked={d.active} onChange={() => toggleActive(d)} disabled={busy === d.id} />
                <button onClick={() => setEditing(d)} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><Pencil size={15} /></button>
                <button onClick={() => { if (window.confirm(`Supprimer "${d.title}" ?`)) adminApi.deleteHotDeal(d.id).then(load); }} className="p-2 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={creating || editing !== null} onClose={() => { setCreating(false); setEditing(null); }} title={editing ? 'Modifier l\'offre' : 'Nouvelle offre en vedette'}>
        <HotDealForm key={editing?.id || 'new'} initial={editing || undefined} onDone={() => { setCreating(false); setEditing(null); load(); }} />
      </Modal>
    </AdminCard>
  );
}

function HotDealForm({ initial, onDone }: { initial?: HotDeal; onDone: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    emoji: initial?.emoji || '🔥',
    badge: initial?.badge || '',
    price: initial?.price || '',
    link: initial?.link || '',
    active: initial?.active ?? true,
    sortOrder: initial?.sortOrder || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        emoji: form.emoji,
        badge: form.badge || null,
        price: form.price || null,
        link: form.link || null,
        active: form.active,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (initial?.id) await adminApi.updateHotDeal(initial.id, payload);
      else await adminApi.createHotDeal(payload);
      onDone();
    } catch (err: any) {
      setError(err?.message || 'Erreur.');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[70px_1fr] gap-3">
        <Field label="Emoji"><input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} className={cn(inputCls, 'text-center')} /></Field>
        <Field label="Titre"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} placeholder="Robot ménager 12-en-1" /></Field>
      </div>
      <Field label="Description"><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={cn(inputCls, 'min-h-[70px] resize-y')} placeholder="Pourquoi ce produit est chaud ?" /></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Badge"><input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} className={inputCls} placeholder="HOT" /></Field>
        <Field label="Prix (affichage)"><input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inputCls} placeholder="2 900 DA" /></Field>
        <Field label="Lien (optionnel)"><input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} className={inputCls} placeholder="https://…" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ordre"><input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} className={inputCls} /></Field>
        <div className="flex items-end"><button onClick={() => setForm(f => ({ ...f, active: !f.active }))} className="flex items-center gap-2 text-[13px] text-white/60 cursor-pointer mb-2"><Toggle checked={form.active} onChange={v => setForm(f => ({ ...f, active: v }))} /> {form.active ? 'Active' : 'Masquée'}</button></div>
      </div>
      {error && <p className="text-[12px] text-rose-400">{error}</p>}
      <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
        <button onClick={submit} disabled={saving} className="btn-dz-primary flex-1 disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Enregistrer
        </button>
        <button onClick={onDone} className="btn-dz-secondary px-4"><X size={14} /></button>
      </div>
    </div>
  );
}
