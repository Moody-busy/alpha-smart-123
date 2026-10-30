import { useState } from 'react';
import { Timer, Trophy, User as UserIcon } from 'lucide-react';
import { formatDuration } from '@/lib/quiz';
import moment from 'moment';

/** Every student's finished quiz: name, score, points and time taken. */
export default function QuizResultsPanel({ quizzes = [], attempts = [], loading = false }) {
  const [quizId, setQuizId] = useState('All');

  const visible = quizId === 'All' ? attempts : attempts.filter((a) => a.quiz_id === quizId);
  const avgTime = visible.length
    ? Math.round(visible.reduce((sum, a) => sum + (a.time_seconds ?? 0), 0) / visible.length)
    : 0;
  const avgScore = visible.length
    ? Math.round(visible.reduce((sum, a) => sum + (a.percent ?? 0), 0) / visible.length)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <select value={quizId} onChange={(e) => setQuizId(e.target.value)} className="input-base sm:max-w-xs">
          <option value="All">All quizzes</option>
          {quizzes.map((quiz) => (
            <option key={quiz.id} value={quiz.id}>
              {quiz.title}
            </option>
          ))}
        </select>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span className="px-3 py-2 rounded-lg bg-card border border-border/50">
            {visible.length} attempts
          </span>
          <span className="px-3 py-2 rounded-lg bg-card border border-border/50 inline-flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-primary" /> Avg {avgScore}%
          </span>
          <span className="px-3 py-2 rounded-lg bg-card border border-border/50 inline-flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-primary" /> Avg {formatDuration(avgTime)}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-card border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl bg-card border border-border/50 px-5 py-10 text-center text-sm text-muted-foreground">
          No student has finished a quiz yet.
        </p>
      ) : (
        <div className="rounded-2xl bg-card border border-border/50 divide-y divide-border/40">
          {visible.map((attempt) => (
            <div key={attempt.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
              <div className="w-9 h-9 rounded-full bg-secondary border border-primary/40 flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{attempt.student_name ?? 'Student'}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {attempt.quiz_title}
                  {attempt.created_date
                    ? ` · ${moment(attempt.created_date).format('DD MMM YYYY · HH:mm')}`
                    : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-xs text-primary tabular-nums">
                  {attempt.score}/{attempt.total} · {attempt.percent ?? 0}%
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-secondary border border-border/50 text-xs tabular-nums inline-flex items-center gap-1">
                  <Timer className="w-3 h-3" /> {formatDuration(attempt.time_seconds)}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-secondary border border-border/50 text-xs tabular-nums">
                  +{attempt.points_earned ?? 0} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}