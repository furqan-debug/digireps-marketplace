export type ActivityStatus = "online" | "away" | "offline";

export interface ActivityStatusInfo {
  status: ActivityStatus;
  color: string;
  label: string;
}

export function getActivityStatus(lastActiveAt: string | null): ActivityStatusInfo {
  if (!lastActiveAt) return { status: "offline", color: "bg-gray-400", label: "Offline" };
  const diff = Date.now() - new Date(lastActiveAt).getTime();
  const mins = diff / 60000;
  if (mins < 5) return { status: "online", color: "bg-emerald-500", label: "Online" };
  if (mins < 30) return { status: "away", color: "bg-amber-500", label: "Away" };
  return { status: "offline", color: "bg-gray-400", label: "Offline" };
}
