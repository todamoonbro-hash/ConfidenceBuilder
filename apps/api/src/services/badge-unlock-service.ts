import type { Badge, GameProgress, UserBadge } from "../db/types";

export function findUnlockableBadges(
  progress: GameProgress,
  badgeCatalog: Badge[],
  existingBadges: UserBadge[],
  nowIso: string
): UserBadge[] {
  const unlockedBadgeIds = new Set(existingBadges.map((item) => item.badgeId));

  return badgeCatalog
    .filter((badge) => !unlockedBadgeIds.has(badge.id))
    .filter((badge) => {
      if (badge.requirement === "first_session") {
        return progress.overallXp > 0;
      }

      if (badge.requirement === "xp_threshold") {
        return progress.overallXp >= (badge.threshold ?? 0);
      }

      if (badge.requirement === "streak_threshold") {
        return progress.streakDays >= (badge.threshold ?? 0);
      }

      return false;
    })
    .map((badge, index) => ({
      id: `user_badge_${existingBadges.length + index + 1}`,
      userId: progress.userId,
      badgeId: badge.id,
      unlockedAt: nowIso
    }));
}
