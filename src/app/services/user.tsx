import {LoggedInUser} from "../../IsaacAppTypes";

export function isLoggedIn(user?: LoggedInUser | null) {
    return user ? user.loggedIn : false;
}

export function isStudent(user?: LoggedInUser | null) {
    return user ? user.loggedIn && user.role == "STUDENT" : false;
}

export function isTeacher(user?: LoggedInUser | null) {
    return user ? user.loggedIn && user.role != "STUDENT" : false;
}

export function isAdmin(user?: LoggedInUser | null) {
    return user ? user.loggedIn && user.role == "ADMIN" : false;
}

export function isStaff(user?: LoggedInUser | null) {
    return user ? user.loggedIn && (user.role == "ADMIN" || user.role == "EVENT_MANAGER" || user.role == "CONTENT_EDITOR") : false;
}

export function isEventLeader(user?: LoggedInUser | null) {
    return user ? user.loggedIn && user.role == "EVENT_LEADER" : false;
}

export function isAdminOrEventManager(user?: LoggedInUser | null) {
    return user ? user.loggedIn && (user.role == "ADMIN" || user.role == "EVENT_MANAGER") : false;
}

export function extractTeacherName(teacher: {givenName?: string; familyName?: string} | null) {
    if (null == teacher)
        return null;
    return (teacher.givenName ? teacher.givenName.charAt(0) + ". " : "") + teacher.familyName;
}
