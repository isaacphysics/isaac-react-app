import { RegisteredUserDTO } from "../../IsaacApiTypes";
import { KEY, persistence } from "./";
import { Immutable } from "immer";

export function showNotification(user: Immutable<RegisteredUserDTO> | null): boolean {
  const dateNow = new Date();
  const notificationTime = persistence.load(KEY.LAST_NOTIFICATION_TIME);
  if (
    user &&
    user.registrationDate &&
    dateNow.getTime() - new Date(user.registrationDate).getTime() > 14 * 24 * 60 * 60 * 1000
  ) {
    if (dateNow.getTime() - new Date(notificationTime || "0").getTime() > 24 * 60 * 60 * 1000) {
      return true;
    }
  }
  return false;
}
