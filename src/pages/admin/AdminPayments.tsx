import { useEffect, useState } from 'react';
import { CreditCard, Plus, Pencil, Trash2, Loader2, Check, ArrowDown, ArrowUp, X } from 'lucide-react';
import { adminApi, type PaymentMethod } from '../../services/admin';
import { AdminCard, EmptyState, Field, LoadingBlock, Modal, Toggle, inputCls } from './AdminUI';
import { cn } from '../../lib/utils';

const TYPE_LABELS: Record<string, string> = { email: 'Email', bank: 'Banque', manual: 'Manuel' };

function emptyForm() {
  return {
    code: '', name: '', description: '', emoji: '💳', type: 'manual' as PaymentMethod['type'],
    instructions: [''] as string[],
    details: { beneficiary: '', iban: '', bic: '', idNumber: '', target: '' } as Record<string, string>,
    enabled: true, sortOrder: 0,
  };
}

export default function AdminPayments() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { setMethods(await adminApi.paymentMethods()); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const toggleEnabled = async (m: PaymentMethod) => {
    setBusy(m.id);
    try { await adminApi.updatePaymentMethod(m.id, { enabled: !m.enabled }); await load(); } catch (err) { console.error(err); } finally { setBusy(null); }
  };

  const move = async (m: PaymentMethod, dir: -1 | 1) => {
    const idx = methods.findIndex(x => x.id === m.id);
    const swap = methods[idx + dir];
    if (!swap) return;
    setBusy(m.id);
    try {
      await Promise.all([
        adminApi.updatePaymentMethod(m.id, { sortOrder: swap.sortOrder }),
        adminApi.updatePaymentMethod(swap.id, { sortOrder: m.sortOrder }),
      ]);
      await load();
    } catch (err) { console.error(err); } finally { setBusy(null); }
  };

  return (
    <AdminCard
      title="Méthodes de paiement"
      icon={CreditCard}
      action={
        <button onClick={() => setCreating(true)} className="btn-dz-primary !px-4 !py-2 !text-[12px]">
          <Plus size={14} /> Ajouter
        </button>
      }
    >
      {loading ? (
        <LoadingBlock />
      ) : methods.length === 0 ? (
        <EmptyState icon={CreditCard} title="Aucune méthode de paiement" hint="Ajoute ta première méthode (RedotPay, BaridiMob…)." />
      ) : (
        <div className="space-y-3">
          {methods.map((m, i) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xl shrink-0">{m.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-white text-[14px]">{m.name}</p>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-white/40 border border-white/10">{m.code}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dz-emerald/10 text-dz-emerald border border-dz-emerald/20">{TYPE_LABELS[m.type]}</span>
                  {!m.enabled && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-white/30 border border-white/10">Masqué</span>}
                </div>
                {m.description && <p className="text-[11px] text-white/35 truncate mt-0.5">{m.description}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <div className="flex flex-col mr-1">
                  <button onClick={() => move(m, -1)} disabled={i === 0 || busy === m.id} className="p-0.5 text-white/20 hover:text-white disabled:opacity-20 cursor-pointer"><ArrowUp size={12} /></button>
                  <button onClick={() => move(m, 1)} disabled={i === methods.length - 1 || busy === m.id} className="p-0.5 text-white/20 hover:text-white disabled:opacity-20 cursor-pointer"><ArrowDown size={12} /></button>
                </div>
                <Toggle checked={m.enabled} onChange={() => toggleEnabled(m)} disabled={busy === m.id} />
                <button onClick={() => setEditing(m)} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><Pencil size={15} /></button>
                <button onClick={() => { if (window.confirm(`Supprimer ${m.name} ?`)) adminApi.deletePaymentMethod(m.id).then(load); }} className="p-2 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={creating || editing !== null} onClose={() => { setCreating(false); setEditing(null); }} title={editing ? `Modifier — ${editing.name}` : 'Nouvelle méthode de paiement'} wide>
        <PaymentMethodForm
          key={editing?.id || 'new'}
          initial={editing ? { ...editing, instructions: [...editing.instructions], details: { ...(editing.details || {}) } } : undefined}
          onDone={() => { setCreating(false); setEditing(null); load(); }}
        />
      </Modal>
    </AdminCard>
  );
}

function PaymentMethodForm({ initial, onDone }: { initial?: Partial<PaymentMethod>; onDone: () => void }) {
  const [form, setForm] = useState(() => {
    if (!initial) return emptyForm();
    return {
      code: initial.code || '', name: initial.name || '', description: initial.description || '',
      emoji: initial.emoji || '💳', type: (initial.type || 'manual') as PaymentMethod['type'],
      instructions: (Array.isArray(initial.instructions) && initial.instructions.length ? initial.instructions : ['']),
      details: { beneficiary: '', iban: '', bic: '', idNumber: '', target: '', ...(initial.details || {}) },
      enabled: initial.enabled !== false, sortOrder: initial.sortOrder || 0,
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm(f => ({ ...f, [k]: v }));

  const setInstruction = (i: number, v: string) =>
    set('instructions', form.instructions.map((s, idx) => (idx === i ? v : s)));
  const addInstruction = () => set('instructions', [...form.instructions, '']);
  const removeInstruction = (i: number) => set('instructions', form.instructions.filter((_, idx) => idx !== i));

  const setDetail = (k: string, v: string) => set('details', { ...form.details, [k]: v });

  const submit = async () => {
    setSaving(true);
    setError('');
    const payload = {
      code: form.code,
      name: form.name,
      description: form.description || null,
      emoji: form.emoji,
      type: form.type,
      instructions: form.instructions.map(s => s.trim()).filter(Boolean),
      enabled: form.enabled,
      sortOrder: form.sortOrder,
    };
    const details: Record<string, string> = {};
    if (form.type === 'bank') {
      for (const k of ['beneficiary', 'iban', 'bic', 'idNumber']) if (form.details[k]) details[k] = form.details[k];
    } else if (form.type === 'email') {
      if (form.details.target) details.target = form.details.target;
    }
    try {
      if (initial?.id) await adminApi.updatePaymentMethod(initial.id, { ...payload, details: Object.keys(details).length ? details : null });
      else await adminApi.createPaymentMethod({ ...payload, details: Object.keys(details).length ? details : null });
      onDone();
    } catch (err: any) {
      setError(err?.message || 'Erreur.');
    } finally { setSaving(false); }
  };

  const bankFields: { key: string; label: string }[] = [
    { key: 'beneficiary', label: 'Bénéficiaire' },
    { key: 'iban', label: 'IBAN' },
    { key: 'bic', label: 'BIC / SWIFT' },
    { key: 'idNumber', label: "N° Identifiant" },
  ];

  return (
    <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nom"><input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="RedotPay" /></Field>
        <Field label="Code (unique, slug)" hint="ex: redotpay"><input value={form.code} onChange={e => set('code', e.target.value)} className={inputCls} placeholder="redotpay" /></Field>
      </div>
      <div className="grid grid-cols-[70px_1fr] gap-3">
        <Field label="Emoji"><input value={form.emoji} onChange={e => set('emoji', e.target.value)} className={cn(inputCls, 'text-center')} /></Field>
        <Field label="Type"><div className="grid grid-cols-3 gap-1.5">
          {(['email', 'bank', 'manual'] as const).map(t => (
            <button key={t} onClick={() => set('type', t)} className={cn(
              'rounded-lg border px-2 py-2 text-[12px] font-semibold transition-all cursor-pointer',
              form.type === t ? 'bg-dz-emerald/10 border-dz-emerald/40 text-dz-emerald' : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:border-white/20'
            )}>{TYPE_LABELS[t]}</button>
          ))}
        </div></Field>
      </div>
      <Field label="Description"><input value={form.description} onChange={e => set('description', e.target.value)} className={inputCls} placeholder="Paiement en ligne rapide et sécurisé" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ordre d'affichage"><input type="number" value={form.sortOrder} onChange={e => set('sortOrder', Number(e.target.value))} className={inputCls} /></Field>
        <div className="flex items-end"><button onClick={() => set('enabled', !form.enabled)} className="flex items-center gap-2 text-[13px] text-white/60 cursor-pointer mb-2"><Toggle checked={form.enabled} onChange={v => set('enabled', v)} /> {form.enabled ? 'Visible dans le checkout' : 'Masquée'}</button></div>
      </div>

      {form.type === 'email' && (
        <Field label="Email de réception (optionnel)" hint="Par défaut : ADMIN_EMAIL">
          <input value={form.details.target} onChange={e => setDetail('target', e.target.value)} className={inputCls} placeholder="admin@dzads.ai" />
        </Field>
      )}

      {form.type === 'bank' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
          {bankFields.map(f => (
            <Field key={f.key} label={f.label}>
              <input value={form.details[f.key]} onChange={e => setDetail(f.key, e.target.value)} className={inputCls} />
            </Field>
          ))}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">Instructions (étapes)</span>
          <button onClick={addInstruction} className="text-[11px] text-dz-emerald hover:text-dz-gold flex items-center gap-1 cursor-pointer"><Plus size={12} /> Ajouter</button>
        </div>
        <div className="space-y-2">
          {form.instructions.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-[10px] font-bold text-white/40 shrink-0">{i + 1}</span>
              <input value={step} onChange={e => setInstruction(i, e.target.value)} className={inputCls} placeholder="Ouvre l'application…" />
              <button onClick={() => removeInstruction(i)} className="p-1.5 rounded-lg text-white/25 hover:text-rose-400 transition-colors cursor-pointer shrink-0"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/25 mt-2">Astuce : utilise <span className="text-dz-emerald font-mono">{"{amount}"}</span>, <span className="text-dz-emerald font-mono">{"{target}"}</span> et <span className="text-dz-emerald font-mono">{"{plan}"}</span> comme variables dynamiques.</p>
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
