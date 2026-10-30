import { useEffect, useState } from 'react';
import { Trash2, Loader2, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

export default function MessagesPanel() {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    (async () => {
      const page = await base44.entities.Message.filter({}, { sort: '-created_date', limit: 100 });
      setMessages(page.items ?? []);
      setLoading(false);
    })();
  }, []);

  const remove = async (message) => {
    setBusyId(message.id);
    try {
      await base44.entities.Message.delete(message.id);
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
      toast({ title: 'Message removed' });
    } catch (err) {
      toast({ title: 'Could not remove message', description: err?.message ?? 'Try again.', variant: 'destructive' });
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-card border border-border/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border/50 divide-y divide-border/40">
      {messages.length === 0 && (
        <div className="px-5 py-14 text-center">
          <MessageCircle className="w-6 h-6 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No messages in the global chat yet.</p>
        </div>
      )}
      {messages.map((message) => (
        <div key={message.id} className="flex flex-wrap items-start gap-3 px-5 py-4">
          <div className="w-8 h-8 rounded-full border border-primary/40 bg-secondary flex items-center justify-center text-xs font-medium shrink-0">
            {(message.user_name?.[0] ?? '?').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1">
              <span className="text-foreground font-medium">{message.user_name}</span> · {message.user_role} ·{' '}
              {message.created_date ? moment(message.created_date).fromNow() : '—'}
            </p>
            <p className="text-sm break-words">{message.text}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {confirmId === message.id ? (
              <>
                <button
                  onClick={() => remove(message)}
                  disabled={busyId === message.id}
                  className="px-3 h-8 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  {busyId === message.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmId(null)}
                  className="px-3 h-8 rounded-lg border border-border/60 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmId(message.id)}
                title="Remove message"
                className="w-8 h-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}