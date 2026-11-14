import { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { exportImage } from '../lib/exportPng.js';
import { toast } from '../lib/toast.js';

// Deux boutons d'export pour le bloc désigné par targetRef : image normale et story 9:16.
export default function ExportButtons({ targetRef, filename, title, subtitle, compact = false }) {
  const [busy, setBusy] = useState(null); // 'image' | 'story' | null

  async function run(story) {
    if (!targetRef.current) return;
    setBusy(story ? 'story' : 'image');
    try {
      await exportImage(targetRef.current, { filename, title, subtitle, story });
      toast(story ? 'Story téléchargée' : 'Image téléchargée');
    } catch (err) {
      console.error(err);
      toast("L'export a échoué. Réessaie.", { error: true });
    } finally {
      setBusy(null);
    }
  }

  const size = compact ? 'px-3 py-1.5' : '';
  return (
    <div className="flex shrink-0 gap-2" data-no-export>
      <button type="button" className={`btn btn-primary ${size}`} onClick={() => run(false)} disabled={busy !== null}>
        <Download className="size-4" aria-hidden="true" />
        {busy === 'image' ? 'Export…' : 'Image'}
      </button>
      <button
        type="button"
        className={`btn btn-quiet ${size}`}
        onClick={() => run(true)}
        disabled={busy !== null}
        title="Image verticale 1080 × 1920 pour les stories"
      >
        <Smartphone className="size-4" aria-hidden="true" />
        {busy === 'story' ? 'Export…' : 'Story'}
      </button>
    </div>
  );
}
