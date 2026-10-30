import { Sparkles } from 'lucide-react';
import QuizCard from '@/components/quiz/QuizCard';

export default function StudentQuizArena({ quizzes, best, loading, onStart }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-56 rounded-2xl bg-card border border-border/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!quizzes.length) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 px-6 py-12 text-center">
        <div className="w-14 h-14 rounded-2xl gold-glow bg-secondary flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-display font-semibold mb-1">No quizzes yet</h3>
        <p className="text-sm text-muted-foreground">
          Your teachers are preparing challenges — check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {quizzes.map((quiz) => (
        <QuizCard
          key={quiz.id}
          quiz={quiz}
          bestPercent={best[quiz.id] ?? null}
          onStart={() => onStart(quiz)}
        />
      ))}
    </div>
  );
}