import { Trophy, Users, Video, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useQuizChampions } from '@/hooks/useQuizzes';
import PodiumCard from '@/components/leaderboard/PodiumCard';
import RankRow from '@/components/leaderboard/RankRow';

export default function Leaderboard() {
  const { user } = useAuth();
  const { contributors, totalLessons, loading } = useLeaderboard();
  const { champions } = useQuizChampions(5);

  const isMe = (c) => c.name && c.name === user?.full_name;

  const top = contributors.slice(0, 3);
  const podium = [];
  if (top[1]) podium.push({ c: top[1], rank: 2 });
  if (top[0]) podium.push({ c: top[0], rank: 1 });
  if (top[2]) podium.push({ c: top[2], rank: 3 });
  const rest = contributors.slice(3);

  return (
    <div className="px-5 md:px-10 py-8 max-w-4xl mx-auto">
      <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-2">Community</p>
      <h2 className="font-display text-2xl md:text-3xl font-semibold flex items-center gap-3 mb-8">
        Top Contributors
        <Trophy className="w-6 h-6 text-primary" />
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <Stat icon={Video} label="Lessons Published" value={loading ? '—' : String(totalLessons)} />
        <Stat icon={Users} label="Active Contributors" value={loading ? '—' : String(contributors.length)} />
      </div>

      {/* Quiz champions */}
      {champions.length > 0 && (
        <div className="mb-10">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold mb-3">
            <Sparkles className="w-4.5 h-4.5 text-primary" /> Quiz Champions
          </h3>
          <div className="space-y-2">
            {champions.map((champion, i) => (
              <div
                key={champion.name}
                className="flex items-center gap-3 rounded-xl bg-card border border-border/50 px-4 py-3"
              >
                <span className="w-5 font-display text-sm text-primary tabular-nums">{i + 1}</span>
                <span className="flex-1 truncate text-sm">{champion.name}</span>
                <span className="hidden sm:inline text-xs text-muted-foreground">
                  {champion.attempts} quizzes · {champion.avgPercent}% avg
                </span>
                <span className="font-display text-sm gold-text tabular-nums">{champion.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-card border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : contributors.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl bg-card border border-border/40">
          <div className="w-16 h-16 rounded-2xl gold-glow flex items-center justify-center bg-secondary mb-4">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-1">No contributions yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Upload the first lesson on the Dashboard and claim the top spot on the leaderboard.
          </p>
        </div>
      ) : (
        <>
          {/* Podium — top 3 */}
          <div className="flex items-end justify-center gap-3 md:gap-6 mb-8">
            {podium.map(({ c, rank }) => (
              <PodiumCard key={`${rank}-${c.name}`} contributor={c} rank={rank} isMe={isMe(c)} />
            ))}
          </div>

          {/* Ranks 4+ */}
          {rest.length > 0 && (
            <div className="space-y-2.5">
              {rest.map((c, i) => (
                <RankRow key={c.name} contributor={c} rank={i + 4} isMe={isMe(c)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-display font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}