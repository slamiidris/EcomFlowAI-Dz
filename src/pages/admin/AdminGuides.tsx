import { useEffect, useState } from 'react';
import { PlaySquare, Plus, Pencil, Trash2, Loader2, Check, X, ArrowDown, ArrowUp, ExternalLink, Video } from 'lucide-react';
import { adminApi, type Guide } from '../../services/admin';
import { AdminCard, EmptyState, Field, LoadingBlock, Modal, Toggle, inputCls } from './AdminUI';
import { cn } from '../../lib/utils';

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return null;
}

export function getYouTubeThumbnail(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`;
  }
  return null;
}

export default function AdminGuides() {
  const [items, setItems] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Guide | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { setItems(await adminApi.guides()); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const toggleActive = async (g: Guide) => {
    setBusy(g.id);
    try { await adminApi.updateGuide(g.id, { active: !g.active }); await load(); } catch (err) { console.error(err); } finally { setBusy(null); }
  };

  const move = async (g: Guide, dir: -1 | 1) => {
    const idx = items.findIndex(x => x.id === g.id);
    const swap = items[idx + dir];
    if (!swap) return;
    try {
      await Promise.all([
        adminApi.updateGuide(g.id, { sortOrder: swap.sortOrder }),
        adminApi.updateGuide(swap.id, { sortOrder: g.sortOrder }),
      ]);
      await load();
    } catch (err) { console.error(err); }
  };

  return (
    <AdminCard
      title="Guides & Tutoriels Vidéo"
      icon={PlaySquare}
      action={
        <button onClick={() => setCreating(true)} className="btn-dz-primary !px-4 !py-2 !text-[12px]">
          <Plus size={14} /> Ajouter un guide vidéo
        </button>
      }
    >
      {loading ? (
        <LoadingBlock />
      ) : items.length === 0 ? (
        <EmptyState icon={Video} title="Aucun guide vidéo" hint="Ajoute des liens de vidéos YouTube pour former tes utilisateurs sur le dashboard." />
      ) : (
        <div className="space-y-3">
          {items.map((g, i) => {
            const thumbnail = getYouTubeThumbnail(g.youtubeUrl);
            return (
              <div key={g.id} className="flex items-center gap-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-3.5 hover:border-white/10 transition-colors">
                <div className="w-24 h-16 rounded-xl bg-black/40 border border-white/10 overflow-hidden relative shrink-0 flex items-center justify-center">
                  {thumbnail ? (
                    <img src={thumbnail} alt={g.title} className="w-full h-full object-cover" />
                  ) : (
                    <Video size={20} className="text-white/30" />
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center">
                      <PlaySquare size={12} />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white text-[14px] truncate">{g.title}</p>
                    {!g.active && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-white/30 border border-white/10">Masqué</span>}
                  </div>
                  {g.description && <p className="text-[11px] text-white/40 truncate mt-0.5">{g.description}</p>}
                  <a href={g.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-mono text-dz-gold hover:underline mt-1">
                    <ExternalLink size={10} /> Voir sur YouTube
                  </a>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex flex-col mr-1">
                    <button onClick={() => move(g, -1)} disabled={i === 0} className="p-0.5 text-white/20 hover:text-white disabled:opacity-20 cursor-pointer"><ArrowUp size={12} /></button>
                    <button onClick={() => move(g, 1)} disabled={i === items.length - 1} className="p-0.5 text-white/20 hover:text-white disabled:opacity-20 cursor-pointer"><ArrowDown size={12} /></button>
                  </div>
                  <Toggle checked={g.active} onChange={() => toggleActive(g)} disabled={busy === g.id} />
                  <button onClick={() => setEditing(g)} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><Pencil size={15} /></button>
                  <button onClick={() => { if (window.confirm(`Supprimer le guide "${g.title}" ?`)) adminApi.deleteGuide(g.id).then(load); }} className="p-2 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={creating || editing !== null} onClose={() => { setCreating(false); setEditing(null); }} title={editing ? 'Modifier le guide vidéo' : 'Nouveau guide vidéo'}>
        <GuideForm key={editing?.id || 'new'} initial={editing || undefined} onDone={() => { setCreating(false); setEditing(null); load(); }} />
      </Modal>
    </AdminCard>
  );
}

function GuideForm({ initial, onDone }: { initial?: Guide; onDone: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    youtubeUrl: initial?.youtubeUrl || '',
    description: initial?.description || '',
    active: initial?.active ?? true,
    sortOrder: initial?.sortOrder || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const embedUrl = getYouTubeEmbedUrl(form.youtubeUrl);

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        youtubeUrl: form.youtubeUrl,
        description: form.description || null,
        active: form.active,
        sortOrder: Number(form.sortOrder) || 0,
      };
      if (initial?.id) await adminApi.updateGuide(initial.id, payload);
      else await adminApi.createGuide(payload);
      onDone();
    } catch (err: any) {
      setError(err?.message || 'Erreur.');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <Field label="Titre du guide"><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} placeholder="Comment lancer une publicité gagnante" /></Field>
      <Field label="Lien vidéo YouTube"><input value={form.youtubeUrl} onChange={e => setForm(f => ({ ...f, youtubeUrl: e.target.value }))} className={inputCls} placeholder="https://www.youtube.com/watch?v=..." /></Field>
      <Field label="Description (optionnelle)"><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={cn(inputCls, 'min-h-[70px] resize-y')} placeholder="Explication succincte du contenu de la vidéo..." /></Field>

      {/* Video Preview */}
      {embedUrl && (
        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video relative">
          <iframe
            src={embedUrl}
            title="Aperçu vidéo"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Ordre"><input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} className={inputCls} /></Field>
        <div className="flex items-end">
          <div onClick={() => setForm(f => ({ ...f, active: !f.active }))} className="flex items-center gap-2 text-[13px] text-white/60 cursor-pointer mb-2 select-none">
            <Toggle checked={form.active} onChange={v => setForm(f => ({ ...f, active: v }))} /> {form.active ? 'Guide actif' : 'Masqué'}
          </div>
        </div>
      </div>
      {error && <p className="text-[12px] text-rose-400">{error}</p>}
      <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
        <button onClick={submit} disabled={saving || !form.title || !form.youtubeUrl} className="btn-dz-primary flex-1 disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Enregistrer
        </button>
        <button onClick={onDone} className="btn-dz-secondary px-4"><X size={14} /></button>
      </div>
    </div>
  );
}
