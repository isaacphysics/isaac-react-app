export const dayMonthYearStringToDate = (d?: string) => {
    if (!d) return undefined;
    const parts = d.split("/").map(n => parseInt(n, 10));
    return new Date(parts[2], parts[1] - 1, parts[0], 0, 0, 0, 0);
}

export const ONE_DAY_IN_MS = 86400000;

export const DDMMYYYY_REGEX = /\d{2}\/\d{2}\/\d{4}/;

export const NOW = Date.now(); // Use same "now" for all time relative calculations

export const DAYS_AGO = (date: Date = new Date(NOW), delta_days: number, roundDownToNearestDate = false) => {
    date.setUTCDate(date.getUTCDate() - delta_days);
    if (roundDownToNearestDate) date.setHours(0, 0, 0, 0);
    return date.valueOf();
};

export const SOME_FIXED_FUTURE_DATE_AS_STRING = '15 Jan 2050 12:00:00 GMT';
export const SOME_FIXED_FUTURE_DATE = Date.parse(SOME_FIXED_FUTURE_DATE_AS_STRING);
