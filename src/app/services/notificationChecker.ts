import {RegisteredUserDTO} from "../../IsaacApiTypes";
import * as persistence from "./localStorage";
import {KEY} from "./localStorage";


export function showNotification(user: RegisteredUserDTO | null): boolean {
    const dateNow = new Date();
    const notificationTime = persistence.load(KEY.LAST_NOTIFICATION_TIME);
    if (user && user.registrationDate && (dateNow.getTime() - new Date(user.registrationDate).getTime()) > 14*24*60*60*1000) {
        if (dateNow.getTime() - (new Date(notificationTime || "0").getTime()) > 24*60*60*1000) {
            return true
        }
    }
    return false
}
