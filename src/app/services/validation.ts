import {LoggedInUser, SubjectInterest, UserEmailPreferences, UserPreferencesDTO} from "../../IsaacAppTypes";


export const validateEmail = (email?: string) => {
    return email && email.length > 0 && email.includes("@");
};

export const isDobOverThirteen = (dateOfBirth?: Date) => {
    if (dateOfBirth) {
        const today = new Date();
        const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
        const hundredAndTwentyYearsAgo = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
        return hundredAndTwentyYearsAgo <= dateOfBirth && dateOfBirth <= thirteenYearsAgo;
    } else {
        return false;
    }
};

export const MINIMUM_PASSWORD_LENGTH = 6;
export const validatePassword = (password: string) => {
    return password.length >= MINIMUM_PASSWORD_LENGTH;
};

export const validateEmailPreferences = (emailPreferences?: UserEmailPreferences | null) => {
    return emailPreferences && [
        emailPreferences.ASSIGNMENTS,
        emailPreferences.EVENTS,
        emailPreferences.NEWS_AND_UPDATES
    ].reduce(
        (prev, next) => prev && (next === true || next === false), // Make sure all expected values are either true or false
        true
    );
};

export const validateSubjectInterest = (subjectInterest?: SubjectInterest | null) => {
    return subjectInterest &&
        Object.values(subjectInterest).length > 0 &&
        (subjectInterest.CS_ALEVEL === true || subjectInterest.CS_ALEVEL === false);
};

const withinLastNMinutes = (nMinutes: number, dateOfAction: string | null) => {
    if (dateOfAction) {
        const now = new Date();
        const nMinutesAgo = new Date(now.getTime() - nMinutes * 60 * 1000);
        const actionTime = new Date(dateOfAction);
        return nMinutesAgo <= actionTime && actionTime <= now;
    } else {
        return false;
    }
};
export const withinLast50Minutes = withinLastNMinutes.bind(null, 50);

export function allRequiredInformationIsPresent(user?: LoggedInUser | null, userPreferences?: UserPreferencesDTO | null) {
    return user && userPreferences &&
        validateEmailPreferences(userPreferences.EMAIL_PREFERENCE) &&
        validateSubjectInterest(userPreferences.SUBJECT_INTEREST);
}
