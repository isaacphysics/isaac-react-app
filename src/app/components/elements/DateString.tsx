import React, { ReactNode } from "react";
import { HoverableTooltip } from "./HoverableTooltip";

const dateLocale = "en-GB";
// 13:00
export const TIME_ONLY = new Intl.DateTimeFormat(dateLocale, {hour: "numeric", minute: "2-digit", hour12: false});
// 22/01/2020
export const NUMERIC_DATE = new Intl.DateTimeFormat(dateLocale);
// Wed, 22 Jan 2020
export const FRIENDLY_DATE = new Intl.DateTimeFormat(dateLocale, {weekday: "short", day: "numeric", month: "short", year: "numeric"});
// 22/01/2020, 13:00:00
export const NUMERIC_DATE_AND_TIME = new Intl.DateTimeFormat(dateLocale, {year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hour12: false});
// Wed, 22 Jan 2020, 13:00
export const FRIENDLY_DATE_AND_TIME = new Intl.DateTimeFormat(dateLocale, {weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: false});

export function formatDate(date: number | Date | undefined, formatter=NUMERIC_DATE) {
    if (!date) return "Unknown";
    const dateObject = new Date(date);
    return formatter.format(dateObject);
}

// 2020-01-22
export function formatISODateOnly(date: number | Date) {
    const dateObject = new Date(date);
    // ISO String looks like 2020-01-22T13:00:00.000Z so remove the time:
    return dateObject.toISOString().split("T")[0];
}

export const DateString = ({children, defaultValue, formatter=FRIENDLY_DATE_AND_TIME}: {children: any; defaultValue?: any; formatter?: any}) => {
    const fallback = defaultValue || "NOT A VALID DATE";
    try {
        return (children && formatter.format(new Date(children))) || fallback;
    } catch (e) {
        return fallback;
    }
};

/**
 * Calculates and returns a friendly string representing the number of days until a given date.
 * If the date is in the future, return "today" if today, "tomorrow" if tomorrow, "in x days" if within a week, "on <date>" if later.
 * If the date is in the past, return "yesterday" if yesterday, "x days ago" if within a week, "on <date>" if earlier.
 * In all cases besides "on <date>", the string is wrapped in a HoverableTooltip showing the exact date.
 * @param date the date to compare against
 * @returns the friendly string as an element.
 */
export function getFriendlyDaysUntil(date: number | Date) : NonNullable<ReactNode> {
    const today = new Date();

    const getStartOfDay = (date: number | Date): Date => {
        const dateObject = new Date(date);
        dateObject.setHours(0, 0, 0, 0);
        return dateObject;
    };

    const daysUntil = (getStartOfDay(date).getTime() - getStartOfDay(today).getTime()) / 86400000;

    let result;

    if (daysUntil < 0) {
        // in the past
        if (daysUntil === -1) result = "yesterday";
        if (daysUntil && daysUntil > -7) result = `${-daysUntil} days ago`;
    } else {
        // in the future
        if (daysUntil === 0) result = "today";
        if (daysUntil === 1) result = "tomorrow";
        if (daysUntil && daysUntil < 7) result = `in ${daysUntil} days`;
    }

    // if the date has a special result, return it with a tooltip showing the exact date
    if (result) return <HoverableTooltip tooltip={formatDate(date, FRIENDLY_DATE)}>{result}</HoverableTooltip>;

    return `on ${FRIENDLY_DATE.format(new Date(date))}`;
}
