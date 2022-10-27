import {isDefined} from "./";
import {LoggedInUser, PotentialUser, School} from "../../IsaacAppTypes";
import {Role} from "../../IsaacApiTypes";

export function isLoggedIn(user?: PotentialUser | null): user is LoggedInUser {
    return user ? user.loggedIn : false;
}

export function isStudent(user?: {role?: Role, loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role === "STUDENT") && (user.loggedIn ?? true);
}

export function isTeacher(user?: {role?: Role, loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role !== "STUDENT") && (user.loggedIn ?? true);
}

export function isAdmin(user?: {role?: Role, loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role === "ADMIN") && (user.loggedIn ?? true);
}

export function isEventManager(user?: {role?: Role, loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role === "EVENT_MANAGER") && (user.loggedIn ?? true);
}

export function isStaff(user?: {role?: Role, loggedIn?: boolean} | null) {
    return isDefined(user) && (user.role === "ADMIN" || user.role === "EVENT_MANAGER" || user.role === "CONTENT_EDITOR") && (user.loggedIn ?? true);
}

export function isEventLeader(user?: {role?: Role, loggedIn?: boolean} | null) {
    return isDefined(user) && (user.role === "EVENT_LEADER") && (user.loggedIn ?? true);
}

export function isEventLeaderOrStaff(user?: {role?: Role, loggedIn?: boolean} | null): boolean {
    return isEventLeader(user) || isStaff(user);
}

export function isAdminOrEventManager(user?: {role?: Role, loggedIn?: boolean} | null): boolean {
    return isAdmin(user) || isEventManager(user);
}

export const roleRequirements: Record<Role, (u: {role?: Role, loggedIn?: boolean} | null) => boolean> = {
    "STUDENT": isStudent,
    "TEACHER": isTeacher,
    "EVENT_LEADER": isEventLeaderOrStaff,
    "CONTENT_EDITOR": isStaff,
    "EVENT_MANAGER": isEventManager,
    "ADMIN": isAdmin
};

export function extractTeacherName(teacher: {givenName?: string; familyName?: string} | null | undefined): string | null {
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
