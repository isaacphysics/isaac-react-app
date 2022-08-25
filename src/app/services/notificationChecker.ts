import {RegisteredUserDTO} from "../../IsaacApiTypes";
import {KEY, persistence} from "./";

export function showNotification(user: RegisteredUserDTO | null) {
    const dateNow = new Date();
    const notificationTime = persistence.load(KEY.LAST_NOTIFICATION_TIME);
    if (user && user.registrationDate && (dateNow.getTime() - new Date(user.registrationDate).getTime()) > 14*24*60*60*1000) {
        if (dateNow.getTime() - (new Date(notificationTime || "0").getTime()) > 24*60*60*1000) {
            return true
        }
    } else return false
}
