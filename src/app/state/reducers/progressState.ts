import {Action, UserProgress} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";

export type MyProgressState = UserProgress | null;
export const myProgress = (myProgress: MyProgressState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.MY_PROGRESS_RESPONSE_SUCCESS:
            return action.myProgress;
        case ACTION_TYPE.USER_SNAPSHOT_PARTIAL_UPDATE:
            return {  // update only the snapshot and then potentially only partially
                ...(myProgress || {}),
                userSnapshot: {...(myProgress?.userSnapshot || {}), ...action.userSnapshot}
            };
        case ACTION_TYPE.USER_SNAPSHOT_RESPONSE_SUCCESS:
            return {  // update only the snapshot and then potentially only partially
                ...(myProgress || {}),
                userSnapshot: {...(myProgress?.userSnapshot || {}), ...action.snapshot}
            };
        case ACTION_TYPE.MY_PROGRESS_RESPONSE_FAILURE:
            return null;
        default:
            return myProgress;
    }
};

export type UserProgressState = UserProgress | null;
export const userProgress = (userProgress: UserProgressState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.USER_PROGRESS_RESPONSE_SUCCESS:
            return action.userProgress;
        // don't want to update the user snapshot when viewing another user's progress, see myProgress
        case ACTION_TYPE.USER_PROGRESS_RESPONSE_FAILURE:
            return null;
        default:
            return userProgress;
    }
};
