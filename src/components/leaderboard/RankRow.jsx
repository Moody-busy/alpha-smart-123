import { GraduationCap, User as UserIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import BadgeChips from '@/components/leaderboard/BadgeChips';

export default function RankRow({ contributor, rank, isMe }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-xl border transition-all',
        isMe ? 'bg-primary/10 border-primary/50 gold-glow' : 'bg-card border-border/40 hover:border-primary/40'
      )}
    >
      <span className="w-7 text-center font-display font-semibold text-muted-foreground">{rank}</span>

      <div className="w-10 h-10 rounded-full border border-primary/40 bg-secondary flex items-center justify-center font-medium shrink-0">
        {contributor.name?.[0]?.toUpperCase() ?? 'U'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {contributor.name}
          {isMe && <span className="ml-2 text-[10px] text-primary uppercase tracking-wide">You</span>}
        </p>
        <span
          className={cn(
            'inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border',
            contributor.role === 'Teacher'
              ? 'border-primary/50 text-primary bg-primary/10'
              : 'border-border/50 text-muted-foreground bg-secondary'
          )}
        >
          {contributor.role === 'Teacher' ? (
            <GraduationCap className="w-3 h-3" />
          ) : (
            <UserIcon className="w-3 h-3" />
          )}
          {contributor.role}
        </span>
        <BadgeChips badges={contributor.badges} className="mt-1.5" />
      </div>

      <div className="flex items-center gap-1.5 text-primary font-display font-semibold">
        <Video className="w-4 h-4" />
        {contributor.count}
      </div>
    </div>
  );
}