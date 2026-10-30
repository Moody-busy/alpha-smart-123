import { useEffect, useMemo, useState } from 'react';
import { Search, Pencil, Trash2, Video as VideoIcon, Loader2 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import EditVideoDialog from '@/components/admin/EditVideoDialog';
import moment from 'moment';

export default function VideosPanel() {
  const { toast } = useToast();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    (async () => {
      const page = await base44.entities.Video.filter({}, { sort: '-created_date', limit: 100 });
      setVideos(page.items ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return videos;
    return videos.filter(
      (v) =>
        (v.title ?? '').toLowerCase().includes(q) ||
        (v.category ?? '').toLowerCase().includes(q) ||
        (v.uploader_name ?? '').toLowerCase().includes(q)
    );
  }, [videos, search]);

  const remove = async (video) => {
    setBusyId(video.id);
    try {
      await base44.entities.Video.delete(video.id);
      setVideos((prev) => prev.filter((v) => v.id !== video.id));
      toast({ title: 'Lesson deleted', description: video.title });
    } catch (err) {
      toast({ title: 'Could not delete lesson', description: err?.message ?? 'Try again.', variant: 'destructive' });
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  };

  const handleSaved = (updated) => {
    setVideos((prev) => prev.map((v) => (v.id === updated.id ? { ...v, ...updated } : v)));
    setEditing(null);
    toast({ title: 'Lesson updated', description: updated.title });
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-card border border-border/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search lessons by title, category or uploader..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border/60 text-sm focus:outline-none focus:border-primary/60 focus:gold-glow transition-all"
        />
      </div>

      <div className="rounded-2xl bg-card border border-border/50 divide-y divide-border/40">
        {filtered.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No lessons found.</p>
        )}
        {filtered.map((video) => (
          <div key={video.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <div className="w-16 h-10 rounded-md overflow-hidden bg-secondary flex items-center justify-center shrink-0">
              {video.thumbnail_url ? (
                <Image src={video.thumbnail_url} alt={video.title} className="w-full h-full" />
              ) : (
                <VideoIcon className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{video.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {video.category} · {video.uploader_name ?? 'Unknown'} ·{' '}
                {video.created_date ? moment(video.created_date).format('DD MMM YYYY') : '—'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setEditing(video)}
                title="Edit lesson"
                className="w-9 h-9 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              {confirmId === video.id ? (
                <>
                  <button
                    onClick={() => remove(video)}
                    disabled={busyId === video.id}
                    className="px-3 h-9 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {busyId === video.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="px-3 h-9 rounded-lg border border-border/60 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmId(video.id)}
                  title="Delete lesson"
                  className="w-9 h-9 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditVideoDialog video={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}
    </div>
  );
}