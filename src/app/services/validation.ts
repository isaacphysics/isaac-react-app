import {UserEmailPreferences} from "../../IsaacAppTypes";


export const validateEmail = (email: string) => {
    return (email.length > 0 && email.includes("@"));
};

export const isDobOverThirteen = (dateOfBirth: Date | null) => {
    const today = new Date();
    const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    const hundredAndTwentyYearsAgo = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    return !!dateOfBirth && dateOfBirth <= thirteenYearsAgo && dateOfBirth >= hundredAndTwentyYearsAgo;
};

export const MINIMUM_PASSWORD_LENGTH = 6;
export const validatePassword = (password: string) => {
    return password.length >= MINIMUM_PASSWORD_LENGTH;
};

export const validateEmailPreferences = (emailPreferences: UserEmailPreferences | null) => {
    return emailPreferences !== null && [
        emailPreferences.ASSIGNMENTS,
        emailPreferences.EVENTS,
        emailPreferences.NEWS_AND_UPDATES
    ].reduce((prev, next) => prev && (next === true || next === false), true); // Make sure all expected values are either true or false
};

const withinLastNMinutes = (n: number, dateOfAction: string | null) => {
    if (dateOfAction) {
        const interval = n * 60 * 1000;
        const now = new Date();
        const actionTime = new Date(dateOfAction);
        const nMinutesAgo = new Date(now.getTime() - interval);
        return nMinutesAgo <= actionTime && actionTime <= now;
    } else {
        return false;
    }
};

export const withinLast50Minutes = withinLastNMinutes.bind(null, 50);
