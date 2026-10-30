import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Builds the contributor leaderboard entirely server-side:
 * one aggregate per role groups uploads by uploader name and counts them,
 * then both lists are merged and ranked by lesson count.
 */
export function useLeaderboard() {
  const [contributors, setContributors] = useState([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [teachers, students, total, badgeRecords] = await Promise.all([
        base44.entities.Video.aggregate({
          query: { uploader_role: 'Teacher' },
          groupBy: 'uploader_name',
          sort: '-count',
          limit: 100,
        }),
        base44.entities.Video.aggregate({
          query: { uploader_role: 'Student' },
          groupBy: 'uploader_name',
          sort: '-count',
          limit: 100,
        }),
        base44.entities.Video.count(),
        base44.entities.UserBadge.list(),
      ]);

      // Badges are keyed by member name, the same key the leaderboard groups uploads by.
      const badgesByName = {};
      (Array.isArray(badgeRecords) ? badgeRecords : []).forEach((record) => {
        if (!record.user_name) return;
        (badgesByName[record.user_name] ??= []).push({
          name: record.badge_name,
          icon_key: record.badge_icon_key,
        });
      });

      const merged = [
        ...(teachers.rows ?? []).map((r) => ({ name: r.uploader_name, role: 'Teacher', count: r.count })),
        ...(students.rows ?? []).map((r) => ({ name: r.uploader_name, role: 'Student', count: r.count })),
      ]
        .filter((c) => c.name)
        .sort((a, b) => b.count - a.count)
        .map((c) => ({ ...c, badges: badgesByName[c.name] ?? [] }));

      setContributors(merged);
      setTotalLessons(total);
    } catch {
      setContributors([]);
      setTotalLessons(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { contributors, totalLessons, loading, refetch: load };
}