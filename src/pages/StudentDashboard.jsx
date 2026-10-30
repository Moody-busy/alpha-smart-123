import { useState } from 'react';
import { Flame, Sparkles, Target, Trophy, Medal } from 'lucide-react';
import LessonLibrary from '@/components/lessons/LessonLibrary';
import StudentQuizArena from '@/components/quiz/StudentQuizArena';
import QuizRunner from '@/components/quiz/QuizRunner';
import { useQuizzes, useMyQuizProgress } from '@/hooks/useQuizzes';
import { useUserBadges } from '@/hooks/useUserBadges';
import { badgeIcon } from '@/lib/badgeIcons';
import { useAuth } from '@/lib/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { quizzes, loading: quizzesLoading, refetch: reloadQuizzes } = useQuizzes();
  const { best, points, taken, loading: progressLoading, refetch: reloadProgress } =
    useMyQuizProgress(user?.id);
  const { badges } = useUserBadges(user?.id);
  const [activeQuiz, setActiveQuiz] = useState(null);

  const level = Math.floor(points / 100) + 1;
  const levelProgress = points % 100;

  const handleFinished = () => {
    reloadProgress();
    reloadQuizzes();
  };

  return (
    <div className="px-5 md:px-10 py-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/15 via-card to-card p-6 md:p-8 mb-8">
        <div className="absolute -top-12 -right-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-2">My Learning Space</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
              Hey <span className="gold-text">{user?.full_name?.split(' ')[0] ?? 'Scholar'}</span> 👋
            </h2>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Take a quiz, collect points and climb the leaderboard.
            </p>

            <div className="mt-5 max-w-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-primary font-medium">
                  <Flame className="w-3.5 h-3.5" /> Level {level}
                </span>
                <span>{levelProgress}/100 to next level</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card/80 border border-primary/30 backdrop-blur px-6 py-5 text-center shrink-0">
            <p className="font-display text-4xl font-semibold gold-text tabular-nums">
              {progressLoading ? '—' : points}
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Total points</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard
          icon={Target}
          label="Quizzes completed"
          value={progressLoading ? '—' : String(taken)}
          hint="every attempt earns points"
        />
        <StatCard
          icon={Trophy}
          label="Badges earned"
          value={String(badges.length)}
          hint="unlocked by quizzes"
        />
        <StatCard
          icon={Sparkles}
          label="Quizzes available"
          value={String(quizzes.length)}
          hint="fresh challenges from teachers"
        />
      </div>

      {/* Badges strip */}
      {badges.length > 0 && (
        <div className="mb-10">
          <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
            <Medal className="w-4.5 h-4.5 text-primary" /> My badges
          </h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => {
              const Icon = badgeIcon(badge.badge_icon_key);
              return (
                <span
                  key={badge.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-primary/30 text-xs text-primary"
                >
                  <Icon className="w-3.5 h-3.5" /> {badge.badge_name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Quiz arena */}
      <section className="mb-12">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Quiz Arena
          </h3>
          <span className="text-xs text-muted-foreground">+10 points per correct answer</span>
        </div>
        <StudentQuizArena
          quizzes={quizzes}
          best={best}
          loading={quizzesLoading}
          onStart={setActiveQuiz}
        />
      </section>

      {/* Lessons */}
      <section>
        <h3 className="font-display text-xl font-semibold mb-4">Lessons</h3>
        <LessonLibrary />
      </section>

      {activeQuiz && (
        <QuizRunner
          quiz={activeQuiz}
          user={user}
          onClose={() => setActiveQuiz(null)}
          onFinished={handleFinished}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5">
      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <p className="font-display text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      <p className="text-[11px] text-muted-foreground/70 mt-1">{hint}</p>
    </div>
  );
}