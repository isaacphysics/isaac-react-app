import { ACTION_TYPE, api } from "../../services";

// Generic log action
export const logAction = (eventDetails: object) => {
  api.logger.log(eventDetails); // We do not care whether this completes or not
  return { type: ACTION_TYPE.LOG_EVENT, eventDetails: eventDetails };
};
