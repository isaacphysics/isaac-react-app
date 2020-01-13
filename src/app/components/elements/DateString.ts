// TODO Format options
// export const FORMAT = {
//     TIME_ONLY: (d: Date) => `${d.getUTCHours()}:${d.getUTCMinutes()} UTC`,
//     DAY: (d: Date) => `${d.getUTCDay()} ${d.getUTCDate()} ${d.getUTCMonth()} ${d.getUTCFullYear()}`,
//     DAY_AND_TIME: (d: Date) => `${d.getUTCDay()} ${d.getUTCDate()} ${d.getUTCMonth()} ${d.getUTCFullYear()}  ${d.getUTCHours()}:${d.getUTCMinutes()}`,
// };

import {DATE_FORMATTER} from "../../services/constants";

export function formatDate(date: number | Date | undefined) {
    if (!date) return "Unknown";
    const dateObject = new Date(date);
    return DATE_FORMATTER.format(dateObject);
}

export const DateString = ({children, defaultValue}: {children: any; defaultValue?: any}) => {
    const fallback = defaultValue || "NOT A VALID DATE";
    try {
        return (children && new Date(children).toUTCString()) || fallback;
    } catch (e) {
        return fallback;
    }
};
