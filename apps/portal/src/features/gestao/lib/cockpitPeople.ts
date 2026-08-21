export type ReminderLike = {
  id: string;
  status: string;
  dueAt: number | null;
  createdAt: Date;
};

export function getOpenPeopleReminders<T extends ReminderLike>(
  reminders: T[],
  now = Date.now()
) {
  return reminders
    .filter(
      reminder =>
        reminder.status !== "completed" &&
        reminder.status !== "cancelled" &&
        reminder.status !== "archived"
    )
    .sort(
      (a, b) =>
        (a.dueAt ?? Number.MAX_SAFE_INTEGER) -
          (b.dueAt ?? Number.MAX_SAFE_INTEGER) ||
        a.createdAt.getTime() - b.createdAt.getTime()
    )
    .map(reminder => ({
      ...reminder,
      isOverdue: Boolean(reminder.dueAt && reminder.dueAt < now),
    }));
}
