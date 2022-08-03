import {IsaacTopicSummaryPageDTO} from "../../../IsaacApiTypes";
import {Action, NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {ACTION_TYPE, NOT_FOUND} from "../../services/constants";
import {routerPageChange} from "../index";

export type CurrentTopicState = IsaacTopicSummaryPageDTO | NOT_FOUND_TYPE | null;
export const currentTopic = (currentTopic: CurrentTopicState = null, action: Action) => {
    if (routerPageChange.match(action)) {
        return null;
    }
    switch (action.type) {
        case ACTION_TYPE.TOPIC_REQUEST:
            return null;
        case ACTION_TYPE.TOPIC_RESPONSE_SUCCESS:
            return action.topic;
        case ACTION_TYPE.TOPIC_RESPONSE_FAILURE:
            return NOT_FOUND;
        default:
            return currentTopic;
    }
};
