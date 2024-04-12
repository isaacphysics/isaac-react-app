import { RegisteredUserDTO } from "../../IsaacApiTypes";
import { KEY, persistence } from "./";
import { Immutable } from "immer";

export function showNotification(user: Immutable<RegisteredUserDTO> | null): boolean {
  const dateNow = new Date().getTime();
  const fourteenDays = 14 * 24 * 60 * 60 * 1000;
  const twentyFourHours = 24 * 60 * 60 * 1000;

  const notificationTime = persistence.load(KEY.LAST_NOTIFICATION_TIME);
  // if user has been registered for more than 14 days and has not seen the notification in the last 24 hours
  if (
    user?.registrationDate &&
    dateNow - user.registrationDate > fourteenDays &&
    dateNow - new Date(notificationTime || "0").getTime() > twentyFourHours
  ) {
    return true;
  }
  return false;
}
