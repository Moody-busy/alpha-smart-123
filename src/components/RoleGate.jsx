import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { GraduationCap, BookOpenCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const ROLES = [
  {
    value: 'Student',
    label: 'Student',
    hint: 'Watch lessons, take quizzes and climb the leaderboard.',
    icon: GraduationCap,
  },
  {
    value: 'Teacher',
    label: 'Teacher',
    hint: 'Upload lessons, build quizzes and follow your students.',
    icon: BookOpenCheck,
  },
];

/** Blocks the app once, right after sign-in, until the member picks Teacher or Student. */
export default function RoleGate() {
  const { checkUserAuth } = useAuth();
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState('');

  const choose = async (accountType) => {
    setSaving(accountType);
    setError('');
    try {
      await base44.auth.updateMe({ account_type: accountType });
      await checkUserAuth();
    } catch (e) {
      setError(e?.message || 'Could not save your role. Please try again.');
      setSaving(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-2xl rounded-3xl bg-card border border-border/60 gold-glow p-6 sm:p-9">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground text-center">
          Welcome to Alpha Smart
        </p>
        <h2 className="font-display text-2xl sm:text-3xl text-center mt-3 gold-text">
          How will you use the hub?
        </h2>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Pick your role to open the right dashboard. This is asked only once.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mt-7">
          {ROLES.map(({ value, label, hint, icon: Icon }) => (
            <button
              key={value}
              onClick={() => choose(value)}
              disabled={!!saving}
              className="text-left rounded-2xl border border-border/60 bg-secondary/40 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 p-5 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <div className="w-11 h-11 rounded-xl bg-card border border-primary/30 flex items-center justify-center">
                {saving === value ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <Icon className="w-5 h-5 text-primary transition-transform group-hover:scale-110" />
                )}
              </div>
              <p className="mt-3 font-display text-lg">{label}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{hint}</p>
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-destructive text-center mt-4">{error}</p>}
      </div>
    </div>
  );
}