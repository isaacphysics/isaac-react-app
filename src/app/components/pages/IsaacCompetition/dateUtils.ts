export const END_DATE = new Date("2025-03-28T16:00:00"); // 4 PM on Friday, March 28, 2025
export const FOUR_WEEKS_AFTER_END_DATE = new Date(END_DATE.getTime() + 4 * 7 * 24 * 60 * 60 * 1000); // 4 weeks after end date

export const isBeforeEndDate = (currentDate: Date) => currentDate <= END_DATE;
export const isWithinFourWeeksAfterEndDate = (currentDate: Date) =>
  currentDate > END_DATE && currentDate <= FOUR_WEEKS_AFTER_END_DATE;
export const isAfterFourWeeksFromEndDate = (currentDate: Date) => currentDate > FOUR_WEEKS_AFTER_END_DATE;
