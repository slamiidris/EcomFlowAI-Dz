import { useEffect, useState } from 'react';
import { Key, Settings, Globe, Trash2, Edit2, X, Loader2, Check, Mail, Zap } from 'lucide-react';
import { adminApi, type ApiSettingsRow, type PlatformConfig } from '../../services/admin';
import { AdminCard, EmptyState, Field, LoadingBlock, Modal, inputCls } from './AdminUI';
import { cn } from '../../lib/utils';

const API_ROWS: { key: string; label: string; group: string }[] = [
  { key: 'facebookAdsToken', label: 'FB Ads Token', group: 'Facebook' },
  { key: 'facebookAccountId', label: 'FB Account ID', group: 'Facebook' },
  { key: 'tiktokAdsToken', label: 'TikTok Ads Token', group: 'TikTok' },
  { key: 'tiktokAccountId', label: 'TikTok Account ID', group: 'TikTok' },
  { key: 'googleAdsCustomerId', label: 'Customer ID', group: 'Google Ads' },
  { key: 'googleAdsDeveloperToken', label: 'Developer Token', group: 'Google Ads' },
  { key: 'snapAdsToken', label: 'Snap Ads Token', group: 'Snap' },
  { key: 'snapAccountId', label: 'Snap Account ID', group: 'Snap' },
  { key: 'geminiApiKey', label: 'Gemini API Key', group: 'IA' },
  { key: 'customApiToken', label: 'Custom Token', group: 'Divers' },
  { key: 'workspaceName', label: 'Workspace', group: 'Divers' },
];

function maskKey(k?: string | null) {
  if (!k) return null;
  if (k.length <= 8) return '••••••••';
  return `${k.slice(0, 4)}•••${k.slice(-4)}`;
}

export default function AdminApis() {
  const [rows, setRows] = useState<ApiSettingsRow[]>([]);
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<ApiSettingsRow | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([adminApi.apiSettings(), adminApi.platformConfig()]);
      setRows(r);
      setConfig(c);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const connected = (u: ApiSettingsRow) => {
    if (!u.apiSettings) return [];
    return API_ROWS.filter(r => r.key !== 'workspaceName' && u.apiSettings?.[r.key as keyof typeof u.apiSettings]);
  };

  return (
    <div className="space-y-6">
      {/* Platform config */}
      <AdminCard title="Configuration de la plateforme" icon={Settings}>
        {loading || !config ? (
          <LoadingBlock />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Email', sub: config.email, active: config.email !== 'console', icon: Mail },
              { label: 'Google OAuth', active: config.googleOauth, icon: Globe },
              { label: 'Telegram Scout', active: config.telegramScout, icon: Zap },
            ].map(item => (
              <div key={item.label} className={cn(
                'rounded-xl border p-3.5 transition-all',
                item.active ? 'bg-dz-emerald/5 border-dz-emerald/30' : 'bg-white/[0.02] border-white/[0.06]'
              )}>
                <div className="flex items-center gap-2 mb-1.5">
                  <item.icon size={14} className={item.active ? 'text-dz-emerald' : 'text-white/30'} />
                  <span className="text-[12px] font-semibold text-white">{item.label}</span>
                </div>
                <p className={cn('text-[11px]', item.active ? 'text-dz-emerald' : 'text-white/30')}>
                  {item.active ? 'Configuré' : item.sub || 'Non configuré'}
                </p>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Per-user API table */}
      <AdminCard title="API par utilisateur" icon={Key}>
        {loading ? (
          <LoadingBlock />
        ) : rows.length === 0 ? (
          <EmptyState icon={Key} title="Aucun utilisateur" />
        ) : (
          <div className="overflow-x-auto -mx-5 sm:-mx-6">
            <table className="w-full text-left text-[13px] min-w-[600px]">
              <thead>
                <tr className="text-[10px] font-mono uppercase tracking-wider text-white/30 border-b border-white/[0.06]">
                  <th className="px-5 sm:px-6 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Intégrations connectées</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(u => {
                  const c = connected(u);
                  return (
                    <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 sm:px-6 py-3">
                        <p className="font-semibold text-white">{u.name}</p>
                        <p className="text-[11px] text-white/35">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {c.length === 0 ? (
                          <span className="text-[12px] text-white/25">Aucune</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {c.slice(0, 6).map(r => (
                              <span key={r.key} className="text-[10px] font-mono px-2 py-0.5 rounded bg-dz-emerald/10 text-dz-emerald border border-dz-emerald/20">
                                {r.group}
                              </span>
                            ))}
                            {c.length > 6 && <span className="text-[10px] text-white/30">+{c.length - 6}</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setEditUser(u)} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><Edit2 size={15} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Edit modal */}
      <Modal open={editUser !== null} onClose={() => setEditUser(null)} title={`API — ${editUser?.name ?? ''}`} wide>
        {editUser && <EditApiSettings user={editUser} onDone={() => { setEditUser(null); load(); }} />}
      </Modal>
    </div>
  );
}

function EditApiSettings({ user, onDone }: { user: ApiSettingsRow; onDone: () => void }) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const r of API_ROWS) {
      v[r.key] = (user.apiSettings as any)?.[r.key] ?? '';
    }
    return v;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await adminApi.updateApiSettings(user.id, form as any);
      onDone();
    } catch (err: any) {
      setError(err?.message || 'Erreur.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer les API keys de ${user.name} ?`)) return;
    try { await adminApi.deleteApiSettings(user.id); onDone(); } catch (err) { console.error(err); }
  };

  const grouped = API_ROWS.reduce<Record<string, typeof API_ROWS>>((acc, r) => {
    (acc[r.group] = acc[r.group] || []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
      {Object.entries(grouped).map(([group, fields]) => (
        <div key={group}>
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/35 mb-3">{group}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(f => (
              <Field key={f.key} label={f.label} hint={f.key.includes('Token') || f.key.includes('ApiKey') ? `actuel: ${maskKey(user.apiSettings?.[f.key as keyof typeof user.apiSettings]) || '—'}` : undefined}>
                <input value={form[f.key]} onChange={e => update(f.key, e.target.value)} className={inputCls} placeholder={f.key.includes('Token') || f.key.includes('ApiKey') ? 'Laisser vide pour garder l\'actuel' : ''} />
              </Field>
            ))}
          </div>
        </div>
      ))}
      {error && <p className="text-[12px] text-rose-400">{error}</p>}
      <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
        <button onClick={submit} disabled={saving} className="btn-dz-primary flex-1 disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Enregistrer
        </button>
        <button onClick={handleDelete} className="btn-dz-danger px-4">
          <Trash2 size={14} />
        </button>
        <button onClick={onDone} className="btn-dz-secondary px-4"><X size={14} /></button>
      </div>
    </div>
  );
}
