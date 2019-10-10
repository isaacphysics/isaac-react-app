import {
    AdditionalInformation,
    AugmentedEvent,
    NOT_FOUND_TYPE,
    SubjectInterests,
    UserEmailPreferences,
    UserPreferencesDTO,
    ValidationUser
} from "../../IsaacAppTypes";
import {UserSummaryWithEmailAddressDTO} from "../../IsaacApiTypes";
import {FAILURE_TOAST} from "../components/navigation/Toasts";
import {NOT_FOUND} from "./constants";

export function atLeastOne(possibleNumber?: number): boolean {return possibleNumber !== undefined && possibleNumber > 0}
export function zeroOrLess(possibleNumber?: number): boolean {return possibleNumber !== undefined && possibleNumber <= 0}

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

export const validateSubjectInterests = (subjectInterests?: SubjectInterests | null) => {
    return subjectInterests &&
        Object.values(subjectInterests).length > 0 &&
        (subjectInterests.CS_ALEVEL === true || subjectInterests.CS_ALEVEL === false);
};

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

export function allRequiredInformationIsPresent(user?: ValidationUser | null, userPreferences?: UserPreferencesDTO | null) {
    return user && userPreferences &&
        validateUserSchool(user) &&
        validateUserGender(user) &&
        validateEmailPreferences(userPreferences.EMAIL_PREFERENCE) &&
        validateSubjectInterests(userPreferences.SUBJECT_INTEREST);
}

export function validateBookingSubmission(event: AugmentedEvent, user: UserSummaryWithEmailAddressDTO, additionalInformation: AdditionalInformation) {
    if (!validateUserSchool(Object.assign({password: null}, user))) {
        return Object.assign({}, FAILURE_TOAST, {title: "School information required", body: "You must enter a school in order to book on to this event."});
    }

    // validation for users / forms that indicate the booker is not a teacher
    if (user.role == 'STUDENT' && !(additionalInformation.yearGroup == 'TEACHER' || additionalInformation.yearGroup == 'OTHER')) {
        if (!additionalInformation.yearGroup) {
            return Object.assign({}, FAILURE_TOAST, {title:"Year group required", body: "You must enter a year group to proceed."});
        }

        if (!event.virtual && (!additionalInformation.emergencyName || !additionalInformation.emergencyNumber)) {
            return Object.assign({}, FAILURE_TOAST, {title: "Emergency contact details required", body: "You must enter a emergency contact details in order to book on to this event."});
        }
    }

    // validation for users that are teachers
    if (user.role != 'STUDENT' && !additionalInformation.jobTitle) {
        return Object.assign({}, FAILURE_TOAST, {title: "Job title required", body: "You must enter a job title to proceed."});
    }

    return true;
}

export const resourceFound = <T>(resource: undefined | null | NOT_FOUND_TYPE | T): resource is T => {
    return resource !== undefined && resource !== null && resource !== NOT_FOUND;
};
