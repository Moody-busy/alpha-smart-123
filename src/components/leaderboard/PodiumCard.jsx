import { Crown, GraduationCap, User as UserIcon, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import BadgeChips from '@/components/leaderboard/BadgeChips';

const MEDALS = {
  1: {
    ring: 'border-primary/70',
    glow: 'badge-glow',
    chip: 'bg-primary text-primary-foreground',
    label: '1st',
  },
  2: {
    ring: 'border-slate-300/60',
    glow: 'gold-glow',
    chip: 'bg-slate-300 text-slate-900',
    label: '2nd',
  },
  3: {
    ring: 'border-amber-600/60',
    glow: '',
    chip: 'bg-amber-600 text-amber-50',
    label: '3rd',
  },
};

export default function PodiumCard({ contributor, rank, isMe }) {
  const medal = MEDALS[rank] ?? MEDALS[3];
  const featured = rank === 1;

  return (
    <div className={cn('flex flex-col items-center text-center', featured ? 'w-28 md:w-40' : 'w-24 md:w-32')}>
      <div className={cn('relative mb-2', featured && '-mt-4')}>
        <div
          className={cn(
            'rounded-full border-2 flex items-center justify-center bg-secondary font-display font-semibold',
            medal.ring,
            medal.glow,
            featured ? 'w-20 h-20 md:w-24 md:h-24 text-2xl' : 'w-14 h-14 md:w-16 md:h-16 text-lg',
            isMe && 'gold-glow-strong'
          )}
        >
          {contributor.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        {featured && (
          <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 text-primary" fill="currentColor" />
        )}
        <span
          className={cn(
            'absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold',
            medal.chip
          )}
        >
          {medal.label}
        </span>
      </div>

      <div className="rounded-2xl bg-card border border-border/50 px-3 py-3 w-full">
        <p className={cn('font-medium truncate', featured ? 'text-sm' : 'text-xs')}>{contributor.name}</p>
        <span
          className={cn(
            'inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium border',
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
        <BadgeChips badges={contributor.badges} limit={2} className="mt-1.5 justify-center" />
        <p className="mt-2 flex items-center justify-center gap-1 text-primary font-display font-semibold text-sm">
          <Video className="w-3.5 h-3.5" />
          {contributor.count}
        </p>
      </div>
    </div>
  );
}