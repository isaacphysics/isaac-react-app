import {UserGameboardProgressSummaryDTO} from "../../../IsaacApiTypes";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";

export type GroupProgressState = {[id: number]: UserGameboardProgressSummaryDTO[] | null} | null ;
export const groupProgress = (groupProgress: GroupProgressState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.GROUP_PROGRESS_RESPONSE_SUCCESS:
            return {...groupProgress, [action.groupId]: action.progress };
        case ACTION_TYPE.GROUP_PROGRESS_RESPONSE_FAILURE:
            return {...groupProgress, [action.groupId]: []}
        default:
            return groupProgress;
    }
}
