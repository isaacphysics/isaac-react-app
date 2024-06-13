export const dayMonthYearStringToDate = (d?: string) => {
    if (!d) return undefined;
    const parts = d.split("/").map(n => parseInt(n, 10));
    return new Date(parts[2], parts[1] - 1, parts[0], 0, 0, 0, 0);
}

export const ONE_DAY_IN_MS = 86400000;

export const DDMMYYYY_REGEX = /\d{2}\/\d{2}\/\d{4}/;

export const NOW = Date.now(); // Use same "now" for all time relative calculations

export const DAYS_AGO = (n: number, roundDownToNearestDate = false) => {
    let d = new Date(NOW);
    d.setUTCDate(d.getUTCDate() - n);
    if (roundDownToNearestDate) d.setHours(0, 0, 0, 0);
    return d.valueOf();
};