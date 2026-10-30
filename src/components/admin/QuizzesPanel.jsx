import { useState } from 'react';
import { ListChecks, Loader2, Trash2, Users, Trophy } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useQuizzes, useQuizAttempts } from '@/hooks/useQuizzes';
import QuizResultsPanel from '@/components/quiz/QuizResultsPanel';

export default function QuizzesPanel() {
  const { toast } = useToast();
  const { quizzes, loading, refetch } = useQuizzes();
  const { attempts, stats, loading: attemptsLoading, refetch: reloadAttempts } = useQuizAttempts();
  const [busyId, setBusyId] = useState(null);

  const remove = async (quiz) => {
    setBusyId(quiz.id);
    try {
      await base44.entities.Quiz.delete(quiz.id);
      toast({ title: 'Quiz deleted', description: quiz.title });
      refetch();
      reloadAttempts();
    } catch (err) {
      toast({ title: 'Could not delete quiz', description: err?.message ?? 'Try again.', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
          <ListChecks className="w-4.5 h-4.5 text-primary" /> All quizzes
        </h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card border border-border/40 animate-pulse" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <p className="rounded-2xl bg-card border border-border/50 px-5 py-10 text-center text-sm text-muted-foreground">
            No quizzes have been created yet.
          </p>
        ) : (
          <div className="rounded-2xl bg-card border border-border/50 divide-y divide-border/40">
            {quizzes.map((quiz) => {
              const stat = stats[quiz.id] ?? { attempts: 0, avgPercent: 0 };
              return (
                <div key={quiz.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {quiz.teacher_name ?? 'Unknown teacher'} · {quiz.questions?.length ?? 0} questions
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary border border-border/50 text-xs">
                    <Users className="w-3 h-3" /> {stat.attempts}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-xs text-primary">
                    <Trophy className="w-3 h-3" /> {stat.avgPercent}%
                  </span>
                  <button
                    onClick={() => remove(quiz)}
                    disabled={busyId === quiz.id}
                    aria-label="Delete quiz"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  >
                    {busyId === quiz.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
          <Trophy className="w-4.5 h-4.5 text-primary" /> Quiz results
        </h3>
        <QuizResultsPanel quizzes={quizzes} attempts={attempts} loading={attemptsLoading} />
      </div>
    </div>
  );
}