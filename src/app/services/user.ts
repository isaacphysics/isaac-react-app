import {isDefined} from "./";
import {LoggedInUser, PotentialUser, School} from "../../IsaacAppTypes";
import {Role} from "../../IsaacApiTypes";
import {Immutable} from "immer";

export function isLoggedIn(user?: Immutable<PotentialUser> | null): user is Immutable<LoggedInUser> {
    return user ? user.loggedIn : false;
}

export function isStudent(user?: {readonly role?: Role, readonly loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role === "STUDENT") && (user.loggedIn ?? true);
}

export function isTeacher(user?: {readonly role?: Role, readonly loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role !== "STUDENT") && (user.loggedIn ?? true);
}

export function isAdmin(user?: {readonly role?: Role, readonly loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role === "ADMIN") && (user.loggedIn ?? true);
}

export function isEventManager(user?: {readonly role?: Role, readonly loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role === "EVENT_MANAGER") && (user.loggedIn ?? true);
}

export function isStaff(user?: {readonly role?: Role, readonly loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role === "ADMIN" || user.role === "EVENT_MANAGER" || user.role === "CONTENT_EDITOR") && (user.loggedIn ?? true);
}

export function isEventLeader(user?: {readonly role?: Role, readonly loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role === "EVENT_LEADER") && (user.loggedIn ?? true);
}

export function isEventLeaderOrStaff(user?: {readonly role?: Role, readonly loggedIn?: boolean} | null): boolean {
    return isEventLeader(user) || isStaff(user);
}

export function isAdminOrEventManager(user?: {readonly role?: Role, readonly loggedIn?: boolean} | null): boolean {
    return isAdmin(user) || isEventManager(user);
}

export const roleRequirements: Record<Role, (u: {readonly role?: Role, readonly loggedIn?: boolean} | null) => boolean> = {
    "STUDENT": isStudent,
    "TEACHER": isTeacher,
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
        schoolName += ", " + schoolResult.postcode
    }
    return schoolName;
}
