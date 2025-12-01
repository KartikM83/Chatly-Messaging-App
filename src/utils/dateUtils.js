
export function groupMessagesByDate(messages) {
  const groups = {};

  messages.forEach((msg) => {
    const d = new Date(msg.timestamp);

    // 👇 Only date part (YYYY-MM-DD)
    const dateKey = d.toISOString().slice(0, 10);

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(msg);
  });

  // Convert object → sorted array (oldest date first)
  return Object.entries(groups)
    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
    .map(([date, msgs]) => ({
      date,
      messages: msgs,
    }));
    
}

export function formatDateLabel(dateKey) {
  const date = new Date(dateKey); // dateKey is "YYYY-MM-DD"

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }); // e.g. "01 Dec 2025"
}

