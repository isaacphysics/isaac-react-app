//Expression of interest banner will be shown till midnight on 2 Nov 2025. Entries open banner will be displayed after this till COMPETITION_END_DATE
//The competition entry form will be displayed on the Events -> National Competition page after this date.
export const COMPETITION_OPEN_DATE = new Date("2025-11-02T23:59:59Z"); // UTC timezone

//The Entries open banner will be displayed till midnight on 31 Jan 2026. Entries closed banner will be displayed after this till ENTRIES_CLOSED_BANNER_END_DATE
export const COMPETITION_END_DATE = new Date("2026-01-31T23:59:59Z"); // UTC timezone

//The Entries closed banner will be displayed till midnight on 13 Mar 2026.
export const ENTRIES_CLOSED_BANNER_END_DATE = new Date("2026-03-13T23:59:59Z"); // UTC timezone

export const FOUR_WEEKS_AFTER_END_DATE = new Date(COMPETITION_END_DATE.getTime() + 4 * 7 * 24 * 60 * 60 * 1000); // 4 weeks after end date

export const isBeforeCompetitionOpenDate = (currentDate: Date) => currentDate <= COMPETITION_OPEN_DATE;

export const isAfterCompetitionOpenDateAndBeforeCompetitionEndDate = (currentDate: Date) =>
  currentDate > COMPETITION_OPEN_DATE && currentDate <= COMPETITION_END_DATE;

export const isAfterCompetitionEndDateAndBeforeEntriesClosedBannerEndDate = (currentDate: Date) =>
  currentDate > COMPETITION_END_DATE && currentDate <= ENTRIES_CLOSED_BANNER_END_DATE;

export const liveQandASessionDate = new Date("2025-11-13");
