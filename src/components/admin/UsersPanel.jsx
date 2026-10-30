import { useEffect, useMemo, useState } from 'react';
import { Search, UserPlus, Loader2, Trash2, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { isOwner } from '@/lib/admin';
import { cn } from '@/lib/utils';
import moment from 'moment';

const ROLE_LABELS = { admin: 'Admin', teacher: 'Teacher', student: 'Student' };

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'teacher', label: 'Teachers' },
  { id: 'student', label: 'Students' },
  { id: 'admin', label: 'Admins' },
];

const memberRole = (u) =>
  u?.role === 'admin' ? 'admin' : u?.account_type === 'Teacher' ? 'teacher' : 'student';

export default function UsersPanel() {
  const { user: me } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [savingId, setSavingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('student');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.User.list();
      setUsers(list);
      try {
        const agg = await base44.entities.Video.aggregate({ query: {}, groupBy: 'created_by_id' });
        const map = {};
        (agg?.rows ?? []).forEach((row) => {
          map[row.created_by_id] = row.count;
        });
        setLessons(map);
      } catch {
        setLessons({});
      }
      setLoading(false);
    })();
  }, []);

  const counts = useMemo(() => {
    const tally = { all: users.length, teacher: 0, student: 0, admin: 0 };
    users.forEach((u) => {
      tally[memberRole(u)] += 1;
    });
    return tally;
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && memberRole(u) !== roleFilter) return false;
      if (!q) return true;
      return (
        (u.full_name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  const changeRole = async (target, value) => {
    setSavingId(target.id);
    const patch =
      value === 'admin'
        ? { role: 'admin' }
        : { role: 'user', account_type: value === 'teacher' ? 'Teacher' : 'Student' };
    try {
      await base44.entities.User.update(target.id, patch);
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, ...patch } : u)));
      toast({
        title: 'Role updated',
        description: `${target.email} is now ${ROLE_LABELS[value]}.`,
      });
    } catch (err) {
      toast({ title: 'Could not update role', description: err?.message ?? 'Try again.', variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  const removeUser = async (target) => {
    setDeletingId(target.id);
    try {
      await base44.entities.User.delete(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      toast({
        title: 'Account deleted',
        description: `${target.email} no longer has access to the hub.`,
      });
    } catch (err) {
      toast({
        title: 'Could not delete account',
        description: err?.message ?? 'Try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const exportCsv = () => {
    const header = ['Name', 'Email', 'Role', 'Lessons', 'Joined'];
    const rows = filtered.map((u) => [
      u.full_name ?? '',
      u.email ?? '',
      ROLE_LABELS[memberRole(u)],
      lessons[u.id] ?? 0,
      u.created_date ? moment(u.created_date).format('YYYY-MM-DD') : '',
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'alpha-smart-members.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(email, inviteRole === 'admin' ? 'admin' : 'user');
      if (inviteRole !== 'admin') {
        const account_type = inviteRole === 'teacher' ? 'Teacher' : 'Student';
        const list = await base44.entities.User.list();
        const invited = list.find((u) => (u.email ?? '').toLowerCase() === email.toLowerCase());
        if (invited) {
          await base44.entities.User.update(invited.id, { account_type });
          setUsers(list.map((u) => (u.id === invited.id ? { ...u, account_type } : u)));
        }
      }
      toast({
        title: 'Invitation sent',
        description: `${email} was invited as a ${ROLE_LABELS[inviteRole]}.`,
      });
      setInviteEmail('');
    } catch (err) {
      toast({ title: 'Invite failed', description: err?.message ?? 'Try again.', variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={sendInvite}
        className="rounded-2xl bg-card border border-border/50 p-5 flex flex-col md:flex-row md:items-end gap-3"
      >
        <label className="flex-1">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
            Invite a member
          </span>
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="name@example.com"
            className="input-base"
          />
        </label>
        <label>
          <span className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
            Role
          </span>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="input-base md:w-40"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={inviting}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:gold-glow transition-all disabled:opacity-50"
        >
          {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Invite
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setRoleFilter(id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all',
              roleFilter === id
                ? 'bg-primary/15 text-primary border-primary/40'
                : 'bg-card border-border/40 text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            {label}
            <span className="text-[11px] opacity-70">{counts[id]}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name or email..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border/60 text-sm focus:outline-none focus:border-primary/60 focus:gold-glow transition-all"
          />
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-card border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-card border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-card border border-border/50 divide-y divide-border/40">
          {filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No members match that search.
            </p>
          )}
          {filtered.map((u) => {
            const isMe = u.id === me?.id;
            return (
              <div key={u.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="w-9 h-9 rounded-full border border-primary/40 bg-secondary flex items-center justify-center text-sm font-medium shrink-0">
                  {(u.full_name?.[0] ?? u.email?.[0] ?? '?').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {u.full_name ?? 'Unnamed member'}
                    {isMe && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-primary">You</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <span className="hidden sm:block w-20 text-xs text-muted-foreground">
                  {lessons[u.id] ?? 0} lessons
                </span>
                <span className="hidden md:block w-32 text-xs text-muted-foreground">
                  {u.created_date ? moment(u.created_date).format('DD MMM YYYY') : '—'}
                </span>
                <select
                  value={memberRole(u)}
                  disabled={isMe || savingId === u.id || isOwner(u)}
                  onChange={(e) => changeRole(u, e.target.value)}
                  className="text-xs px-3 py-2 rounded-lg bg-secondary border border-border/60 focus:outline-none focus:border-primary/60 disabled:opacity-60"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
                {confirmId === u.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => removeUser(u)}
                      disabled={deletingId === u.id}
                      className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-destructive text-destructive-foreground text-[11px] font-medium disabled:opacity-60"
                    >
                      {deletingId === u.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="px-2.5 py-2 rounded-lg bg-secondary text-[11px] text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(u.id)}
                    disabled={isMe || isOwner(u)}
                    aria-label={`Delete ${u.email ?? 'account'}`}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40 disabled:hover:text-muted-foreground disabled:hover:bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}