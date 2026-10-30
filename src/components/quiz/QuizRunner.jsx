import { useEffect, useRef, useState } from 'react';
import { Loader2, Timer, X, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitQuizAttempt, formatDuration } from '@/lib/quiz';
import { badgeIcon } from '@/lib/badgeIcons';

export default function QuizRunner({ quiz, user, onClose, onFinished }) {
  const questions = quiz?.questions ?? [];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (result) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [result]);

  const finish = async (finalAnswers) => {
    setSubmitting(true);
    setError('');
    try {
      const outcome = await submitQuizAttempt({
        quiz,
        answers: finalAnswers,
        user,
        timeSeconds: (Date.now() - startedAt.current) / 1000,
      });
      setResult({ ...outcome, seconds: Math.round((Date.now() - startedAt.current) / 1000) });
      if (outcome.percent >= 60) {
        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#f5d67b', '#ffffff'],
        });
      }
      onFinished?.();
    } catch (err) {
      setError(err?.message ?? 'Could not submit your quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const choose = (optionIndex) => {
    if (submitting) return;
    const next = [...answers];
    next[index] = optionIndex;
    setAnswers(next);
    if (index + 1 < questions.length) setIndex(index + 1);
    else finish(next);
  };

  const question = questions[index];
  const progress = questions.length ? ((index + 1) / questions.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl bg-card border border-border/60 shadow-2xl overflow-hidden">
        {result ? (
          <div className="p-7 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl gold-glow-strong bg-primary/15 border border-primary/40 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-semibold">Quiz complete!</h3>
            <p className="text-sm text-muted-foreground mt-1">{quiz.title}</p>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="rounded-2xl bg-secondary/60 border border-border/50 p-4">
                <p className="font-display text-2xl font-semibold gold-text">{result.percent}%</p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1">Score</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 border border-border/50 p-4">
                <p className="font-display text-2xl font-semibold">{result.points}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1">Points</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 border border-border/50 p-4">
                <p className="font-display text-2xl font-semibold">{formatDuration(result.seconds)}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mt-1">Time</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              {result.correct} of {result.total} correct — your teacher can see this result.
            </p>

            {result.awarded?.length > 0 && (
              <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-primary mb-3">New badges unlocked</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {result.awarded.map((badge) => {
                    const Icon = badgeIcon(badge.icon_key);
                    return (
                      <span
                        key={badge.name}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-primary/40 text-xs text-primary"
                      >
                        <Icon className="w-3.5 h-3.5" /> {badge.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:gold-glow transition-all"
            >
              <CheckCircle2 className="w-4 h-4" /> Back to my dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-6 pt-6">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary/80">{quiz.category ?? 'Quiz'}</p>
                <h3 className="font-display text-lg font-semibold truncate">{quiz.title}</h3>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border/50 text-sm tabular-nums">
                <Timer className="w-4 h-4 text-primary" /> {formatDuration(elapsed)}
              </div>
              <button
                onClick={onClose}
                aria-label="Leave quiz"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 pt-4">
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Question {index + 1} of {questions.length}
              </p>
            </div>

            {question ? (
              <div className="p-6">
                <p className="font-display text-xl font-medium leading-snug mb-5">{question.question}</p>
                <div className="space-y-2.5">
                  {question.options.map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      onClick={() => choose(optionIndex)}
                      disabled={submitting}
                      className="w-full text-left px-4 py-3.5 rounded-xl bg-secondary/60 border border-border/50 text-sm transition-all duration-200 hover:border-primary/60 hover:bg-primary/10 hover:translate-x-1 disabled:opacity-50"
                    >
                      <span className="inline-flex w-6 h-6 mr-3 rounded-md bg-card border border-border/60 items-center justify-center text-[11px] text-muted-foreground">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      {option}
                    </button>
                  ))}
                </div>

                {submitting && (
                  <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving your result...
                  </p>
                )}
                {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
              </div>
            ) : (
              <div className="p-6 text-sm text-muted-foreground">
                This quiz has no questions yet.
                <button onClick={onClose} className="ml-2 text-primary underline">
                  Close
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}