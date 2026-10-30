import {
  Award,
  Bell,
  BookOpen,
  Crown,
  GraduationCap,
  Layers,
  Library,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';

const BADGE_ICONS = {
  award: Award,
  bell: Bell,
  'book-open': BookOpen,
  crown: Crown,
  'graduation-cap': GraduationCap,
  layers: Layers,
  library: Library,
  sparkles: Sparkles,
  star: Star,
  'trending-up': TrendingUp,
  users: Users,
};

export function badgeIcon(key) {
  return BADGE_ICONS[key] ?? Award;
}