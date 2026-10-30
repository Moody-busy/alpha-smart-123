import { useState } from 'react';
import { Plus, ListChecks, Users, Trophy } from 'lucide-react';
import UploadModal from '@/components/UploadModal';
import LessonLibrary from '@/components/lessons/LessonLibrary';
import QuizBuilder from '@/components/quiz/QuizBuilder';
import QuizResultsPanel from '@/components/quiz/QuizResultsPanel';
import { useQuizzes, useQuizAttempts } from '@/hooks/useQuizzes';
import { useAuth } from '@/lib/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [libraryVersion, setLibraryVersion] = useState(0);
  const { quizzes, loading: quizzesLoading, refetch: reloadQuizzes } = useQuizzes();
  const {
    attempts,
    stats,
    loading: attemptsLoading,
    refetch: reloadAttempts,
  } = useQuizAttempts();

  return (
    <div className="px-5 md:px-10 py-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-3">Teacher Studio</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
            Welcome back, <span className="gold-text">{user?.full_name?.split(' ')[0] ?? 'Teacher'}</span>
          </h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Publish lessons, build quizzes and follow how your students are doing.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setBuilderOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-primary/40 text-primary bg-primary/10 font-medium text-sm transition-all hover:bg-primary/15 active:scale-95"
          >
            <ListChecks className="w-4 h-4" /> New Quiz
          </button>
          <button
            onClick={() => setUploadOpen(true)}
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all duration-300 hover:gold-glow-strong hover:scale-[1.03] active:scale-95"
          >
            <Plus className="w-4.5 h-4.5 transition-transform group-hover:rotate-90" />
            Upload Lesson
          </button>
        </div>
      </div>

      {/* Quizzes */}
      <section className="mb-12">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="font-display text-xl font-semibold flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" /> Quizzes
          </h3>
          <button
            onClick={() => setBuilderOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Plus className="w-4 h-4" /> Create quiz
          </button>
        </div>

        {quizzesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-card border border-border/40 animate-pulse" />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border/50 px-6 py-10 text-center">
            <p className="font-display font-semibold mb-1">No quizzes yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Build a quiz and your students can start earning points today.
            </p>
            <button
              onClick={() => setBuilderOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:gold-glow transition-all"
            >
              <ListChecks className="w-4 h-4" /> Create your first quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => {
              const stat = stats[quiz.id] ?? { attempts: 0, avgPercent: 0 };
              return (
                <div key={quiz.id} className="rounded-2xl bg-card border border-border/50 p-5">
                  <span className="px-2.5 py-1 rounded-md text-[11px] frosted border border-border/40 text-primary">
                    {quiz.category ?? 'General'}
                  </span>
                  <p className="font-display font-semibold mt-3 leading-snug line-clamp-2">{quiz.title}</p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-3">
                    <span className="inline-flex items-center gap-1">
                      <ListChecks className="w-3.5 h-3.5" /> {quiz.questions?.length ?? 0} questions
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {stat.attempts} attempts
                    </span>
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Trophy className="w-3.5 h-3.5" /> {stat.avgPercent}% avg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Student results */}
      <section className="mb-12">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" /> Student Results
        </h3>
        <QuizResultsPanel quizzes={quizzes} attempts={attempts} loading={attemptsLoading} />
      </section>

      {/* Lessons */}
      <section>
        <h3 className="font-display text-xl font-semibold mb-4">Lesson Hub</h3>
        <LessonLibrary onUpload={() => setUploadOpen(true)} version={libraryVersion} />
      </section>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={() => setLibraryVersion((v) => v + 1)}
      />
      <QuizBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onSaved={() => {
          reloadQuizzes();
          reloadAttempts();
          setBuilderOpen(false);
        }}
      />
    </div>
  );
}