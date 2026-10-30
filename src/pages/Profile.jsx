import { useEffect, useState } from 'react';
import { Award, Video as VideoIcon, Lock, GraduationCap, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useUserBadges } from '@/hooks/useUserBadges';
import { getUserVideoCount } from '@/lib/gamification';
import { base44 } from '@/api/base44Client';

export default function Profile() {
  const { user } = useAuth();
  const { badges, loading: badgesLoading } = useUserBadges(user?.id);
  const [videoCount, setVideoCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [countLoading, setCountLoading] = useState(true);
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    Promise.all([
      getUserVideoCount(user?.id),
      user?.id ? base44.entities.QuizAttempt.count({ student_id: user.id }) : Promise.resolve(0),
    ])
      .then(([videos, quizzes]) => {
        setVideoCount(videos);
        setQuizCount(quizzes);
      })
      .finally(() => setCountLoading(false));
  }, [user?.id]);

  useEffect(() => {
    base44.entities.Badge.list().then((list) => {
      setCatalog([...list].sort((a, b) => (a.threshold ?? 0) - (b.threshold ?? 0)));
    });
  }, []);

  const role = user?.account_type ?? (user?.role === 'admin' ? 'Teacher' : 'Student');
  const visibleBadges = catalog.filter((b) => !b.role || b.role === 'All' || b.role === role);
  const initials = (user?.full_name ?? 'U')[0]?.toUpperCase();

  return (
    <div className="px-5 md:px-10 py-8 max-w-4xl mx-auto">
      <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-2">Your Profile</p>
      <h2 className="font-display text-2xl md:text-3xl font-semibold mb-8">Account & Achievements</h2>

      {/* Profile card */}
      <div className="rounded-2xl bg-card border border-border/50 p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-primary/60 gold-glow flex items-center justify-center bg-secondary text-3xl font-display font-semibold gold-text">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background">
              {role === 'Teacher' ? <GraduationCap className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-display text-xl font-semibold">{user?.full_name ?? 'User'}</h3>
            <p className="text-muted-foreground text-sm mb-3">{user?.email}</p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-primary/50 text-primary bg-primary/10">
              {role === 'Teacher' ? <GraduationCap className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard
          icon={VideoIcon}
          label={role === 'Student' ? 'Quizzes Taken' : 'Lessons Uploaded'}
          value={countLoading ? '—' : String(role === 'Student' ? quizCount : videoCount)}
        />
        <StatCard
          icon={Award}
          label="Badges Earned"
          value={badgesLoading ? '—' : String(badges.length)}
        />
      </div>

      {/* Badges showcase */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4">Achievement Badges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleBadges.map((badge) => {
            const isQuizBadge = badge.metric === 'Quizzes';
            const metricCount = isQuizBadge ? quizCount : videoCount;
            return (
              <BadgeTile
                key={badge.id}
                name={badge.name}
                description={badge.description}
                unlocked={badges.some((b) => b.badge_name === badge.name)}
                progress={Math.min(metricCount, badge.threshold)}
                threshold={badge.threshold}
                unit={isQuizBadge ? 'quizzes completed' : 'lessons uploaded'}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-display font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

function BadgeTile({ name, description, unlocked, progress, threshold, unit }) {
  return (
    <div
      className={
        'rounded-2xl p-5 border transition-all ' +
        (unlocked
          ? 'bg-card border-primary/50 badge-glow'
          : 'bg-card border-border/40 opacity-70')
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={
            'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ' +
            (unlocked ? 'bg-primary/15 border border-primary/50' : 'bg-secondary border border-border/50')
          }
        >
          {unlocked ? <Award className="w-7 h-7 text-primary" /> : <Lock className="w-6 h-6 text-muted-foreground" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={'font-medium ' + (unlocked ? 'gold-text' : 'text-muted-foreground')}>{name}</h4>
            {unlocked && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-primary/20 text-primary border border-primary/40">
                UNLOCKED
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{description}</p>
          {!unlocked && (
            <div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(progress / threshold) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {progress} / {threshold} {unit}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}