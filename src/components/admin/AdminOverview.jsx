import { useEffect, useState } from 'react';
import { Users, Video, MessageCircle, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CARD_STYLES = [
  'from-primary/15 to-transparent',
  'from-chart-2/15 to-transparent',
  'from-chart-3/15 to-transparent',
  'from-chart-4/15 to-transparent',
];

export default function AdminOverview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [members, lessons, messages, awards] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Video.count(),
        base44.entities.Message.count(),
        base44.entities.UserBadge.count(),
      ]);
      if (!active) return;
      setStats({
        members: members.length,
        admins: members.filter((u) => u.role === 'admin').length,
        teachers: members.filter((u) => u.role !== 'admin' && u.account_type === 'Teacher').length,
        students: members.filter((u) => u.role !== 'admin' && u.account_type !== 'Teacher').length,
        lessons,
        messages,
        awards,
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-card border border-border/40 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Members',
      value: stats.members,
      hint: `${stats.teachers} teachers · ${stats.students} students · ${stats.admins} admins`,
      icon: Users,
    },
    { label: 'Lessons', value: stats.lessons, hint: 'published in the hub', icon: Video },
    { label: 'Chat messages', value: stats.messages, hint: 'in the global room', icon: MessageCircle },
    { label: 'Badges unlocked', value: stats.awards, hint: 'awarded to members', icon: Award },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, hint, icon: Icon }, index) => (
          <div
            key={label}
            className={`relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 bg-gradient-to-br ${CARD_STYLES[index]}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <p className="font-display text-3xl font-semibold">{value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border/50 p-5">
        <h3 className="font-display font-semibold mb-1">Everything in one place</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Use the tabs above to change member roles and send invites, edit or delete any lesson, moderate the
          global chat, and award badges by hand.
        </p>
      </div>
    </div>
  );
}