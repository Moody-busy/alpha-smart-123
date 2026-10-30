import { useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const CATEGORIES = ['Mathematics', 'Science', 'Programming', 'Languages', 'History', 'Art'];

export default function EditVideoDialog({ video, onClose, onSaved }) {
  const { toast } = useToast();
  const [title, setTitle] = useState(video.title ?? '');
  const [category, setCategory] = useState(video.category ?? 'Mathematics');
  const [description, setDescription] = useState(video.description ?? '');
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const changes = { title, category, description };
      await base44.entities.Video.update(video.id, changes);
      onSaved({ ...video, ...changes });
    } catch (err) {
      toast({ title: 'Could not save lesson', description: err?.message ?? 'Try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border/60 gold-glow p-6 msg-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl font-semibold gold-text">Edit Lesson</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={save} className="space-y-4">
          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Title
            </span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="input-base" />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Category
            </span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-base resize-none"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border/60 text-sm font-medium hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:gold-glow transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}