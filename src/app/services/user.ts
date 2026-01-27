import {isAda, isDefined} from "./";
import {LoggedInUser, PotentialUser, School} from "../../IsaacAppTypes";
import {AuthenticationResponseDTO, UserRole} from "../../IsaacApiTypes";
import {Immutable} from "immer";

export function isLoggedIn(user?: Immutable<PotentialUser> | null): user is Immutable<LoggedInUser> {
    return user ? user.loggedIn : false;
}

export function isStudent(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): user is LoggedInUser & {readonly role: "STUDENT"} {
    return isDefined(user) && (user.role === "STUDENT") && (user.loggedIn ?? true);
}

export function isTutor(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): user is LoggedInUser & {readonly role: "TUTOR"} {
    return isDefined(user) && (user.role === "TUTOR") && (user.loggedIn ?? true);
}

export function isTutorOrAbove(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): user is LoggedInUser & {readonly role: Exclude<UserRole, "STUDENT">} {
    return isDefined(user) && isDefined(user.role) && (user.role !== "STUDENT") && (user.loggedIn ?? true);
}

export function isTeacherOrAbove(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): user is LoggedInUser & {readonly role: Exclude<UserRole, "STUDENT" | "TUTOR">} {
    return isDefined(user) && isDefined(user.role) && (user.role !== "STUDENT") && (user.role !== "TUTOR") && (user.loggedIn ?? true);
}

export function isAdmin(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): user is LoggedInUser & {readonly role: "ADMIN"} {
    return isDefined(user) && (user.role === "ADMIN") && (user.loggedIn ?? true);
}

export function isEventManager(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): user is LoggedInUser & {readonly role: "EVENT_MANAGER"} {
    return isDefined(user) && (user.role === "EVENT_MANAGER") && (user.loggedIn ?? true);
}

export function isStaff(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): user is LoggedInUser & {readonly role: "ADMIN" | "EVENT_MANAGER" | "CONTENT_EDITOR"} {
    return isDefined(user) && (user.role === "ADMIN" || user.role === "EVENT_MANAGER" || user.role === "CONTENT_EDITOR") && (user.loggedIn ?? true);
}

export function isEventLeader(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): user is LoggedInUser & {readonly role: "EVENT_LEADER"} {
    return isDefined(user) && (user.role === "EVENT_LEADER") && (user.loggedIn ?? true);
}

export function isEventLeaderOrStaff(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): user is LoggedInUser & {readonly role: "EVENT_LEADER" | "ADMIN" | "EVENT_MANAGER" | "CONTENT_EDITOR"} {
    return isEventLeader(user) || isStaff(user);
}

export function isAdminOrEventManager(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): user is LoggedInUser & {readonly role: "ADMIN" | "EVENT_MANAGER"} {
    return isAdmin(user) || isEventManager(user);
}

export function isVerified(user?: {readonly role?: UserRole, readonly loggedIn?: boolean, readonly emailVerificationStatus?: string} | null): user is LoggedInUser & {readonly emailVerificationStatus: "VERIFIED"} {
    return isDefined(user) && (user.emailVerificationStatus === "VERIFIED");
}

// this is not type guarded, nor used on the same types as the above checks; use isTeacherPending in most cases instead.
// this checks whether a **login response** (which is usually a user, but may not be!) requires further verification.
export function isTeacherAuthResponsePendingVerification(authResponse?: AuthenticationResponseDTO): boolean {
    return !!(authResponse && ("EMAIL_VERIFICATION_REQUIRED" in authResponse || "teacherAccountPending" in authResponse && authResponse?.teacherAccountPending === true));
}

/*
* Returns true if the client is in a "teacher pending verification" (AKA caveat login) state, and needs to do something else for
*  full functionality (e.g. email verification).
*
* Todo: For now this is specific to the Ada teacher flow. For Ada, teacher accounts where teacherAccountPending is true
*  can only ever be partially logged-in.
*/
export function isTeacherPending(user?: Immutable<PotentialUser> | null): user is LoggedInUser {
    return isLoggedIn(user) && !!(isAda && isTeacherAuthResponsePendingVerification(user));
}

export const roleRequirements: Record<UserRole, (u: {readonly role?: UserRole, readonly loggedIn?: boolean} | null) => boolean> = {
    "STUDENT": isStudent,
    "TUTOR": isTutorOrAbove,
    "TEACHER": isTeacherOrAbove,
    "EVENT_LEADER": isEventLeaderOrStaff,
    "CONTENT_EDITOR": isStaff,
    "EVENT_MANAGER": isEventManager,
    "ADMIN": isAdmin
};

export function extractTeacherName(teacher: {readonly givenName?: string; readonly familyName?: string} | null | undefined): string | null {
    if (null == teacher) {
        return null;
    }
    return (teacher.givenName ? teacher.givenName.charAt(0) + ". " : "") + teacher.familyName;
}

export function schoolNameWithPostcode(schoolResult: School): string | undefined {
    let schoolName = schoolResult.name;
    if (schoolResult.postcode) {
        schoolName += ", " + schoolResult.postcode;
    }
    return schoolName;
}
