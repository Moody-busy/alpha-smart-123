import { Play, RefreshCw, ListChecks, Sparkles } from 'lucide-react';

export default function QuizCard({ quiz, bestPercent, attempts = 0, onStart }) {
  const taken = bestPercent != null;
  return (
    <div className="group rounded-2xl bg-card border border-border/50 p-5 transition-all duration-300 hover:gold-glow hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium frosted border border-border/40 text-primary">
          {quiz.category ?? 'General'}
        </span>
        {taken && (
          <span className="inline-flex items-center gap-1 text-[11px] text-primary">
            <Sparkles className="w-3 h-3" /> Best {bestPercent}%
          </span>
        )}
      </div>

      <h3 className="font-display font-semibold mt-3 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {quiz.title}
      </h3>
      {quiz.description && (
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{quiz.description}</p>
      )}

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-3">
        <ListChecks className="w-3.5 h-3.5" />
        {quiz.questions?.length ?? 0} questions
        {quiz.teacher_name ? <span className="truncate">· {quiz.teacher_name}</span> : null}
      </div>

      <button
        onClick={onStart}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all hover:gold-glow active:scale-95"
      >
        {taken ? <RefreshCw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {taken ? 'Try Again' : 'Start Quiz'}
      </button>

      {attempts > 0 && (
        <p className="text-[11px] text-muted-foreground text-center mt-2">
          {attempts} attempt{attempts === 1 ? '' : 's'} so far
        </p>
      )}
    </div>
  );
}