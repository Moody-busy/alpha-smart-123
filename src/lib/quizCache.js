const CACHE_TTL = 15000;

/** Short-lived caches so switching pages does not re-scan the same entities. */
export const quizCache = { at: 0, items: [] };
export const attemptCache = { at: 0, items: [] };

export const isFresh = (cache) => Date.now() - cache.at < CACHE_TTL;

export function invalidateQuizCache() {
  quizCache.at = 0;
}

export function invalidateAttemptCache() {
  attemptCache.at = 0;
}

/** Attempt statistics per quiz, derived from one already-loaded attempts list. */
export function buildQuizStats(attempts = []) {
  const map = {};
  attempts.forEach((attempt) => {
    const entry = (map[attempt.quiz_id] ??= { attempts: 0, totalPercent: 0, avgPercent: 0 });
    entry.attempts += 1;
    entry.totalPercent += attempt.percent ?? 0;
    entry.avgPercent = Math.round(entry.totalPercent / entry.attempts);
  });
  return map;
}