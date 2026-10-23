import { useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, Save, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { directCtaIndex } from '../../lib/landingHtml';
import type { LandingOutput } from './useGenerators';
import '../../i18n/campaigns';
import '../../i18n/funnels';

type LpData = LandingOutput['lpData'];
type Section = Record<string, any>;

const HEX = /^#[0-9a-f]{6}$/i;

/** Edits the words, order and colours of a generated landing page; saving creates a new version. */
export default function SectionEditor({ lpData, onSave, onCancel }: { lpData: LpData; onSave: (next: LpData) => Promise<void>; onCancel: () => void }) {
  const { t } = useLanguage();
  const [sections, setSections] = useState<Section[]>(() => lpData.sections.map((s) => ({ ...s })));
  const [saving, setSaving] = useState(false);
  const [palette, setPalette] = useState<string[]>(() => {
    const base = (lpData.colorPalette ?? []).filter((c) => HEX.test(c));
    return [base[0] ?? '#5b3df5', base[1] ?? '#f59e0b', base[2] ?? '#ffffff'];
  });

  const edit = (i: number, patch: (s: Section) => Section) => setSections((list) => list.map((s, j) => (j === i ? patch(s) : s)));
  const move = (i: number, by: -1 | 1) =>
    setSections((list) => {
      const next = [...list];
      const [item] = next.splice(i, 1);
      next.splice(i + by, 0, item);
      return next;
    });
  // the button text the page publishes: the plain call to action (see directCtaIndex)
  const buttonText = (s: Section) => {
    const variations = s.cta?.variations ?? [];
    return variations[directCtaIndex(variations)]?.text ?? '';
  };
  const setButtonText = (i: number, text: string) =>
    edit(i, (x) => {
      const variations = [...(x.cta?.variations ?? [])];
      const at = directCtaIndex(variations);
      if (at >= 0) variations[at] = { ...variations[at], text };
      else variations.push({ type: 'direct', text });
      return { ...x, cta: { ...x.cta, variations } };
    });
  const editRow = (i: number, r: number, patch: Record<string, string>) =>
    edit(i, (x) => ({ ...x, comparisonTable: (x.comparisonTable as Section[]).map((row, k) => (k === r ? { ...row, ...patch } : row)) }));
  const removeRow = (i: number, r: number) =>
    edit(i, (x) => ({ ...x, comparisonTable: (x.comparisonTable as Section[]).filter((_, k) => k !== r) }));

  // one click, one version: the button stays disabled until the save has answered
  const save = async () => {
    setSaving(true);
    try {
      await onSave({ ...lpData, sections, colorPalette: [...palette, ...(lpData.colorPalette ?? []).slice(3)] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section aria-labelledby="ed-colors" className="ui-card p-5">
        <h3 id="ed-colors" className="text-sm font-semibold text-fg">{t('cmpPageColors', 'Couleurs de la page')}</h3>
        <div className="mt-3 flex flex-wrap gap-4">
          {[t('cmpColorMain', 'Principale'), t('cmpColorAccent', 'Accent'), t('cmpColorBackground', 'Fond')].map((label, i) => (
            <label key={label} className="flex items-center gap-2 text-[13px] text-fg-muted">
              <input type="color" value={palette[i]} onChange={(e) => setPalette((p) => p.map((c, j) => (j === i ? e.target.value : c)))} className="size-9 cursor-pointer rounded-[var(--radius-xs)] border border-line bg-transparent p-0.5" />
              {label}
              <code className="text-xs text-fg-faint" dir="ltr">{palette[i]}</code>
            </label>
          ))}
        </div>
      </section>

      <ol className="space-y-4">
        {sections.map((s, i) => (
          <li key={s.id ?? i} className="ui-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-[var(--radius-xs)] bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary-ink">{t('lpgSection', 'Section')} {i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-xs text-fg-faint">{s.step}</span>
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={t('lpgMonterSection', 'Monter la section')} className="grid size-8 place-items-center rounded-[var(--radius-sm)] text-fg-muted hover:bg-surface-2 disabled:opacity-30"><ArrowUp size={15} /></button>
              <button type="button" disabled={i === sections.length - 1} onClick={() => move(i, 1)} aria-label={t('lpgDescendreSection', 'Descendre la section')} className="grid size-8 place-items-center rounded-[var(--radius-sm)] text-fg-muted hover:bg-surface-2 disabled:opacity-30"><ArrowDown size={15} /></button>
              <button type="button" disabled={sections.length === 1} onClick={() => setSections((list) => list.filter((_, j) => j !== i))} aria-label={t('lpgSupprimerCetteSection', 'Supprimer cette section')} className="grid size-8 place-items-center rounded-[var(--radius-sm)] text-fg-muted hover:bg-danger/10 hover:text-danger-ink disabled:opacity-30"><Trash2 size={15} /></button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-[13px] font-medium text-fg">
                {t('cmpHeadline', 'Grand titre')}
                <input dir="auto" className="input-dz mt-1.5" value={s.textOverlay?.headline ?? ''} onChange={(e) => edit(i, (x) => ({ ...x, textOverlay: { ...x.textOverlay, headline: e.target.value } }))} />
              </label>
              <label className="block text-[13px] font-medium text-fg">
                {t('cmpSubheadline', 'Sous-titre')}
                <input dir="auto" className="input-dz mt-1.5" value={s.textOverlay?.subtext ?? ''} onChange={(e) => edit(i, (x) => ({ ...x, textOverlay: { ...x.textOverlay, subtext: e.target.value } }))} />
              </label>
              <label className="block text-[13px] font-medium text-fg">
                {t('cmpSectionTitle', 'Titre de la section')}
                <input dir="auto" className="input-dz mt-1.5" value={s.title ?? ''} onChange={(e) => edit(i, (x) => ({ ...x, title: e.target.value }))} />
              </label>
              <label className="block text-[13px] font-medium text-fg">
                {t('cmpButtonText', 'Texte du bouton')}
                <input dir="auto" className="input-dz mt-1.5" value={buttonText(s)} onChange={(e) => setButtonText(i, e.target.value)} />
              </label>
              <label className="block text-[13px] font-medium text-fg md:col-span-2">
                {t('cmpSectionText', 'Texte')}
                <textarea dir="auto" className="input-dz mt-1.5 min-h-24 resize-y" value={s.content ?? ''} onChange={(e) => edit(i, (x) => ({ ...x, content: e.target.value }))} />
              </label>
              {Array.isArray(s.benefits) && (
                <label className="block text-[13px] font-medium text-fg md:col-span-2">
                  {t('cmpBenefits', 'Avantages (un par ligne)')}
                  <textarea
                    dir="auto"
                    className="input-dz mt-1.5 min-h-20 resize-y"
                    value={s.benefits.join('\n')}
                    onChange={(e) => edit(i, (x) => ({ ...x, benefits: e.target.value.split('\n') }))}
                    onBlur={() => edit(i, (x) => ({ ...x, benefits: (x.benefits as string[]).map((b) => b.trim()).filter(Boolean) }))}
                  />
                </label>
              )}
              {s.guaranteeDetails && (
                <>
                  <label className="block text-[13px] font-medium text-fg">
                    {t('cmpGuaranteeTitle', 'Garantie : titre')}
                    <input dir="auto" className="input-dz mt-1.5" value={s.guaranteeDetails.title ?? ''} onChange={(e) => edit(i, (x) => ({ ...x, guaranteeDetails: { ...x.guaranteeDetails, title: e.target.value } }))} />
                  </label>
                  <label className="block text-[13px] font-medium text-fg">
                    {t('cmpGuaranteeText', "Garantie : ce qu'elle couvre")}
                    <input dir="auto" className="input-dz mt-1.5" value={s.guaranteeDetails.description ?? ''} onChange={(e) => edit(i, (x) => ({ ...x, guaranteeDetails: { ...x.guaranteeDetails, description: e.target.value } }))} />
                  </label>
                  <p className="text-xs text-fg-muted md:col-span-2">{t('cmpGuaranteeNote', 'Affichée seulement si, dans la page prête, tu coches une garantie ou la vérification avant paiement.')}</p>
                </>
              )}
              {Array.isArray(s.comparisonTable) && s.comparisonTable.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-[13px] font-medium text-fg">{t('cmpCompare', 'Tableau comparatif')}</p>
                  <div className="mt-1.5 space-y-2">
                    {(s.comparisonTable as Section[]).map((row, r) => (
                      <div key={r} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                        <input dir="auto" className="input-dz" aria-label={t('cmpCompareFeature', 'Critère')} placeholder={t('cmpCompareFeature', 'Critère')} value={row.feature ?? ''} onChange={(e) => editRow(i, r, { feature: e.target.value })} />
                        <input dir="auto" className="input-dz" aria-label={t('cmpCompareOurs', 'Ton produit')} placeholder={t('cmpCompareOurs', 'Ton produit')} value={row.product ?? ''} onChange={(e) => editRow(i, r, { product: e.target.value })} />
                        <input dir="auto" className="input-dz" aria-label={t('cmpCompareOthers', 'Les autres')} placeholder={t('cmpCompareOthers', 'Les autres')} value={row.competitor ?? ''} onChange={(e) => editRow(i, r, { competitor: e.target.value })} />
                        <button type="button" onClick={() => removeRow(i, r)} aria-label={t('cmpCompareRemove', 'Retirer cette ligne')} className="grid size-11 place-items-center rounded-[var(--radius-sm)] text-fg-muted hover:bg-danger/10 hover:text-danger-ink"><Trash2 size={15} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-line bg-bg/95 py-3">
        <button type="button" onClick={onCancel} className="btn-dz-secondary">{t('cmpCancel', 'Annuler')}</button>
        <button type="button" onClick={() => void save()} disabled={saving} className="btn-dz-primary disabled:opacity-60">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {t('cmpSaveVersion', 'Enregistrer une nouvelle version')}</button>
      </div>
    </div>
  );
}
