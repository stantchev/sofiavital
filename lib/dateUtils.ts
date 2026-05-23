/** Format a date string in Bulgarian — safe for both client and server */
export function formatDateBg(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("bg-BG", {
    day:   "numeric",
    month: "long",
    year:  "numeric",
  });
}
