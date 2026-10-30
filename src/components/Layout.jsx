import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, User, LogOut, GraduationCap, Trophy, ShieldCheck, Sparkles, CalendarRange } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import WarningNotice from '@/components/WarningNotice';
import RoleGate from '@/components/RoleGate';
import { useAuth } from '@/lib/AuthContext';
import { isOwner } from '@/lib/admin';
import { cn } from '@/lib/utils';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tutor', label: 'AI Tutor', icon: Sparkles },
    { to: '/study-plans', label: 'Study Plans', icon: CalendarRange },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/chat', label: 'Global Chat', icon: MessageCircle },
    { to: '/profile', label: 'Profile', icon: User },
    ...(isOwner(user) ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/60 frosted sticky top-0 h-screen">
        <div className="px-6 py-7 flex items-center gap-3 border-b border-border/40">
          <div className="w-10 h-10 rounded-xl gold-glow flex items-center justify-center bg-card">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-base leading-tight gold-text">Alpha Smart</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Platform</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group',
                  isActive
                    ? 'bg-primary/10 text-primary gold-glow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                )
              }
            >
              <Icon className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border/40">
          <div className="flex items-center justify-between px-3 pb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Appearance</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full border border-primary/50 overflow-hidden bg-card flex items-center justify-center">
              {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.full_name ?? 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 frosted border-b border-border/60 px-4 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg gold-glow flex items-center justify-center bg-card shrink-0">
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-semibold gold-text truncate">Alpha Smart</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            aria-label="Sign out"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 frosted border-t border-border/60 px-1 py-2 flex items-center justify-around">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all',
                isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label === 'Global Chat' ? 'Chat' : label}
          </NavLink>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 pb-20 md:pt-0 md:pb-0">
        <Outlet />
      </main>

      <WarningNotice />
      {user && !user.account_type && <RoleGate />}
    </div>
  );
}