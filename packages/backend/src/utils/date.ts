export function addDays(date: Date | string, days: number): Date {
  const baseDate = date instanceof Date ? new Date(date) : new Date(date);

  // Проверка на корректность даты
  if (isNaN(baseDate.getTime())) {
    throw new Error("Invalid date provided");
  }

  const result = new Date(baseDate);
  result.setDate(baseDate.getDate() + days);
  return result;
}
