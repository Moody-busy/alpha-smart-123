import { useEffect, useState } from 'react';
import { Megaphone, Loader2, Trash2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

export default function AnnouncementsPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const page = await base44.entities.Message.filter(
      { created_by_id: user?.id },
      { sort: '-created_date', limit: 20 }
    );
    setPosts(page.items ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) load();
  }, [user?.id]);

  const post = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      await base44.entities.Message.create({
        text: body,
        user_name: user?.full_name ?? 'Admin',
        user_role: 'Teacher',
      });
      setText('');
      await load();
      toast({ title: 'Announcement posted', description: 'It is live in the global chat.' });
    } catch (err) {
      toast({
        title: 'Could not post announcement',
        description: err?.message ?? 'Try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const remove = async (message) => {
    setBusyId(message.id);
    try {
      await base44.entities.Message.delete(message.id);
      setPosts((prev) => prev.filter((m) => m.id !== message.id));
      toast({ title: 'Announcement removed' });
    } catch (err) {
      toast({
        title: 'Could not remove announcement',
        description: err?.message ?? 'Try again.',
        variant: 'destructive',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={post} className="rounded-2xl bg-card border border-border/50 p-5">
        <label className="block">
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            <Megaphone className="w-3.5 h-3.5 text-primary" /> New announcement
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            maxLength={600}
            placeholder="Share news, a study reminder or an update with everyone in the hub..."
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border/60 text-sm resize-none focus:outline-none focus:border-primary/60 transition-colors"
          />
        </label>
        <div className="flex items-center justify-between gap-3 mt-3">
          <span className="text-[11px] text-muted-foreground">{text.length}/600 · posts to the global chat</span>
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:gold-glow transition-all disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Post announcement
          </button>
        </div>
      </form>

      <div>
        <h3 className="font-display font-semibold mb-3">Your recent announcements</h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card border border-border/40 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="rounded-2xl bg-card border border-border/50 px-5 py-10 text-center text-sm text-muted-foreground">
            You haven't posted anything yet.
          </p>
        ) : (
          <div className="rounded-2xl bg-card border border-border/50 divide-y divide-border/40">
            {posts.map((message) => (
              <div key={message.id} className="flex items-start gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed break-words">{message.text}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {message.created_date ? moment(message.created_date).format('DD MMM YYYY · HH:mm') : ''}
                  </p>
                </div>
                <button
                  onClick={() => remove(message)}
                  disabled={busyId === message.id}
                  aria-label="Remove announcement"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 shrink-0"
                >
                  {busyId === message.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}