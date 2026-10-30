import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Brain, Loader2, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ProgressPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('progressInsights', {});
      setData(res.data);
    } catch {
      setError('The progress analysis could not run. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
  }, []);

  const notesById = Object.fromEntries((data?.analysis?.member_notes ?? []).map((n) => [n.user_id, n.note]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" /> AI Progress Tracking
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Lesson uploads, quiz scores, points and warnings across every member.
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/60 text-sm hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {loading ? 'Analyzing...' : 'Re-analyze'}
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && !data ? (
        <div className="rounded-2xl bg-card border border-border/50 p-10 flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" /> Alpha AI is reading the activity of every member...
        </div>
      ) : data ? (
        <>
          <div className="rounded-2xl bg-card border border-border/50 p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/80 mb-2">Summary</p>
            <p className="text-sm leading-relaxed">{data.analysis?.summary}</p>
            <div className="grid md:grid-cols-2 gap-4 mt-5">
              <div>
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-emerald-400 mb-2">
                  <TrendingUp className="w-3.5 h-3.5" /> Doing well
                </p>
                <ul className="space-y-1.5">
                  {(data.analysis?.highlights ?? []).map((h, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {h}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-amber-400 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> Needs attention
                </p>
                <ul className="space-y-1.5">
                  {(data.analysis?.concerns ?? []).map((c, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wide text-muted-foreground border-b border-border/50">
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Lessons</th>
                    <th className="px-4 py-3">Quizzes</th>
                    <th className="px-4 py-3">Avg</th>
                    <th className="px-4 py-3">Points</th>
                    <th className="px-4 py-3">Warnings</th>
                    <th className="px-4 py-3">AI note</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.members ?? []).map((m) => (
                    <tr key={m.user_id} className="border-b border-border/30 last:border-0">
                      <td className="px-4 py-3 whitespace-nowrap">{m.name}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{m.account_type}</td>
                      <td className="px-4 py-3">{m.lessons}</td>
                      <td className="px-4 py-3">{m.quizzes}</td>
                      <td className="px-4 py-3">{m.avg_percent === null ? '—' : `${m.avg_percent}%`}</td>
                      <td className="px-4 py-3">{m.points}</td>
                      <td className={m.warnings > 0 ? 'px-4 py-3 text-destructive' : 'px-4 py-3'}>{m.warnings}</td>
                      <td className="px-4 py-3 text-muted-foreground min-w-[220px]">{notesById[m.user_id] ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}