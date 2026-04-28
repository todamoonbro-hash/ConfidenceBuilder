export type AnalyticsEventName =
  | "session_started"
  | "drill_completed"
  | "score_calculated"
  | "weekly_review_viewed";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  userId: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}
