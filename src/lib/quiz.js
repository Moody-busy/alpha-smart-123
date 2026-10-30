import { base44 } from '@/api/base44Client';
import { checkAndAssignBadges } from '@/lib/gamification';
import { invalidateAttemptCache } from '@/lib/quizCache';

export const POINTS_PER_CORRECT = 10;

export const QUIZ_CATEGORIES = ['Mathematics', 'Science', 'Programming', 'Languages', 'History', 'Islamic', 'Art'];

/** Scores a set of option indexes against the quiz answer key. */
export function scoreQuiz(quiz, answers) {
  const questions = quiz?.questions ?? [];
  const correct = questions.reduce(
    (acc, question, index) => acc + (answers[index] === question.correct_index ? 1 : 0),
    0
  );
  const total = questions.length;
  return { correct, total, percent: total ? Math.round((correct / total) * 100) : 0 };
}

/** 95 -> "1:35" */
export function formatDuration(seconds) {
  const safe = Math.max(0, Math.round(seconds ?? 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Saves the finished attempt, adds points and unlocks any quiz badges.
 * Returns { correct, total, percent, points, awarded }.
 */
export async function submitQuizAttempt({ quiz, answers, user, timeSeconds }) {
  const { correct, total, percent } = scoreQuiz(quiz, answers);
  const points = correct * POINTS_PER_CORRECT;

  await base44.entities.QuizAttempt.create({
    quiz_id: quiz.id,
    quiz_title: quiz.title,
    student_id: user.id,
    student_name: user.full_name ?? user.email ?? 'Student',
    score: correct,
    total,
    percent,
    points_earned: points,
    time_seconds: Math.max(1, Math.round(timeSeconds)),
  });
  invalidateAttemptCache();

  const { awarded } = await checkAndAssignBadges(
    user.id,
    user.full_name ?? user.email ?? 'Student',
    'Student',
    'Quizzes'
  );

  return { correct, total, percent, points, awarded };
}