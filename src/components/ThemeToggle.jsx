import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { cn } from '@/lib/utils';

export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className={cn(
        'relative w-9 h-9 shrink-0 rounded-xl border border-border/60 text-muted-foreground transition-all hover:text-primary hover:border-primary/50 hover:bg-secondary',
        className
      )}
    >
      <Sun
        className={cn(
          'absolute inset-0 m-auto w-4 h-4 transition-all duration-300',
          isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        )}
      />
      <Moon
        className={cn(
          'absolute inset-0 m-auto w-4 h-4 transition-all duration-300',
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        )}
      />
    </button>
  );
}