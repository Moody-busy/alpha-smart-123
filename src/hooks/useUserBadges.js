import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getUserBadges } from '@/lib/gamification';

export function useUserBadges(userId) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setBadges([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setBadges(await getUserBadges(userId));
    } catch {
      setBadges([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
    // live updates when badges are awarded
    const unsub = base44.entities.UserBadge.subscribe((event) => {
      if (event?.data?.user_id === userId) load();
    });
    return unsub;
  }, [load, userId]);

  return { badges, loading, refetch: load };
}