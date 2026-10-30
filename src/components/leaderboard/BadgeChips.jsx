import { badgeIcon } from '@/lib/badgeIcons';
import { cn } from '@/lib/utils';

export default function BadgeChips({ badges = [], limit = 3, className }) {
  if (!badges?.length) return null;

  const shown = badges.slice(0, limit);
  const extra = badges.length - shown.length;

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {shown.map((badge, index) => {
        const Icon = badgeIcon(badge.icon_key);
        return (
          <span
            key={`${badge.name}-${index}`}
            title={badge.name}
            aria-label={badge.name}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-primary/40 bg-primary/10 text-primary shrink-0"
          >
            <Icon className="w-3 h-3" />
          </span>
        );
      })}
      {extra > 0 && <span className="text-[10px] text-muted-foreground">+{extra}</span>}
    </div>
  );
}