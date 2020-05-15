import {RegisteredUserDTO} from "../../IsaacApiTypes";
import * as persistence from "./localStorage";
import {KEY} from "./localStorage";


export function showNotification(user: RegisteredUserDTO | null) {
    if (user && user.registrationDate && (Date.now() - (Number(user.registrationDate)) > 2*24*60*60*1000)) {
        if (Date.now() - Number(persistence.load(KEY.LAST_NOTIFICATION_TIME)) > 24*60*60*1000) {
            return true
        }
    } else return false
}
