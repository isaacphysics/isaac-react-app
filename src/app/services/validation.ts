import {
    AdditionalInformation,
    AugmentedEvent,
    UserEmailPreferences,
    UserPreferencesDTO,
    ValidationUser
} from "../../IsaacAppTypes";
import {UserContext, UserSummaryWithEmailAddressDTO} from "../../IsaacApiTypes";
import {FAILURE_TOAST} from "../components/navigation/Toasts";
import {EXAM_BOARD, isCS, isLoggedIn, isStudent, STAGE} from "./";

export function atLeastOne(possibleNumber?: number): boolean {return possibleNumber !== undefined && possibleNumber > 0}
export function zeroOrLess(possibleNumber?: number): boolean {return possibleNumber !== undefined && possibleNumber <= 0}

export function validateName(userName?: string | null) {
    return userName && userName.length > 0 && userName.length <= 255 && !userName.includes('*')
}

export const validateEmail = (email?: string) => {
    return email && email.length > 0 && email.includes("@");
};

export const isValidGameboardId = (gameboardId?: string) => {
    return !gameboardId || /^[a-z0-9_-]+$/.test(gameboardId);
};

const isDobOverN = (n: number, dateOfBirth?: Date) => {
    if (dateOfBirth) {
        const today = new Date();
        const nYearsAgo = new Date(today.getFullYear() - n, today.getMonth(), today.getDate());
        const hundredAndTwentyYearsAgo = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
        return hundredAndTwentyYearsAgo <= dateOfBirth && dateOfBirth <= nYearsAgo;
    } else {
        return false;
    }
};

export const isDobOverThirteen = (dateOfBirth?: Date) => isDobOverN(13, dateOfBirth);
export const isDobOverTen = (dateOfBirth?: Date) => isDobOverN(10, dateOfBirth);

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
        // Make sure all expected values are either true or false
        (prev, next) => prev && (next === true || next === false),
        true
    );
};

export function validateUserContexts(userContexts?: UserContext[]): boolean {
    if (userContexts === undefined) {return false;}
    if (userContexts.length === 0) {return false;}
    return userContexts.every(uc =>
        Object.values(STAGE).includes(uc.stage as STAGE) && //valid stage
        (!isCS || Object.values(EXAM_BOARD).includes(uc.examBoard as EXAM_BOARD)) // valid exam board for cs
    );
}

export const validateUserSchool = (user?: ValidationUser | null) => {
    return !!user && (
        (!!user.schoolId) ||
        (!!user.schoolOther && user.schoolOther.length > 0)
    );
};

export const validateUserGender = (user?: ValidationUser | null) => {
    return user && user.gender && user.gender !== "UNKNOWN";
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
export const withinLast2Hours = withinLastNMinutes.bind(null, 120);

export function allRequiredInformationIsPresent(user?: ValidationUser | null, userPreferences?: UserPreferencesDTO | null, userContexts?: UserContext[]) {
    return user && userPreferences
        && (!isCS || (validateUserSchool(user) && validateUserGender(user)
        && validateName(user.givenName) && validateName(user.familyName)))
        && (userPreferences.EMAIL_PREFERENCE === null || validateEmailPreferences(userPreferences.EMAIL_PREFERENCE))
        && validateUserContexts(userContexts);
}

// TUTOR TODO consider tutor role in here if necessary
export function validateBookingSubmission(event: AugmentedEvent, user: UserSummaryWithEmailAddressDTO, additionalInformation: AdditionalInformation) {
    if (!validateUserSchool(Object.assign({password: null}, user))) {
        return Object.assign({}, FAILURE_TOAST, {title: "School information required", body: "You must enter a school in order to book on to this event."});
    }

    // validation for users / forms that indicate the booker is not a teacher
    if (isStudent(user) && !(additionalInformation.yearGroup == 'TEACHER' || additionalInformation.yearGroup == 'OTHER')) {
        if (!additionalInformation.yearGroup) {
            return Object.assign({}, FAILURE_TOAST, {title:"Year group required", body: "You must enter a year group to proceed."});
        }

        if (!event.isVirtual && (!additionalInformation.emergencyName || !additionalInformation.emergencyNumber)) {
            return Object.assign({}, FAILURE_TOAST, {title: "Emergency contact details required", body: "You must enter a emergency contact details in order to book on to this event."});
        }
    }

    // validation for users that are teachers
    if (!isStudent(user) && !additionalInformation.jobTitle) {
        return Object.assign({}, FAILURE_TOAST, {title: "Job title required", body: "You must enter a job title to proceed."});
    }

    return true;
}

export function safePercentage(correct: number | null | undefined, attempts: number | null | undefined) {
    return (!(correct || correct == 0) || !attempts) ? null : correct / attempts * 100;
}
