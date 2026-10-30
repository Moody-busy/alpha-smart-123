import { useEffect, useState } from 'react';
import { Award, Loader2, Trash2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

export default function BadgesPanel() {
  const { toast } = useToast();
  const [badges, setBadges] = useState([]);
  const [awards, setAwards] = useState([]);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [badgeName, setBadgeName] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [badgeList, awardList, userList] = await Promise.all([
        base44.entities.Badge.list(),
        base44.entities.UserBadge.list(),
        base44.entities.User.list(),
      ]);
      setBadges(badgeList);
      setAwards(awardList);
      setUsers(userList);
      setBadgeName(badgeList[0]?.name ?? '');
      setUserId(userList[0]?.id ?? '');
      setLoading(false);
    })();
  }, []);

  const award = async (e) => {
    e.preventDefault();
    const user = users.find((u) => u.id === userId);
    const badge = badges.find((b) => b.name === badgeName);
    if (!user || !badge) return;
    setSaving(true);
    try {
      const created = await base44.entities.UserBadge.create({
        user_id: user.id,
        user_name: user.full_name ?? user.email,
        badge_name: badge.name,
        badge_icon_key: badge.icon_key,
      });
      setAwards((prev) => [created, ...prev]);
      toast({ title: 'Badge awarded', description: `${badge.name} → ${user.full_name ?? user.email}` });
    } catch (err) {
      toast({ title: 'Could not award badge', description: err?.message ?? 'Try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (award) => {
    try {
      await base44.entities.UserBadge.delete(award.id);
      setAwards((prev) => prev.filter((a) => a.id !== award.id));
      toast({ title: 'Badge revoked', description: award.badge_name });
    } catch (err) {
      toast({ title: 'Could not revoke badge', description: err?.message ?? 'Try again.', variant: 'destructive' });
    } finally {
      setConfirmId(null);
    }
  };

  if (loading) {
    return <div className="h-40 rounded-2xl bg-card border border-border/40 animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={award}
        className="rounded-2xl bg-card border border-border/50 p-5 flex flex-col md:flex-row md:items-end gap-3"
      >
        <label className="flex-1 min-w-0">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
            Member
          </span>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className="input-base">
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name ?? 'Unnamed'} — {u.email}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 min-w-0">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
            Badge
          </span>
          <select value={badgeName} onChange={(e) => setBadgeName(e.target.value)} className="input-base">
            {badges.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={saving || !users.length || !badges.length}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:gold-glow transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Award
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badges.map((badge) => (
          <div key={badge.id} className="rounded-2xl bg-card border border-border/50 p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/40 flex items-center justify-center shrink-0 badge-glow">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-display font-semibold text-sm">{badge.name}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{badge.description}</p>
              <p className="text-[11px] text-primary mt-2">
                Unlocks at {badge.threshold} {badge.metric === 'Quizzes' ? 'quizzes' : 'lessons'} ·{' '}
                {awards.filter((a) => a.badge_name === badge.name).length} awarded
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border/50 divide-y divide-border/40">
        <p className="px-5 pt-4 pb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Awarded badges ({awards.length})
        </p>
        {awards.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">No badges awarded yet.</p>
        )}
        {awards.map((award) => (
          <div key={award.id} className="flex items-center gap-3 px-5 py-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{award.badge_name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {award.user_name}
                {award.created_date ? ` · ${moment(award.created_date).format('DD MMM YYYY')}` : ''}
              </p>
            </div>
            {confirmId === award.id ? (
              <>
                <button
                  onClick={() => revoke(award)}
                  className="px-3 h-8 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium"
                >
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
                onClick={() => setConfirmId(award.id)}
                title="Revoke badge"
                className="w-8 h-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}