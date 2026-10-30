import { useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Video,
  MessageCircle,
  Award,
  Megaphone,
  AlertTriangle,
  ListChecks,
  Brain,
  MessagesSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdminOverview from '@/components/admin/AdminOverview';
import UsersPanel from '@/components/admin/UsersPanel';
import VideosPanel from '@/components/admin/VideosPanel';
import MessagesPanel from '@/components/admin/MessagesPanel';
import BadgesPanel from '@/components/admin/BadgesPanel';
import AnnouncementsPanel from '@/components/admin/AnnouncementsPanel';
import WarningsPanel from '@/components/admin/WarningsPanel';
import QuizzesPanel from '@/components/admin/QuizzesPanel';
import ProgressPanel from '@/components/admin/ProgressPanel';
import TutorChatsPanel from '@/components/admin/TutorChatsPanel';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'progress', label: 'AI Progress', icon: Brain },
  { id: 'tutor', label: 'Tutor Chats', icon: MessagesSquare },
  { id: 'warnings', label: 'Warnings', icon: AlertTriangle },
  { id: 'quizzes', label: 'Quizzes', icon: ListChecks },
  { id: 'videos', label: 'Lessons', icon: Video },
  { id: 'messages', label: 'Chat', icon: MessageCircle },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'badges', label: 'Badges', icon: Award },
];

export default function Admin() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="px-5 md:px-10 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary/80 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> Owner Console
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
          Admin <span className="gold-text">Board</span>
        </h2>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Manage members, lessons, chat and rewards. This area is visible only to you.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-8">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap border transition-all duration-300',
              tab === id
                ? 'bg-primary/15 text-primary border-primary/40'
                : 'bg-card border-border/40 text-muted-foreground hover:text-foreground hover:border-border'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <AdminOverview />}
      {tab === 'users' && <UsersPanel />}
      {tab === 'progress' && <ProgressPanel />}
      {tab === 'tutor' && <TutorChatsPanel />}
      {tab === 'warnings' && <WarningsPanel />}
      {tab === 'quizzes' && <QuizzesPanel />}
      {tab === 'videos' && <VideosPanel />}
      {tab === 'messages' && <MessagesPanel />}
      {tab === 'announcements' && <AnnouncementsPanel />}
      {tab === 'badges' && <BadgesPanel />}
    </div>
  );
}