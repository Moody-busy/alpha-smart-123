import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

export default function WarningsPanel() {
  const { user: me } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState('');
  const [reason, setReason] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    (async () => {
      const [users, page] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Warning.filter({}, { sort: '-created_date', limit: 100 }),
      ]);
      setMembers(users);
      setWarnings(page.items ?? []);
      setLoading(false);
    })();
  }, []);

  const issue = async (e) => {
    e.preventDefault();
    const target = members.find((m) => m.id === memberId);
    const text = reason.trim();
    if (!target || !text) return;
    setIssuing(true);
    try {
      const created = await base44.entities.Warning.create({
        user_id: target.id,
        user_name: target.full_name ?? 'Unnamed member',
        user_email: target.email ?? '',
        reason: text,
        issued_by_name: me?.full_name ?? 'Admin',
        acknowledged: false,
      });
      setWarnings((prev) => [created, ...prev]);
      setMemberId('');
      setReason('');
      toast({
        title: 'Warning issued',
        description: `${target.email ?? 'That member'} will see it the next time they sign in.`,
      });
    } catch (err) {
      toast({
        title: 'Could not issue warning',
        description: err?.message ?? 'Try again.',
        variant: 'destructive',
      });
    } finally {
      setIssuing(false);
    }
  };

  const remove = async (warning) => {
    setBusyId(warning.id);
    try {
      await base44.entities.Warning.delete(warning.id);
      setWarnings((prev) => prev.filter((w) => w.id !== warning.id));
      toast({ title: 'Warning removed' });
    } catch (err) {
      toast({
        title: 'Could not remove warning',
        description: err?.message ?? 'Try again.',
        variant: 'destructive',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={issue} className="rounded-2xl bg-card border border-border/50 p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <AlertTriangle className="w-3.5 h-3.5 text-destructive" /> Flag a member
        </div>

        <label className="block">
          <span className="block text-xs text-muted-foreground mb-1.5">Member</span>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
            className="input-base"
          >
            <option value="">Select a student or teacher...</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name ?? 'Unnamed member'} — {m.email}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-xs text-muted-foreground mb-1.5">What rule was broken?</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            required
            placeholder="Describe the violation so the member understands what to change..."
            className="w-full px-4 py-3 rounded-xl bg-secondary border border-border/60 text-sm resize-none focus:outline-none focus:border-primary/60 transition-colors"
          />
          <span className="block text-[11px] text-muted-foreground mt-1">{reason.length}/500</span>
        </label>

        <button
          type="submit"
          disabled={issuing || !memberId || !reason.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
        >
          {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
          Issue warning
        </button>
      </form>

      <div>
        <h3 className="font-display font-semibold mb-3">Recent warnings</h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card border border-border/40 animate-pulse" />
            ))}
          </div>
        ) : warnings.length === 0 ? (
          <p className="rounded-2xl bg-card border border-border/50 px-5 py-10 text-center text-sm text-muted-foreground">
            No warnings issued. The community is behaving.
          </p>
        ) : (
          <div className="rounded-2xl bg-card border border-border/50 divide-y divide-border/40">
            {warnings.map((warning) => (
              <div key={warning.id} className="flex items-start gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {warning.user_name ?? 'Member'}
                    </p>
                    <span className="text-xs text-muted-foreground truncate">
                      {warning.user_email}
                    </span>
                    {warning.acknowledged ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] text-primary">
                        <CheckCircle2 className="w-3 h-3" /> Acknowledged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/30 text-[10px] text-destructive">
                        <Clock className="w-3 h-3" /> Waiting for member
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 break-words">{warning.reason}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {warning.issued_by_name ? `By ${warning.issued_by_name} · ` : ''}
                    {warning.created_date ? moment(warning.created_date).format('DD MMM YYYY · HH:mm') : ''}
                    {warning.acknowledged && warning.acknowledged_date
                      ? ` · seen ${moment(warning.acknowledged_date).format('DD MMM YYYY')}`
                      : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(warning)}
                  disabled={busyId === warning.id}
                  aria-label="Remove warning"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50 shrink-0"
                >
                  {busyId === warning.id ? (
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