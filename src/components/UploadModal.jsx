import { useState } from 'react';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { checkAndAssignBadges } from '@/lib/gamification';

const CATEGORIES = ['Mathematics', 'Science', 'Programming', 'Languages', 'History', 'Islamic', 'Art'];

export default function UploadModal({ open, onClose, onUploaded }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Mathematics');
  const [thumbnail, setThumbnail] = useState(null);
  const [video, setVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const reset = () => {
    setTitle('');
    setDescription('');
    setCategory('Mathematics');
    setThumbnail(null);
    setVideo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !video) {
      toast({ title: 'Title and video file are required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      // AI gate: nothing is uploaded or published unless the lesson is educational
      const check = await base44.functions.invoke('moderateVideo', { title, description, category });
      if (check.data?.allowed === false) {
        toast({
          title: 'Upload removed — not a learning lesson',
          description: check.data.reason || 'Alpha Smart only accepts educational content.',
          variant: 'destructive',
        });
        return;
      }

      // Upload thumbnail (public so it renders in cards)
      let thumbnail_url = '';
      if (thumbnail) {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: thumbnail });
        thumbnail_url = file_url;
      }
      // Upload video (public so it streams to all users)
      const { file_url: video_url } = await base44.integrations.Core.UploadPublicFile({ file: video });

      await base44.entities.Video.create({
        title,
        description,
        category,
        thumbnail_url,
        video_url,
        uploader_name: user?.full_name ?? 'Anonymous',
        uploader_role: user?.account_type ?? (user?.role === 'admin' ? 'Teacher' : 'Student'),
      });

      // Gamification: award every badge this upload has unlocked
      const { awarded } = await checkAndAssignBadges(
        user?.id,
        user?.full_name ?? 'Anonymous',
        user?.account_type ?? (user?.role === 'admin' ? 'Teacher' : 'Student')
      );
      if (awarded.length > 0) {
        toast({
          title: awarded.length === 1 ? `${awarded[0].name} Unlocked!` : `${awarded.length} Badges Unlocked!`,
          description: awarded.map((badge) => badge.name).join(' · '),
        });
      } else {
        toast({ title: 'Lesson published', description: 'Your video is now live on the hub.' });
      }
      reset();
      onClose();
      onUploaded?.();
    } catch (err) {
      toast({ title: 'Upload failed', description: err?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border/60 gold-glow p-6 msg-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl font-semibold gold-text">Upload a Lesson</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Understanding Quantum Mechanics"
              className="input-base"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Briefly describe what students will learn..."
              className="input-base resize-none"
            />
          </Field>

          <Field label="Subject Category">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-card text-foreground">
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Custom Thumbnail (optional)">
            <FileDrop file={thumbnail} onFile={setThumbnail} accept="image/*" label="Choose an image" />
          </Field>

          <Field label="Video File">
            <FileDrop file={video} onFile={setVideo} accept="video/*" label="Choose a video" />
          </Field>

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
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:gold-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {submitting ? 'Publishing...' : 'Publish Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

function FileDrop({ file, onFile, accept, label }) {
  return (
    <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-border/70 bg-secondary/40 cursor-pointer hover:border-primary/60 transition-colors">
      <UploadCloud className="w-5 h-5 text-primary" />
      <span className="text-sm flex-1 truncate">{file ? file.name : label}</span>
      <input type="file" accept={accept} className="hidden" onChange={(e) => onFile(e.target.files[0])} />
    </label>
  );
}