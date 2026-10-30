import { useState } from 'react';
import { Search, Play, X, Plus } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import { useVideos } from '@/hooks/useVideos';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const CATEGORIES = ['All', 'Mathematics', 'Science', 'Programming', 'Languages', 'History', 'Islamic', 'Art'];

/** Shared lesson browser: search, category filters and the player modal. */
export default function LessonLibrary({ onUpload, version = 0 }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [playing, setPlaying] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const { videos, loading } = useVideos({ search: debouncedSearch, category: activeCategory, version });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons by title or category..."
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-card border border-border/60 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:gold-glow transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={
                'px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-300 ' +
                (activeCategory === cat
                  ? 'bg-primary/15 text-primary border border-primary/40'
                  : 'bg-card border border-border/40 text-muted-foreground hover:text-foreground hover:border-border')
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading && videos.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-2xl bg-card border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl gold-glow flex items-center justify-center bg-card mx-auto mb-5">
            <Play className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2">
            {search || activeCategory !== 'All' ? 'No lessons found' : 'No lessons yet'}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {search || activeCategory !== 'All'
              ? 'Try a different title or category, or clear your search.'
              : onUpload
                ? 'Be the first to share knowledge in this category.'
                : 'Your teachers have not published lessons in this category yet.'}
          </p>
          {onUpload && (
            <button
              onClick={onUpload}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:gold-glow transition-all"
            >
              <Plus className="w-4 h-4" /> Upload a Lesson
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} onPlay={() => setPlaying(video)} />
          ))}
        </div>
      )}

      {playing && <VideoPlayerModal video={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}