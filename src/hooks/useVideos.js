import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function useVideos({ search = '', category = 'All', version = 0 } = {}) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = {};
      if (category && category !== 'All') query.category = category;

      const term = search.trim();
      if (term) {
        const rx = { $regex: escapeRegex(term), $options: 'i' };
        query.$or = [{ title: rx }, { category: rx }];
      }

      const page = await base44.entities.Video.filter(query, {
        sort: '-created_date',
        limit: 50,
      });
      setVideos(page.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [search, category, version]);

  useEffect(() => {
    load();
  }, [load]);

  return { videos, loading, refetch: load };
}