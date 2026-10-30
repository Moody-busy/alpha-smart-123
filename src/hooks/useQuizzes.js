import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  quizCache,
  attemptCache,
  isFresh,
  invalidateAttemptCache,
  buildQuizStats,
} from '@/lib/quizCache';

/** Quizzes, loaded once and reused across pages for a few seconds. */
export function useQuizzes() {
  const [quizzes, setQuizzes] = useState(quizCache.items);
  const [loading, setLoading] = useState(!isFresh(quizCache));

  const load = useCallback(async (force = false) => {
    if (!force && isFresh(quizCache)) {
      setQuizzes(quizCache.items);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const page = await base44.entities.Quiz.filter({}, { sort: '-created_date', limit: 50 });
      quizCache.at = Date.now();
      quizCache.items = page.items ?? [];
      setQuizzes(quizCache.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { quizzes, loading, refetch: () => load(true) };
}

/** Every finished attempt, shared by the teacher studio and the admin board. */
export function useQuizAttempts() {
  const [attempts, setAttempts] = useState(attemptCache.items);
  const [loading, setLoading] = useState(!isFresh(attemptCache));

  const load = useCallback(async (force = false) => {
    if (!force && isFresh(attemptCache)) {
      setAttempts(attemptCache.items);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const page = await base44.entities.QuizAttempt.filter({}, { sort: '-created_date', limit: 100 });
      attemptCache.at = Date.now();
      attemptCache.items = page.items ?? [];
      setAttempts(attemptCache.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    attempts,
    stats: buildQuizStats(attempts),
    loading,
    refetch: () => {
      invalidateAttemptCache();
      return load(true);
    },
  };
}

/** A student's own progress: best score per quiz, total points and quizzes taken. */
export function useMyQuizProgress(userId) {
  const [best, setBest] = useState({});
  const [points, setPoints] = useState(0);
  const [taken, setTaken] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const page = await base44.entities.QuizAttempt.filter(
        { student_id: userId },
        { sort: '-created_date', limit: 100 }
      );
      const attempts = page.items ?? [];
      const map = {};
      attempts.forEach((attempt) => {
        map[attempt.quiz_id] = Math.max(map[attempt.quiz_id] ?? 0, attempt.percent ?? 0);
      });
      setBest(map);
      setPoints(attempts.reduce((sum, attempt) => sum + (attempt.points_earned ?? 0), 0));
      setTaken(attempts.length);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { best, points, taken, loading, refetch: load };
}

/** Quiz ranking by points earned, for the leaderboard. */
export function useQuizChampions(limit = 5) {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    base44.entities.QuizAttempt
      .aggregate({
        groupBy: 'student_name',
        sum: ['points_earned'],
        avg: ['percent'],
        sort: '-sum_points_earned',
        limit,
      })
      .then((res) => {
        if (!active) return;
        setChampions(
          (res.rows ?? [])
            .filter((row) => row.student_name)
            .map((row) => ({
              name: row.student_name,
              points: Math.round(row.sum_points_earned ?? 0),
              attempts: row.count ?? 0,
              avgPercent: Math.round(row.avg_percent ?? 0),
            }))
        );
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [limit]);

  return { champions, loading };
}