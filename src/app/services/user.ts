import {LoggedInUser, PotentialUser, School} from "../../IsaacAppTypes";

export function isLoggedIn(user?: PotentialUser | null): user is LoggedInUser {
    return user ? user.loggedIn : false;
}

export function isStudent(user?: PotentialUser | null): boolean {
    return isLoggedIn(user) && user.role === "STUDENT";
}

export function isTeacher(user?: PotentialUser | null): boolean {
    return isLoggedIn(user) && user.role !== "STUDENT";
}

export function isAdmin(user?: PotentialUser | null): boolean {
    return isLoggedIn(user) && user.role === "ADMIN";
}

export function isEventManager(user?: PotentialUser | null): boolean {
    return isLoggedIn(user) && (user.role === "EVENT_MANAGER");
}

export function isStaff(user?: PotentialUser | null): boolean {
    return isLoggedIn(user) && (user.role === "ADMIN" || user.role === "EVENT_MANAGER" || user.role === "CONTENT_EDITOR");
}

export function isEventLeader(user?: PotentialUser | null): boolean {
    return isLoggedIn(user) && user.role === "EVENT_LEADER";
}

export function isEventLeaderOrStaff(user?: PotentialUser | null): boolean {
    return isEventLeader(user) || isStaff(user);
}

export function isAdminOrEventManager(user?: PotentialUser | null): boolean {
    return isAdmin(user) || isEventManager(user);
}

export function extractTeacherName(teacher: {givenName?: string; familyName?: string} | null): string | null {
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
