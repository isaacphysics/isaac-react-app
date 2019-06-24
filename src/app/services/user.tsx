import {LoggedInUser} from "../../IsaacAppTypes";

export function isTeacher(user: LoggedInUser) {
    return user.loggedIn && user.role != "STUDENT";
}

export function isAdmin(user: LoggedInUser) {
    return user.loggedIn && user.role == "ADMIN";
}

export function extractTeacherName(teacher: {givenName?: string; familyName?: string} | null) {
    if (null == teacher)
        return null;
    return (teacher.givenName ? teacher.givenName.charAt(0) + ". " : "") + teacher.familyName;
}
