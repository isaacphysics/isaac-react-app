const dateLocale = "en-GB";
// 1:00 pm
export const TIME_ONLY = new Intl.DateTimeFormat(dateLocale, {hour: "numeric", minute: "2-digit", hour12: true});
// 22/01/2020
export const NUMERIC_DATE = new Intl.DateTimeFormat(dateLocale);
// Wed, 22 Jan 2020
export const FRIENDLY_DATE = new Intl.DateTimeFormat(dateLocale, {weekday: "short", day: "2-digit", month: "short", year: "numeric"});
// 22/01/2020, 13:00:00
export const NUMERIC_DATE_AND_TIME = new Intl.DateTimeFormat(dateLocale, {year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hour12: false});
// Wed, 22 Jan 2020, 1:00 pm
export const FRIENDLY_DATE_AND_TIME = new Intl.DateTimeFormat(dateLocale, {weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true});

export function formatDate(date: number | Date | undefined) {
    if (!date) return "Unknown";
    const dateObject = new Date(date);
    return NUMERIC_DATE.format(dateObject);
}

export const DateString = ({children, defaultValue, formatter=FRIENDLY_DATE_AND_TIME}: {children: any; defaultValue?: any; formatter?: any}) => {
    const fallback = defaultValue || "NOT A VALID DATE";
    try {
        return (children && formatter.format(new Date(children))) || fallback;
    } catch (e) {
        return fallback;
    }
};
