import {LoggedInUser} from "../../IsaacAppTypes";

export function isTeacher(user: LoggedInUser) {
    return user.loggedIn && user.role != "STUDENT";
}

export function isAdmin(user: LoggedInUser) {
    return user.loggedIn && user.role == "ADMIN";
}

export function isStaffUser(user: LoggedInUser | null) {
    return user ? user.loggedIn && (user.role == "ADMIN" || user.role == "EVENT_MANAGER" || user.role == "CONTENT_EDITOR") : false;
}

export function extractTeacherName(teacher: {givenName?: string; familyName?: string} | null) {
    if (null == teacher)
        return null;
    return (teacher.givenName ? teacher.givenName.charAt(0) + ". " : "") + teacher.familyName;
}
