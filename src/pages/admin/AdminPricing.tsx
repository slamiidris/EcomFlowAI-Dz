import { useEffect, useMemo, useState } from 'react';
import { Coins, Loader2, Save, Check } from 'lucide-react';
import { adminApi } from '../../services/admin';
import { AdminCard, Field, LoadingBlock, inputCls } from './AdminUI';
import { DEFAULT_PRICING, type PricingConfig, buildPlans } from '../../lib/pricing';
import { cn } from '../../lib/utils';

export default function AdminPricing() {
  const [form, setForm] = useState<PricingConfig>(DEFAULT_PRICING);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      setForm(await adminApi.pricing());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const set = (patch: Partial<PricingConfig>) => {
    setForm(f => ({ ...f, ...patch }));
    setSaved(false);
    setError('');
  };

  const preview = useMemo(() => buildPlans(form), [form]);

  const submit = async () => {
    const prices = [form.monthlyPrice, form.quarterlyPrice, form.lifetimePrice];
    if (prices.some(p => !Number.isInteger(p) || p < 0)) {
      setError('Les prix doivent être des nombres entiers positifs.');
      return;
    }
    if (!form.currencyCode.trim() || !form.currencySymbol.trim()) {
      setError('Le code et le symbole de la devise sont requis.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await adminApi.updatePricing(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminCard title="Tarifs & Devise" icon={Coins}
      action={
        <button onClick={submit} disabled={saving} className="btn-dz-primary !px-4 !py-2 !text-[12px] flex items-center gap-1.5 disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'Enregistré' : 'Enregistrer'}
        </button>
      }
    >
      {loading ? (
        <LoadingBlock />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Code devise">
                <input
                  className={inputCls}
                  value={form.currencyCode}
                  onChange={e => set({ currencyCode: e.target.value })}
                  placeholder="DA, USD, EUR…"
                  maxLength={16}
                />
              </Field>
              <Field label="Symbole">
                <input
                  className={inputCls}
                  value={form.currencySymbol}
                  onChange={e => set({ currencySymbol: e.target.value })}
                  placeholder="DA, $, دج…"
                  maxLength={16}
                />
              </Field>
            </div>

            <Field label="Position du symbole">
              <select
                className={inputCls}
                value={form.currencyPosition}
                onChange={e => set({ currencyPosition: e.target.value as 'before' | 'after' })}
              >
                <option value="after">Après le montant — « 1 500 DA »</option>
                <option value="before">Avant le montant — « DA 1 500 »</option>
              </select>
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Mensuel">
                <input
                  type="number" min={0} step={1}
                  className={inputCls}
                  value={Number.isFinite(form.monthlyPrice) ? form.monthlyPrice : ''}
                  onChange={e => set({ monthlyPrice: Number(e.target.value) })}
                />
              </Field>
              <Field label="Trimestriel">
                <input
                  type="number" min={0} step={1}
                  className={inputCls}
                  value={Number.isFinite(form.quarterlyPrice) ? form.quarterlyPrice : ''}
                  onChange={e => set({ quarterlyPrice: Number(e.target.value) })}
                />
              </Field>
              <Field label="À vie">
                <input
                  type="number" min={0} step={1}
                  className={inputCls}
                  value={Number.isFinite(form.lifetimePrice) ? form.lifetimePrice : ''}
                  onChange={e => set({ lifetimePrice: Number(e.target.value) })}
                />
              </Field>
            </div>

            {error && <p className="text-[12px] text-rose-400">{error}</p>}
            <p className="text-[11px] text-white/30">
              Ces prix s'appliquent au checkout, à la page de vente et au montant affiché dans les instructions de paiement.
            </p>
          </div>

          {/* Live preview */}
          <div className="space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-wider text-white/40">Aperçu</p>
            {preview.map(p => (
              <div key={p.id} className={cn('surface-card p-4 flex items-center justify-between', p.popular && 'border-dz-emerald/40')}>
                <div>
                  <p className="text-sm font-bold text-white">{p.label}</p>
                  <p className="text-[11px] text-white/40">{p.per}</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-dz-dinar">{p.price}</p>
                  <p className="text-[10px] text-white/35 font-mono">{p.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminCard>
  );
}
