import {
    AdditionalInformation,
    AugmentedEvent,
    UserEmailPreferences,
    UserPreferencesDTO,
    ValidationUser
} from "../../IsaacAppTypes";
import {UserContext, UserSummaryWithEmailAddressDTO} from "../../IsaacApiTypes";
import {FAILURE_TOAST} from "../components/navigation/Toasts";
import {EXAM_BOARD, isAda, isPhy, isStudent, isTeacherOrAbove, isTutor, siteSpecific, STAGE} from "./";
import {Immutable} from "immer";

export function atLeastOne(possibleNumber?: number): boolean {return possibleNumber !== undefined && possibleNumber > 0}
export function zeroOrLess(possibleNumber?: number): boolean {return possibleNumber !== undefined && possibleNumber <= 0}

export function validateName(userName?: string | null) {
    return userName && userName.length > 0 && userName.length <= 255 && !userName.includes('*')
}

export function validateCountryCode(countryCode: string | undefined) {
    return !!countryCode;
}

export const validateEmail = (email?: string) => {
    return email && email.length > 0 && /.*@.+\.[^.]+$/.test(email);
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
export const isDobOldEnoughForSite = siteSpecific(isDobOverTen, isDobOverThirteen);

export const MINIMUM_PASSWORD_LENGTH = 8;
export const validatePassword = (password: string) => {
    return password.length >= MINIMUM_PASSWORD_LENGTH;
};

export const validateEmailPreferences = (emailPreferences?: UserEmailPreferences | null) => {
    return emailPreferences && [
        emailPreferences.ASSIGNMENTS,
        emailPreferences.NEWS_AND_UPDATES
    ].concat(siteSpecific([emailPreferences.EVENTS], [])).reduce(
        // Make sure all expected values are either true or false
        (prev, next) => prev && (next === true || next === false),
        true
    );
};

export function validateUserContexts(userContexts?: UserContext[], defaultIsValid=false): boolean {
    if (userContexts === undefined) {return false;}
    if (defaultIsValid && userContexts.length === 1 && Object.keys(userContexts[0]).length === 0) {return true;}
    if (userContexts.length === 0) {return false;}
    return userContexts.every(uc =>
        Object.values(STAGE).includes(uc.stage as STAGE) && //valid stage
        (!isAda || Object.values(EXAM_BOARD).includes(uc.examBoard as EXAM_BOARD)) // valid exam board for cs
    );
}

// Users school is valid if user is a tutor - their school is allowed to be undefined
export const validateUserSchool = (user?: Immutable<ValidationUser> | null) => {
    return !!user && (
        (!!user.schoolId) ||
        (!!user.schoolOther && user.schoolOther.length > 0) ||
        isTutor(user)
    );
};

export const validateUserGender = (user?: Immutable<ValidationUser> | null) => {
    return user && user.gender && user.gender !== "UNKNOWN";
};

export const wasTodayUTC = (dateOfAction: string | null) => {
    if (dateOfAction) {
        const now = new Date();
        const actionTime = new Date(dateOfAction);
        return now.getUTCDate() == actionTime.getUTCDate();
    } else {
        return false;
    }
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

export function allRequiredInformationIsPresent(user?: Immutable<ValidationUser> | null, userPreferences?: UserPreferencesDTO | null, userContexts?: UserContext[]) {
    return user && userPreferences && validateName(user.givenName) && validateName(user.familyName)
        && validateUserContexts(userContexts, isAda)
        && (userPreferences.EMAIL_PREFERENCE === null || validateEmailPreferences(userPreferences.EMAIL_PREFERENCE))
        && (isPhy || (!isTeacherOrAbove(user) || validateUserSchool(user)))
}

export function validateBookingSubmission(event: AugmentedEvent, user: Immutable<UserSummaryWithEmailAddressDTO>, additionalInformation: AdditionalInformation) {
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

    // validation for users that are teachers or tutors
    if (!isStudent(user) && !additionalInformation.jobTitle) {
        return Object.assign({}, FAILURE_TOAST, {title: "Job title required", body: "You must enter a job title to proceed."});
    }

    return true;
}

export function safePercentage(correct: number | null | undefined, attempts: number | null | undefined) {
    return (!(correct || correct == 0) || !attempts) ? null : correct / attempts * 100;
}
