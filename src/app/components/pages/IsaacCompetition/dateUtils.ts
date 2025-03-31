export const END_DATE = new Date("2025-04-07T16:00:00"); // Monday 7th April 2025 at 4pm
export const FOUR_WEEKS_AFTER_END_DATE = new Date(END_DATE.getTime() + 4 * 7 * 24 * 60 * 60 * 1000); // 4 weeks after end date

export const isBeforeEndDate = (currentDate: Date) => currentDate <= END_DATE;
export const isWithinFourWeeksAfterEndDate = (currentDate: Date) =>
  currentDate > END_DATE && currentDate <= FOUR_WEEKS_AFTER_END_DATE;
export const isAfterFourWeeksFromEndDate = (currentDate: Date) => currentDate > FOUR_WEEKS_AFTER_END_DATE;
