import {LoggedInUser} from "../../IsaacAppTypes";

export function isTeacher(user: LoggedInUser) {
    return user.loggedIn && user.role != "STUDENT";
}

export function isAdmin(user: LoggedInUser) {
    return user.loggedIn && user.role == "ADMIN";
}