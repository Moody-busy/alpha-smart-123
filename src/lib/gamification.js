import { base44 } from '@/api/base44Client';

const toList = (res) => (Array.isArray(res) ? res : res?.items ?? []);

/**
 * Awards every badge the user has newly earned for an achievement metric.
 * "Lessons" counts published lessons, "Quizzes" counts completed quizzes.
 * A badge is earned when that count reaches its threshold and its audience
 * matches the user's role. Returns { awarded, count }.
 */
export async function checkAndAssignBadges(userId, userName, userRole, metric = 'Lessons') {
  if (!userId) return { awarded: [], count: 0 };

  const count =
    metric === 'Quizzes'
      ? await base44.entities.QuizAttempt.count({ student_id: userId })
      : await base44.entities.Video.count({ created_by_id: userId });
  const [catalog, owned] = await Promise.all([
    base44.entities.Badge.list(),
    base44.entities.UserBadge.filter({ user_id: userId }),
  ]);
  const ownedNames = new Set(toList(owned).map((badge) => badge.badge_name));

  const awarded = catalog.filter(
    (badge) =>
      (badge.metric ?? 'Lessons') === metric &&
      count >= (badge.threshold ?? 0) &&
      (!badge.role || badge.role === 'All' || badge.role === userRole) &&
      !ownedNames.has(badge.name)
  );

  await Promise.all(
    awarded.map((badge) =>
      base44.entities.UserBadge.create({
        user_id: userId,
        user_name: userName,
        badge_name: badge.name,
        badge_icon_key: badge.icon_key,
      })
    )
  );

  return { awarded, count };
}

export async function getUserBadges(userId) {
  if (!userId) return [];
  return toList(await base44.entities.UserBadge.filter({ user_id: userId }));
}

export async function getUserVideoCount(userId) {
  if (!userId) return 0;
  return base44.entities.Video.count({ created_by_id: userId });
}